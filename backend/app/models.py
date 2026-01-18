from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    admin = "admin"
    owner = "owner"
    manager = "manager"
    worker = "worker"

class StationStatus(str, Enum):
    idle = "idle"
    active = "active"
    completed = "completed"
    delayed = "delayed"
    stopped = "stopped"

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str]

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Batch Models
class BatchCreate(BaseModel):
    batch_number: str
    product_name: str = "ABC Powder"
    start_date: str
    end_date: str
    target_quantity_kg: float
    raw_material_kg: float

class BatchResponse(BaseModel):
    id: str
    batch_number: str
    product_name: str
    start_date: str
    end_date: str
    target_quantity_kg: float
    current_quantity_kg: float
    current_station: Optional[str]
    overall_status: str

# Voice Command Models
class VoiceCommand(BaseModel):
    worker_id: str
    station_id: str
    raw_command: str
    batch_number: Optional[str] = None

# Worker Location Update
class LocationUpdate(BaseModel):
    worker_id: str
    station_id: str

# Production Progress
class ProductionProgressUpdate(BaseModel):
    batch_id: str
    station_id: str
    status: StationStatus
    input_quantity_kg: Optional[float] = None
    output_quantity_kg: Optional[float] = None
    wastage_kg: Optional[float] = 0