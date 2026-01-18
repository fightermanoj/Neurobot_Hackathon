from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import get_db
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/productivity")
def get_productivity_data(current_user: dict = Depends(get_current_user)):
    """Worker productivity analytics"""
    db = get_db()
    
    workers = db.table("workers").select("worker_id, worker_name, station_id, productivity_score, total_tasks_completed").eq("is_active", True).execute()
    
    # Group by station
    station_productivity = {}
    for worker in workers.data:
        station = worker["station_id"]
        if station not in station_productivity:
            station_productivity[station] = {
                "workers": [],
                "average_score": 0,
                "total_tasks": 0
            }
        station_productivity[station]["workers"].append(worker)
        station_productivity[station]["total_tasks"] += worker["total_tasks_completed"]
    
    # Calculate averages
    for station in station_productivity:
        scores = [w["productivity_score"] for w in station_productivity[station]["workers"]]
        station_productivity[station]["average_score"] = sum(scores) / len(scores) if scores else 0
    
    return {
        "workers": workers.data,
        "station_productivity": station_productivity
    }

@router.get("/wastage")
def get_wastage_analysis(current_user: dict = Depends(get_current_user)):
    """Wastage analysis across stations"""
    db = get_db()
    
    progress = db.table("production_progress").select("station_id, wastage_kg").execute()
    
    # Group by station
    station_wastage = {}
    for record in progress.data:
        station = record["station_id"]
        if station not in station_wastage:
            station_wastage[station] = {
                "total_wastage": 0,
                "count": 0
            }
        station_wastage[station]["total_wastage"] += record["wastage_kg"] or 0
        station_wastage[station]["count"] += 1
    
    # Calculate averages
    for station in station_wastage:
        count = station_wastage[station]["count"]
        station_wastage[station]["average_wastage"] = station_wastage[station]["total_wastage"] / count if count > 0 else 0
    
    return station_wastage

@router.get("/timeline")
def get_production_timeline(batch_number: str = None, current_user: dict = Depends(get_current_user)):
    """Production timeline"""
    db = get_db()
    
    query = db.table("production_progress").select("*, batches(batch_number), stations(station_name)")
    
    if batch_number:
        batch = db.table("batches").select("id").eq("batch_number", batch_number).execute()
        if batch.data:
            query = query.eq("batch_id", batch.data[0]["id"])
    
    progress = query.execute()
    
    return progress.data

@router.get("/costs")
def get_cost_analysis(current_user: dict = Depends(get_current_user)):
    """Cost analysis"""
    db = get_db()
    
    # Get inventory costs
    inventory = db.table("inventory").select("*").execute()
    
    total_raw_material_cost = sum([
        item["quantity"] * item["cost_per_unit"] 
        for item in inventory.data 
        if item["item_type"] == "raw_material"
    ])
    
    total_packaging_cost = sum([
        item["quantity"] * item["cost_per_unit"] 
        for item in inventory.data 
        if item["item_type"] == "packaging"
    ])
    
    # Get wastage cost (simplified)
    progress = db.table("production_progress").select("wastage_kg").execute()
    total_wastage_kg = sum([p["wastage_kg"] or 0 for p in progress.data])
    wastage_cost = total_wastage_kg * 50  # Assuming ₹50 per kg average
    
    return {
        "raw_material_cost": total_raw_material_cost,
        "packaging_cost": total_packaging_cost,
        "wastage_cost": wastage_cost,
        "total_cost": total_raw_material_cost + total_packaging_cost + wastage_cost
    }