"""
Simple server for API integration testing.
"""

import os
import sys
from pathlib import Path

# Add backend to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from database.connection import DatabaseManager, get_db_session
    from models.history import CalculationHistory

    def test_database_connection():
        """Test database connection and model creation."""
        try:
            # Initialize database
            DatabaseManager.init_db()
            print(" Database initialized successfully")

            # Test session creation
            session = get_db_session()
            print(" Database session created successfully")

            # Test model creation
            test_calc = CalculationHistory(
                expression="2 + 2",
                result=4.0,
                operation_type="addition",
                session_id="test-session"
            )

            session.add(test_calc)
            session.commit()
            print(" Test calculation saved to database")

            # Test model retrieval
            stored_calc = session.query(CalculationHistory).first()
            if stored_calc:
                print(f" Retrieved calculation: {stored_calc.expression} = {stored_calc.result}")

            session.close()
            return True

        except Exception as e:
            print(f" Database test failed: {e}")
            return False

    def main():
        """Main entry point for testing."""
        print("=== Calculator Backend API Test ===")

        if test_database_connection():
            print(" All backend tests passed")
            return 0
        else:
            print(" Backend tests failed")
            return 1

    if __name__ == "__main__":
        sys.exit(main())

except ImportError as e:
    print(f"Import error: {e}")
    print("Backend modules may not be properly configured")
    sys.exit(1)
