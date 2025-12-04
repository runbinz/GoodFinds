"""
Test cases for main application endpoints and health checks.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
from main import app
import db


class TestMainEndpoints:
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self):
        """Test the root endpoint returns welcome message"""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/")
            
            assert response.status_code == 200
            data = response.json()
            assert "message" in data
            assert "GoodFinds API" in data["message"]
            assert data["version"] == "1.0.0"
            assert data["status"] == "running"
            assert data["docs"] == "/docs"
    
    
    @pytest.mark.asyncio
    async def test_health_check_healthy(self, mock_db):
        """Test health check endpoint when database is connected"""
        mock_db.command = AsyncMock(return_value={"ok": 1})
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["database"] == "connected"
            assert "operational" in data["message"]
    
    
    @pytest.mark.asyncio
    async def test_health_check_unhealthy(self, mock_db):
        """Test health check endpoint when database is disconnected"""
        mock_db.command = AsyncMock(side_effect=Exception("Connection failed"))
        
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "unhealthy"
            assert data["database"] == "disconnected"
            assert "error" in data

