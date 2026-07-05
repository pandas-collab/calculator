"""
CalculationHistory model for storing calculator operations.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from ..database.base import Base


class CalculationHistory(Base):
    """Model for storing calculation history entries."""

    __tablename__ = 'calculation_history'

    id = Column(Integer, primary_key=True, autoincrement=True)
    expression = Column(Text, nullable=False)
    result = Column(Float, nullable=False)
    operation_type = Column(String(50), nullable=False)
    session_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<CalculationHistory(id={self.id}, expression='{self.expression}', result={self.result})>"

    def to_dict(self):
        """Convert model instance to dictionary."""
        return {
            'id': self.id,
            'expression': self.expression,
            'result': self.result,
            'operation_type': self.operation_type,
            'session_id': self.session_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
