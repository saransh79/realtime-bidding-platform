import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Realtime Bidding Platform' }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary-600">
                  BidStream
                </Link>
              </div>
              <nav className="ml-6 flex space-x-8">
                <Link href="/auctions" className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-primary-700">
                  Auctions
                </Link>
                {isAuthenticated && (
                  <>
                    <Link href="/auctions/create" className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-primary-700">
                      Create Auction
                    </Link>
                    <Link href="/profile" className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-primary-700">
                      My Bids
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user?.username}</span>
                  <button
                    onClick={logout}
                    className="btn btn-outline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Link href="/login" className="btn btn-outline">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-primary">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            &copy; {new Date().getFullYear()} BidStream. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 