import {
  AppShell,
  Box,
  Burger,
  Button,
  Container,
  Group,
  Header,
  Menu,
  Navbar,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { ChevronDown, Dashboard, Logout, Mail, User } from "tabler-icons-react";
import { Login } from "../features/auth";
import { useAuthStore } from "../stores/useAuthStore";

const CustomerLayout = () => {
  const { user, setAccessToken } = useAuthStore();

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

  const theme = useMantineTheme();
  const smAndDown = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [opened, setOpened] = useState(false);

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
                      onClick={() => setAccessToken(null)}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}

              {user && user.role !== "CUSTOMER" && (
                <Button
                  color="green"
                  size="md"
                  component={Link}
                  to={user.role === "BUSINESS" ? "/business" : "/admin"}
                  leftIcon={<Dashboard />}
                >
                  Dashboard
                </Button>
              )}
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
