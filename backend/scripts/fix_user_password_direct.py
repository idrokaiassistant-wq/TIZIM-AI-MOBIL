"""
Fix user password hash using bcrypt directly (bypasses passlib issue)
Email: test@example.com
Password: test123456
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models import User
import bcrypt

def fix_user_password_direct():
    """Fix password hash using bcrypt directly"""
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        # Find user
        user = db.query(User).filter(User.email == "test@example.com").first()
        if not user:
            print("User not found: test@example.com")
            print("Creating new user...")
            # Create new user
            password_hash = bcrypt.hashpw(b"test123456", bcrypt.gensalt()).decode('utf-8')
            user = User(
                id="test_user_123",
                email="test@example.com",
                password_hash=password_hash,
                full_name="Test User",
            )
            db.add(user)
        else:
            print(f"Found user: {user.email} (ID: {user.id})")
            print("Resetting password hash...")
            # Reset password hash using bcrypt directly
            password_hash = bcrypt.hashpw(b"test123456", bcrypt.gensalt()).decode('utf-8')
            user.password_hash = password_hash
        
        db.commit()
        db.refresh(user)
        
        # Verify password hash
        is_valid = bcrypt.checkpw(b"test123456", user.password_hash.encode('utf-8'))
        
        print("\n" + "="*50)
        print("Password hash fixed successfully!")
        print("="*50)
        print(f"Email: {user.email}")
        print(f"Password: test123456")
        print(f"ID: {user.id}")
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
    exit(fix_user_password_direct())

