import os
import jwt
import requests
import base64
from jwt import PyJWKClient
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
def get_jwks_client():
    """Get the JWKS client for Clerk token verification"""
    if not CLERK_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="CLERK_PUBLISHABLE_KEY not configured"
        )
    
    # Clerk publishable key format: pk_<env>_<base64_encoded_domain>
    # We need to decode the base64 part to get the actual domain
    try:
        parts = CLERK_PUBLISHABLE_KEY.split("_")
        if len(parts) < 3:
            raise ValueError("Invalid key format")
        
        # Get the base64-encoded domain (everything after pk_<env>_)
        encoded_domain = "_".join(parts[2:])
        
        # Add padding if needed for base64 decoding
        padding = len(encoded_domain) % 4
        if padding:
            encoded_domain += '=' * (4 - padding)
        
        # Decode from base64
        clerk_domain = base64.b64decode(encoded_domain).decode('utf-8')
        
        # Remove any trailing special characters like $ and .clerk.accounts.dev suffix
        clerk_domain = clerk_domain.rstrip('$').replace('.clerk.accounts.dev', '')
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse CLERK_PUBLISHABLE_KEY: {str(e)}"
        )
    
    if not clerk_domain:
        raise HTTPException(
            status_code=500,
            detail="Invalid CLERK_PUBLISHABLE_KEY format"
        )
    
    jwks_url = f"https://{clerk_domain}.clerk.accounts.dev/.well-known/jwks.json"
    print(f"🔑 Constructed JWKS URL: {jwks_url}")
    
    try:
        return PyJWKClient(jwks_url)
    except Exception as e:
        print(f"❌ Failed to create JWKS client: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create JWKS client: {str(e)}"
        )


def verify_clerk_token(token: str) -> dict:
    try:
        print(f"🔐 Verifying token: {token[:20]}...")
        jwks_client = get_jwks_client()
        
        # Get the signing key from JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        
        print(f"✅ Token verified successfully. User ID: {payload.get('sub')}")
        return payload
        
    except jwt.ExpiredSignatureError:
        print(f"❌ Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        print(f"❌ Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        print(f"❌ Token verification failed: {str(e)}")
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
