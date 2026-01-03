from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Optional, List
from datetime import date
from app.models import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionStats
import uuid


def get_transactions(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    transaction_type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
) -> List[Transaction]:
    """Get transactions with filters and pagination"""
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if category:
        query = query.filter(Transaction.category == category)
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)
    if search:
        query = query.filter(
            or_(
                Transaction.title.ilike(f"%{search}%"),
                Transaction.description.ilike(f"%{search}%")
            )
        )
    
    return query.order_by(Transaction.transaction_date.desc()).offset(skip).limit(limit).all()


def get_transaction(db: Session, transaction_id: str, user_id: str) -> Optional[Transaction]:
    """Get a single transaction by ID"""
    return db.query(Transaction).filter(
        and_(Transaction.id == transaction_id, Transaction.user_id == user_id)
    ).first()


def create_transaction(db: Session, transaction: TransactionCreate, user_id: str) -> Transaction:
    """Create a new transaction"""
    db_transaction = Transaction(
        id=str(uuid.uuid4()),
        user_id=user_id,
        **transaction.model_dump(),
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(
    db: Session,
    transaction_id: str,
    user_id: str,
    transaction_update: TransactionUpdate
) -> Optional[Transaction]:
    """Update a transaction"""
    transaction = get_transaction(db, transaction_id, user_id)
    if not transaction:
        return None
    
    update_data = transaction_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction_id: str, user_id: str) -> bool:
    """Delete a transaction"""
    transaction = get_transaction(db, transaction_id, user_id)
    if not transaction:
        return False
    db.delete(transaction)
    db.commit()
    return True


def get_transaction_stats(
    db: Session,
    user_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> TransactionStats:
    """Get transaction statistics"""
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)
    
    # Calculate totals
    income_result = query.filter(Transaction.transaction_type == "income").with_entities(
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).first()
    
    expense_result = query.filter(Transaction.transaction_type == "expense").with_entities(
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).first()
    
    total_income = float(income_result[0] or 0)
    income_count = int(income_result[1] or 0)
    total_expense = abs(float(expense_result[0] or 0))
    expense_count = int(expense_result[1] or 0)
    
    return TransactionStats(
        total_income=total_income,
        total_expense=total_expense,
        balance=total_income - total_expense,
        income_count=income_count,
        expense_count=expense_count,
    )

