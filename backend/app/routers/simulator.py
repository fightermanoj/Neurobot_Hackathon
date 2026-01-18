from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
import threading
import sys
import os

# Add parent directory to path to import simulator modules
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from simulators.run_all import simulate_all_workers

router = APIRouter()

class SimulationStatus(BaseModel):
    message: str
    status: str

@router.post("/run", response_model=SimulationStatus)
async def run_simulation(background_tasks: BackgroundTasks):
    """
    Trigger the simulator to run in the background.
    """
    background_tasks.add_task(simulate_all_workers)
    return {"message": "Simulation started in background", "status": "running"}
