from pydantic import BaseModel, UUID4

class AreaOfExpertiseBase(BaseModel):
    name: str
    description: str | None = None

class AreaOfExpertiseCreate(AreaOfExpertiseBase):
    pass

class AreaOfExpertiseUpdate(AreaOfExpertiseBase):
    pass

class AreaOfExpertiseInDB(AreaOfExpertiseBase):
    id: UUID4

    class Config:
        orm_mode = True
