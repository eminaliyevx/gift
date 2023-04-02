import {
  Anchor,
  Box,
  Button,
  InputBase,
  PasswordInput,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { closeModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import type { Gender, Role } from "@prisma/client";
import { isMobilePhone } from "class-validator";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import { Mail, X } from "tabler-icons-react";
import { z } from "zod";
import { Login } from ".";
import { axios } from "../../lib";

type FormValues = {
  email: string;
  password: string;
  phone: string;
  role: Role | null;
  name?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  gender?: Gender;
};

const baseSchema = z
  .object({
    email: z.string().email("Email address must be valid"),
    password: z
      .string()
      .min(8, { message: "Password must have at least 8 characters" })
      .max(256, { message: "Password must have at most 256 characters" }),
    phone: z
      .string()
      .refine(
        (arg) => isMobilePhone(arg, "az-AZ"),
        "Phone number must be valid"
      ),
    role: z
      .string({
        required_error: "Select role",
        invalid_type_error: "Select role",
      })
      .refine((arg) => arg === "CUSTOMER" || arg === "BUSINESS", "Select role"),
  })
  .required();

const customerSchema = baseSchema
  .extend({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    birthDate: z.date({
      required_error: "Birth date is required",
      invalid_type_error: "Birth date is required",
    }),
    gender: z
      .string({
        required_error: "Select gender",
        invalid_type_error: "Select gender",
      })
      .refine((arg) => arg === "MALE" || arg === "FEMALE", "Select gender"),
  })
  .required();

const businessSchema = baseSchema
  .extend({
    name: z.string().trim().min(1, "Name is required"),
  })
  .required();

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState(baseSchema);

  const form = useForm<FormValues>({
    validate: zodResolver(schema),
    initialValues: {
      email: "",
      password: "",
      phone: "",
      role: null,
      name: "",
      firstName: "",
      lastName: "",
      birthDate: undefined,
      gender: undefined,
    },
  });

  useEffect(() => {
    if (form.values.role === "CUSTOMER") {
      setSchema(customerSchema);
    } else if (form.values.role === "BUSINESS") {
      setSchema(businessSchema);
    } else {
      setSchema(baseSchema);
    }
  }, [form.values.role]);

  const handleSubmit = async ({
    name,
    firstName,
    lastName,
    birthDate,
    gender,
    ...rest
  }: FormValues) => {
    setLoading(true);

    try {
      if (rest.role === "CUSTOMER") {
        await axios.post("/customer/register", {
          firstName,
          lastName,
          birthDate: dayjs(birthDate?.toISOString()).format("YYYY-MM-DD"),
          gender,
          ...rest,
        });
      } else if (rest.role === "BUSINESS") {
        await axios.post("/business/register", {
          name,
          ...rest,
        });
      } else {
        return showNotification({
          title: "Error",
          message: "No role selected",
          icon: <X size={20} />,
          color: "red",
        });
      }

      showNotification({
        title: "Success",
        message:
          "A confirmation email has been sent to your email address. Please, confirm your email address to use our website.",
        icon: <Mail size={20} />,
        color: "green",
      });

      closeModal("register");
    } catch {
      showNotification({
        title: "Error",
        message: "An error occurred",
        icon: <X size={20} />,
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

      <InputBase
        placeholder="Phone"
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
        size="lg"
        mb="md"
        component={InputMask}
        mask="+\9\94999999999"
        {...form.getInputProps("phone")}
      />

      <Select
        placeholder="Who are you?"
        size="lg"
        data={[
          { value: "CUSTOMER", label: "Customer" },
          { value: "BUSINESS", label: "Business" },
        ]}
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
        {...form.getInputProps("role")}
      />

      {form.values.role === "BUSINESS" && (
        <TextInput
          placeholder="Name"
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
          {...form.getInputProps("name")}
        />
      )}

      {form.values.role === "CUSTOMER" && (
        <>
          <TextInput
            placeholder="First name"
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
            {...form.getInputProps("firstName")}
          />

          <TextInput
            placeholder="Last name"
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
            {...form.getInputProps("lastName")}
          />

          <DateInput
            placeholder="Birth date"
            valueFormat="YYYY-MM-DD"
            size="lg"
            mb="md"
            {...form.getInputProps("birthDate")}
          />

          <Select
            placeholder="Gender"
            size="lg"
            data={[
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ]}
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
            {...form.getInputProps("gender")}
          />
        </>
      )}

      <Text align="center" mb="md">
        Already have an account?{" "}
        <Anchor
          color="green"
          onClick={() => {
            closeModal("register");
            openModal({
              modalId: "login",
              title: <Text fz="xl">Login</Text>,
              children: <Login />,
            });
          }}
        >
          Login
        </Anchor>
      </Text>

      <Button type="submit" size="lg" color="green" fullWidth loading={loading}>
        Register
      </Button>
    </Box>
  );
};

export default Register;
