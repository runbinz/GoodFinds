import os
import jwt
import requests
from typing import Optional
from dotenv import load_dotenv
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from functools import lru_cache

load_dotenv()

CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY", "")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")

security = HTTPBearer()

@lru_cache()
def get_clerk_jwks():
    if not CLERK_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="CLERK_PUBLISHABLE_KEY not configured"
        )
    
    clerk_domain = CLERK_PUBLISHABLE_KEY.split("_")[1] if "_" in CLERK_PUBLISHABLE_KEY else ""
    
    if not clerk_domain:
        raise HTTPException(
            status_code=500,
            detail="Invalid CLERK_PUBLISHABLE_KEY format"
        )
    
    jwks_url = f"https://{clerk_domain}.clerk.accounts.dev/.well-known/jwks.json"
    
    try:
        response = requests.get(jwks_url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Clerk JWKS: {str(e)}"
        )


def verify_clerk_token(token: str) -> dict:
    try:
        jwks = get_clerk_jwks()
        
        unverified_header = jwt.get_unverified_header(token)
        
        rsa_key = None
        for key in jwks.get("keys", []):
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find appropriate key"
            )
        
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = credentials.credentials
    
    payload = verify_clerk_token(token)
    
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing user ID"
        )
    
    return {
        "id": user_id,
        "email": payload.get("email"),
        "username": payload.get("username"),
    }


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[dict]:
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
