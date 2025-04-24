from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class UserInDB(User):
    hashed_password: str

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Auction schemas
class AuctionBase(BaseModel):
    title: str
    description: str
    starting_price: float
    image_url: Optional[str] = None
    end_time: datetime

class AuctionCreate(AuctionBase):
    pass

class Auction(AuctionBase):
    id: int
    current_price: float
    start_time: datetime
    is_active: bool
    owner_id: int
    
    class Config:
        orm_mode = True

class AuctionDetails(Auction):
    owner: User
    bids: List["Bid"] = []

# Bid schemas
class BidBase(BaseModel):
    amount: float

class BidCreate(BidBase):
    auction_id: int

class Bid(BidBase):
    id: int
    time: datetime
    auction_id: int
    user_id: int
    
    class Config:
        orm_mode = True

class BidDetails(Bid):
    bidder: User
    auction: Auction

# Update circular references
AuctionDetails.update_forward_refs() 