import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: {
    default: 'Talk of Nations - Kenyan News, Politics, Gossip, and Humor',
    template: '%s | Talk of Nations',
  },
  description: 'The home of unfiltered Kenyan news, political gossip, satire, and humor. Your daily source for breaking stories, analysis, and lifestyle content from across the nation and Africa.',
  keywords: [
    // General & Global
    'international news today', 'breaking news worldwide', 'world politics updates', 'trending global stories', 'international current affairs',
    // Kenyan & African
    'Kenyan politics news', 'latest news in Kenya today', 'Africa breaking news', 'East African politics', 'Kenya government updates',
    // Politics & Governance
    'political gossip and satire', 'government scandals exposed', 'political analysis and commentary', 'leaders corruption news', 'regime change discussions',
    // Humor & Gossip
    'funny Kenyan news', 'humorous political gossip', 'trending scandals Kenya', 'rib-cracking Kenyan stories', 'celebrity gossip Kenya',
    // Blog/Brand
    'Talk of Nations news', 'Talk of Nations gossip', 'Talk of Nations blog', 'unfiltered raw news Kenya', 'daily gossip and humor news',
    // Long-Tail
    'real raw political gossip in Kenya', 'funny commentary on Kenyan leaders', 'latest scandals in Kenyan churches', 'humorous news blog Africa', 'politics with humor and satire'
  ],
  verification: {
    google: 'google273252ce5a3190c2',
  },
  openGraph: {
    title: 'Talk of Nations - Unfiltered News & Satire',
    description: 'Your source for Kenyan news, lifestyle, and technological trends.',
    url: 'https://www.talkofnations.com',
    siteName: 'Talk of Nations',
    images: [
      {
        url: 'https://www.talkofnations.com/og-image.png', // Must be an absolute URL
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
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
   twitter: {
    card: 'summary_large_image',
    title: 'Talk of Nations - Unfiltered News & Satire',
    description: 'Your source for Kenyan news, lifestyle, and technological trends.',
    images: ['https://www.talkofnations.com/og-image.png'], // Must be an absolute URL
  },
   icons: {
    apple: '/apple-touch-icon.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
