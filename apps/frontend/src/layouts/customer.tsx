import {
  ActionIcon,
  Anchor,
  AppShell,
  Box,
  Burger,
  Button,
  Center,
  Container,
  Footer,
  Group,
  Header,
  Image,
  Indicator,
  LoadingOverlay,
  Menu,
  MultiSelect,
  Navbar,
  Text,
  TextInput,
  UnstyledButton,
  createStyles,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
  SpotlightAction,
  SpotlightActionProps,
  SpotlightProvider,
  spotlight,
} from "@mantine/spotlight";
import type { Category } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CartItem, Product } from "local-types";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import {
  ChevronDown,
  Edit,
  Logout,
  Mail,
  Search,
  Send,
  ShoppingCart,
} from "tabler-icons-react";
import { Logo } from "../components/logo";
import { Login, UpdateAccount } from "../features/auth";
import { Cart } from "../features/cart";
import { axios } from "../lib";
import { useAuthStore, useCartStore, useNavbarStore } from "../stores";

const ActionsWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div>
      {children}

      <Group
        position="apart"
        px={15}
        py="xs"
        sx={(theme) => ({
          borderTop: `${rem(1)} solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[2]
          }`,
        })}
      >
        <Text fz="xs" color="dimmed">
          Click on a product to add to cart
        </Text>
      </Group>
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  action: {
    position: "relative",
    display: "block",
    width: "100%",
    padding: `${rem(10)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[1],
    }),

    "&[data-hovered]": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[1],
    },
  },
}));

const CustomAction = ({ action, onTrigger }: SpotlightActionProps) => {
  const { classes } = useStyles();

  return (
    <UnstyledButton
      className={classes.action}
      tabIndex={-1}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onTrigger}
    >
      <Group noWrap>
        {action.image && (
          <Center>
            <Image
              src={action.image}
              alt={action.title}
              width={50}
              height={50}
            />
          </Center>
        )}

        <div style={{ flex: 1 }}>
          <Text>{action.title}</Text>

          {action.description && (
            <Text fz="xs" color="dimmed">
              {action.description}
            </Text>
          )}
        </div>
      </Group>
    </UnstyledButton>
  );
};

const CustomerLayout = () => {
  const queryClient = useQueryClient();
  const { loading, user, setAccessToken } = useAuthStore();
  const { items, setItems } = useCartStore();
  const { setCategories } = useNavbarStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [actions, setActions] = useState<SpotlightAction[]>([]);

  const form = useForm({
    initialValues: {
      categories: [],
    },
  });

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

  const { mutate } = useMutation({
    mutationFn: (items: { productId: string; quantity: number }[]) => {
      return axios.post("/cart", {
        items,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      axios.get<Category[]>("/category").then((response) => response.data),
    initialData: [],
  });

  useQuery({
    queryKey: ["cart"],
    queryFn: () =>
      axios.get<CartItem[]>("/cart").then((response) => response.data),
    onSuccess: (items) => {
      setItems(items);
    },
    enabled: user?.role === "CUSTOMER",
  });

  useQuery({
    queryKey: ["searchProducts", debouncedQuery],
    queryFn: () =>
      axios
        .get<{ products: Product[]; cursor?: string }>("/product", {
          params: {
            name: debouncedQuery,
          },
        })
        .then((response) => response.data),
    enabled: !!debouncedQuery,
    onSuccess: (data) => {
      setActions(
        data.products.map((product) => ({
          title: product.name,
          description: product.description,
          image: product.images[0]?.url,
          onTrigger: () =>
            mutate([
              ...items.map(({ productId, quantity }) => ({
                productId,
                quantity,
              })),
              { productId: product.id, quantity: 1 },
            ]),
        }))
      );
    },
  });

  const theme = useMantineTheme();
  const mdAndDown = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
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

  const handleSubmit = ({ categories }: typeof form.values) =>
    setCategories(categories);

  return (
    <AppShell
      navbarOffsetBreakpoint="md"
      navbar={
        <Navbar
          width={{ base: "100%", md: 300 }}
          hiddenBreakpoint="md"
          hidden={!opened}
          p="md"
        >
          <Box
            maw="100%"
            h="100%"
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
            onSubmit={form.onSubmit(handleSubmit)}
          >
            <MultiSelect
              label="What are you looking for?"
              placeholder="Categories"
              data={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              clearable
              size="md"
              mb="md"
              labelProps={{ mb: "xs" }}
              styles={(theme) => ({
                input: {
                  ":focus": {
                    borderColor: theme.colors.green[5],
                  },
                  ":focus-within": {
                    borderColor: theme.colors.green[5],
                  },
                },
                item: {
                  "&[data-selected]": {
                    "&, &:hover": {
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.green[8]
                          : theme.colors.green[6],
                    },
                  },
                },
              })}
              {...form.getInputProps("categories")}
            />

            <Button
              type="submit"
              size="lg"
              color="green"
              mt="auto"
              leftIcon={<Send size={20} />}
              fullWidth
            >
              Go
            </Button>
          </Box>
        </Navbar>
      }
      header={
        <SpotlightProvider
          actions={actions}
          actionsWrapperComponent={ActionsWrapper}
          actionComponent={CustomAction}
          query={query}
          onQueryChange={setQuery}
          searchIcon={<Search size={20} />}
          searchPlaceholder="Search"
          nothingFoundMessage="Nothing found"
        >
          <Header height={80}>
            <Container
              fluid
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              {mdAndDown && (
                <Burger
                  size="sm"
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                />
              )}

              {!mdAndDown && <Logo />}

              {!mdAndDown && (
                <TextInput
                  placeholder="Search products"
                  size="lg"
                  ml="auto"
                  styles={(theme) => ({
                    input: {
                      ":focus": {
                        borderColor: theme.colors.green[5],
                      },
                      ":focus-within": {
                        borderColor: theme.colors.green[5],
                      },
                    },
                  })}
                  icon={<Search size={20} />}
                  readOnly
                  onClick={() => spotlight.open()}
                />
              )}

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
                        variant="transparent"
                        color="gray"
                        size="md"
                        leftIcon={
                          <Image
                            src={user.image?.url}
                            alt={
                              user.customer?.firstName +
                              " " +
                              user.customer?.lastName
                            }
                            width={40}
                            height={40}
                            radius="xl"
                          />
                        }
                        rightIcon={<ChevronDown size={20} />}
                      >
                        {user.customer?.firstName +
                          " " +
                          user.customer?.lastName}
                      </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        icon={<Edit size={20} />}
                        onClick={() =>
                          openModal({
                            modalId: "updateAccount",
                            title: <Text fz="xl">Update account</Text>,
                            children: <UpdateAccount />,
                          })
                        }
                      >
                        Update account
                      </Menu.Item>

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
        </SpotlightProvider>
      }
      footer={
        <Footer height={mdAndDown ? 72 : 64}>
          <Container
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: mdAndDown ? "column-reverse" : "row",
              justifyContent: mdAndDown ? "center" : "space-between",
              alignItems: "center",
            }}
          >
            <Text color="dimmed">© 2023 Gift. All rights reserved.</Text>

            <Group>
              <Anchor component={Link} to="/about" color="dimmed">
                About
              </Anchor>

              <Anchor color="dimmed">Contact</Anchor>
            </Group>
          </Container>
        </Footer>
      }
    >
      <Container size="lg">
        <Box component="main">
          <Outlet />
        </Box>
      </Container>
    </AppShell>
  );
};

export default CustomerLayout;
