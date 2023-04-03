import { LoadingOverlay, SimpleGrid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Product } from "local-types";
import { ProductCard } from "../../components/product";
import { axios } from "../../lib";

const Home = () => {
  const { data: products, isFetching } = useQuery({
    queryKey: ["confirm"],
    queryFn: () =>
      axios.get<Product[]>("/product").then((response) => response.data),
  });

  return (
    <>
      <LoadingOverlay
        loaderProps={{ color: "green", variant: "bars" }}
        visible={isFetching}
      />

      {products && products.length > 0 && (
        <SimpleGrid
          breakpoints={[
            { minWidth: "xs", cols: 2 },
            { minWidth: "sm", cols: 3 },
            { minWidth: "md", cols: 4 },
          ]}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      )}
    </>
  );
};

export default Home;
