import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import AuctionCard from '@/components/AuctionCard';
import { getAuctions, Auction } from '@/lib/api';
import { connectToLiveFeed } from '@/lib/websocket';

const Home = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const data = await getAuctions(true); // Get active auctions only
        setAuctions(data);
      } catch (err) {
        console.error('Error fetching auctions:', err);
        setError('Failed to load auctions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctions();
    
    // Connect to live feed for real-time updates
    const liveConnection = connectToLiveFeed({
      onMessage: (data) => {
        // Handle real-time updates
        if (data.event === 'new_auction') {
          // Refresh auctions when a new one is created
          fetchAuctions();
        }
        
        if (data.event === 'auction_ended') {
          // Update UI when an auction ends
          setAuctions(prevAuctions => 
            prevAuctions.map(auction => 
              auction.id === data.auction_id 
                ? { ...auction, is_active: false } 
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
  
  return (
    <Layout title="BidStream - Realtime Bidding Platform">
      <div className="py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome to BidStream
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The realtime bidding platform where you can bid on items in real-time and watch the action unfold live.
          </p>
          
          <div className="mt-8">
            <Link href="/auctions" className="btn btn-primary px-8 py-3 text-lg">
              Browse All Auctions
            </Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Auctions</h2>
          
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
              <p className="text-gray-600">No active auctions found</p>
              <Link href="/auctions/create" className="mt-4 inline-block btn btn-primary">
                Create an Auction
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.slice(0, 6).map(auction => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
          
          {auctions.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/auctions" className="btn btn-outline">
                View All Auctions
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home; 