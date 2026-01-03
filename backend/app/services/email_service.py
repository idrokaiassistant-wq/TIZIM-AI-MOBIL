"""
Email Service - SMTP Email Notifications
"""
import os
import logging
from typing import List, Dict, Optional
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from jinja2 import Template

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending email notifications"""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.smtp_from = os.getenv("SMTP_FROM", self.smtp_user)
        self.enabled = os.getenv("EMAIL_ENABLED", "false").lower() == "true"
        
    async def send_email(
        self,
        to: str,
        subject: str,
        body: str,
        html: Optional[str] = None
    ) -> bool:
        """
        Send email
        
        Args:
            to: Recipient email address
            subject: Email subject
            body: Plain text body
            html: HTML body (optional)
            
        Returns:
            bool: Success status
        """
        if not self.enabled:
            logger.warning("Email not enabled, skipping email")
            return False
        
        if not self.smtp_user or not self.smtp_password:
            logger.error("SMTP credentials not configured")
            return False
        
        try:
            message = MIMEMultipart("alternative")
            message["From"] = self.smtp_from
            message["To"] = to
            message["Subject"] = subject
            
            # Add plain text part
            text_part = MIMEText(body, "plain", "utf-8")
            message.attach(text_part)
            
            # Add HTML part if provided
            if html:
                html_part = MIMEText(html, "html", "utf-8")
                message.attach(html_part)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                use_tls=True,
            )
            
            logger.info(f"Email sent successfully to {to}")
            return True
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False
    
    async def send_task_reminder(
        self,
        to: str,
        task_title: str,
        due_date: Optional[datetime] = None
    ) -> bool:
        """Send task reminder email"""
        subject = f"Eslatma: {task_title}"
        
        due_text = ""
        if due_date:
            due_text = f"\nMuddat: {due_date.strftime('%Y-%m-%d %H:%M')}"
        
        body = f"""
Salom!

Sizga vazifa eslatmasi:

Vazifa: {task_title}
{due_text}

Tizim AI
        """.strip()
        
        html = f"""
        <html>
        <body>
            <h2>Vazifa eslatmasi</h2>
            <p><strong>Vazifa:</strong> {task_title}</p>
            {f'<p><strong>Muddat:</strong> {due_date.strftime("%Y-%m-%d %H:%M")}</p>' if due_date else ''}
            <p>Tizim AI</p>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body, html)
    
    async def send_daily_summary(
        self,
        to: str,
        tasks_completed: int,
        tasks_pending: int,
        habits_streak: int
    ) -> bool:
        """Send daily summary email"""
        subject = "Kunlik xulosa - Tizim AI"
        
        body = f"""
Salom!

Bugungi kunlik xulosa:

✅ Bajarilgan vazifalar: {tasks_completed}
📋 Kutilayotgan vazifalar: {tasks_pending}
🔥 Odatlar streak: {habits_streak}

Tizim AI
        """.strip()
        
        html = f"""
        <html>
        <body>
            <h2>Kunlik xulosa</h2>
            <p>✅ <strong>Bajarilgan vazifalar:</strong> {tasks_completed}</p>
            <p>📋 <strong>Kutilayotgan vazifalar:</strong> {tasks_pending}</p>
            <p>🔥 <strong>Odatlar streak:</strong> {habits_streak}</p>
            <p>Tizim AI</p>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body, html)
    
    async def send_habit_reminder(
        self,
        to: str,
        habit_title: str,
        current_streak: int
    ) -> bool:
        """Send habit reminder email"""
        subject = f"Odat eslatmasi: {habit_title}"
        
        body = f"""
Salom!

Odat eslatmasi:

Odat: {habit_title}
Joriy streak: {current_streak} kun

Davom eting! 💪

Tizim AI
        """.strip()
        
        html = f"""
        <html>
        <body>
            <h2>Odat eslatmasi</h2>
            <p><strong>Odat:</strong> {habit_title}</p>
            <p><strong>Joriy streak:</strong> {current_streak} kun</p>
            <p>Davom eting! 💪</p>
            <p>Tizim AI</p>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body, html)

