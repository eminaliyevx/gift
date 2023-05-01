import {
  Box,
  Button,
  FileInput,
  Image,
  InputBase,
  TextInput,
} from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm, zodResolver } from "@mantine/form";
import { closeModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isMobilePhone } from "class-validator";
import InputMask from "react-input-mask";
import { Check, X } from "tabler-icons-react";
import { z } from "zod";
import { axios } from "../../lib";
import { useAuthStore } from "../../stores";

type FormValues = {
  email?: string;
  phone?: string;
  image?: File;
};

const schema = z
  .object({
    email: z.string().email("Email address must be valid"),
    phone: z
      .string()
      .refine(
        (arg) => isMobilePhone(arg, "az-AZ"),
        "Phone number must be valid"
      ),
  })
  .required();

const UpdateAccount = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const form = useForm<FormValues>({
    validate: zodResolver(schema),
    initialValues: {
      email: user?.email,
      phone: user?.phone,
      image: undefined,
    },
  });

  const { mutate: updateAccount, isLoading } = useMutation({
    mutationFn: (data: typeof form.values) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      return axios.patch("/auth/account", formData);
    },
    onSuccess: () => {
      showNotification({
        title: "Success",
        message: "Your account has been successfully updated.",
        icon: <Check size={20} />,
        color: "green",
        autoClose: 5000,
      });

      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
    onError: () => {
      showNotification({
        title: "Error",
        message: "An error occurred",
        icon: <X size={20} />,
        color: "red",
      });
    },
    onSettled: () => {
      closeModal("updateAccount");
    },
  });

  const handleSubmit = async (data: typeof form.values) => {
    updateAccount(data);
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      {user?.image && (
        <Image
          src={user.image.url}
          alt={user.id.toString()}
          width={200}
          height={200}
          radius="50%"
          mx="auto"
          mb="xl"
        />
      )}

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

      <FileInput
        accept={IMAGE_MIME_TYPE.join(",")}
        placeholder="Image"
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
        {...form.getInputProps("image")}
      />

      <Button
        type="submit"
        size="lg"
        color="green"
        fullWidth
        loading={isLoading}
      >
        Update
      </Button>
    </Box>
  );
};

export default UpdateAccount;
