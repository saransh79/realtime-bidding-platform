import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBids, Bid } from '@/lib/api';

interface UserBid extends Bid {
  auction_title?: string;
}

const Profile = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [bids, setBids] = useState<UserBid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const fetchUserBids = async () => {
      try {
        const data = await getUserBids();
        setBids(data);
      } catch (err) {
        console.error('Error fetching user bids:', err);
        setError('Failed to load your bids');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserBids();
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return (
      <Layout title="Profile - BidStream">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="btn btn-primary"
          >
            Login
          </button>
        </div>
      </Layout>
    );
  }
  
  const sortedBids = [...bids].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  
  return (
    <Layout title="Your Profile - BidStream">
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h1>
          
          {user && (
            <div className="mt-4">
              <p className="text-gray-600">
                <span className="font-medium">Username:</span> {user.username}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {user.email}
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Bid History</h2>
          
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading bids...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              {error}
            </div>
          ) : sortedBids.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">You haven't placed any bids yet.</p>
              <Link href="/auctions" className="btn btn-primary">
                Browse Auctions
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bid Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedBids.map((bid) => {
                    const isHighestBid = bid.auction?.current_price === bid.amount;
                    
                    return (
                      <tr key={bid.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {bid.auction?.title || `Auction #${bid.auction_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-700">
                          ${bid.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(bid.time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isHighestBid ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Highest Bid
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Outbid
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            href={`/auctions/${bid.auction_id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View Auction
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 