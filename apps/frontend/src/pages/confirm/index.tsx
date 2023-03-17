import { Alert, Container, LoadingOverlay, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { AccountWithoutPassword } from "local-types";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Check } from "tabler-icons-react";
import { axios } from "../../lib";
import { useAuthStore } from "../../stores/useAuthStore";

const Confirm = () => {
  const { setAccessToken } = useAuthStore();
  const { hash } = useParams();
  const navigate = useNavigate();

  const { isLoading, error } = useQuery({
    queryKey: ["confirm"],
    queryFn: () =>
      axios.get<{ user: AccountWithoutPassword; accessToken: string }>(
        "/auth/confirm",
        {
          params: {
            hash,
          },
        }
      ),
    retry: false,
    onSuccess: ({ data: { accessToken } }) => {
      setAccessToken(accessToken);
      navigate("/");

      showNotification({
        title: "Success",
        message: "Your email address has been successfully confirmed.",
        icon: <Check size={20} />,
        color: "green",
        autoClose: 5000,
      });
    },
  });

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <Container
        size="xs"
        mih="100vh"
        sx={{ display: "grid", placeItems: "center" }}
      >
        {!!error && (
          <Alert
            title={
              <Text fz="xl" weight={600}>
                Error
              </Text>
            }
            icon={<AlertCircle size={28} />}
            color="red"
            styles={{
              icon: {
                width: 28,
                height: 28,
              },
            }}
            w="100%"
          >
            Failed to confirm your email address
          </Alert>
        )}
      </Container>
    </>
  );
};

export default Confirm;
