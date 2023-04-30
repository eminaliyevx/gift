import { Group, Image, SpacingValue, SystemProp, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { USER_NAVIGATES } from "../../guards/role.guard";
import { useAuthStore } from "../../stores";

type LogoProps = {
  size?: string | number;
  fz?: SystemProp<SpacingValue>;
};

const Logo = ({ size = 32, fz = "xl" }: LogoProps) => {
  const { user } = useAuthStore();

  return (
    <Link
      to={user ? USER_NAVIGATES[user.role] : "/"}
      style={{ color: "unset", textDecoration: "none" }}
    >
      <Group>
        <Image src="/vite.svg" width={size} height={size} />

        <Text fz={fz} fw={700}>
          Gift
        </Text>
      </Group>
    </Link>
  );
};

export default Logo;
