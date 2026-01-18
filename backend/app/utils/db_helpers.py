"""
Database helper functions with retry logic for handling network errors
"""
import time
from typing import Callable, Any, Optional

def safe_db_operation(operation: Callable, max_retries: int = 3, delay: float = 0.1) -> Optional[Any]:
    """
    Execute a database operation with retry logic for transient network errors
    
    Args:
        operation: A callable that performs the database operation
        max_retries: Maximum number of retry attempts
        delay: Initial delay between retries (exponential backoff)
    
    Returns:
        Result of the operation or None if all retries fail
    """
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            return operation()
        except Exception as e:
            last_exception = e
            error_str = str(e).lower()
            
            # Check if it's a transient network error
            is_transient = any(keyword in error_str for keyword in [
                'readerror',
                'winerror 10035',
                'non-blocking socket',
                'connection',
                'timeout',
                'network'
            ])
            
            if not is_transient or attempt == max_retries - 1:
                # Not a transient error or last attempt, log and return None
                if attempt == max_retries - 1:
                    print(f"⚠️ Database operation failed after {max_retries} attempts: {str(e)}")
                break
            
            # Wait before retrying (exponential backoff)
            wait_time = delay * (2 ** attempt)
            time.sleep(wait_time)
            print(f"🔄 Retrying database operation (attempt {attempt + 1}/{max_retries})...")
    
    return None

