import type { Metadata } from "next";
import { spaceGrotesk, inter, jetbrainsMono } from "@/lib/fonts";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Cloud Renovation — Structured, stress-free kitchen & bath renovations",
  description: "Get your personalized renovation quote. Professional bathroom renovations with transparent pricing and expert design guidance.",
  keywords: ["bathroom renovation", "kitchen renovation", "renovation quote", "design consultation"],
  openGraph: {
    title: "Cloud Renovation Quote App",
    description: "Get your personalized renovation quote",
    url: "https://quote.cloudrenovation.ca",
    siteName: "Cloud Renovation",
    images: [
      {
        url: "https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud%20Logo.png",
        width: 512,
        height: 512,
        alt: "Cloud Renovation Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud Renovation Quote App",
    description: "Get your personalized renovation quote",
    images: ["https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud%20Logo.png"],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-inter antialiased">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}