import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hyhilman.web.id/preday"),
  title: {
    default: "PredaY | Your Professional H-1 Buffer",
    template: "%s | PredaY"
  },
  description: "Yo! Don't let your day slip away. PredaY is your centralized Telegram alert buffer, ensuring you're never surprised by a deadline again.",
  keywords: ["telegram alerts", "reminder service", "n8n automation", "productivity tool", "deadline buffer", "preday"],
  authors: [{ name: "Hilman" }],
  creator: "Hilman",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hyhilman.web.id/preday",
    title: "PredaY | Your Professional H-1 Buffer",
    description: "Centralized Telegram alerts powered by automation. Your perfect H-1 buffer for every event.",
    siteName: "PredaY",
  },
  twitter: {
    card: "summary_large_image",
    title: "PredaY | Your H-1 Buffer",
    description: "Don't let your day slip away. Centralized Telegram alerts for your events.",
    creator: "@hyhilman", // Assuming user handle based on URL
  },
  alternates: {
    canonical: "/preday",
  },
  icons: {
    icon: "/preday/logo.png",
    apple: "/preday/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PredaY",
    "description": "Centralized Telegram alerts powered by automation. Your professional H-1 buffer for every event.",
    "applicationCategory": "Productivity",
    "operatingSystem": "Web",
    "author": {
      "@type": "Person",
      "name": "Hilman"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Telegram Alert Integration",
      "Smart Buffer Notifications",
      "Centralized Dashboard",
      "n8n Powered Automation"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
