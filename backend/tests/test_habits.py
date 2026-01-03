import pytest
from fastapi import status
from datetime import date


def test_create_habit(client, auth_headers):
    """Test creating a habit"""
    habit_data = {
        "title": "Test Habit",
        "goal": "30 min",
        "category": "Salomatlik",
        "icon": "Heart",
    }
    response = client.post("/api/habits", json=habit_data, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == habit_data["title"]
    assert data["goal"] == habit_data["goal"]
    assert "id" in data


def test_get_habits(client, auth_headers):
    """Test getting all habits"""
    # Create a habit first
    habit_data = {"title": "Test Habit", "goal": "30 min"}
    client.post("/api/habits", json=habit_data, headers=auth_headers)
    
    response = client.get("/api/habits", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_complete_habit(client, auth_headers):
    """Test completing a habit"""
    # Create a habit first
    habit_data = {"title": "Test Habit", "goal": "30 min"}
    create_response = client.post("/api/habits", json=habit_data, headers=auth_headers)
    habit_id = create_response.json()["id"]
    
    # Complete habit
    completion_data = {
        "completion_date": str(date.today()),
        "progress": 100,
        "notes": "Done!",
    }
    response = client.post(
        f"/api/habits/{habit_id}/complete",
        json=completion_data,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["progress"] == 100
    
    # Check habit stats updated
    get_response = client.get(f"/api/habits/{habit_id}", headers=auth_headers)
    habit = get_response.json()
    assert habit["total_completions"] > 0

