import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { LoginData } from '@/lib/api';

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
  
  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    setError(null);
    
    try {
      await login(data);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout title="Login - BidStream">
      <div className="max-w-md mx-auto my-10">
        <div className="bg-white p-8 shadow rounded-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                type="text"
                className="input w-full"
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && (
                <p className="error">{errors.username.message}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                className="input w-full"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="error">{errors.password.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="link">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login; 