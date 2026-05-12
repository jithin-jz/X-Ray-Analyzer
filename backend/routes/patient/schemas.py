from datetime import date
from typing import Optional

from pydantic import BaseModel


class PatientCreateSchema(BaseModel):
    name: str
    age: int
    gender: str  # "M" | "F" | "Other"
    contact: Optional[str] = None
    date_of_birth: Optional[date] = None
    medical_history: Optional[list[str]] = []


class PatientUpdateSchema(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    medical_history: Optional[list[str]] = None


class PatientOut(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: str
    contact: Optional[str] = None
    medical_history: list[str] = []
    created_by: str
