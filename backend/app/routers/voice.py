from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models import VoiceCommand
from app.utils.voice_parser import parse_voice_command
from app.utils.db_helpers import safe_db_operation
from datetime import datetime

router = APIRouter()

@router.post("/command")
def process_voice_command(command: VoiceCommand):
    """Process voice command from simulated worker device"""
    db = get_db()
    
    # Parse the command
    parsed = parse_voice_command(command.raw_command)
    
    # Insert into voice_commands table with retry logic
    voice_log = safe_db_operation(
        lambda: db.table("voice_commands").insert({
            "worker_id": command.worker_id,
            "station_id": command.station_id,
            "raw_command": command.raw_command,
            "parsed_action": parsed["action"],
            "parsed_entity": parsed["entity"],
            "batch_number": command.batch_number or parsed["batch_number"],
            "processed": False
        }).execute()
    )
    
    if not voice_log or not voice_log.data:
        # If insert fails, still try to process the command but log it
        print(f"⚠️ Failed to log voice command from {command.worker_id}, but continuing processing...")
    
    # Process the command with error handling
    try:
        if parsed["action"] == "starting":
            # Update worker activity
            safe_db_operation(
                lambda: db.table("worker_activity").insert({
                    "worker_id": command.worker_id,
                    "station_id": command.station_id,
                    "activity_type": "task_start",
                    "description": f"Started {parsed['entity']} at {command.station_id}",
                    "batch_number": command.batch_number
                }).execute()
            )
            
            # Update production progress if batch number is present
            if command.batch_number:
                batch = safe_db_operation(
                    lambda: db.table("batches").select("*").eq("batch_number", command.batch_number).execute()
                )
                if batch and batch.data:
                    batch_id = batch.data[0]["id"]
                    batch_data = batch.data[0]
                    
                    # Calculate realistic input quantities based on station
                    # Start with target quantity and apply station-specific processing
                    import random
                    target_qty = batch_data.get("target_quantity_kg", 200)
                    
                    # Station-specific quantity calculations
                    station_multipliers = {
                        "STATION_1": 1.35,  # Receiving (with extra for wastage)
                        "STATION_2": 1.0,   # Washing
                        "STATION_3": 1.0,   # Blanching
                        "STATION_4": 1.0,   # Slicing
                        "STATION_5": 1.0,   # Drying
                        "STATION_6": 1.0,   # Grinding
                        "STATION_7": 1.0,   # Packaging
                        "STATION_8": 1.0    # QC
                    }
                    
                    input_qty = target_qty * station_multipliers.get(command.station_id, 1.0)
                    
                    safe_db_operation(
                        lambda: db.table("production_progress").update({
                            "status": "in_progress",
                            "start_time": datetime.utcnow().isoformat(),
                            "workers_assigned": 1,
                            "input_quantity_kg": round(input_qty, 2)
                        }).eq("batch_id", batch_id).eq("station_id", command.station_id).execute()
                    )
                    
                    # Update batch current station
                    safe_db_operation(
                        lambda: db.table("batches").update({
                            "current_station": command.station_id,
                            "overall_status": "in_progress"
                        }).eq("id", batch_id).execute()
                    )
            
            # Update station status
            safe_db_operation(
                lambda: db.table("stations").update({"current_status": "active"}).eq("station_id", command.station_id).execute()
            )
    
        elif parsed["action"] == "completed":
            # Update worker activity
            safe_db_operation(
                lambda: db.table("worker_activity").insert({
                    "worker_id": command.worker_id,
                    "station_id": command.station_id,
                    "activity_type": "task_complete",
                    "description": f"Completed {parsed['entity']} at {command.station_id}",
                    "batch_number": command.batch_number
                }).execute()
            )
            
            # Update production progress
            if command.batch_number:
                batch = safe_db_operation(
                    lambda: db.table("batches").select("*").eq("batch_number", command.batch_number).execute()
                )
                if batch and batch.data:
                    batch_id = batch.data[0]["id"]
                    batch_data = batch.data[0]
                    
                    # Get current progress to calculate output from input
                    prog = safe_db_operation(
                        lambda: db.table("production_progress").select("*").eq("batch_id", batch_id).eq("station_id", command.station_id).execute()
                    )
                    
                    if prog and prog.data:
                        import random
                        input_qty = prog.data[0].get("input_quantity_kg", 200)
                        
                        # Calculate output with realistic wastage (5-12%)
                        wastage_percentage = random.uniform(0.05, 0.12)
                        wastage = input_qty * wastage_percentage
                        output_qty = input_qty - wastage
                        
                        safe_db_operation(
                            lambda: db.table("production_progress").update({
                                "status": "completed",
                                "end_time": datetime.utcnow().isoformat(),
                                "output_quantity_kg": round(output_qty, 2),
                                "wastage_kg": round(wastage, 2)
                            }).eq("batch_id", batch_id).eq("station_id", command.station_id).execute()
                        )
                        
                        # Update batch current quantity
                        safe_db_operation(
                            lambda: db.table("batches").update({
                                "current_quantity_kg": round(output_qty, 2)
                            }).eq("id", batch_id).execute()
                        )
            
            # Update station status
            safe_db_operation(
                lambda: db.table("stations").update({"current_status": "completed"}).eq("station_id", command.station_id).execute()
            )
    
        elif parsed["action"] == "machine_stopped":
            # Create alert
            batch = None
            batch_id = None
            if command.batch_number:
                batch = safe_db_operation(
                    lambda: db.table("batches").select("id").eq("batch_number", command.batch_number).execute()
                )
                if batch and batch.data:
                    batch_id = batch.data[0]["id"]
            
            safe_db_operation(
                lambda: db.table("alerts").insert({
                    "alert_type": "machine_failure",
                    "severity": "high",
                    "station_id": command.station_id,
                    "batch_id": batch_id,
                    "message": f"Machine stopped at {command.station_id} - reported by {command.worker_id}",
                    "is_resolved": False
                }).execute()
            )
            
            # Update station status
            safe_db_operation(
                lambda: db.table("stations").update({"current_status": "stopped"}).eq("station_id", command.station_id).execute()
            )
            
            # Log activity
            safe_db_operation(
                lambda: db.table("worker_activity").insert({
                    "worker_id": command.worker_id,
                    "station_id": command.station_id,
                    "activity_type": "machine_issue",
                    "description": command.raw_command,
                    "batch_number": command.batch_number
                }).execute()
            )
    except Exception as e:
        # Log error but don't fail the request
        print(f"⚠️ Error processing voice command from {command.worker_id}: {str(e)}")
    
    # Mark command as processed (with retry)
    if voice_log and voice_log.data:
        safe_db_operation(
            lambda: db.table("voice_commands").update({"processed": True}).eq("id", voice_log.data[0]["id"]).execute()
        )
    
    return {
        "message": "Voice command processed",
        "parsed": parsed,
        "worker_id": command.worker_id,
        "station_id": command.station_id
    }

@router.get("/commands")
def get_recent_commands(limit: int = 50):
    """Get recent voice commands"""
    db = get_db()
    response = db.table("voice_commands").select("*").order("timestamp", desc=True).limit(limit).execute()
    return response.data