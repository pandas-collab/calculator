"""
Database connection and session management.
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from .base import Base

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./calculator_history.db')

# Create engine
if DATABASE_URL.startswith('sqlite'):
    # SQLite specific configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False,
        },
        poolclass=StaticPool,
        echo=os.getenv('DB_ECHO', 'false').lower() == 'true'
    )

    # Enable foreign key constraints for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL/MySQL configuration
    engine = create_engine(
        DATABASE_URL,
        echo=os.getenv('DB_ECHO', 'false').lower() == 'true'
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_session() -> Session:
    """Get database session (direct)."""
    return SessionLocal()


class DatabaseManager:
    """Database management utilities."""

    @staticmethod
    def init_db():
        """Initialize database with tables."""
        create_tables()

    @staticmethod
    def reset_db():
        """Reset database (drop and recreate tables)."""
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    @staticmethod
    def get_session() -> Session:
        """Get a new database session."""
        return SessionLocal()
