"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuotesAPI, QuoteSummary } from '@/lib/quotes-api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface QuoteStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  totalValue: number;
}

function DashboardContent() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [recentQuotes, setRecentQuotes] = useState<QuoteSummary[]>([]);
  const [stats, setStats] = useState<QuoteStats>({
    total: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [quotesResult, statsResult] = await Promise.all([
        QuotesAPI.getQuotes(1, 5), // Get 5 most recent quotes
        QuotesAPI.getQuoteStats()
      ]);
      
      setRecentQuotes(quotesResult.quotes);
      setStats(statsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/login');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'customer_viewable': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'customer_viewable': return 'Sent';
      case 'draft': return 'Draft';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-navy">CloudReno Quote App</h1>
              <p className="text-gray-600">Welcome back, {profile?.full_name || user?.email}</p>
              {profile?.company_name && (
                <p className="text-sm text-gray-500">{profile.company_name}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <p className="text-coral capitalize">{profile?.role}</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div className="text-red-700">{error}</div>
              <Button 
                onClick={loadDashboardData} 
                variant="outline" 
                size="sm"
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">New Quote</h3>
              <p className="text-gray-600 text-sm mb-4">Start a new bathroom renovation quote</p>
              <Button onClick={() => router.push('/intake')} className="w-full">
                Create Quote
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">All Quotes</h3>
              <p className="text-gray-600 text-sm mb-4">View and manage your quotes</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/quotes')}
              >
                View All Quotes
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">Rate Cards</h3>
              <p className="text-gray-600 text-sm mb-4">Manage your pricing and rate cards</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/admin/rate-cards')}
              >
                Manage Rates
              </Button>
            </div>
          </div>
        </div>

        {/* Quote Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-navy mb-6">Quote Statistics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-coral">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Quotes</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
            <div className="text-center p-4 bg-coral/10 rounded">
              <div className="text-2xl font-bold text-coral">{formatCurrency(stats.totalValue)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-navy">Recent Quotes</h2>
            <Button 
              variant="outline"
              onClick={() => router.push('/quotes')}
            >
              View All
            </Button>
          </div>
          
          {recentQuotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>No quotes created yet</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/intake')}
              >
                Create Your First Quote
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Quote #</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Project</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Total</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotes.map((quote) => (
                    <tr 
                      key={quote.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/quotes/${quote.id}`)}
                    >
                      <td className="py-3 px-2 font-mono text-sm">{quote.quote_number}</td>
                      <td className="py-3 px-2">
                        <div className="font-semibold">{quote.customer_name}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm">{quote.bathroom_type?.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500 capitalize">{quote.building_type}</div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(quote.status)}`}>
                          {getStatusLabel(quote.status)}
                        </span>
                      </td>
                      <td className="text-right py-3 px-2 font-semibold">
                        {formatCurrency(quote.grand_total)}
                      </td>
                      <td className="text-center py-3 px-2 text-sm">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}