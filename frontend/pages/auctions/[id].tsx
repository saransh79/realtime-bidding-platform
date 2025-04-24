import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Layout from '@/components/Layout';
import BidForm from '@/components/BidForm';
import AuctionLiveUpdates from '@/components/AuctionLiveUpdates';
import { getAuction, AuctionDetails } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface AuctionDetailProps {
  auctionId: number;
  initialData?: AuctionDetails;
  error?: string;
}

const AuctionDetail: React.FC<AuctionDetailProps> = ({ auctionId, initialData, error: initialError }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [auction, setAuction] = useState<AuctionDetails | undefined>(initialData);
  const [currentPrice, setCurrentPrice] = useState<number>(initialData?.current_price || 0);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | undefined>(initialError);
  
  useEffect(() => {
    if (!initialData && auctionId) {
      const fetchAuction = async () => {
        try {
          const data = await getAuction(auctionId);
          setAuction(data);
          setCurrentPrice(data.current_price);
        } catch (err) {
          console.error('Error fetching auction:', err);
          setError('Failed to load auction details');
        } finally {
          setLoading(false);
        }
      };
      
      fetchAuction();
    }
  }, [auctionId, initialData]);
  
  // Handle live price updates
  const handlePriceUpdate = (newPrice: number) => {
    setCurrentPrice(newPrice);
    if (auction) {
      setAuction({
        ...auction,
        current_price: newPrice
      });
    }
  };
  
  // Handle after a bid is placed
  const handleBidPlaced = () => {
    // The price will be updated through the WebSocket connection
    console.log('Bid placed');
  };
  
  if (loading) {
    return (
      <Layout title="Loading Auction - BidStream">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auction details...</p>
        </div>
      </Layout>
    );
  }
  
  if (error || !auction) {
    return (
      <Layout title="Auction Not Found - BidStream">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Auction not found'}</p>
          <button
            onClick={() => router.push('/auctions')}
            className="btn btn-primary"
          >
            Browse Auctions
          </button>
        </div>
      </Layout>
    );
  }
  
  const isActive = auction.is_active && new Date(auction.end_time) > new Date();
  const isOwner = user?.id === auction.owner_id;
  
  // Format time left
  const timeLeft = new Date(auction.end_time).getTime() - new Date().getTime();
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  let timeLeftStr = "Ended";
  if (timeLeft > 0) {
    if (days > 0) timeLeftStr = `${days}d ${hours}h ${minutes}m`;
    else if (hours > 0) timeLeftStr = `${hours}h ${minutes}m`;
    else timeLeftStr = `${minutes}m`;
  }
  
  return (
    <Layout title={`${auction.title} - BidStream`}>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* Image/Left side */}
          <div className="md:w-1/2 relative">
            <div className="relative h-64 md:h-full bg-gray-200">
              {auction.image_url ? (
                <Image
                  src={auction.image_url}
                  alt={auction.title}
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-300">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              
              {/* Status badge */}
              <div className="absolute top-4 left-4">
                {isActive ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Ended
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Content/Right side */}
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold text-gray-900">{auction.title}</h1>
            
            <div className="mt-2 flex items-center text-gray-600">
              <span>Seller: {auction.owner.username}</span>
              {isOwner && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">You</span>
              )}
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current bid</p>
                  <p className="text-2xl font-bold text-primary-600">${currentPrice.toFixed(2)}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Time left</p>
                  <p className={`text-xl font-semibold ${timeLeft <= 300000 ? 'text-red-600' : 'text-gray-700'}`}>
                    {timeLeftStr}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{auction.description}</p>
            </div>
            
            <div className="mt-6">
              <div className="flex flex-wrap text-sm">
                <div className="w-1/2 mb-2">
                  <span className="text-gray-500">Starting price:</span>
                  <span className="ml-2 font-medium">${auction.starting_price.toFixed(2)}</span>
                </div>
                <div className="w-1/2 mb-2">
                  <span className="text-gray-500">Start time:</span>
                  <span className="ml-2 font-medium">{new Date(auction.start_time).toLocaleString()}</span>
                </div>
                <div className="w-1/2">
                  <span className="text-gray-500">End time:</span>
                  <span className="ml-2 font-medium">{new Date(auction.end_time).toLocaleString()}</span>
                </div>
                <div className="w-1/2">
                  <span className="text-gray-500">Total bids:</span>
                  <span className="ml-2 font-medium">{auction.bids.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bidding section and live updates */}
        <div className="px-6 py-8 border-t border-gray-200">
          <div className="md:flex md:space-x-6">
            {/* Bid form */}
            <div className="md:w-1/2 mb-6 md:mb-0">
              {isActive && !isOwner ? (
                <BidForm
                  auctionId={auction.id}
                  currentPrice={currentPrice}
                  onBidPlaced={handleBidPlaced}
                />
              ) : isOwner ? (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Auction</h3>
                  <p className="text-gray-600 mb-4">
                    You cannot bid on your own auction. You can track the bidding activity in real-time.
                  </p>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Auction Ended</h3>
                  <p className="text-gray-600 mb-4">
                    This auction has ended and is no longer accepting bids.
                  </p>
                </div>
              )}
            </div>
            
            {/* Live updates */}
            <div className="md:w-1/2">
              <AuctionLiveUpdates
                auctionId={auction.id}
                onPriceUpdate={handlePriceUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};
  
  if (!id || Array.isArray(id)) {
    return {
      props: {
        error: 'Invalid auction ID'
      }
    };
  }
  
  const auctionId = parseInt(id as string, 10);
  
  if (isNaN(auctionId)) {
    return {
      props: {
        error: 'Invalid auction ID'
      }
    };
  }
  
  try {
    const auctionData = await getAuction(auctionId);
    
    return {
      props: {
        auctionId,
        initialData: auctionData
      }
    };
  } catch (error) {
    console.error('Error fetching auction:', error);
    
    return {
      props: {
        auctionId,
        error: 'Failed to load auction details'
      }
    };
  }
};

export default AuctionDetail; 