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
		path: string[];
		message: string;
	}>;
}

// User types
export interface User {
	_id: string;
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
	defaultPricePerSlot: number;
	pricingRules: PricingRule[];
	isActive: boolean;
	admins: User[];
	createdAt: string;
	updateAt: string;
}

// Booking types
export interface Booking {
	_id: string;
	user: string | User;
	turf: string | Turf;
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
	pricePerSlot: number;
	dayTypeLabel: "FRI-SAT" | "SUN-THU";
}

export interface TurfAvailability {
	date: string;
	dayType: string;
	slots: AvailabilitySlot[];
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
