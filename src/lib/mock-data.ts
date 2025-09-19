import type { Post } from './types';
import { Timestamp } from 'firebase/firestore';

// Helper to create a Firestore Timestamp from a Date
const toTimestamp = (date: Date): Timestamp => {
  return new Timestamp(date.getTime() / 1000, 0);
};

export const mockPosts: Post[] = [
  {
    id: 'mock-1',
    title: 'Kenya Launches New Tech Hub in Nairobi to Foster Innovation',
    slug: 'kenya-launches-new-tech-hub-nairobi',
    content: 'The Kenyan government has officially opened a new state-of-the-art technology hub in Nairobi, aimed at fostering innovation and entrepreneurship among the youth. The hub, named "Silicon Savannah," will provide resources, mentorship, and funding opportunities for startups.',
    coverImage: 'https://picsum.photos/seed/tech-hub-kenya/1200/800',
    tags: ['Technology', 'Kenya', 'Innovation'],
    status: 'published',
    createdAt: toTimestamp(new Date('2024-07-22T10:00:00Z')),
    updatedAt: toTimestamp(new Date('2024-07-22T10:00:00Z')),
  },
  {
    id: 'mock-2',
    title: 'The Great Wildebeest Migration: A Spectacle of Nature',
    slug: 'wildebeest-migration-spectacle',
    content: 'The annual wildebeest migration in the Maasai Mara is in full swing, drawing tourists and wildlife enthusiasts from around the globe. This incredible event sees over a million wildebeest, zebras, and gazelles journey across the plains in search of greener pastures.',
    coverImage: 'https://picsum.photos/seed/wildebeest-migration/1200/800',
    tags: ['Tourism', 'Wildlife', 'Maasai Mara'],
    status: 'published',
    createdAt: toTimestamp(new Date('2024-07-21T14:30:00Z')),
    updatedAt: toTimestamp(new Date('2024-07-21T14:30:00Z')),
  },
  {
    id: 'mock-3',
    title: 'Nairobi Fashion Week Showcases Emerging Kenyan Designers',
    slug: 'nairobi-fashion-week-2024',
    content: 'Nairobi Fashion Week 2024 concluded with a dazzling display of creativity and talent from emerging Kenyan designers. The event highlighted sustainable fashion and traditional African textiles, putting Kenyan fashion on the global map.',
    coverImage: 'https://picsum.photos/seed/nairobi-fashion/1200/800',
    tags: ['Fashion', 'Lifestyle', 'Nairobi'],
    status: 'published',
    createdAt: toTimestamp(new Date('2024-07-20T18:00:00Z')),
    updatedAt: toTimestamp(new Date('2024-07-20T18:00:00Z')),
  },
    {
    id: 'mock-4',
    title: 'Kenyan Shilling Gains Against the Dollar Amidst Economic Reforms',
    slug: 'kenyan-shilling-gains-dollar',
    content: 'The Kenyan Shilling (KES) has shown remarkable strength against the US Dollar this week, a positive sign attributed to recent economic reforms and increased foreign investment. The Central Bank remains optimistic about the currency\'s stability.',
    coverImage: 'https://picsum.photos/seed/kenyan-shilling/1200/800',
    tags: ['Business', 'Economy', 'Finance'],
    status: 'published',
    createdAt: toTimestamp(new Date('2024-07-19T09:00:00Z')),
    updatedAt: toTimestamp(new Date('2024-07-19T09:00:00Z')),
  },
  {
    id: 'mock-5',
    title: 'Top 5 Gadgets for Load Shedding in Kenya',
    slug: 'top-5-gadgets-load-shedding',
    content: 'With intermittent power cuts affecting various parts of the country, having the right gadgets can make a huge difference. From portable power stations to solar-powered chargers, we review the top 5 essential gadgets to help you through load shedding.',
    coverImage: 'https://picsum.photos/seed/gadgets-kenya/1200/800',
    tags: ['Gadgets', 'Technology', 'Lifestyle'],
    status: 'published',
    createdAt: toTimestamp(new Date('2024-07-18T16:45:00Z')),
    updatedAt: toTimestamp(new Date('2024-07-18T16:45:00Z')),
  },
   {
    id: 'mock-6',
    title: 'Kenyan Athletes Dominate at the Diamond League',
    slug: 'kenyan-athletes-diamond-league',
    content: 'Kenyan athletes have once again showcased their dominance on the world stage, clinching several gold medals at the recent Diamond League meeting in Monaco. Faith Kipyegon shattered another world record in the mile.',
    coverImage: 'https://picsum.photos/seed/kenyan-runners/1200/800',
    tags: ['Sport', 'Athletics'],
    status: 'published',
    createdAt: toTimestamp(new Date('2024-07-17T20:00:00Z')),
    updatedAt: toTimestamp(new Date('2024-07-17T20:00:00Z')),
  }
];

export const mockTrendingTopics: string[] = [
  '#KenyaDecides',
  '#SiliconSavannah',
  '#MagicalKenya',
  '#FinanceBill2024',
  '#GoTusker',
];

export const mockAds = [
  {
    id: 'ad-1',
    title: 'Safari Adventures',
    description: 'Book your dream Kenyan safari today!',
    imageUrl: 'https://picsum.photos/seed/safari-ad/600/600',
    link: '#',
    alt: 'Giraffe in the wild'
  }
];

export const mockMarketData = [
    { ticker: 'SCOM', price: 17.50, change: '+0.25' },
    { ticker: 'EQTY', price: 42.00, change: '-0.10' },
    { ticker: 'KCB', price: 35.75, change: '+0.50' },
    { ticker: 'EABL', price: 155.25, change: '-1.00' },
    { ticker: 'BAMB', price: 210.00, change: '+2.50' },
    { ticker: 'NSE', price: 8.90, change: '+0.05' },
];
