/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod";
import type {
	createBookingSchema,
	createTurfSchema,
	forgotPasswordSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema,
	updateBookingStatusSchema,
	updateProfileSchema,
	verifyOtpSchema,
} from "../lib/validation";

// API Response types
export interface ApiResponse<T = any> {
	success: boolean;
	message: string;
	data?: T;
	meta?: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		itemsPerPage: number;
	};
}

// API Error types
export interface ApiError {
	message: string;
	errors?: Array<{
		path: string | string[];
		message: string;
	}>;
}

// User types
export interface User {
	_id: string;
	id?: string; // Authentication responses use id.
	name: string;
	email: string;
	phone?: string;
	role?: "user" | "admin" | "manager";
	isVerified: boolean;
	isActive: boolean;
	profilePicture?: string;
	createdAt: string;
	updatedAt: string;
}

// Turf Types
export type PricingRule = z.infer<typeof createTurfSchema>["pricingRules"][0];
export type TimeSlot = PricingRule["timeSlots"][0];

export interface Facility {
	_id: string;
	name: string;
	turf: string;
	pricingRules: PricingRule[]; // Required - facility must have pricing rules
	defaultPricePerSlot?: number; // Optional - display-only fallback
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Turf {
	_id: string;
	name: string;
	slug: string;
	location: {
		coordinates: any;
		address: string;
		city: string;
	};
	description: string;
	images: string[];
	amenities: string[];
	operatingHours: {
		start: string;
		end: string;
	};
	capacity?: number;
	defaultPricePerSlot?: number; // Deprecated - not used, kept for backward compatibility
	pricingRules?: PricingRule[]; // Deprecated - not used, kept for backward compatibility
	isActive: boolean;
	admins: User[];
	facilities?: Facility[];
	createdAt: string;
	updateAt: string;
}

// Booking types
export interface Booking {
	_id: string;
	user: string | User;
	turf: string | Turf;
	facility: string;
	facilityName?: string;
	date: string;
	startTime: string;
	endTime: string;
	appliedPricePerSlot: number;
	totalPrice: number;
	pricingRule: string;
	dayType: string;
	status: "pending" | "confiremed" | "cancelled";
	paymentStatus: "unpaid" | "paid" | "refunded";
	createdAt: string;
	updatedAt: string;
}

// Availability types
export interface AvailabilitySlot {
	startTime: string;
	endTime: string;
	isAvailable: boolean;
	isTimePassed: boolean;
	pricePerSlot: number;
	dayTypeLabel: "FRI-SAT" | "SUN-THU";
}

export interface TurfAvailability {
	date: string;
	dayType: string;
	slots: AvailabilitySlot[];
}

// Maintenance endpoints intentionally omit the global ApiResponse.success flag.
export interface DataResponse<T> {
  message: string;
  data: T;
}

export interface ManageableTurfsResponse extends DataResponse<Turf[]> {
  meta: { totalItems: number; totalPage: number; currentPage: number; itemsPerPage: number };
}

export interface MaintenanceBlock {
  _id: string;
  facility: string;
  turf: string;
  date: string; // UTC ISO timestamp representing Asia/Dhaka midnight.
  startTime: string;
  endTime: string;
  reason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  releasedAt?: string;
  releasedBy?: string;
  releaseReason?: string;
}

export interface CreateMaintenanceBlockData {
  date: string; // Dhaka YYYY-MM-DD, never an ISO timestamp.
  startTime: string;
  endTime: string;
  reason?: string;
}

// Validation Schema Types
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type CreateTurfData = z.infer<typeof createTurfSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type CreateBookingData = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusData = z.infer<typeof updateBookingStatusSchema>;
