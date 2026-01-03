import pytest
from fastapi import status


def test_register(client, test_user_data):
    """Test user registration"""
    response = client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == test_user_data["email"]
    assert "id" in data
    assert "password_hash" not in data


def test_register_duplicate_email(client, test_user_data):
    """Test registration with duplicate email"""
    client.post("/api/auth/register", json=test_user_data)
    response = client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_login(client, test_user_data):
    """Test user login"""
    # Register first
    client.post("/api/auth/register", json=test_user_data)
    
    # Login
    login_data = {
        "username": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client, test_user_data):
    """Test login with invalid credentials"""
    login_data = {
        "username": test_user_data["email"],
        "password": "wrongpassword",
    }
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_me(client, auth_headers):
    """Test getting current user"""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "id" in data
    assert "email" in data


def test_get_me_unauthorized(client):
    """Test getting current user without auth"""
    response = client.get("/api/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_update_profile(client, auth_headers):
    """Test updating user profile"""
    update_data = {"full_name": "Updated Name", "timezone": "UTC"}
    response = client.put("/api/auth/profile", json=update_data, headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["timezone"] == "UTC"

