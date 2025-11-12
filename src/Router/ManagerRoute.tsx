// import type { ReactNode } from "react";
// import { Navigate, useLocation } from "react-router";
// import { authStore } from "../Store/auth";
// import type { User } from "../types/api.types";


// interface ManagerProps {
//     children: ReactNode;
//     requiredRole?: User["role"];
//     redirectTo?: string;
// }

// export default function Manager({
//     children,
//     requiredRole,
//     redirectTo = "/",
// }: ManagerProps) {
//     const { user, isAuthenticated } = authStore();
//     const location = useLocation();

//     if (!isAuthenticated) {
//         return <Navigate to={redirectTo} state={{ from: location }} replace />;
//     }

//     if (requiredRole && user?.role !== requiredRole && user?.role !== "manager") {
//         return <Navigate to="/unauthorized" state={{ from: location }} replace />;
//     }

//     return <>{children}</>;
// }
