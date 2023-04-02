import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Button,
  Container,
  Group,
  Header,
  Indicator,
  LoadingOverlay,
  Menu,
  Navbar,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { CartItem } from "local-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  ChevronDown,
  Logout,
  Mail,
  ShoppingCart,
  User,
} from "tabler-icons-react";
import { Login } from "../features/auth";
import { Cart } from "../features/cart";
import { axios } from "../lib";
import { useAuthStore, useCartStore } from "../stores";

const CustomerLayout = () => {
  const { loading, user, setAccessToken } = useAuthStore();
  const { setItems, items } = useCartStore();

  const quantity = useMemo(
    () => items.reduce((accumulator, item) => accumulator + item.quantity, 0),
    [items]
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    setItems([]);
  }, []);

  useEffect(() => {
    if (user && !user.confirmed) {
      showNotification({
        message: "Please, confirm your email address.",
        icon: <Mail size={20} />,
        color: "yellow",
        autoClose: false,
      });
    }
  }, [user]);

  useQuery({
    queryKey: ["cart"],
    queryFn: () =>
      axios.get<CartItem[]>("/cart").then((response) => response.data),
    onSuccess: (items) => {
      setItems(items);
    },
    enabled: user?.role === "CUSTOMER",
  });

  const theme = useMantineTheme();
  const smAndDown = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [opened, setOpened] = useState(false);

  if (loading) {
    return (
      <LoadingOverlay
        loaderProps={{ color: "green", variant: "bars" }}
        visible
      />
    );
  }

  if (user && user.role === "BUSINESS") {
    return <Navigate to="/business" replace />;
  }

  if (user && user.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      navbar={
        smAndDown ? (
          <Navbar hiddenBreakpoint="sm" hidden={!opened}>
            Navbar
          </Navbar>
        ) : undefined
      }
      header={
        <Header height={80}>
          <Container
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Burger
              size="sm"
              display={!smAndDown ? "none" : undefined}
              opened={opened}
              onClick={() => setOpened((o) => !o)}
            />

            <Group ml="auto">
              {!user && (
                <Button
                  size="lg"
                  color="green"
                  onClick={() =>
                    openModal({
                      modalId: "login",
                      title: <Text fz="xl">Login</Text>,
                      children: <Login />,
                    })
                  }
                >
                  Login
                </Button>
              )}

              {user && user.role === "CUSTOMER" && (
                <Menu width={200}>
                  <Menu.Target>
                    <Button
                      variant="light"
                      color="gray"
                      size="md"
                      leftIcon={<User />}
                      rightIcon={<ChevronDown size={20} />}
                    >
                      {user.customer?.firstName + " " + user.customer?.lastName}
                    </Button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      icon={<Logout size={20} />}
                      onClick={() => logout()}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}

              <Indicator label={quantity} inline size={20} color="green">
                <ActionIcon
                  variant="light"
                  size="xl"
                  onClick={() =>
                    openModal({
                      modalId: "cart",
                      title: (
                        <Text fz={24} weight="bold">
                          Your cart
                        </Text>
                      ),
                      children: <Cart />,
                      size: 1200,
                    })
                  }
                >
                  <ShoppingCart />
                </ActionIcon>
              </Indicator>
            </Group>
          </Container>
        </Header>
      }
    >
      <Container>
        <Box component="main">
          <Outlet />
        </Box>
      </Container>
    </AppShell>
  );
};

export default CustomerLayout;
