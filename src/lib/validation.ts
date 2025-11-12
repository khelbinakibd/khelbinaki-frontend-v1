import { z } from "zod";

// Strong password regex to match backend
const strongPasswordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Auth Schemas
export const loginSchema = z.object({
	email: z.email("Please enter a valid email address").toLowerCase(),
	password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").trim(),
	email: z.email("Please enter a valid email address").toLowerCase(),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long")
		.regex(
			strongPasswordRegex,
			"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
		),
	phone: z
		.string()
		.min(11, "Phone number must be at least 11 digits")
		.max(14, "Phone number must not exceed 14 digits")
		.trim(),
});

export const verifyOtpSchema = z.object({
	email: z.email().toLowerCase(),
	otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export const forgotPasswordSchema = z.object({
	email: z.email("Please enter a valid email address").toLowerCase(),
});

export const resetPasswordSchema = z.object({
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long")
		.regex(
			strongPasswordRegex,
			"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
		),
});

// Booking Schema
export const createBookingSchema = z
	.object({
		turf: z.string(),
		date: z
			.date({
				error: "Please select a date",
			})
			.refine(
				(date) => date >= new Date(new Date().setHours(0, 0, 0, 0)),
				"Date must be today or in the future",
			),
		startTime: z
			.string()
			.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
		endTime: z
			.string()
			.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
	})
	.refine((data) => data.endTime > data.startTime, {
		message: "End time must be after start time",
		path: ["endTime"],
	});

export const updateBookingStatusSchema = z.object({
	status: z.enum(["pending", "confirmed", "cancelled"]),
});

// Turf Schema
export const createTurfSchema = z.object({
	name: z.string().min(3),
	location: z.object({
		address: z.string().min(3),
		city: z.string().min(3),
	}),
	description: z.string().optional(),
	pricingRules: z
		.array(
			z.object({
				dayType: z.enum(["sunday-thursday", "friday-saturday", "all-days"]),
				timeSlots: z
					.array(
						z.object({
							startTime: z
								.string()
								.regex(
									/^([01]\d|2[0-3]):([0-5]\d)$/,
									"Invalid time format, expected HH:mm",
								),
							endTime: z
								.string()
								.regex(
									/^([01]\d|2[0-3]):([0-5]\d)$/,
									"Invalid time format, expected HH:mm",
								),
							pricePerSlot: z.number().nonnegative(),
						}),
					)
					.min(1, "At least one time slot is required per rule."),
			}),
		)
		.min(1, "At least one pricing rule is required."),
	defaultPricePerSlot: z
		.number()
		.nonnegative("Default price must be a non-negative number."),
	amenities: z.array(z.string()).optional(),
	images: z.array(z.url()).optional(),
	operatingHours: z.object({
		start: z.string().min(1),
		end: z.string().min(1),
	}),
});

export const updateTurfSchema = createTurfSchema.partial();

// User Schema
export const updateProfileSchema = z.object({
	name: z.string().min(2).trim().optional(),
	email: z.email().toLowerCase().optional(),
	phone: z.string().min(11).max(14).trim().optional(),
	profilePicture: z.url().optional(),
});
