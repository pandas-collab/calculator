"""
Backend package for calculator application.

This package contains the SQLAlchemy models and database configuration
for calculator history persistence and user session management.
"""

from .models import CalculationHistory, MODELS, get_model, get_all_models
from .database import Base, engine, SessionLocal, create_tables, get_db, close_db_session

__version__ = "1.0.0"

__all__ = [
    'CalculationHistory',
    'MODELS',
    'get_model',
    'get_all_models',
    'Base',
    'engine',
    'SessionLocal',
    'create_tables',
    'get_db',
    'close_db_session',
]
