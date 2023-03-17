import { LoadingOverlay } from "@mantine/core";
import { Role } from "@prisma/client";
import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const USER_NAVIGATES = {
  [Role.CUSTOMER]: "/",
  [Role.BUSINESS]: "/business",
  [Role.ADMIN]: "/admin",
};

const AuthGuard = ({
  roles,
  children,
}: PropsWithChildren<{ roles: Role[] }>) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <LoadingOverlay visible />;
  }

  if (user && roles.some((role) => user.role === role)) {
    return <>{children}</>;
  }

  if (user) {
    return <Navigate to={USER_NAVIGATES[user.role]} replace />;
  }

  return <Navigate to={USER_NAVIGATES[Role.CUSTOMER]} replace />;
};

export default AuthGuard;
