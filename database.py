from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os

# Get the directory where this file (database.py) is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Go up one level to the project root (since database.py is in 'app')
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# Use absolute path for the database
DATABASE_URL = f"sqlite:///{os.path.join(PROJECT_ROOT, 'courses_v2.db')}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
