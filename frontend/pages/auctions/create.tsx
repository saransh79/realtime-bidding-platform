import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { createAuction, CreateAuctionData } from '@/lib/api';

const CreateAuction = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateAuctionData>();
  
  // Calculate minimum end date (24 hours from now)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minEndDate = tomorrow.toISOString().split('T')[0];
  
  // Calculate maximum end date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxEndDate = maxDate.toISOString().split('T')[0];
  
  const onSubmit = async (data: CreateAuctionData) => {
    if (!isAuthenticated) {
      setError('You must be logged in to create an auction');
      router.push('/login');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Format end_time as ISO string
      const endDateTime = new Date(`${data.end_time}T23:59:59`);
      const formattedData = {
        ...data,
        end_time: endDateTime.toISOString()
      };
      
      const newAuction = await createAuction(formattedData);
      router.push(`/auctions/${newAuction.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create auction. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Layout title="Create Auction - BidStream">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to create an auction.</p>
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
  
  return (
    <Layout title="Create Auction - BidStream">
      <div className="max-w-2xl mx-auto my-10">
        <div className="bg-white p-8 shadow rounded-lg">
          <h1 className="text-2xl font-bold mb-6">Create New Auction</h1>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="title" className="label">Title</label>
              <input
                id="title"
                type="text"
                className="input w-full"
                placeholder="Enter auction title"
                {...register('title', { 
                  required: 'Title is required',
                  maxLength: {
                    value: 100,
                    message: 'Title cannot exceed 100 characters'
                  }
                })}
              />
              {errors.title && (
                <p className="error">{errors.title.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                rows={4}
                className="input w-full"
                placeholder="Describe your item in detail"
                {...register('description', { 
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description must be at least 20 characters'
                  }
                })}
              ></textarea>
              {errors.description && (
                <p className="error">{errors.description.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="starting_price" className="label">Starting Price ($)</label>
              <input
                id="starting_price"
                type="number"
                step="0.01"
                min="0.01"
                className="input w-full"
                placeholder="0.00"
                {...register('starting_price', { 
                  required: 'Starting price is required',
                  min: {
                    value: 0.01,
                    message: 'Starting price must be at least $0.01'
                  },
                  valueAsNumber: true
                })}
              />
              {errors.starting_price && (
                <p className="error">{errors.starting_price.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="image_url" className="label">Image URL (optional)</label>
              <input
                id="image_url"
                type="url"
                className="input w-full"
                placeholder="https://example.com/image.jpg"
                {...register('image_url', { 
                  pattern: {
                    value: /^(https?:\/\/.*)\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i,
                    message: 'Must be a valid image URL (JPG, PNG, GIF, WEBP)'
                  }
                })}
              />
              {errors.image_url && (
                <p className="error">{errors.image_url.message}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="end_time" className="label">End Date</label>
              <input
                id="end_time"
                type="date"
                className="input w-full"
                min={minEndDate}
                max={maxEndDate}
                {...register('end_time', { 
                  required: 'End date is required'
                })}
              />
              {errors.end_time && (
                <p className="error">{errors.end_time.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Auction must end between 1 and 30 days from today
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Auction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateAuction; 