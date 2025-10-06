"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface SelectionData {
  package_name: string;
  pricing_snapshot: {
    package_id: string;
    package_name: string;
    materials_total: number;
    labor_total: number;
    grand_total: number;
  };
  selected_at: string;
  customer_name: string;
  customer_email: string;
  project_address: string;
}

export default function CustomerCompletePage({ params }: { params: { token: string } }) {
  const [selectionData, setSelectionData] = useState<SelectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelection = async () => {
      try {
        const response = await fetch(`/api/customer/selection/${params.token}`);

        if (!response.ok) {
          throw new Error('Failed to load selection');
        }

        const data = await response.json();
        setSelectionData(data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load confirmation');
      } finally {
        setLoading(false);
      }
    };

    fetchSelection();
  }, [params.token]);

  if (loading) {
    return <LoadingSpinner message="Loading confirmation..." fullScreen />;
  }

  if (error || !selectionData) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 shadow-lg max-w-md mx-auto text-center [clip-path:polygon(0.75rem_0%,100%_0%,100%_calc(100%-0.75rem),calc(100%-0.75rem)_100%,0%_100%,0%_0.75rem)]">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy to-navy/90">
      {/* Hero Section - Celebration */}
      <div className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-coral blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-coral blur-3xl"></div>
        </div>

        <div className="relative container-custom py-16 text-center">
          {/* Success Icon */}
          <div className="mb-6 inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-coral to-coral/80 flex items-center justify-center mx-auto shadow-2xl [clip-path:polygon(0.75rem_0%,100%_0%,100%_calc(100%-0.75rem),calc(100%-0.75rem)_100%,0%_100%,0%_0.75rem)]">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Congratulations, {selectionData.customer_name}!
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            You've just designed your dream bathroom renovation
          </p>

          {/* Selection Highlight Card */}
          <div className="bg-white shadow-2xl p-8 max-w-4xl mx-auto mb-8 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div className="text-left">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Your Selection</p>
                <h2 className="text-2xl font-bold text-navy mb-2">{selectionData.package_name}</h2>
                <p className="text-gray-600">{selectionData.project_address}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Total Investment</p>
                <div className="text-4xl font-bold text-coral mb-1">
                  ${selectionData.pricing_snapshot.grand_total.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">
                  Labor ${selectionData.pricing_snapshot.labor_total.toLocaleString()} +
                  Materials ${selectionData.pricing_snapshot.materials_total.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="border-t pt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-navy">100+</div>
                <div className="text-sm text-gray-600">Happy Homeowners</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">5-Star</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">Licensed</div>
                <div className="text-sm text-gray-600">& Insured</div>
              </div>
            </div>
          </div>

          {/* Urgency Message */}
          <div className="bg-coral/10 border-2 border-coral/30 p-4 max-w-2xl mx-auto [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <p className="text-white font-semibold">
              ⏰ Your quote is valid for 30 days. Secure your spot on our schedule today!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - White Background */}
      <div className="bg-white">
        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Why Choose Us Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy mb-4">
                Why CloudReno Customers Love Their Decision
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join hundreds of homeowners who trusted us with their bathroom transformation
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-coral/10 flex items-center justify-center mx-auto mb-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                  <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Fixed Pricing</h3>
                <p className="text-gray-600">No surprises. What you see is what you pay. Guaranteed.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-coral/10 flex items-center justify-center mx-auto mb-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                  <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">On-Time Delivery</h3>
                <p className="text-gray-600">We respect your time. Projects completed on schedule, every time.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-coral/10 flex items-center justify-center mx-auto mb-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                  <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">Premium materials and expert craftsmanship. Your satisfaction is guaranteed.</p>
              </div>
            </div>

            {/* CTA Section - Deposit */}
            <div className="bg-gradient-to-br from-coral to-coral/90 p-8 md:p-12 text-white text-center shadow-2xl [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Secure Your Spot Today
              </h2>
              <p className="text-xl mb-2 text-white/90">
                Reserve your project with a fully refundable $500 deposit
              </p>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Lock in your pricing, secure your spot on our schedule, and start your bathroom transformation journey
              </p>

              <div className="bg-white/10 backdrop-blur p-6 mb-8 max-w-md mx-auto [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-lg">100% Refundable Deposit</span>
                </div>
                <p className="text-sm text-white/80">
                  Change your mind? Get your full deposit back, no questions asked
                </p>
              </div>

              <a
                href={process.env.NEXT_PUBLIC_STRIPE_DEPOSIT_LINK || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-coral px-10 py-4 text-lg font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]"
              >
                Pay $500 Deposit Now →
              </a>

              <p className="text-sm text-white/70 mt-6">
                Secure payment processing by Stripe • Takes less than 2 minutes
              </p>
            </div>

            {/* Payment Timeline */}
            <div className="bg-gray-50 p-8 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
              <h3 className="text-2xl font-bold text-navy mb-6 text-center">
                Simple, Transparent Payment Schedule
              </h3>

              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-coral text-white flex items-center justify-center font-bold [clip-path:polygon(0.375rem_0%,100%_0%,100%_calc(100%-0.375rem),calc(100%-0.375rem)_100%,0%_100%,0%_0.375rem)]">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-navy text-lg mb-1">$500 Today</h4>
                    <p className="text-gray-600">Refundable deposit to secure your spot and lock in pricing</p>
                  </div>
                  <div className="text-right">
                    <div className="text-coral font-bold">Now</div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-navy text-white flex items-center justify-center font-bold [clip-path:polygon(0.375rem_0%,100%_0%,100%_calc(100%-0.375rem),calc(100%-0.375rem)_100%,0%_100%,0%_0.375rem)]">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-navy text-lg mb-1">50% Payment</h4>
                    <p className="text-gray-600">After project start date confirmed and materials ordered</p>
                  </div>
                  <div className="text-right">
                    <div className="text-navy font-semibold text-sm">Week 1-2</div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-navy text-white flex items-center justify-center font-bold [clip-path:polygon(0.375rem_0%,100%_0%,100%_calc(100%-0.375rem),calc(100%-0.375rem)_100%,0%_100%,0%_0.375rem)]">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-navy text-lg mb-1">40% Payment</h4>
                    <p className="text-gray-600">After tile installation is complete and inspected</p>
                  </div>
                  <div className="text-right">
                    <div className="text-navy font-semibold text-sm">Week 2-3</div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-navy text-white flex items-center justify-center font-bold [clip-path:polygon(0.375rem_0%,100%_0%,100%_calc(100%-0.375rem),calc(100%-0.375rem)_100%,0%_100%,0%_0.375rem)]">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-navy text-lg mb-1">10% Final Payment</h4>
                    <p className="text-gray-600">Upon completion, final walkthrough, and your satisfaction</p>
                  </div>
                  <div className="text-right">
                    <div className="text-navy font-semibold text-sm">Completion</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-white border-2 border-gray-200 p-8 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
              <h3 className="text-2xl font-bold text-navy mb-6 text-center">
                What Happens After Your Deposit?
              </h3>

              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 text-coral text-2xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-navy mb-1">Instant Confirmation</h4>
                    <p className="text-gray-600">
                      You'll receive immediate confirmation and your project is officially scheduled
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 text-coral text-2xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-navy mb-1">Meet Your Contractor (24-48 hours)</h4>
                    <p className="text-gray-600">
                      Your dedicated contractor will reach out to introduce themselves and answer any questions
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 text-coral text-2xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-navy mb-1">Schedule Your Project</h4>
                    <p className="text-gray-600">
                      We'll work with your schedule to find the perfect start date for your renovation
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 text-coral text-2xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-navy mb-1">Materials Coordination</h4>
                    <p className="text-gray-600">
                      Review and finalize all materials to ensure everything matches your vision perfectly
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 text-coral text-2xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-navy mb-1">Dream Bathroom Complete</h4>
                    <p className="text-gray-600">
                      Sit back and watch as we transform your bathroom into the space you've always wanted
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof / Testimonial */}
            <div className="bg-gradient-to-br from-navy to-navy/90 text-white p-8 md:p-12 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
              <div className="max-w-3xl mx-auto text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-8 h-8 text-coral" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xl md:text-2xl mb-6 italic">
                  "Best decision we made! CloudReno transformed our outdated bathroom into a spa-like retreat.
                  Professional, on-time, and the quality exceeded our expectations. Worth every penny!"
                </p>
                <p className="font-semibold">- Sarah & Mike T., Vancouver</p>
                <p className="text-white/70 text-sm">Full Bathroom Renovation, 2024</p>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                Ready to Start Your Bathroom Transformation?
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Your dream bathroom is just one click away. Join our family of happy homeowners today.
              </p>
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_DEPOSIT_LINK || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-coral text-white px-10 py-4 text-lg font-bold hover:bg-coral/90 transition-all transform hover:scale-105 shadow-xl [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]"
              >
                Secure My Spot with $500 Deposit →
              </a>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 p-6 text-center [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
              <h4 className="font-semibold text-navy mb-2">Have Questions?</h4>
              <p className="text-gray-600 mb-4">We're here to help! Reach out anytime.</p>
              <div className="space-y-2">
                <a
                  href="mailto:team@cloudrenovation.ca"
                  className="text-coral hover:underline font-semibold block"
                >
                  team@cloudrenovation.ca
                </a>
                <a
                  href="https://cloudrenovation.ca"
                  className="text-coral hover:underline font-semibold block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  cloudrenovation.ca
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
