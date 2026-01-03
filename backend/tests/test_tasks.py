import pytest
from fastapi import status


def test_create_task(client, auth_headers):
    """Test creating a task"""
    task_data = {
        "title": "Test Task",
        "description": "Test description",
        "category": "Ish",
        "priority": "high",
        "status": "pending",
        "is_focus": True,
    }
    response = client.post("/api/tasks", json=task_data, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["category"] == task_data["category"]
    assert "id" in data


def test_get_tasks(client, auth_headers):
    """Test getting all tasks"""
    # Create a task first
    task_data = {"title": "Test Task", "category": "Ish"}
    client.post("/api/tasks", json=task_data, headers=auth_headers)
    
    response = client.get("/api/tasks", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_task_by_id(client, auth_headers):
    """Test getting a task by ID"""
    # Create a task first
    task_data = {"title": "Test Task", "category": "Ish"}
    create_response = client.post("/api/tasks", json=task_data, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == task_id


def test_update_task(client, auth_headers):
    """Test updating a task"""
    # Create a task first
    task_data = {"title": "Test Task", "category": "Ish"}
    create_response = client.post("/api/tasks", json=task_data, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    # Update task
    update_data = {"title": "Updated Task", "status": "done"}
    response = client.put(f"/api/tasks/{task_id}", json=update_data, headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Task"
    assert data["status"] == "done"


def test_delete_task(client, auth_headers):
    """Test deleting a task"""
    # Create a task first
    task_data = {"title": "Test Task", "category": "Ish"}
    create_response = client.post("/api/tasks", json=task_data, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    # Delete task
    response = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify task is deleted
    get_response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_toggle_task(client, auth_headers):
    """Test toggling task status"""
    # Create a task first
    task_data = {"title": "Test Task", "category": "Ish", "status": "pending"}
    create_response = client.post("/api/tasks", json=task_data, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    # Toggle task
    response = client.patch(f"/api/tasks/{task_id}/toggle", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "done"
    
    # Toggle again
    response = client.patch(f"/api/tasks/{task_id}/toggle", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "pending"

