import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/api.types";

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

interface AuthAction {
	setUser: (user: User) => void;
	setTokens: (accessToken: string, refreshToken?: string) => void;
	login: (user: User, accessToken: string, refreshToken?: string) => void;
	logout: () => void;
	updateUser: (updates: Partial<User>) => void;
	setLoading: (loading: boolean) => void;
	clearAuth: () => void;
}

export const authStore = create<AuthState & AuthAction>()(
	persist(
		(set, get) => ({
			user: null,
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,
			isLoading: false,

			setUser: (user) => set({ user, isAuthenticated: true }),

			setTokens: (accessToken, refreshToken) =>
				set({
					accessToken,
					refreshToken: refreshToken || get().refreshToken,
					isAuthenticated: true,
				}),

			login: (user, accessToken, refreshToken) =>
				set({
					user,
					accessToken,
					refreshToken: refreshToken || "cookie-stored", // Placeholder since it's in httpOnly cookie
					isAuthenticated: true,
					isLoading: false,
				}),

			logout: () => {
				set({
					user: null,
					accessToken: null,
					refreshToken: null,
					isAuthenticated: false,
					isLoading: false,
				});
			},

			clearAuth: () => get().logout(),

			updateUser: (updates) =>
				set((state) => ({
					user: state.user ? { ...state.user, ...updates } : null,
				})),

			setLoading: (loading) => set({ isLoading: loading }),
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				accessToken: state.accessToken,
				isAuthenticated: state.isAuthenticated,
			}),
			version: 1,
		},
	),
);
