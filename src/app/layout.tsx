import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LunchRank",
  description: "Rate your lunch and help us find the best spots!",
  keywords: "lunch, restaurant ratings, food reviews, team lunch, office lunch",
  authors: [{ name: "Tom Snyder", url: "https://tomsnyder.blog" }],
  creator: "Tom Snyder",
  publisher: "Tom Snyder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' }
  ],
  openGraph: {
    title: 'LunchRank',
    description: 'Rate your lunch and help us find the best spots!',
    type: 'website',
    images: [
      {
        url: '/lunchrank-open-graph.png',
        width: 1200,
        height: 630,
        alt: 'LunchRank'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LunchRank - Rate Your Lunch',
    description: 'Rate your lunch and help us find the best spots!',
    images: ['/favicon/og-image.png'],
    creator: '@tomsnyder',
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
  icons: {
    icon: [
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon.ico', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    title: 'LunchRank',
    capable: true,
    statusBarStyle: 'default'
  },
  manifest: '/favicon/site.webmanifest'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="lunchrank">
      <head>
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="LunchRank" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        
        {/* Additional meta tags */}
        <meta name="application-name" content="LunchRank" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
      </head>
      <body>{children}</body>
    </html>
  );
}
