import type { Role } from "@prisma/client";
import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores";

export const USER_NAVIGATES = {
  CUSTOMER: "/",
  BUSINESS: "/business",
  ADMIN: "/admin",
};

const RoleGuard = ({
  roles,
  children,
}: PropsWithChildren<{ roles: Role[] }>) => {
  const { user } = useAuthStore();

  if (user && roles.some((role) => role === user.role)) {
    return <>{children}</>;
  }

  return <Navigate to={USER_NAVIGATES[user?.role || "CUSTOMER"]} replace />;
};

export default RoleGuard;
