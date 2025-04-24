import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Auction } from '@/lib/api';

interface AuctionCardProps {
  auction: Auction;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const isActive = auction.is_active && new Date(auction.end_time) > new Date();
  const timeLeft = new Date(auction.end_time).getTime() - new Date().getTime();
  
  // Format time left
  const formatTimeLeft = () => {
    if (timeLeft <= 0) return "Ended";
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
        {auction.image_url ? (
          <Image
            src={auction.image_url}
            alt={auction.title}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-300">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        {isActive && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 truncate">{auction.title}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{auction.description}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Current bid</p>
            <p className="text-lg font-semibold text-primary-600">${auction.current_price.toFixed(2)}</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Time left</p>
            <p className={`text-sm font-medium ${timeLeft <= 300000 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTimeLeft()}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <Link 
            href={`/auctions/${auction.id}`}
            className="w-full btn btn-primary"
          >
            {isActive ? 'Bid Now' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard; 