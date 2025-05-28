
import { Document } from 'mongoose';

export interface TurfData extends Document {
  ownerId: string;
  name: string;
  city: string;
  area: string;
  address: string;
  turfType: string;
  size?: string;
  images: string[];
  hourlyRate: number;
  status: 'active' | 'inactive' | 'pending';
  availability: Availability;
  isDelete?: boolean;
  bookings?: Booking[];
}

export interface Availability {
  days: string[];
  startTime: string;
  endTime: string;
  unavailableSlots?: UnavailableSlot[];
}

export interface UnavailableSlot {
  date: string; // ISO format "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  reason?: string;
}

export interface Booking {
  userId: string;
  turfId: string;
  date: string; // ISO format
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  amount: number;
  createdAt: Date;
}

export interface TurfFormInput {
  ownerId: string;
  name: string;
  city: string;
  area: string;
  address: string;
  turfType: string;
  size?: string;
  hourlyRate: number;
  images: string[];
  availability: Availability;
}