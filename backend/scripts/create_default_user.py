"""
Create default test user
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

def create_default_user():
    """Create default test user if not exists"""
    print("Initializing database...")
    # Initialize database first
    init_db()
    
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print("Default user already exists!")
            print(f"Email: {existing_user.email}")
            print(f"ID: {existing_user.id}")
            print(f"Full Name: {existing_user.full_name}")
            
            # Test password verification
            print("\nTesting password verification...")
            test_password = "test123456"
            is_valid = verify_password(test_password, existing_user.password_hash)
            print(f"Password verification result: {is_valid}")
            
            if not is_valid:
                print("WARNING: Password verification failed! User password hash may be corrupted.")
                response = input("Do you want to reset the password? (y/n): ")
                if response.lower() == 'y':
                    existing_user.password_hash = get_password_hash(test_password)
                    db.commit()
                    print("Password reset successfully!")
            
            return
        
        # Create default user
        print("Creating default user...")
        password_hash = get_password_hash("test123456")
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            password_hash=password_hash,
            full_name="Test User",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Verify the password hash works
        print("Verifying password hash...")
        is_valid = verify_password("test123456", user.password_hash)
        
        print("\n" + "="*50)
        print("Default user created successfully!")
        print("="*50)
        print(f"Email: {user.email}")
        print(f"Password: test123456")
        print(f"Full Name: {user.full_name}")
        print(f"ID: {user.id}")
        print(f"Password hash verification: {'✓ PASSED' if is_valid else '✗ FAILED'}")
        print("="*50)
        
        if not is_valid:
            print("\nWARNING: Password verification failed after creation!")
        
    except Exception as e:
        print(f"\nError creating default user: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_default_user()

