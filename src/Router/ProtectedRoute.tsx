import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { authStore } from "../Store/auth";
import type { User } from "../types/api.types";


interface ProtectedRouteProps {
	children: ReactNode;
	requiredRole?: User["role"] | User["role"][];
	redirectTo?: string;
}

export default function ProtectedRoute({
	children,
	requiredRole,
	redirectTo = "/",
}: ProtectedRouteProps) {
	const { user, isAuthenticated } = authStore();
	const location = useLocation();
	
	if (!isAuthenticated) {
		return <Navigate to={redirectTo} state={{ from: location }} replace />;
	}

	if (requiredRole) {
		const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
		if (!user?.role || !allowedRoles.includes(user.role)) {
			return <Navigate to="/unauthorized" state={{ from: location }} replace />;
		}
	}

	return <>{children}</>;
}
