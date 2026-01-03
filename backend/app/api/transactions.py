from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionStats,
)
from app.services import transaction_service
from app.services.ai.receipt_scanner_service import ReceiptScannerService

router = APIRouter()


@router.get("", response_model=list[TransactionResponse])
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    transaction_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all transactions with filters and pagination"""
    transactions = transaction_service.get_transactions(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        transaction_type=transaction_type,
        category=category,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single transaction by ID"""
    transaction = transaction_service.get_transaction(db, transaction_id, current_user.id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return transaction


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new transaction"""
    return transaction_service.create_transaction(db, transaction, current_user.id)


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: str,
    transaction_update: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a transaction"""
    transaction = transaction_service.update_transaction(
        db, transaction_id, current_user.id, transaction_update
    )
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a transaction"""
    success = transaction_service.delete_transaction(db, transaction_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )


@router.get("/stats/summary", response_model=TransactionStats)
async def get_transaction_stats(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get transaction statistics"""
    return transaction_service.get_transaction_stats(
        db, current_user.id, start_date, end_date
    )


@router.post("/scan-receipt", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Scan receipt image and create transaction"""
    try:
        # Read image data
        image_data = await file.read()
        
        # Validate image format
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Scan receipt
        scanner = ReceiptScannerService()
        extracted_data = await scanner.scan_receipt(image_data)
        
        # Create transaction from extracted data
        transaction_data = TransactionCreate(
            title=extracted_data["title"],
            description=extracted_data.get("description", ""),
            category=extracted_data["category"],
            amount=extracted_data["amount"],
            transaction_type="expense",
            transaction_date=date.fromisoformat(extracted_data["date"]),
            icon="ShoppingBag",
            color="bg-slate-100 text-slate-600",
        )
        
        # Create transaction
        transaction = transaction_service.create_transaction(
            db, transaction_data, current_user.id
        )
        
        return transaction
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to scan receipt: {str(e)}"
        )

