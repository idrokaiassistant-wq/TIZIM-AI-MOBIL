from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import json
import io
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.services.export_import_service import ExportImportService

router = APIRouter()


@router.get("/tasks")
async def export_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export tasks as JSON"""
    service = ExportImportService(db)
    tasks = service.export_tasks(current_user.id)
    return JSONResponse(content={"tasks": tasks})


@router.get("/habits")
async def export_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export habits as JSON"""
    service = ExportImportService(db)
    habits = service.export_habits(current_user.id)
    return JSONResponse(content={"habits": habits})


@router.get("/finance")
async def export_finance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export finance data as JSON"""
    service = ExportImportService(db)
    finance = service.export_finance(current_user.id)
    return JSONResponse(content=finance)


@router.get("/all")
async def export_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export all data as JSON"""
    service = ExportImportService(db)
    data = service.export_all(current_user.id)
    return JSONResponse(content=data)


@router.post("/tasks")
async def import_tasks(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Import tasks from JSON file"""
    try:
        content = await file.read()
        data = json.loads(content.decode('utf-8'))
        
        if "tasks" not in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format: 'tasks' key not found"
            )
        
        service = ExportImportService(db)
        result = service.import_tasks(current_user.id, data["tasks"])
        
        return {
            "message": f"Imported {result['imported']} tasks",
            "imported": result["imported"],
            "errors": result["errors"],
        }
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {str(e)}"
        )


@router.post("/habits")
async def import_habits(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Import habits from JSON file"""
    try:
        content = await file.read()
        data = json.loads(content.decode('utf-8'))
        
        if "habits" not in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format: 'habits' key not found"
            )
        
        service = ExportImportService(db)
        result = service.import_habits(current_user.id, data["habits"])
        
        return {
            "message": f"Imported {result['imported']} habits",
            "imported": result["imported"],
            "errors": result["errors"],
        }
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {str(e)}"
        )


@router.post("/all")
async def import_all(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Import all data from JSON file"""
    try:
        content = await file.read()
        data = json.loads(content.decode('utf-8'))
        
        service = ExportImportService(db)
        result = service.import_all(current_user.id, data)
        
        total_imported = result.get("tasks", {}).get("imported", 0) + result.get("habits", {}).get("imported", 0)
        
        return {
            "message": f"Imported {total_imported} items",
            "results": result,
        }
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {str(e)}"
        )

