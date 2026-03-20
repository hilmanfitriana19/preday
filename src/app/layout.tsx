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
    default: "PredaY | The Proactive H-1 Telegram Reminder & Loop System",
    template: "%s | PredaY"
  },
  description: "Stop missing deadlines. PredaY gives you a friendly 'Yo!' nudge 1 day before your event. Set recurring bills, birthdays, and tasks on autopilot with centralized Telegram alerts.",
  keywords: ["telegram alerts", "reminder service", "n8n automation", "productivity tool", "deadline buffer", "H-1 nudge", "recurring reminders", "preday"],
  authors: [{ name: "Hilman" }],
  creator: "Hilman",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hyhilman.web.id/preday",
    title: "PredaY | The Proactive H-1 Telegram Reminder & Loop System",
    description: "Friendly 'Yo!' nudges 1 day before your events. Automated Telegram alerts for bills, tasks, and birthdays.",
    siteName: "PredaY",
  },
  twitter: {
    card: "summary_large_image",
    title: "PredaY | The Proactive H-1 Telegram Reminder & Loop System",
    description: "Stop missing deadlines. Friendly H-1 nudges via Telegram for all your important events.",
    creator: "@hyhilman",
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
    "description": "The Proactive H-1 Telegram Reminder & Loop System. Stop missing deadlines with friendly 'Yo!' nudges.",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web/Telegram",
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
      "H-1 Proactive Nudges",
      "Recurring Loops",
      "Telegram Integration",
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
