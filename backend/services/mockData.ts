
import { User, UserRole, UserStatus, Service, Booking, BookingStatus, Review, DashboardStats } from '../types';

export const MOCK_USERS: User[] = [
  { 
    id: 'admin-001', 
    name: 'System Admin', 
    email: 'admin@servicelink.com', 
    role: UserRole.ADMIN, 
    status: UserStatus.ACTIVE, 
    createdAt: '2023-01-01', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 
    provider: 'Email', 
    onboarded: true 
  },
  { 
    id: 'p1', 
    name: 'Sarah Martinez', 
    email: 'sarah@example.com', 
    role: UserRole.PROVIDER, 
    status: UserStatus.ACTIVE, 
    createdAt: '2023-02-15', 
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg', 
    bio: 'Urban gardening and plant care workshops.', 
    rating: 4.9, 
    completedJobs: 154, 
    streetName: 'Invalidenstrasse',
    streetNumber: '12',
    city: 'Berlin',
    country: 'Germany',
    pincode: '10115',
    languages: 'EN, DE',
    years: 3,
    provider: 'Email', 
    onboarded: true 
  },
  { 
    id: 'p2', 
    name: 'Emma Johnson', 
    email: 'emma@example.com', 
    role: UserRole.PROVIDER, 
    status: UserStatus.ACTIVE, 
    createdAt: '2023-03-10', 
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg', 
    bio: 'Certified childcare and early education.', 
    rating: 5.0, 
    completedJobs: 82, 
    languages: 'EN',
    years: 5,
    provider: 'Email', 
    onboarded: true 
  }
];

export const MOCK_SERVICES: Service[] = [
  // Home
  { id: 'S1',  name: 'Cleaning',          category: 'Home',      icon: '🧹', color: '#a7f3d0', providerCount: 18, status: 'Active', description: 'Home and office cleaning by vetted professionals.' },
  { id: 'S2',  name: 'Gardening',         category: 'Home',      icon: '🌱', color: '#bbf7d0', providerCount: 12, status: 'Active', description: 'Lawn care, planting, and garden maintenance.' },
  { id: 'S3',  name: 'Handyman',          category: 'Home',      icon: '🔧', color: '#e2e8f0', providerCount: 9,  status: 'Active', description: 'General home repairs and installations.' },
  // Care
  { id: 'S4',  name: 'Babysitting',       category: 'Care',      icon: '👶', color: '#fecdd3', providerCount: 14, status: 'Active', description: 'Trusted childcare in your own home.' },
  { id: 'S5',  name: 'Elder Care',        category: 'Care',      icon: '🧓', color: '#fde68a', providerCount: 7,  status: 'Active', description: 'Companionship, light assistance, and care for elderly.' },
  { id: 'S6',  name: 'Pet Care',          category: 'Care',      icon: '🐕', color: '#fbcfe8', providerCount: 10, status: 'Active', description: 'Dog walking, pet sitting, and grooming.' },
  // Transport
  { id: 'S7',  name: 'Transport',         category: 'Transport', icon: '🚗', color: '#bfdbfe', providerCount: 22, status: 'Active', description: 'Reliable rides for errands, events, and daily travel.' },
  { id: 'S8',  name: 'Groceries',         category: 'Transport', icon: '🛒', color: '#ddd6fe', providerCount: 11, status: 'Active', description: 'Grocery shopping and delivery to your door.' },
  // Wellness
  { id: 'S9',  name: 'Cooking',           category: 'Wellness',  icon: '👨‍🍳', color: '#fed7aa', providerCount: 8,  status: 'Active', description: 'Home-cooked meals prepared fresh by local chefs.' },
  { id: 'S10', name: 'Massage',           category: 'Wellness',  icon: '💆', color: '#e9d5ff', providerCount: 6,  status: 'Active', description: 'Professional home massage for relaxation and recovery.' },
  // Skills
  { id: 'S11', name: 'Math Tuition',      category: 'Skills',    icon: '📐', color: '#fef9c3', providerCount: 5,  status: 'Active', description: 'One-on-one math lessons for all ages and levels.' },
  { id: 'S12', name: 'IT Support',        category: 'Skills',    icon: '💻', color: '#e0e7ff', providerCount: 8,  status: 'Active', description: 'Tech help, device setup, and troubleshooting.' },
];

export const MOCK_BOOKINGS: Booking[] = [
  { id: 'B1', customerId: 'c1', customerName: 'Julia Peters', providerId: 'p1', providerName: 'Sarah Martinez', serviceName: 'Gardening', date: '2023-11-20', status: BookingStatus.COMPLETED },
  { id: 'B2', customerId: 'c2', customerName: 'Markus Wolf', providerId: 'p6', providerName: 'Marcus Weber', serviceName: 'Handyman', date: '2023-12-01', status: BookingStatus.CONFIRMED },
  { id: 'B3', customerId: 'c1', customerName: 'Julia Peters', providerId: 'p2', providerName: 'Emma Johnson', serviceName: 'Babysitting', date: '2023-12-05', status: BookingStatus.PENDING },
  { id: 'B4', customerId: 'c2', customerName: 'Markus Wolf', providerId: 'p10', providerName: 'Lars Schmidt', serviceName: 'Handyman', date: '2023-11-25', status: BookingStatus.COMPLETED },
  { id: 'B5', customerId: 'c3', customerName: 'Hanna Berg', providerId: 'p9', providerName: 'Sophie Muller', serviceName: 'Photography', date: '2023-12-02', status: BookingStatus.CONFIRMED }
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'R1', customerName: 'Max T.', providerId: 'p1', rating: 5, comment: 'Exceptional gardening work!', serviceName: 'Gardening', status: 'Approved', date: '2023-11-21' },
  { id: 'R2', customerName: 'Julia P.', providerId: 'p1', rating: 5, comment: 'Sarah transformed my patio.', serviceName: 'Gardening', status: 'Approved', date: '2023-11-22' },
  { id: 'R3', customerName: 'Markus W.', providerId: 'p6', rating: 5, comment: 'Marcus is a master with wood.', serviceName: 'Handyman', status: 'Approved', date: '2023-12-02' },
  { id: 'R4', customerName: 'Leo H.', providerId: 'p10', rating: 4, comment: 'Fixed our leak quickly.', serviceName: 'Handyman', status: 'Approved', date: '2023-11-26' },
  { id: 'R5', customerName: 'Anna S.', providerId: 'p2', rating: 5, comment: 'Highly recommended for kids.', serviceName: 'Babysitting', status: 'Approved', date: '2023-12-06' }
];

export const MOCK_STATS: DashboardStats = {
  totalUsers: 1420,
  adImpressions: 1254300,
  adClicks: 21450,
  pendingInquiries: 42,
  averageRating: 4.8,
  engagementData: [
    { month: 'Jan', value: 3400 },
    { month: 'Feb', value: 4100 },
    { month: 'Mar', value: 3800 },
    { month: 'Apr', value: 5200 },
    { month: 'May', value: 6100 },
    { month: 'Jun', value: 7500 }
  ],
  categoryData: [
    { name: 'Home',      value: 35 },
    { name: 'Care',      value: 25 },
    { name: 'Transport', value: 18 },
    { name: 'Wellness',  value: 12 },
    { name: 'Skills',    value: 10 },
  ]
};
