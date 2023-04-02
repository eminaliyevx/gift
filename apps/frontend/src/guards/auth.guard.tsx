import { LoadingOverlay } from "@mantine/core";
import { PropsWithChildren, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores";

const AuthGuard = ({ children }: PropsWithChildren<{}>) => {
  const { loading, user } = useAuthStore();
  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState<string | null>(
    null
  );

  if (loading) {
    return (
      <LoadingOverlay
        loaderProps={{ color: "green", variant: "bars" }}
        visible
      />
    );
  }

  if (!user) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }

    return <Navigate to="/" replace />;
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);

    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
