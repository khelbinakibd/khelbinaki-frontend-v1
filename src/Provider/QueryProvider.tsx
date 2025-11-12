/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 30, // 30 minutes

			retry: (failureCount, error: any) => {
				if (error.response.status === 404) return false;
				return failureCount < 3;
			},
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 1,
		},
	},
});

export function QueryProvider({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{import.meta.env.VITE_ENABLE_DEVTOOLS === "true" && (
				<ReactQueryDevtools initialIsOpen={false} />
			)}
		</QueryClientProvider>
	);
}
