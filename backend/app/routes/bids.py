from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database.db import get_db
from app.schemas.schemas import Bid, BidCreate, BidDetails
from app.database.models import Bid as BidModel, Auction as AuctionModel
from app.services.auth import get_current_active_user
from app.websockets.connection_manager import connection_manager

router = APIRouter(
    prefix="/bids",
    tags=["bids"],
)

@router.post("/", response_model=Bid, status_code=status.HTTP_201_CREATED)
async def create_bid(
    bid: BidCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    # Get the auction
    auction = db.query(AuctionModel).filter(AuctionModel.id == bid.auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    # Check if auction is still active
    if not auction.is_active or auction.end_time < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Auction has ended")
    
    # Check if bid amount is higher than current price
    if bid.amount <= auction.current_price:
        raise HTTPException(status_code=400, detail="Bid must be higher than current price")
    
    # Create the bid
    db_bid = BidModel(
        amount=bid.amount,
        auction_id=bid.auction_id,
        user_id=current_user.id
    )
    
    # Update auction's current price
    auction.current_price = bid.amount
    
    db.add(db_bid)
    db.commit()
    db.refresh(db_bid)
    
    # Notify all connected clients about the new bid
    bid_info = {
        "event": "new_bid",
        "auction_id": auction.id,
        "bid_id": db_bid.id,
        "amount": db_bid.amount,
        "bidder": current_user.username,
        "time": db_bid.time.isoformat()
    }
    
    await connection_manager.broadcast_to_auction(auction.id, bid_info)
    
    # Notify the previous highest bidder that they've been outbid
    highest_previous_bid = db.query(BidModel).filter(
        BidModel.auction_id == auction.id,
        BidModel.id != db_bid.id
    ).order_by(BidModel.amount.desc()).first()
    
    if highest_previous_bid and highest_previous_bid.user_id != current_user.id:
        await connection_manager.send_to_user(
            highest_previous_bid.user_id,
            {
                "event": "outbid",
                "auction_id": auction.id,
                "auction_title": auction.title,
                "new_price": db_bid.amount
            }
        )
    
    return db_bid

@router.get("/auctions/{auction_id}", response_model=List[Bid])
def get_auction_bids(
    auction_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Verify auction exists
    auction = db.query(AuctionModel).filter(AuctionModel.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    # Get bids
    bids = db.query(BidModel).filter(
        BidModel.auction_id == auction_id
    ).order_by(BidModel.time.desc()).offset(skip).limit(limit).all()
    
    return bids

@router.get("/user", response_model=List[BidDetails])
def get_user_bids(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    bids = db.query(BidModel).filter(
        BidModel.user_id == current_user.id
    ).order_by(BidModel.time.desc()).offset(skip).limit(limit).all()
    
    return bids 