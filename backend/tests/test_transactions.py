import pytest
from fastapi import status
from datetime import date


def test_create_transaction(client, auth_headers):
    """Test creating a transaction"""
    transaction_data = {
        "title": "Test Transaction",
        "category": "Oziq-ovqat",
        "amount": 100.50,
        "transaction_type": "expense",
        "transaction_date": str(date.today()),
    }
    response = client.post("/api/transactions", json=transaction_data, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == transaction_data["title"]
    assert data["amount"] == transaction_data["amount"]
    assert "id" in data


def test_get_transactions(client, auth_headers):
    """Test getting all transactions"""
    # Create a transaction first
    transaction_data = {
        "title": "Test Transaction",
        "category": "Oziq-ovqat",
        "amount": 100.50,
        "transaction_type": "expense",
        "transaction_date": str(date.today()),
    }
    client.post("/api/transactions", json=transaction_data, headers=auth_headers)
    
    response = client.get("/api/transactions", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_transaction_stats(client, auth_headers):
    """Test getting transaction statistics"""
    # Create some transactions
    transactions = [
        {
            "title": "Income",
            "category": "Maosh",
            "amount": 1000.0,
            "transaction_type": "income",
            "transaction_date": str(date.today()),
        },
        {
            "title": "Expense",
            "category": "Oziq-ovqat",
            "amount": 50.0,
            "transaction_type": "expense",
            "transaction_date": str(date.today()),
        },
    ]
    for t in transactions:
        client.post("/api/transactions", json=t, headers=auth_headers)
    
    response = client.get("/api/transactions/stats/summary", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_income" in data
    assert "total_expense" in data
    assert "balance" in data
    assert data["total_income"] > 0
    assert data["total_expense"] > 0

