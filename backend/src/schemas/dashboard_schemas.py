from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_leads: int
    total_campaigns: int
    emails_sent: int
