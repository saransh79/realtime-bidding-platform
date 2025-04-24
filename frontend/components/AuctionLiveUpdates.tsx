import React, { useEffect, useState, useRef } from 'react';
import { Bid } from '@/lib/api';
import { connectToAuction, WebSocketConnection } from '@/lib/websocket';
import { useAuth } from '@/contexts/AuthContext';

interface AuctionLiveUpdatesProps {
  auctionId: number;
  onPriceUpdate: (newPrice: number) => void;
}

interface LiveBid extends Bid {
  bidder: string;
}

const AuctionLiveUpdates: React.FC<AuctionLiveUpdatesProps> = ({ auctionId, onPriceUpdate }) => {
  const { user } = useAuth();
  const [bids, setBids] = useState<LiveBid[]>([]);
  const [viewers, setViewers] = useState<number>(1);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const wsRef = useRef<WebSocketConnection | null>(null);
  
  useEffect(() => {
    // Connect to auction WebSocket
    const userId = user?.id;
    
    const connection = connectToAuction(
      auctionId,
      userId,
      {
        onOpen: () => {
          setIsConnected(true);
          console.log('Connected to auction WebSocket');
        },
        onMessage: (data) => {
          handleMessage(data);
        },
        onClose: () => {
          setIsConnected(false);
          console.log('Disconnected from auction WebSocket');
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
        }
      }
    );
    
    wsRef.current = connection;
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [auctionId, user]);
  
  const handleMessage = (data: any) => {
    console.log('Received message:', data);
    
    switch (data.event) {
      case 'new_bid':
        const newBid: LiveBid = {
          id: data.bid_id,
          amount: data.amount,
          time: data.time,
          auction_id: data.auction_id,
          user_id: 0, // Not available in the message
          bidder: data.bidder
        };
        
        setBids(prev => [newBid, ...prev.slice(0, 9)]);
        onPriceUpdate(data.amount);
        break;
        
      case 'auction_data':
        // Set initial price
        onPriceUpdate(data.current_price);
        break;
        
      case 'viewers_update':
        setViewers(data.count);
        break;
        
      case 'auction_ended':
        // Handle auction end
        break;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Live Updates</h3>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        <span>{viewers} {viewers === 1 ? 'person' : 'people'} watching this auction</span>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium text-gray-700 mb-2">Recent Bids</h4>
        
        {bids.length > 0 ? (
          <ul className="space-y-2">
            {bids.map((bid, index) => (
              <li key={bid.id || index} className="text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{bid.bidder}</span> bid 
                    <span className="ml-1 text-primary-600 font-semibold">${bid.amount.toFixed(2)}</span>
                  </div>
                  <div className="text-gray-500">
                    {new Date(bid.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No bids yet. Be the first to bid!</p>
        )}
      </div>
    </div>
  );
};

export default AuctionLiveUpdates; 