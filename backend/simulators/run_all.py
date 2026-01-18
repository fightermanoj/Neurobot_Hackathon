"""
Run all worker simulators for all stations simultaneously
"""
import threading
import time
from worker_simulator import WorkerSimulator

def run_station_workers(station_id, num_workers, batch_number="BATCH_001"):
    """Run all workers for a specific station"""
    workers = []
    
    for i in range(num_workers):
        worker_id = f"WORKER_{station_id[-1]}{i+1:02d}"
        worker = WorkerSimulator(worker_id, station_id, batch_number)
        workers.append(worker)
    
    # Run workers in parallel
    threads = []
    for worker in workers:
        thread = threading.Thread(target=worker.run_continuous, kwargs={"cycles": 10})
        threads.append(thread)
        thread.start()
    
    # Wait for completion
    for thread in threads:
        thread.join()

def simulate_all_workers():
    """Simulate all 50 workers across all 8 stations"""
    
    stations = [
        ("STATION_1", 5),
        ("STATION_2", 8),
        ("STATION_3", 6),
        ("STATION_4", 7),
        ("STATION_5", 10),
        ("STATION_6", 7),
        ("STATION_7", 8),
        ("STATION_8", 4)
    ]
    
    print("🚀 Starting simulation of all 50 workers")
    print("=" * 60)
    
    station_threads = []
    
    for station_id, num_workers in stations:
        thread = threading.Thread(
            target=run_station_workers,
            args=(station_id, min(3, num_workers), "BATCH_001")  # Limit to 3 per station for demo
        )
        station_threads.append(thread)
        thread.start()
        time.sleep(2)  # Stagger station starts
    
    # Wait for all stations
    for thread in station_threads:
        thread.join()
    
    print("\n✅ All worker simulations complete!")

if __name__ == "__main__":
    simulate_all_workers()