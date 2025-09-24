"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { QuotesAPI, StoredQuote } from "@/lib/quotes-api";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function QuoteDetailContent() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<StoredQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (quoteId) {
      loadQuote();
    }
  }, [quoteId]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const quoteData = await QuotesAPI.getQuote(quoteId);
      setQuote(quoteData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quote');
      console.error('Load quote error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true);
      await QuotesAPI.updateQuoteStatus(quoteId, newStatus);
      
      // Refresh the quote data
      await loadQuote();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quote status');
      console.error('Update status error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
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
      case 'customer_viewable': return 'Sent to Customer';
      case 'draft': return 'Draft';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const getAvailableStatusTransitions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft':
        return [
          { status: 'customer_viewable', label: 'Send to Customer', color: 'btn-coral' },
        ];
      case 'customer_viewable':
        return [
          { status: 'accepted', label: 'Mark as Accepted', color: 'bg-green-600 hover:bg-green-700' },
          { status: 'declined', label: 'Mark as Declined', color: 'bg-red-600 hover:bg-red-700' },
          { status: 'expired', label: 'Mark as Expired', color: 'bg-orange-600 hover:bg-orange-700' },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Error Loading Quote</h1>
          <p className="text-gray-700 mb-6">{error || 'Quote not found'}</p>
          <Button onClick={() => router.push('/quotes')} className="btn-coral">
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  const formData = quote.labour_inputs?.data;

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-navy">Quote {quote.quote_number}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                  {getStatusLabel(quote.status)}
                </span>
              </div>
              <p className="text-gray-600">
                {quote.project?.customer?.name} • Created {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => router.push('/quotes')} 
                variant="outline"
              >
                ← All Quotes
              </Button>
              <Button 
                onClick={() => router.push('/intake')} 
                variant="outline"
              >
                New Quote
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Customer & Project Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <div className="font-semibold">{quote.project?.customer?.name || 'N/A'}</div>
                </div>
                {quote.project?.customer?.email && (
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <div className="font-semibold">{quote.project.customer.email}</div>
                  </div>
                )}
                {quote.project?.customer?.phone && (
                  <div>
                    <label className="text-sm text-gray-600">Phone</label>
                    <div className="font-semibold">{quote.project.customer.phone}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Project Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Address</label>
                  <div className="font-semibold">
                    {typeof quote.project?.address === 'object' 
                      ? quote.project.address.full_address || 'Address not provided'
                      : quote.project?.address || 'Address not provided'
                    }
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Building Type</label>
                  <div className="font-semibold capitalize">{quote.project?.building_type}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Bathroom Type</label>
                  <div className="font-semibold">{formData?.bathroom_type?.replace('_', ' ')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Details */}
          {formData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Quote Specifications</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Floor Area</label>
                  <div className="font-semibold">{formData.floor_sqft} sq ft</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Wet Wall Area</label>
                  <div className="font-semibold">{formData.wet_wall_sqft} sq ft</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Ceiling Height</label>
                  <div className="font-semibold">{formData.ceiling_height || 'Standard'}</div>
                </div>
                {formData.vanity_width_in && (
                  <div>
                    <label className="text-sm text-gray-600">Vanity Width</label>
                    <div className="font-semibold">{formData.vanity_width_in} inches</div>
                  </div>
                )}
                {formData.electrical_items && (
                  <div>
                    <label className="text-sm text-gray-600">Electrical Items</label>
                    <div className="font-semibold">{formData.electrical_items}</div>
                  </div>
                )}
                {formData.year_built && (
                  <div>
                    <label className="text-sm text-gray-600">Year Built</label>
                    <div className="font-semibold">{formData.year_built}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Pricing Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Labour Subtotal</span>
                <span className="font-semibold">{formatCurrency(quote.labour_subtotal_cents)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Materials Subtotal</span>
                <span className="font-semibold">{formatCurrency(quote.materials_subtotal_cents)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-coral/5 px-4 rounded">
                <span className="text-lg font-semibold text-navy">Grand Total</span>
                <span className="text-xl font-bold text-coral">
                  {formatCurrency(quote.labour_subtotal_cents + quote.materials_subtotal_cents)}
                </span>
              </div>
              <div className="text-sm text-gray-600 pt-2">
                Deposit Required: {formatCurrency((quote.labour_subtotal_cents + quote.materials_subtotal_cents) * (quote.deposit_required_pct / 100))} ({quote.deposit_required_pct}%)
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Quote Actions</h2>
            <div className="flex flex-wrap gap-3">
              {getAvailableStatusTransitions(quote.status).map((transition) => (
                <Button
                  key={transition.status}
                  onClick={() => handleStatusUpdate(transition.status)}
                  disabled={updating}
                  className={`${transition.color} text-white`}
                >
                  {updating ? 'Updating...' : transition.label}
                </Button>
              ))}
              
              {quote.status === 'draft' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Implement duplicate quote functionality
                    alert('Duplicate quote functionality coming soon');
                  }}
                >
                  Duplicate Quote
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Implement PDF export
                  alert('PDF export functionality coming soon');
                }}
              >
                Export PDF
              </Button>
            </div>
          </div>

          {/* Quote History / Audit Trail - TODO: Implement this */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Quote History</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 py-2">
                <div className="w-2 h-2 bg-coral rounded-full"></div>
                <div>
                  <div className="font-medium">Quote created</div>
                  <div className="text-sm text-gray-600">{new Date(quote.created_at).toLocaleString()}</div>
                </div>
              </div>
              {quote.updated_at !== quote.created_at && (
                <div className="flex items-center space-x-3 py-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Quote updated</div>
                    <div className="text-sm text-gray-600">{new Date(quote.updated_at).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function QuoteDetailPage() {
  return (
    <ProtectedRoute>
      <QuoteDetailContent />
    </ProtectedRoute>
  );
}