from sqlalchemy import Column, Integer, String
from .database import Base

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    course = Column(String, nullable=False)
    program = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    date_field = Column(String, nullable=True) # Using string for simplicity (e.g. YYYY-MM-DD)
    reason = Column(String, nullable=True)
    benefits = Column(String, nullable=True)
    status = Column(String, default="Pending")
