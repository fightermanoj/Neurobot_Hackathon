from fastapi import APIRouter, HTTPException, Depends
from app.models import BatchCreate, BatchResponse
from app.auth import get_current_user
from app.database import get_db
from typing import List
from datetime import datetime

router = APIRouter()

@router.post("", response_model=BatchResponse)
def create_batch(batch: BatchCreate, current_user: dict = Depends(get_current_user)):
    """Create a new production batch"""
    if current_user["role"] not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Only owner/admin can create batches")
    
    db = get_db()
    
    # Check if batch number exists
    existing = db.table("batches").select("id").eq("batch_number", batch.batch_number).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Batch number already exists")
    
    # Insert batch
    response = db.table("batches").insert({
        "batch_number": batch.batch_number,
        "product_name": batch.product_name,
        "start_date": batch.start_date,
        "end_date": batch.end_date,
        "target_quantity_kg": batch.target_quantity_kg,
        "raw_material_kg": batch.raw_material_kg,
        "current_station": "STATION_1",
        "overall_status": "not_started"
    }).execute()
    
    if response.data:
        batch_data = response.data[0]
        
        # Create production progress records for all 8 stations
        stations = ["STATION_1", "STATION_2", "STATION_3", "STATION_4", 
                   "STATION_5", "STATION_6", "STATION_7", "STATION_8"]
        
        for station in stations:
            db.table("production_progress").insert({
                "batch_id": batch_data["id"],
                "station_id": station,
                "status": "pending" if station != "STATION_1" else "in_progress"
            }).execute()
        
        return BatchResponse(**batch_data)
    
    raise HTTPException(status_code=500, detail="Failed to create batch")

@router.get("", response_model=List[BatchResponse])
def list_batches(current_user: dict = Depends(get_current_user)):
    """List all batches"""
    db = get_db()
    response = db.table("batches").select("*").order("created_at", desc=True).execute()
    return [BatchResponse(**batch) for batch in response.data]

@router.get("/{batch_id}", response_model=BatchResponse)
def get_batch(batch_id: str, current_user: dict = Depends(get_current_user)):
    """Get batch details"""
    db = get_db()
    response = db.table("batches").select("*").eq("id", batch_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return BatchResponse(**response.data[0])

@router.get("/{batch_id}/progress")
def get_batch_progress(batch_id: str, current_user: dict = Depends(get_current_user)):
    """Get batch progress across all stations"""
    db = get_db()
    
    # Get batch info
    batch = db.table("batches").select("*").eq("id", batch_id).execute()
    if not batch.data:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Get progress for all stations
    progress = db.table("production_progress").select("*").eq("batch_id", batch_id).execute()
    
    # Enrich progress with station names
    stations_map = {s["station_id"]: s["station_name"] for s in db.table("stations").select("*").execute().data}
    
    progress_data = []
    for prog in progress.data:
        prog_copy = prog.copy()
        prog_copy["station_name"] = stations_map.get(prog["station_id"], prog["station_id"])
        progress_data.append(prog_copy)
    
    return {
        "batch": batch.data[0],
        "progress": progress_data
    }