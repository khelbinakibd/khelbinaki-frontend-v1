/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import api from "../lib/api";
import { authStore } from "../Store/auth";
import type {
	ApiError,
	ApiResponse,
	ForgotPasswordData,
	LoginData,
	RegisterData,
	User,
	VerifyOtpData,
} from "../types/api.types";

export function useAuth() {
	const navigate = useNavigate();
	const { login, logout, user, isAuthenticated } = authStore();

	// Login mutation
	const loginMutation = useMutation({
		mutationFn: async (credentials: LoginData) => {
			console.log("Attemting login with:", credentials);
			const response = await api.post<
				ApiResponse<{
					user: User;
					accessToken: string;
				}>
			>("/auth/login", credentials);

			const loginData = response.data.data as any;
			const loginMessage = response.data.message as any;
			return {
				message: loginMessage,
				data: {
					user: loginData?.user,
					accessToken: loginData?.accessToken,
				},
			};
		},
		onSuccess: ({ message, data }) => {
			console.log("Login successfully:", data?.user?.email);

			if (data) {
				login(data.user, data.accessToken, "cookie-stored");
				toast.success(message);
				navigate("/");
			}
		},
		onError: (error: AxiosError<ApiError>) => {
			console.error("Login error:", error);
			const errorMessage = error.response?.data?.message || "Login failed";
			toast.error(errorMessage);
		},
	});

	// Registration mutation
	const registerMutation = useMutation({
		mutationFn: async (data: RegisterData) => {
			console.log("Attempting registration with: ", data);
			const response = await api.post<ApiResponse<{ email: string }>>(
				"/auth/register",
				data,
			);
			const registerData = response.data.data as any;
			const registerMessage = response.data.message as any;
			console.log(registerData);
			return {
				message: registerMessage,
				email: registerData?.email
			};
		},
		onSuccess: ({ message, email }) => {
			console.log("Registration successful", email);
			toast.success(message);
			if (email) {
				sessionStorage.setItem("otp-email", email);
				navigate("/auth/verify-otp");
			}
		},
		onError: (error: AxiosError<ApiError>) => {
			console.log("Registration error:", error);
			const errorMessage =
				error.response?.data?.message || "Registration failed";
			toast.error(errorMessage);
		},
	});








	// Verify OTP mutation
	const verifyOtpMutation = useMutation({
		mutationFn: async (data: VerifyOtpData) => {
			console.log("Attempting OTP verification with: ", data.email);
			const response = await api.post<
				ApiResponse<{
					user: User;
					accessToken: string;
				}>
			>("/auth/verify-otp", data);
			const verificationData = response.data.data as any;
			const verificationMessage = response.data.message as any;
			console.log(verificationData);
			return {
				message: verificationMessage,
				data: {
					user: verificationData?.user,
					accessToken: verificationData?.accessToken,
				},
			};
		},
		onSuccess: ({ data, message }) => {
			console.log("OTP verification successful for: ", data);
			console.log("OTP verification successful message: ", message);
			if (data) {
				login(data.user, data.accessToken, "cookie-stored");
				toast.success(message);
				sessionStorage.removeItem("otp-email");
				navigate("/");
			}
		},
		onError: (error: AxiosError<ApiError>) => {
			console.log("OTP verification error: ", error.response?.data);
			const errorMessage =
				error.response?.data?.message || "OTP verification failed";
			toast.error(errorMessage);
		},
	});




	// Forgot Password mutation
	const forgotPasswordMutation = useMutation({
		mutationFn: async (data: ForgotPasswordData) => {
			console.log("Requesting password reset for: ", data.email);
			const response = await api.post<ApiResponse>(
				"/auth/forgot-password",
				data,
			);
			return response.data;
		},
		onSuccess: ({ message }) => {
			toast.success(message);
			navigate("/auth/login");
		},
		onError: (error: AxiosError<ApiError>) => {
			console.error("Forgot password error:", error.response?.data);
			const errorMessage =
				error.response?.data?.message || "Failed to send reset email";
			toast.error(errorMessage);
		},
	});

	// Reset Password mutation
	const resetPasswordMutation = useMutation({
		mutationFn: async ({
			token,
			password,
		}: {
			token: string;
			password: string;
		}) => {
			console.log("Attempting password reset");
			const response = await api.patch<
				ApiResponse<{
					user: User;
					accessToken: string;
				}>
			>(`/auth/reset-password/${token}`, { password });

			const resetData = response.data as any;
			console.log(resetData);
			return {
				message: resetData.message,
				user: resetData?.user,
				accessToken: resetData?.accessToken,
			};
		},
		onSuccess: ({ user, accessToken, message }) => {
			console.log("Password reset successful", user);
			if (user) {
				login(user, accessToken, "cookie-stored");
				toast.success(message);
				navigate("/");
			}
		},
		onError: (error: AxiosError<ApiError>) => {
			console.error("Password reset error:", error.response?.data);
			const errorMessage =
				error.response?.data?.message || "Password reset failed";
			toast.error(errorMessage);
		},
	});

	// Logout function
	const handleLogout = () => {
		logout();
		navigate("/");
		toast.success("Logged out successfully", { richColors: true });
	};

	return {
		// State
		user,
		isAuthenticated,
		isLoading:
			loginMutation.isPending ||
			registerMutation.isPending ||
			verifyOtpMutation.isPending ||
			forgotPasswordMutation.isPending ||
			resetPasswordMutation.isPending,

		// Actions
		login: loginMutation.mutate,
		register: registerMutation.mutate,
		verifyOtp: verifyOtpMutation.mutate,
		forgotPassword: forgotPasswordMutation.mutate,
		resetPassword: resetPasswordMutation.mutate,
		logout: handleLogout,

		// Status flags
		loginError: loginMutation.error,
		registerError: registerMutation.error,
		verifyOtpError: verifyOtpMutation.error,
	};
}
