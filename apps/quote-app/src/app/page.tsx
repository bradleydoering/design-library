import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="navbar navbar--glass">
        <div className="container-custom">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Image
                src="https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud_Renovation_Logo-removebg-preview.png"
                alt="Cloud Renovation"
                width={200}
                height={56}
                className="h-8 md:h-14 w-auto"
                priority
              />
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-navy hover:text-coral hover:bg-coral/10"
                asChild
              >
                <Link href="/admin/rate-cards">Rate Cards</Link>
              </Button>
              <Button
                variant="ghost"
                className="text-navy hover:text-coral hover:bg-coral/10"
                asChild
              >
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="container-custom">
          <div className="ipad-container text-center">
            <h1 className="heading-responsive font-space text-navy mb-6">
              Contractor Quote Calculator
            </h1>
            <p className="text-responsive text-navy/80 mb-8 max-w-2xl mx-auto">
              iPad-optimized tool for contractors to generate instant bathroom renovation quotes on-site.
              Take measurements, input data, get accurate labor pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="ipad"
                className="btn-coral touch-target w-full sm:w-auto"
                asChild
              >
                <Link href="/intake">Start Quote</Link>
              </Button>
              <Button
                variant="outline"
                size="ipad"
                className="touch-target w-full sm:w-auto"
                asChild
              >
                <Link href="/login">Login to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 -z-10 dotted-pattern"></div>
      </section>

      {/* How it Works Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="ipad-container">
            <h2 className="text-2xl md:text-3xl font-space text-navy text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="square-container w-16 h-16 mx-auto mb-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-space text-navy mb-2">Project Details</h3>
                <p className="text-navy/70">
                  Tell us about your bathroom renovation project, space dimensions, and preferences.
                </p>
              </div>
              <div className="text-center">
                <div className="square-container w-16 h-16 mx-auto mb-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-space text-navy mb-2">Choose Design</h3>
                <p className="text-navy/70">
                  Select from our curated design packages that match your style and budget.
                </p>
              </div>
              <div className="text-center">
                <div className="square-container w-16 h-16 mx-auto mb-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_100%,0%_0.5rem)]">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-space text-navy mb-2">Get Your Quote</h3>
                <p className="text-navy/70">
                  Receive a detailed, transparent quote with all materials and labor included.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-cloudwhite py-8">
        <div className="container-custom">
          <div className="text-center">
            <p className="text-sm opacity-80">
              © 2024 Cloud Renovation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
