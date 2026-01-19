import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Correct imports for Vercel when running inside 'app' folder
try:
    import database
    import models
    import email_utils
    from database import Base, engine, SessionLocal
    from models import Registration
    from email_utils import send_email
except ImportError:
    from app.database import Base, engine, SessionLocal
    from app.models import Registration
    from app.email_utils import send_email

# ---------- App ----------
app = FastAPI(title="Course Registration API")

# ---------- Static ----------
# Path to frontend folder relative to this file (up one level)
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
frontend_path = os.path.join(parent_dir, "frontend")

app.mount("/frontend", StaticFiles(directory=frontend_path, html=True), name="frontend")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DB ----------
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- Schema ----------
class RegisterRequest(BaseModel):
    full_name: str
    email: str
    course: str
    program: str
    age: int
    date_field: str
    reason: str
    benefits: str

# ---------- Public ----------
from fastapi.responses import RedirectResponse

@app.get("/")
async def root():
    return RedirectResponse(url="/frontend/register.html")

@app.post("/register")
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Registration).filter(
        Registration.email == data.email
    ).first()

    if existing:
        print(f"⚠️ Registration Blocked: Email '{data.email}' already exists.")
        raise HTTPException(status_code=400, detail="Email already registered")

    user = Registration(
        full_name=data.full_name,
        email=data.email,
        course=data.course,
        program=data.program,
        age=data.age,
        date_field=data.date_field,
        reason=data.reason,
        benefits=data.benefits,
        status="Pending"
    )
    
    db.add(user)
    db.commit()

    print(f"✅ New User Registered: {data.email}")

    # Send Confirmation Email (Async logic simulated with try-except for now)
    try:
        subject = "Welcome to Course Registration!"
        body = f"""Hello {data.full_name},

Thank you for registering for the '{data.course}' course.
Your application has been received and is currently Pending approval.

We will notify you once your status changes.

Best Regards,
Admin Team
"""
        # Note: This will fail if EMAIL_ADDRESS/PASSWORD are not set in email_utils.py
        # But it wont stop the registration process due to try/except
        send_email(data.email, subject, body)
        print(f"📧 Confirmation email sent to {data.email}")
    except Exception as e:
        print(f"❌ Failed to send email (Check credentials): {e}")

    return {"message": "Registration successful"}

# ---------- Admin ----------
@app.get("/admin/registrations")
def get_all_registrations(db: Session = Depends(get_db)):
    return db.query(Registration).all()

@app.post("/admin/approve/{user_id}")
def approve_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Registration).filter(Registration.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = "Accepted"
    db.commit()

    # Send Approval Email
    try:
        subject = "🎉 Congratulations! You have been Accepted"
        body = f"""Dear {user.full_name},

We are pleased to inform you that your application for the '{user.course}' course has been ACCEPTED!

Please wait for further instructions regarding the start date.

Welcome aboard!
"""
        send_email(user.email, subject, body)
    except Exception as e:
        print(f"Failed to send approval email: {e}")

    return {"message": "User approved"}

@app.post("/admin/reject/{user_id}")
def reject_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Registration).filter(Registration.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = "Rejected"
    db.commit()

    # Send Rejection Email
    try:
        subject = "Update regarding your application"
        body = f"""Dear {user.full_name},

Thank you for your interest in the '{user.course}' course.

After careful review, we regret to inform you that we cannot move forward with your application at this time.

We wish you the best in your future learning journey.
"""
        send_email(user.email, subject, body)
    except Exception as e:
        print(f"Failed to send rejection email: {e}")

    return {"message": "User rejected"}

@app.delete("/admin/delete/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Registration).filter(Registration.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}
