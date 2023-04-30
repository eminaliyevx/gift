import { Badge, Button, Card, Image, Stack, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "local-types";
import { useMemo } from "react";
import { ShoppingCartPlus, ShoppingCartX } from "tabler-icons-react";
import { axios } from "../../lib";
import { useAuthStore, useCartStore } from "../../stores";
import { findPrice } from "../../utils";

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { items } = useCartStore();

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

  const isProductAdded = useMemo(
    () => items.some(({ productId }) => productId === product.id),
    [items, product]
  );

  return (
    <Card withBorder sx={{ display: "flex", flexDirection: "column" }}>
      <Card.Section>
        <Image
          src={product.images[0]?.url}
          height={200}
          alt={product.name}
          withPlaceholder
          fit="cover"
        />
      </Card.Section>

      <Stack align="flex-start" spacing="xs" my="xs">
        <Text weight={500}>{product.name}</Text>

        <Badge size="xl" color="green">
          {findPrice(product) + " AZN"}
        </Badge>
      </Stack>

      <Text color="dimmed" mb="md" lineClamp={3}>
        {product.description}
      </Text>

      {isProductAdded ? (
        <Button
          variant="light"
          color="red"
          leftIcon={<ShoppingCartX size={20} />}
          fullWidth
          mt="auto"
          onClick={() =>
            mutate(
              items
                .filter(({ productId }) => productId !== product.id)
                .map(({ productId, quantity }) => ({ productId, quantity }))
            )
          }
          disabled={!user}
        >
          Drop
        </Button>
      ) : (
        <Button
          variant="light"
          color="green"
          leftIcon={<ShoppingCartPlus size={20} />}
          fullWidth
          mt="auto"
          onClick={() =>
            mutate([
              ...items.map(({ productId, quantity }) => ({
                productId,
                quantity,
              })),
              { productId: product.id, quantity: 1 },
            ])
          }
          disabled={!user}
        >
          Add to cart
        </Button>
      )}
    </Card>
  );
};

export default ProductCard;
