import requests
import time
import threading
from worker_simulator import WorkerSimulator

API_BASE_URL = "http://localhost:8000/api"

def create_batch(batch_number, target_qty=200):
    """Create a new batch"""
    from datetime import date, timedelta
    
    today = str(date.today())
    end_date = str(date.today() + timedelta(days=1))
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/batches",
            json={
                "batch_number": batch_number,
                "product_name": "ABC Powder",
                "start_date": today,
                "end_date": end_date,
                "target_quantity_kg": target_qty,
                "raw_material_kg": target_qty * 1.35  # Account for wastage
            },
            headers={
                "Authorization": "Bearer YOUR_TOKEN_HERE"  # Replace with actual token
            }
        )
        if response.status_code == 200:
            print(f"✅ Batch {batch_number} created successfully")
            return response.json()
        else:
            print(f"❌ Failed to create batch: {response.status_code}")
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

def simulate_full_production(batch_number="BATCH_001"):
    """Simulate a complete production cycle through all 8 stations"""
    
    stations = [
        ("STATION_1", 5, 30),   # Receiving - 5 workers, 30 min
        ("STATION_2", 8, 45),   # Washing - 8 workers, 45 min
        ("STATION_3", 6, 30),   # Blanching - 6 workers, 30 min
        ("STATION_4", 7, 40),   # Slicing - 7 workers, 40 min
        ("STATION_5", 10, 240), # Drying - 10 workers, 240 min (4 hours)
        ("STATION_6", 7, 60),   # Grinding - 7 workers, 60 min
        ("STATION_7", 8, 50),   # Packaging - 8 workers, 50 min
        ("STATION_8", 4, 35)    # QC - 4 workers, 35 min
    ]
    
    print(f"\n🏭 Starting full production simulation for {batch_number}")
    print("=" * 60)
    
    for station_id, num_workers, duration_min in stations:
        print(f"\n📍 Processing at {station_id} ({num_workers} workers, {duration_min} min)")
        
        # Create workers for this station
        workers = []
        for i in range(min(3, num_workers)):  # Simulate 3 workers per station (for demo)
            worker_id = f"WORKER_{station_id[-1]}{i+1:02d}"
            worker = WorkerSimulator(worker_id, station_id, batch_number)
            workers.append(worker)
        
        # Run workers in parallel
        threads = []
        for worker in workers:
            thread = threading.Thread(target=worker.simulate_work_cycle)
            threads.append(thread)
            thread.start()
        
        # Wait for all workers to complete
        for thread in threads:
            thread.join()
        
        print(f"✅ {station_id} completed")
        time.sleep(5)  # Small delay before next station
    
    print(f"\n🎉 Full production cycle complete for {batch_number}!")

if __name__ == "__main__":
    # Create batch first
    # create_batch("BATCH_001", target_qty=200)
    
    # Simulate production
    simulate_full_production("BATCH_001")