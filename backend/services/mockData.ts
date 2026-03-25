
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
  { id: 'S1', name: 'Gardening', category: 'Home', icon: '🌱', providerCount: 12, status: 'Active', description: 'Complete lawn care and maintenance.' },
  { id: 'S2', name: 'Babysitting', category: 'Care', icon: '👶', providerCount: 8, status: 'Active', description: 'Safe and fun childcare.' },
  { id: 'S8', name: 'Handyman', category: 'Home', icon: '🔧', providerCount: 5, status: 'Active', description: 'General home repairs.' }
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
    { name: 'Home', value: 40 },
    { name: 'Care', value: 25 },
    { name: 'Auto', value: 15 },
    { name: 'Personal', value: 20 },
  ]
};
