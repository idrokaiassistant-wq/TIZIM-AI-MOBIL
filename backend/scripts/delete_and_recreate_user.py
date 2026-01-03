"""
Delete and recreate default user - fixes corrupted password hash
Email: test@example.com
Password: test123456
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models import User
from app.utils.auth import get_password_hash, verify_password
import uuid

def delete_and_recreate_user():
    """Delete existing user and recreate with correct password hash"""
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        # Find and delete existing user
        user = db.query(User).filter(User.email == "test@example.com").first()
        if user:
            print(f"Deleting existing user: {user.email} (ID: {user.id})")
            db.delete(user)
            db.commit()
            print("User deleted successfully")
        
        # Create new user with correct password hash
        print("Creating new user...")
        password_hash = get_password_hash("test123456")
        new_user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            password_hash=password_hash,
            full_name="Test User",
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Verify password hash
        is_valid = verify_password("test123456", new_user.password_hash)
        
        print("\n" + "="*50)
        print("User recreated successfully!")
        print("="*50)
        print(f"Email: {new_user.email}")
        print(f"Password: test123456")
        print(f"Full Name: {new_user.full_name}")
        print(f"ID: {new_user.id}")
        print(f"Password hash verification: {'✓ PASSED' if is_valid else '✗ FAILED'}")
        print("="*50)
        
        if not is_valid:
            print("\nERROR: Password verification failed!")
            return 1
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return 1
    finally:
        db.close()
    
    return 0

if __name__ == "__main__":
    exit(delete_and_recreate_user())

