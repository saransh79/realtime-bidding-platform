import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import AuctionCard from '@/components/AuctionCard';
import { getAuctions, Auction } from '@/lib/api';
import { connectToLiveFeed } from '@/lib/websocket';
import { useRouter } from 'next/router';

const AuctionsPage = () => {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showActive, setShowActive] = useState<boolean>(true);
  
  const fetchAuctions = async (activeOnly = showActive) => {
    setLoading(true);
    try {
      const data = await getAuctions(activeOnly);
      setAuctions(data);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAuctions();
    
    // Connect to live feed for real-time updates
    const liveConnection = connectToLiveFeed({
      onMessage: (data) => {
        if (data.event === 'new_auction' || data.event === 'auction_deleted') {
          fetchAuctions();
        }
        
        if (data.event === 'auction_updated') {
          setAuctions(prevAuctions => 
            prevAuctions.map(auction => 
              auction.id === data.auction_id 
                ? { ...auction, title: data.title, current_price: data.current_price } 
                : auction
            )
          );
        }
        
        if (data.event === 'new_bid') {
          setAuctions(prevAuctions => 
            prevAuctions.map(auction => 
              auction.id === data.auction_id 
                ? { ...auction, current_price: data.amount } 
                : auction
            )
          );
        }
      }
    });
    
    return () => {
      liveConnection.disconnect();
    };
  }, []);
  
  // Toggle between active and all auctions
  const toggleActiveFilter = () => {
    setShowActive(!showActive);
    fetchAuctions(!showActive);
  };
  
  return (
    <Layout title="Auctions - BidStream">
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {showActive ? 'Active Auctions' : 'All Auctions'}
          </h1>
          
          <div className="flex space-x-4">
            <button
              onClick={toggleActiveFilter}
              className="btn btn-outline"
            >
              {showActive ? 'Show All' : 'Show Active Only'}
            </button>
            
            <Link href="/auctions/create" className="btn btn-primary">
              Create Auction
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auctions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            {error}
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {showActive 
                ? 'No active auctions found. Be the first to create one!' 
                : 'No auctions found'
              }
            </p>
            <Link href="/auctions/create" className="btn btn-primary">
              Create Auction
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map(auction => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuctionsPage; 