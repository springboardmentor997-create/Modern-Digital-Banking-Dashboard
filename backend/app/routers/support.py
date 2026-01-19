from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import get_db, Base
from app.dependencies import get_current_user, require_admin, require_support
from app.models.user import User, UserRole
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import enum

router = APIRouter(prefix="/api/support", tags=["support"])

# Enums
class TicketPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class TicketCategory(str, enum.Enum):
    general = "general"
    account = "account"
    transaction = "transaction"
    technical = "technical"
    billing = "billing"
    security = "security"

class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"

# Database Models
class SupportTicket(Base):
    __tablename__ = "support_tickets"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String, default="general")
    priority = Column(String, default="medium")
    status = Column(String, default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    conversation_id = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    sender = Column(String, nullable=False)  # 'user' or 'bot'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Pydantic Models
class TicketCreate(BaseModel):
    subject: str
    message: str
    category: TicketCategory = TicketCategory.general
    priority: TicketPriority = TicketPriority.medium

class ChatMessageCreate(BaseModel):
    message: str
    conversation_id: str

class TicketResponse(BaseModel):
    id: int
    subject: str
    message: str
    category: str
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Support Ticket Endpoints
@router.post("/tickets")
async def create_support_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new support ticket"""
    try:
        # Ensure tables exist
        Base.metadata.create_all(bind=db.bind)
        
        # Create new ticket
        db_ticket = SupportTicket(
            user_id=current_user.id,
            subject=ticket_data.subject,
            message=ticket_data.message,
            category=ticket_data.category.value,
            priority=ticket_data.priority.value,
            status=TicketStatus.open.value
        )
        
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        
        return {
            "message": "Support ticket created successfully",
            "ticket_id": db_ticket.id,
            "status": "open",
            "estimated_response": "24 hours"
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating support ticket: {e}")
        raise HTTPException(status_code=500, detail="Failed to create support ticket")

@router.get("/tickets")
async def get_user_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tickets for the current user"""
    tickets = db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id
    ).order_by(SupportTicket.created_at.desc()).all()
    
    return [
        {
            "id": ticket.id,
            "subject": ticket.subject,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at
        }
        for ticket in tickets
    ]

@router.get("/tickets/{ticket_id}")
async def get_ticket_details(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific ticket"""
    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id,
        SupportTicket.user_id == current_user.id
    ).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "message": ticket.message,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at
    }

# Live Chat Endpoints
@router.post("/chat")
async def send_chat_message(
    chat_data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a chat message and get bot response"""
    try:
        # Ensure tables exist
        Base.metadata.create_all(bind=db.bind)
        
        # Save user message
        user_message = ChatMessage(
            user_id=current_user.id,
            conversation_id=chat_data.conversation_id,
            message=chat_data.message,
            sender="user"
        )
        db.add(user_message)
        
        # Generate bot response based on message content
        bot_reply = generate_bot_response(chat_data.message)
        
        # Save bot response
        bot_message = ChatMessage(
            user_id=current_user.id,
            conversation_id=chat_data.conversation_id,
            message=bot_reply,
            sender="bot"
        )
        db.add(bot_message)
        
        db.commit()
        
        return {
            "reply": bot_reply,
            "conversation_id": chat_data.conversation_id,
            "timestamp": datetime.now()
        }
    except Exception as e:
        db.rollback()
        print(f"Error in chat: {e}")
        # Return a fallback response instead of raising an exception
        return {
            "reply": "I apologize, but I'm having trouble connecting right now. Please try again or contact our email support at urmilakshirsagar1945@gmail.com.",
            "conversation_id": chat_data.conversation_id,
            "timestamp": datetime.now()
        }

@router.get("/chat/{conversation_id}")
async def get_chat_history(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for a conversation"""
    try:
        # Ensure tables exist
        Base.metadata.create_all(bind=db.bind)
        
        messages = db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conversation_id,
            ChatMessage.user_id == current_user.id
        ).order_by(ChatMessage.created_at.asc()).all()
        
        return [
            {
                "id": msg.id,
                "message": msg.message,
                "sender": msg.sender,
                "timestamp": msg.created_at
            }
            for msg in messages
        ]
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        return []

# Bot Response Generator
def generate_bot_response(user_message: str) -> str:
    """Generate appropriate bot responses based on user input"""
    message_lower = user_message.lower()
    
    # Account related queries
    if any(word in message_lower for word in ['account', 'balance', 'login', 'password']):
        return "I can help you with account-related issues. For account access problems, please verify your email and password. If you're still having trouble, I can connect you with our account specialists."
    
    # Transaction related queries
    elif any(word in message_lower for word in ['transaction', 'payment', 'transfer', 'money']):
        return "For transaction-related questions, I can help you understand your transaction history, pending payments, or transfer issues. What specific transaction concern do you have?"
    
    # Technical support
    elif any(word in message_lower for word in ['bug', 'error', 'not working', 'broken', 'technical']):
        return "I understand you're experiencing technical difficulties. Can you describe what exactly isn't working? Our technical team can help resolve any app or website issues."
    
    # Security concerns
    elif any(word in message_lower for word in ['security', 'fraud', 'suspicious', 'hack', 'unauthorized']):
        return "Security is our top priority. If you suspect any unauthorized activity, please contact our security team immediately at urmilakshirsagar1945@gmail.com or call +1 (555) 123-4567."
    
    # Billing questions
    elif any(word in message_lower for word in ['bill', 'charge', 'fee', 'cost', 'pricing']):
        return "I can help explain our fees and billing. Most of our basic services are free, with transparent pricing for premium features. What specific billing question do you have?"
    
    # Greeting responses
    elif any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
        return "Hello! I'm here to help you with any banking questions or issues. What can I assist you with today?"
    
    # Thank you responses
    elif any(word in message_lower for word in ['thank', 'thanks', 'appreciate']):
        return "You're welcome! Is there anything else I can help you with today?"
    
    # Default response
    else:
        return "Thank you for your message. I'm here to help with account issues, transactions, technical support, and general banking questions. Could you please provide more details about what you need assistance with?"

# Admin/Support endpoints for managing support tickets
@router.get("/admin/tickets")
async def get_all_tickets(
    current_user: User = Depends(require_support),
    db: Session = Depends(get_db)
):
    """Get all support tickets (Support/Admin only)"""
    tickets = db.query(SupportTicket).order_by(
        SupportTicket.created_at.desc()
    ).all()
    
    return [
        {
            "id": ticket.id,
            "user_id": ticket.user_id,
            "subject": ticket.subject,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "created_at": ticket.created_at
        }
        for ticket in tickets
    ]

@router.patch("/admin/tickets/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: int,
    status: TicketStatus,
    current_user: User = Depends(require_support),
    db: Session = Depends(get_db)
):
    """Update ticket status (Support/Admin only)"""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = status.value
    db.commit()
    
    return {"message": f"Ticket status updated to {status.value}"}