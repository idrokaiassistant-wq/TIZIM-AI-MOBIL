"""
Notification Service - FCM Push Notifications
"""
import os
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import User, Task, Habit

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for sending push notifications"""
    
    def __init__(self, db: Session):
        self.db = db
        self.fcm_enabled = os.getenv("FCM_ENABLED", "false").lower() == "true"
        self.fcm_server_key = os.getenv("FCM_SERVER_KEY", "")
        
    async def register_device(self, user_id: str, device_token: str, platform: str = "web") -> bool:
        """
        Register device token for push notifications
        
        Args:
            user_id: User ID
            device_token: FCM device token
            platform: Platform (web, android, ios)
            
        Returns:
            bool: Success status
        """
        try:
            # In a real implementation, you would store device tokens in a database
            # For now, we'll just log it
            logger.info(f"Device registered: user={user_id}, platform={platform}, token={device_token[:20]}...")
            return True
        except Exception as e:
            logger.error(f"Error registering device: {str(e)}")
            return False
    
    async def send_task_reminder(self, user_id: str, task: Task) -> bool:
        """
        Send task reminder notification
        
        Args:
            user_id: User ID
            task: Task object
            
        Returns:
            bool: Success status
        """
        try:
            if not self.fcm_enabled:
                logger.warning("FCM not enabled, skipping notification")
                return False
            
            # In a real implementation, you would send FCM notification here
            logger.info(f"Sending task reminder: user={user_id}, task={task.title}")
            return True
        except Exception as e:
            logger.error(f"Error sending task reminder: {str(e)}")
            return False
    
    async def send_habit_reminder(self, user_id: str, habit: Habit) -> bool:
        """
        Send habit reminder notification
        
        Args:
            user_id: User ID
            habit: Habit object
            
        Returns:
            bool: Success status
        """
        try:
            if not self.fcm_enabled:
                logger.warning("FCM not enabled, skipping notification")
                return False
            
            # In a real implementation, you would send FCM notification here
            logger.info(f"Sending habit reminder: user={user_id}, habit={habit.title}")
            return True
        except Exception as e:
            logger.error(f"Error sending habit reminder: {str(e)}")
            return False
    
    def get_tasks_due_soon(self, user_id: str, hours: int = 1) -> List[Task]:
        """Get tasks due within specified hours"""
        from datetime import datetime, timedelta
        
        now = datetime.now()
        future = now + timedelta(hours=hours)
        
        tasks = self.db.query(Task).filter(
            Task.user_id == user_id,
            Task.status == 'pending',
            Task.due_date.isnot(None),
        ).all()
        
        # Filter tasks due within the time window
        due_soon = []
        for task in tasks:
            if task.due_date:
                task_datetime = datetime.combine(task.due_date, datetime.min.time())
                if now <= task_datetime <= future:
                    due_soon.append(task)
        
        return due_soon
    
    def get_habits_for_reminder(self, user_id: str) -> List[Habit]:
        """Get active habits that need reminders"""
        habits = self.db.query(Habit).filter(
            Habit.user_id == user_id,
            Habit.is_active == 1
        ).all()
        
        return habits


