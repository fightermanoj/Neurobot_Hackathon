from fastapi import APIRouter, HTTPException, Depends
from app.auth import get_current_user
from app.database import get_db
from app.models import LocationUpdate
from app.utils.db_helpers import safe_db_operation
from typing import List

router = APIRouter()

@router.get("")
def list_workers(current_user: dict = Depends(get_current_user)):
    """List all workers"""
    db = get_db()
    response = db.table("workers").select("*").execute()
    return response.data

@router.get("/{worker_id}")
def get_worker(worker_id: str, current_user: dict = Depends(get_current_user)):
    """Get worker details"""
    db = get_db()
    response = db.table("workers").select("*").eq("worker_id", worker_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    return response.data[0]

@router.put("/{worker_id}/location")
def update_worker_location(worker_id: str, location: LocationUpdate):
    """Update worker location/station (no auth required for simulators)"""
    db = get_db()
    
    # Verify worker exists
    worker = safe_db_operation(
        lambda: db.table("workers").select("id").eq("worker_id", worker_id).execute()
    )
    
    if not worker or not worker.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Update worker location with retry logic
    result = safe_db_operation(
        lambda: db.table("workers").update({
            "station_id": location.station_id
        }).eq("worker_id", worker_id).execute()
    )
    
    if result and result.data:
        return {
            "message": "Worker location updated",
            "worker_id": worker_id,
            "station_id": location.station_id
        }
    
    # Don't raise error if update fails - just return success to avoid breaking simulators
    return {
        "message": "Worker location update attempted",
        "worker_id": worker_id,
        "station_id": location.station_id
    }