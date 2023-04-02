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
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ChevronDown, Logout, User } from "tabler-icons-react";
import { Login } from "../features/auth";
import { AuthGuard, RoleGuard } from "../guards";
import { useAuthStore } from "../stores";

const AdminLayout = () => {
  const { user, setAccessToken } = useAuthStore();
  const theme = useMantineTheme();
  const smAndDown = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [opened, setOpened] = useState(false);

  return (
    <AuthGuard>
      <RoleGuard roles={["ADMIN"]}>
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

                  {user && (
                    <Menu width={200}>
                      <Menu.Target>
                        <Button
                          variant="light"
                          color="gray"
                          size="md"
                          leftIcon={<User />}
                          rightIcon={<ChevronDown size={20} />}
                        >
                          {user.role}
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
      </RoleGuard>
    </AuthGuard>
  );
};

export default AdminLayout;
