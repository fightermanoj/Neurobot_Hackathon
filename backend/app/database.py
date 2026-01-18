"""
In-memory database for demo purposes
Replaces Supabase with simple dictionaries
"""
from datetime import datetime, date
from typing import Dict, List
import uuid

# In-memory data store
class InMemoryDB:
    def __init__(self):
        self.users: List[Dict] = []
        self.managers: List[Dict] = []
        self.workers: List[Dict] = []
        self.stations: List[Dict] = []
        self.batches: List[Dict] = []
        self.production_progress: List[Dict] = []
        self.worker_activity: List[Dict] = []
        self.voice_commands: List[Dict] = []
        self.alerts: List[Dict] = []
        self.inventory: List[Dict] = []
        
        # Initialize with demo data
        self._initialize_demo_data()
    
    def _initialize_demo_data(self):
        """Initialize with demo data"""
        # Create users with bcrypt hashed passwords
        import bcrypt
        
        def _hash_password(password: str) -> str:
            """Hash password using bcrypt"""
            password_bytes = password.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password_bytes, salt)
            return hashed.decode('utf-8')
        
        self.users = [
            {
                "id": str(uuid.uuid4()),
                "email": "admin@lakshmi.com",
                "password_hash": _hash_password("admin123"),
                "full_name": "Admin User",
                "role": "admin",
                "phone": "+91-9876543210",
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "rajesh@lakshmi.com",
                "password_hash": _hash_password("owner123"),
                "full_name": "Rajesh Kumar",
                "role": "owner",
                "phone": "+91-9876543211",
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "suresh@lakshmi.com",
                "password_hash": _hash_password("manager123"),
                "full_name": "Suresh",
                "role": "manager",
                "phone": "+91-9876543212",
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "email": "priya@lakshmi.com",
                "password_hash": _hash_password("manager123"),
                "full_name": "Priya",
                "role": "manager",
                "phone": "+91-9876543213",
                "created_at": datetime.utcnow().isoformat()
            }
        ]
        
        # Create managers
        self.managers = [
            {
                "id": str(uuid.uuid4()),
                "user_id": self.users[2]["id"],  # Suresh
                "manager_name": "Suresh",
                "assigned_stations": ["STATION_1", "STATION_2"],
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": self.users[3]["id"],  # Priya
                "manager_name": "Priya",
                "assigned_stations": ["STATION_3", "STATION_4"],
                "created_at": datetime.utcnow().isoformat()
            }
        ]
        
        # Create stations
        station_names = {
            "STATION_1": "Raw Material Receiving",
            "STATION_2": "Washing & Peeling",
            "STATION_3": "Blanching",
            "STATION_4": "Slicing",
            "STATION_5": "Drying (Tunnel Dryer)",
            "STATION_6": "Grinding & Sieving",
            "STATION_7": "Packaging & Mixing",
            "STATION_8": "Quality Check & Dispatch"
        }
        
        for station_id, station_name in station_names.items():
            self.stations.append({
                "id": str(uuid.uuid4()),
                "station_id": station_id,
                "station_name": station_name,
                "current_status": "idle",
                "capacity": 100,
                "created_at": datetime.utcnow().isoformat()
            })
        
        # Create batches
        today = str(date.today())
        self.batches.append({
            "id": str(uuid.uuid4()),
            "batch_number": "BATCH_001",
            "product_name": "ABC Powder",
            "start_date": today,
            "end_date": today,
            "target_quantity_kg": 200,
            "current_quantity_kg": 0,
            "raw_material_kg": 270,
            "current_station": "STATION_1",
            "overall_status": "in_progress",
            "created_at": datetime.utcnow().isoformat()
        })
        
        # Create production progress entries for BATCH_001
        batch_id = self.batches[0]["id"]
        for station in self.stations:
            self.production_progress.append({
                "id": str(uuid.uuid4()),
                "batch_id": batch_id,
                "station_id": station["station_id"],
                "status": "pending",
                "input_quantity_kg": 0,
                "output_quantity_kg": 0,
                "wastage_kg": 0,
                "workers_assigned": 0,
                "start_time": None,
                "end_time": None,
                "created_at": datetime.utcnow().isoformat()
            })
        
        # Create workers
        worker_names = [
            "Ravi", "Arun", "Deepak", "Vijay", "Karthik", "Prakash", "Ramesh", "Sunil",
            "Anitha", "Priya", "Meena", "Lakshmi", "Kavitha", "Divya", "Radha", "Geetha",
            "Kumar", "Raj", "Mohan", "Ganesh", "Siva", "Bala", "Mani", "Senthil",
            "Veni", "Devi", "Prema", "Saranya", "Janaki", "Kamala", "Vasantha", "Mala",
            "Arjun", "Dinesh", "Naveen", "Prabhu", "Raghu", "Saravanan", "Thiru", "Vinod",
            "Bhavani", "Chitra", "Indira", "Jaya", "Kala", "Latha", "Mythili", "Nila",
            "Selvi", "Uma"
        ]
        
        stations_config = {
            "STATION_1": 5,
            "STATION_2": 8,
            "STATION_3": 6,
            "STATION_4": 7,
            "STATION_5": 10,
            "STATION_6": 7,
            "STATION_7": 8,
            "STATION_8": 4
        }
        
        worker_index = 0
        for station_id, count in stations_config.items():
            for i in range(count):
                worker_id = f"WORKER_{station_id[-1]}{i+1:02d}"
                self.workers.append({
                    "id": str(uuid.uuid4()),
                    "worker_id": worker_id,
                    "worker_name": worker_names[worker_index % len(worker_names)],
                    "station_id": station_id,
                    "manager_id": None,
                    "phone": f"+91-98765{worker_index:05d}",
                    "productivity_score": round(60 + (worker_index % 30), 2),
                    "total_tasks_completed": worker_index * 5,
                    "is_active": True,
                    "created_at": datetime.utcnow().isoformat()
                })
                worker_index += 1
    
    def table(self, table_name: str):
        """Return a table query builder"""
        return TableQueryBuilder(self, table_name)

class TableQueryBuilder:
    """Mimics Supabase query builder interface"""
    
    def __init__(self, db: InMemoryDB, table_name: str):
        self.db = db
        self.table_name = table_name
        self._select_fields = "*"
        self._filters = []
        self._order_by = None
        self._order_desc = False
        self._limit_value = None
        self._data_to_insert = None
        self._data_to_update = None
    
    def select(self, fields: str = "*"):
        """Select fields"""
        self._select_fields = fields
        return self
    
    def insert(self, data: Dict):
        """Insert data"""
        self._data_to_insert = data
        return self
    
    def update(self, data: Dict):
        """Update data"""
        self._data_to_update = data
        return self
    
    def eq(self, field: str, value):
        """Filter by equality"""
        self._filters.append(("eq", field, value))
        return self
    
    def in_(self, field: str, values: List):
        """Filter by inclusion"""
        self._filters.append(("in", field, values))
        return self
    
    def gte(self, field: str, value):
        """Filter by greater than or equal"""
        self._filters.append(("gte", field, value))
        return self
    
    def order(self, field: str, desc: bool = False):
        """Order by field"""
        self._order_by = field
        self._order_desc = desc
        return self
    
    def limit(self, value: int):
        """Limit results"""
        self._limit_value = value
        return self
    
    def execute(self):
        """Execute the query"""
        table_data = getattr(self.db, self.table_name, [])
        
        # Handle insert
        if self._data_to_insert:
            new_item = {
                "id": str(uuid.uuid4()),
                "created_at": datetime.utcnow().isoformat(),
                **self._data_to_insert
            }
            table_data.append(new_item)
            return QueryResult([new_item])
        
        # Handle update
        if self._data_to_update:
            updated_items = []
            for item in table_data:
                if self._match_filters(item):
                    item.update(self._data_to_update)
                    updated_items.append(item)
            return QueryResult(updated_items)
        
        # Handle select
        results = [item for item in table_data if self._match_filters(item)]
        
        # Apply ordering
        if self._order_by:
            results = sorted(results, key=lambda x: x.get(self._order_by, ""), reverse=self._order_desc)
        
        # Apply limit
        if self._limit_value:
            results = results[:self._limit_value]
        
        return QueryResult(results)
    
    def _match_filters(self, item: Dict) -> bool:
        """Check if item matches all filters"""
        if not self._filters:
            return True
        
        for filter_type, field, value in self._filters:
            item_value = item.get(field)
            
            if filter_type == "eq":
                if item_value != value:
                    return False
            elif filter_type == "in":
                if item_value not in value:
                    return False
            elif filter_type == "gte":
                if not (item_value and item_value >= value):
                    return False
        
        return True

class QueryResult:
    """Mimics Supabase query result"""
    
    def __init__(self, data: List[Dict]):
        self.data = data

# Global in-memory database instance
_db = InMemoryDB()

def get_db():
    """Return the in-memory database instance"""
    return _db
