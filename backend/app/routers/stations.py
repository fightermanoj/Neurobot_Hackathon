from fastapi import APIRouter, HTTPException, Depends
from app.auth import get_current_user
from app.database import get_db
from typing import List

router = APIRouter()

@router.get("")
def list_stations(current_user: dict = Depends(get_current_user)):
    """List all stations"""
    db = get_db()
    response = db.table("stations").select("*").execute()
    return response.data

@router.get("/{station_id}")
def get_station(station_id: str, current_user: dict = Depends(get_current_user)):
    """Get station details"""
    db = get_db()
    response = db.table("stations").select("*").eq("station_id", station_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Station not found")
    
    return response.data[0]

@router.get("/{station_id}/workers")
def get_station_workers(station_id: str, current_user: dict = Depends(get_current_user)):
    """Get workers at a station"""
    db = get_db()
    response = db.table("workers").select("*").eq("station_id", station_id).eq("is_active", True).execute()
    return response.data

@router.put("/{station_id}/status")
def update_station_status(station_id: str, status: str, current_user: dict = Depends(get_current_user)):
    """Update station status"""
    db = get_db()
    
    valid_statuses = ["idle", "active", "completed", "delayed", "stopped"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    response = db.table("stations").update({"current_status": status}).eq("station_id", station_id).execute()
    
    if response.data:
        return {"message": "Station status updated", "station_id": station_id, "status": status}
    
    raise HTTPException(status_code=404, detail="Station not found")