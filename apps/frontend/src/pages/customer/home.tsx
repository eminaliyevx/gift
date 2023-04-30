import { Center, Loader, LoadingOverlay, SimpleGrid } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Product } from "local-types";
import { Fragment, useEffect } from "react";
import { ProductCard } from "../../components/product";
import { axios } from "../../lib";
import { useNavbarStore } from "../../stores";

const Home = () => {
  const { ref, entry } = useIntersection();
  const { categories } = useNavbarStore();

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      ["products", categories],
      async ({ pageParam = "" }) =>
        axios
          .get<{ products: Product[]; cursor?: string }>("/product", {
            params: {
              cursor: pageParam,
              categories,
            },
          })
          .then((response) => response.data),
      {
        getNextPageParam: (lastPage) => lastPage.cursor || undefined,
      }
    );

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry, hasNextPage]);

  return (
    <>
      <LoadingOverlay
        loaderProps={{ color: "green", variant: "bars" }}
        visible={isFetching}
      />

      {data?.pages.map((page) => (
        <Fragment key={page.cursor || "lastPage"}>
          <SimpleGrid
            mb="md"
            breakpoints={[
              { minWidth: "xs", cols: 2 },
              { minWidth: "sm", cols: 3 },
              { minWidth: "lg", cols: 4 },
            ]}
          >
            {page.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>
        </Fragment>
      ))}

      {isFetchingNextPage && (
        <Center mt="lg">
          <Loader color="green" variant="bars" mx="auto" />
        </Center>
      )}

      <span ref={ref} style={{ visibility: "hidden" }}>
        Intersection Observer
      </span>
    </>
  );
};

export default Home;
