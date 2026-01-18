import requests
import time
import random
import os
from datetime import datetime

# Configuration
# Use Render's PORT provided in env, default to 8000 for local
port = os.environ.get("PORT", "8000")
# If running inside the container, we can use localhost. 
# But prefer the public URL if provided, or localhost if internal.
API_BASE_URL = f"http://127.0.0.1:{port}/api"

WORKERS_PER_STATION = {
    "STATION_1": 5,
    "STATION_2": 8,
    "STATION_3": 6,
    "STATION_4": 7,
    "STATION_5": 10,
    "STATION_6": 7,
    "STATION_7": 8,
    "STATION_8": 4
}

# Voice command templates
VOICE_COMMANDS = {
    "start": [
        "Starting {task} batch {batch}",
        "Begin {task} for batch {batch}",
        "Initiated {task} at {station}"
    ],
    "complete": [
        "Completed {task} batch {batch}",
        "Finished {task} for batch {batch}",
        "Done with {task} at {station}"
    ],
    "material_received": [
        "Material received from {previous_station}",
        "Batch {batch} received at {station}"
    ],
    "machine_issue": [
        "Machine stopped at {station}",
        "Machine issue at {station}",
        "Equipment breakdown at {station}"
    ]
}

STATION_TASKS = {
    "STATION_1": "receiving",
    "STATION_2": "washing",
    "STATION_3": "blanching",
    "STATION_4": "slicing",
    "STATION_5": "drying",
    "STATION_6": "grinding",
    "STATION_7": "packaging",
    "STATION_8": "quality check"
}

class WorkerSimulator:
    def __init__(self, worker_id, station_id, batch_number="BATCH_001"):
        self.worker_id = worker_id
        self.station_id = station_id
        self.batch_number = batch_number
        self.task = STATION_TASKS.get(station_id, "processing")
    
    def send_voice_command(self, command_text):
        """Send voice command to backend"""
        try:
            response = requests.post(
                f"{API_BASE_URL}/voice/command",
                json={
                    "worker_id": self.worker_id,
                    "station_id": self.station_id,
                    "raw_command": command_text,
                    "batch_number": self.batch_number
                }
            )
            if response.status_code == 200:
                print(f"✅ [{self.worker_id}] {command_text}")
                return response.json()
            else:
                print(f"❌ [{self.worker_id}] Error: {response.status_code}")
        except Exception as e:
            print(f"❌ [{self.worker_id}] Exception: {str(e)}")
    
    def update_location(self):
        """Update worker location"""
        try:
            response = requests.put(
                f"{API_BASE_URL}/workers/{self.worker_id}/location",
                json={
                    "worker_id": self.worker_id,
                    "station_id": self.station_id
                }
            )
            if response.status_code == 200:
                print(f"📍 [{self.worker_id}] Location updated: {self.station_id}")
        except Exception as e:
            print(f"❌ [{self.worker_id}] Location update failed: {str(e)}")
    
    def simulate_work_cycle(self):
        """Simulate a complete work cycle"""
        
        # 1. Update location
        self.update_location()
        time.sleep(2)
        
        # 2. Start task
        start_cmd = random.choice(VOICE_COMMANDS["start"]).format(
            task=self.task,
            batch=self.batch_number,
            station=self.station_id
        )
        self.send_voice_command(start_cmd)
        time.sleep(3)
        
        # 3. Random events during work
        if random.random() < 0.1:  # 10% chance of machine issue
            issue_cmd = random.choice(VOICE_COMMANDS["machine_issue"]).format(
                station=self.station_id
            )
            self.send_voice_command(issue_cmd)
            time.sleep(5)  # Simulate repair time
        
        # 4. Complete task
        time.sleep(random.randint(5, 15))  # Simulate work time
        complete_cmd = random.choice(VOICE_COMMANDS["complete"]).format(
            task=self.task,
            batch=self.batch_number,
            station=self.station_id
        )
        self.send_voice_command(complete_cmd)
        
    def run_continuous(self, cycles=5):
        """Run multiple work cycles"""
        print(f"\n🚀 Starting worker {self.worker_id} at {self.station_id}")
        for i in range(cycles):
            print(f"\n--- Cycle {i+1}/{cycles} ---")
            self.simulate_work_cycle()
            time.sleep(random.randint(10, 20))  # Break between cycles

# Example usage
if __name__ == "__main__":
    # Simulate a worker at washing station
    worker = WorkerSimulator(
        worker_id="WORKER_001",
        station_id="STATION_2",
        batch_number="BATCH_001"
    )
    worker.run_continuous(cycles=3)