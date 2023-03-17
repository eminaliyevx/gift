import {
  Anchor,
  Box,
  Button,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { closeModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { AccountWithoutPassword } from "local-types";
import { useState } from "react";
import { X } from "tabler-icons-react";
import { z } from "zod";
import { Register } from ".";
import { axios } from "../../lib";
import { useAuthStore } from "../../stores/useAuthStore";

const schema = z
  .object({
    email: z.string().email("Email address must be valid"),
    password: z
      .string()
      .min(8, { message: "Password must have at least 8 characters" })
      .max(256, { message: "Password must have at most 256 characters" }),
  })
  .required();

const Login = () => {
  const { setAccessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: typeof form.values) => {
    setLoading(true);

    try {
      const {
        data: { accessToken },
      } = await axios.post<{
        user: AccountWithoutPassword;
        accessToken: string;
      }>("/auth/login", data);

      setAccessToken(accessToken);

      closeModal("login");
    } catch {
      showNotification({
        title: "Error",
        message: "Invalid username or password",
        icon: <X />,
        color: "red",
      });

      form.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        placeholder="Email address"
        size="lg"
        mb="md"
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
        {...form.getInputProps("email")}
      />

      <PasswordInput
        placeholder="Password"
        size="lg"
        mb="md"
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
        {...form.getInputProps("password")}
      />

      <Text align="center" mb="md">
        Don't have an account?{" "}
        <Anchor
          color="green"
          onClick={() => {
            closeModal("login");
            openModal({
              modalId: "register",
              title: <Text fz="xl">Register</Text>,
              children: <Register />,
            });
          }}
        >
          Register
        </Anchor>
      </Text>

      <Button type="submit" size="lg" color="green" fullWidth loading={loading}>
        Login
      </Button>
    </Box>
  );
};

export default Login;
