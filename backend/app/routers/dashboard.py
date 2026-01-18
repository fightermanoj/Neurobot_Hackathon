from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.database import get_db
from typing import List, Dict

router = APIRouter()

@router.get("/owner")
def get_owner_dashboard(current_user: dict = Depends(get_current_user)):
    """Owner sees everything - all 8 stations"""
    if current_user.get("role") not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    
    db = get_db()
    
    # Get all stations with current status
    stations = db.table("stations").select("*").execute()
    
    # Get active batches
    batches = db.table("batches").select("*").eq("overall_status", "in_progress").execute()
    
    # Get unresolved alerts (most recent first)
    alerts = db.table("alerts").select("*").eq("is_resolved", False).order("created_at", desc=True).limit(10).execute()
    
    # Get total workers with all required fields
    workers = db.table("workers").select("id, worker_id, worker_name, station_id, productivity_score, total_tasks_completed, is_active").eq("is_active", True).execute()
    
    # Calculate statistics
    total_workers = len(workers.data)
    active_stations = len([s for s in stations.data if s["current_status"] == "active"])
    delayed_stations = len([s for s in stations.data if s["current_status"] == "delayed"])
    
    return {
        "stations": stations.data,
        "batches": batches.data,
        "alerts": alerts.data,
        "workers": workers.data,
        "statistics": {
            "total_workers": total_workers,
            "active_stations": active_stations,
            "delayed_stations": delayed_stations,
            "total_batches": len(batches.data)
        }
    }

@router.get("/manager/{manager_id}")
def get_manager_dashboard(manager_id: str, current_user: dict = Depends(get_current_user)):
    """Manager sees only assigned stations"""
    if current_user["role"] not in ["admin", "owner", "manager"]:
        raise HTTPException(status_code=403, detail="Manager access required")
    
    db = get_db()
    
    # Get manager's assigned stations
    manager = db.table("managers").select("assigned_stations").eq("user_id", manager_id).execute()
    
    if not manager.data:
        raise HTTPException(status_code=404, detail="Manager not found")
    
    assigned_stations = manager.data[0]["assigned_stations"]
    
    # Get station details
    stations = db.table("stations").select("*").in_("station_id", assigned_stations).execute()
    
    # Get workers in assigned stations
    workers = db.table("workers").select("*").in_("station_id", assigned_stations).eq("is_active", True).execute()
    
    # Get batches currently at assigned stations
    batches = db.table("batches").select("*").in_("current_station", assigned_stations).execute()
    
    # Get alerts for assigned stations
    alerts = db.table("alerts").select("*").in_("station_id", assigned_stations).eq("is_resolved", False).execute()
    
    return {
        "assigned_stations": assigned_stations,
        "stations": stations.data,
        "workers": workers.data,
        "batches": batches.data,
        "alerts": alerts.data
    }

@router.get("/stats")
def get_statistics(current_user: dict = Depends(get_current_user)):
    """Overall statistics"""
    db = get_db()
    
    # Total production today
    from datetime import date
    today = str(date.today())
    
    batches_today = db.table("batches").select("*").gte("start_date", today).execute()
    completed_today = db.table("batches").select("*").eq("overall_status", "completed").gte("start_date", today).execute()
    
    # Average productivity
    workers = db.table("workers").select("productivity_score").eq("is_active", True).execute()
    avg_productivity = sum([w["productivity_score"] for w in workers.data]) / len(workers.data) if workers.data else 0
    
    # Current inventory
    inventory = db.table("inventory").select("*").execute()
    
    return {
        "batches_today": len(batches_today.data),
        "completed_today": len(completed_today.data),
        "average_productivity": round(avg_productivity, 2),
        "inventory_items": len(inventory.data),
        "low_stock_items": len([i for i in inventory.data if i["quantity"] < i["min_threshold"]])
    }