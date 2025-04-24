import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { placeBid, CreateBidData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface BidFormProps {
  auctionId: number;
  currentPrice: number;
  onBidPlaced: () => void;
}

const BidForm: React.FC<BidFormProps> = ({ auctionId, currentPrice, onBidPlaced }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ amount: number }>();
  
  // Minimum bid is 1 higher than current price
  const minBid = Math.ceil(currentPrice) + 1;
  
  const onSubmit = async (data: { amount: number }) => {
    if (!isAuthenticated) {
      setError('You need to login to place a bid');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const bidData: CreateBidData = {
        auction_id: auctionId,
        amount: parseFloat(data.amount.toString())
      };
      
      await placeBid(bidData);
      setSuccess('Bid placed successfully!');
      reset();
      onBidPlaced();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to place bid. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Place Your Bid</h3>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="amount" className="label">
            Bid Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            className="input w-full"
            step="0.01"
            min={minBid}
            {...register('amount', {
              required: 'Bid amount is required',
              min: {
                value: minBid,
                message: `Bid must be at least $${minBid}`
              },
              valueAsNumber: true
            })}
          />
          {errors.amount && (
            <p className="error">{errors.amount.message}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Current price: <span className="font-semibold">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-600">
            Min. bid: <span className="font-semibold">${minBid.toFixed(2)}</span>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-2 bg-green-50 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <button
          type="submit"
          className={`w-full btn ${
            isAuthenticated ? 'btn-primary' : 'btn-disabled'
          }`}
          disabled={loading || !isAuthenticated}
        >
          {loading ? 'Placing Bid...' : isAuthenticated ? 'Place Bid' : 'Login to Bid'}
        </button>
        
        {!isAuthenticated && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Please login to place a bid
          </p>
        )}
      </form>
    </div>
  );
};

export default BidForm; 