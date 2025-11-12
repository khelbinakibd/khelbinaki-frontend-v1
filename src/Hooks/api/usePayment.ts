import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "../../lib/api";
import type { ApiError, ApiResponse } from "../../types/api.types";

interface PaymentInitResponse {
	url: string;
}

export function usePayment() {
	const initPaymentMutation = useMutation<
		ApiResponse<PaymentInitResponse>,
		AxiosError<ApiError>,
		string
	>({
		mutationFn: async (bookingId) => {
			console.log("Initiating payment for booking ID:", bookingId);
			const response = await api.post<ApiResponse<PaymentInitResponse>>(
				`/payments/init/${bookingId}`,
			);
			console.log("Payment API response:", response.data);
			return response.data;
		},
		onSuccess: (data) => {
			console.log("Payment initialization successful:", data);
			const paymentUrl = data?.data?.url;
			console.log("Payment URL:", paymentUrl);
			if (paymentUrl) {
				console.log("Redirecting to:", paymentUrl);
				window.location.href = paymentUrl;
			} else {
				console.error("No payment URL in response:", data);
				toast.error("Failed to get payment URL.");
			}
		},
		onError: (error) => {
			console.error("Payment initialization error:", error);
			console.error("Error response:", error.response?.data);
			const errorMessage =
				error.response?.data.message || "Payment initialization failed";
			toast.error(errorMessage);
		},
	});
	return {
		initPayment: initPaymentMutation.mutate,
		initPaymentAsync: initPaymentMutation.mutateAsync,
		isLoading: initPaymentMutation.isPending,
		error: initPaymentMutation.error,
		isSuccess: initPaymentMutation.isSuccess,
	};
}
