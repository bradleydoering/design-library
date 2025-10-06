"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuotesAPI, QuoteSummary } from "@/lib/quotes-api";
import { Button } from "@/components/ui/button";
import { ClientAuthCheck } from "@/components/auth/ClientAuthCheck";

function QuotesListContent() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadQuotes();
  }, [page, statusFilter]);

  const loadQuotes = async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;
      const result = await QuotesAPI.getQuotes(
        currentPage, 
        20, 
        statusFilter === 'all' ? undefined : statusFilter
      );
      
      setQuotes(result.quotes);
      setHasMore(result.hasMore);
      setTotal(result.total);
      
      if (resetPage) {
        setPage(1);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
      console.error('Load quotes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
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

  const handleQuoteClick = (quoteId: string) => {
    router.push(`/quotes/${quoteId}`);
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Loading quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-navy">Quote Management</h1>
              <p className="text-gray-600">View and manage all your quotes ({total} total)</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="outline"
              >
                ← Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/intake')} 
                className="btn-coral"
              >
                New Quote
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-500 mr-3">⚠️</div>
                <div className="text-red-700">{error}</div>
                <Button 
                  onClick={() => loadQuotes(true)} 
                  variant="outline" 
                  size="sm"
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Filter Quotes</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Quotes' },
                { value: 'draft', label: 'Drafts' },
                { value: 'customer_viewable', label: 'Sent' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'declined', label: 'Declined' },
                { value: 'expired', label: 'Expired' }
              ].map((filter) => (
                <Button
                  key={filter.value}
                  onClick={() => handleStatusFilter(filter.value)}
                  variant={statusFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  className={statusFilter === filter.value ? "bg-coral hover:bg-coral-dark" : ""}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quotes Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-navy">
                {statusFilter === 'all' ? 'All Quotes' : `${getStatusLabel(statusFilter)} Quotes`}
              </h2>
            </div>
            
            {quotes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-navy mb-2">No Quotes Found</h3>
                <p className="mb-6">
                  {statusFilter === 'all' 
                    ? "You haven't created any quotes yet" 
                    : `No ${getStatusLabel(statusFilter).toLowerCase()} quotes found`
                  }
                </p>
                <Button 
                  onClick={() => router.push('/intake')}
                  className="btn-coral"
                >
                  Create Your First Quote
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Quote #</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Project</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Address</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-700">Total</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Created</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quotes.map((quote) => (
                      <tr 
                        key={quote.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleQuoteClick(quote.id)}
                      >
                        <td className="py-4 px-6 font-mono text-sm text-coral">
                          {quote.quote_number}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-navy">{quote.customer_name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium">{quote.bathroom_type?.replace('_', ' ')}</div>
                          <div className="text-sm text-gray-500 capitalize">{quote.building_type}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {quote.project_address || 'No address provided'}
                          </div>
                        </td>
                        <td className="text-center py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                            {getStatusLabel(quote.status)}
                          </span>
                        </td>
                        <td className="text-right py-4 px-6 font-semibold text-navy">
                          {formatCurrency(quote.grand_total)}
                        </td>
                        <td className="text-center py-4 px-6 text-sm text-gray-600">
                          {new Date(quote.created_at).toLocaleDateString()}
                        </td>
                        <td className="text-center py-4 px-6">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuoteClick(quote.id);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {quotes.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing page {page} of quotes
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1 || loading}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={!hasMore || loading}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function QuotesListPage() {
  return (
    <ClientAuthCheck>
      <QuotesListContent />
    </ClientAuthCheck>
  );
}