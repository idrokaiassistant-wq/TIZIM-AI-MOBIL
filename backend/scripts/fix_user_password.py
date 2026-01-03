"""
Fix user password hash - reset password hash for existing user
Email: test@example.com
Password: test123456
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models import User
from app.utils.auth import get_password_hash, verify_password

def fix_user_password():
    """Fix password hash for existing user"""
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        # Find user
        user = db.query(User).filter(User.email == "test@example.com").first()
        if not user:
            print("User not found: test@example.com")
            return
        
        print(f"Found user: {user.email} (ID: {user.id})")
        
        # Try to verify current password
        try:
            is_valid = verify_password("test123456", user.password_hash)
            if is_valid:
                print("Password hash is valid. No need to fix.")
                return
        except Exception as e:
            print(f"Password verification failed (expected): {e}")
        
        # Reset password hash
        print("Resetting password hash...")
        user.password_hash = get_password_hash("test123456")
        db.commit()
        
        # Verify new password hash
        is_valid = verify_password("test123456", user.password_hash)
        
        print("\n" + "="*50)
        print("Password hash fixed successfully!")
        print("="*50)
        print(f"Email: {user.email}")
        print(f"Password: test123456")
        print(f"Password hash verification: {'✓ PASSED' if is_valid else '✗ FAILED'}")
        print("="*50)
        
        if not is_valid:
            print("\nERROR: Password verification failed after reset!")
            return 1
        
    except Exception as e:
        print(f"\nError fixing password: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return 1
    finally:
        db.close()
    
    return 0

if __name__ == "__main__":
    exit(fix_user_password())

