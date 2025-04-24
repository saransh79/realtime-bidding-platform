from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database.db import get_db
from app.schemas.schemas import Auction, AuctionCreate, AuctionDetails
from app.database.models import Auction as AuctionModel
from app.services.auth import get_current_active_user
from app.websockets.connection_manager import connection_manager

router = APIRouter(
    prefix="/auctions",
    tags=["auctions"],
)

@router.post("/", response_model=Auction, status_code=status.HTTP_201_CREATED)
async def create_auction(
    auction: AuctionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_auction = AuctionModel(
        title=auction.title,
        description=auction.description,
        starting_price=auction.starting_price,
        current_price=auction.starting_price,
        image_url=auction.image_url,
        end_time=auction.end_time,
        owner_id=current_user.id
    )
    db.add(db_auction)
    db.commit()
    db.refresh(db_auction)
    
    # Notify all connected clients about new auction
    await connection_manager.broadcast({
        "event": "new_auction",
        "auction_id": db_auction.id,
        "title": db_auction.title,
        "current_price": db_auction.current_price
    })
    
    return db_auction

@router.get("/", response_model=List[Auction])
def get_auctions(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(AuctionModel)
    
    if active_only:
        now = datetime.utcnow()
        query = query.filter(
            AuctionModel.is_active == True,
            AuctionModel.end_time > now
        )
    
    auctions = query.offset(skip).limit(limit).all()
    return auctions

@router.get("/{auction_id}", response_model=AuctionDetails)
def get_auction(auction_id: int, db: Session = Depends(get_db)):
    db_auction = db.query(AuctionModel).filter(AuctionModel.id == auction_id).first()
    if db_auction is None:
        raise HTTPException(status_code=404, detail="Auction not found")
    return db_auction

@router.put("/{auction_id}", response_model=Auction)
async def update_auction(
    auction_id: int,
    auction: AuctionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_auction = db.query(AuctionModel).filter(AuctionModel.id == auction_id).first()
    
    if db_auction is None:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    if db_auction.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this auction")
    
    # Only allow updates if no bids yet or auction hasn't started
    if len(db_auction.bids) > 0:
        raise HTTPException(status_code=400, detail="Cannot update auction with existing bids")
    
    # Update fields
    db_auction.title = auction.title
    db_auction.description = auction.description
    db_auction.starting_price = auction.starting_price
    db_auction.current_price = auction.starting_price
    db_auction.image_url = auction.image_url
    db_auction.end_time = auction.end_time
    
    db.commit()
    db.refresh(db_auction)
    
    # Notify all connected clients about the update
    await connection_manager.broadcast_to_auction(auction_id, {
        "event": "auction_updated",
        "auction_id": db_auction.id,
        "title": db_auction.title,
        "current_price": db_auction.current_price
    })
    
    return db_auction

@router.delete("/{auction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_auction(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_auction = db.query(AuctionModel).filter(AuctionModel.id == auction_id).first()
    
    if db_auction is None:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    if db_auction.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this auction")
    
    # Only allow deletion if no bids
    if len(db_auction.bids) > 0:
        raise HTTPException(status_code=400, detail="Cannot delete auction with existing bids")
    
    db.delete(db_auction)
    db.commit()
    
    # Notify connected clients
    await connection_manager.broadcast({
        "event": "auction_deleted",
        "auction_id": auction_id
    })
    
    return None 