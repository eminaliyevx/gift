import "@fontsource/jetbrains-mono";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccountWithoutPassword } from "local-types";
import { useCallback, useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AdminLayout, BusinessLayout, CustomerLayout } from "./layouts";
import { axios } from "./lib";
import { AdminHome, BusinessHome, Confirm, CustomerHome } from "./pages";
import { useAuthStore } from "./stores/useAuthStore";

const router = createBrowserRouter([
  {
    path: "/",
    element: <CustomerLayout />,
    children: [{ element: <CustomerHome />, index: true }],
  },
  {
    path: "business",
    element: <BusinessLayout />,
    children: [{ element: <BusinessHome />, index: true }],
  },
  {
    path: "admin",
    element: <AdminLayout />,
    children: [{ element: <AdminHome />, index: true }],
  },
  { path: "confirm/:hash", element: <Confirm /> },
  { path: "*", element: <Navigate to="/" /> },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const { accessToken, setUser, user } = useAuthStore();

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "color-scheme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const initialize = useCallback(async () => {
    const { data: user } = await axios.get<AccountWithoutPassword | null>(
      "auth/account"
    );

    setUser(user);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setUser(null);
    } else {
      initialize();
    }
  }, [accessToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{ colorScheme, fontFamily: "JetBrains Mono" }}
          withGlobalStyles
          withNormalizeCSS
        >
          <Notifications position="top-right" />

          <ModalsProvider>
            <RouterProvider router={router} />
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </QueryClientProvider>
  );
};

export default App;
