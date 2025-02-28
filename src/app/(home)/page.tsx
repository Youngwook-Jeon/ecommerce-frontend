import { Suspense } from "react";

import { Hero } from "@/modules/home/ui/components/Hero";
import { FeaturedProducts } from "@/modules/home/ui/components/featured-products/FeaturedProducts";
import LoadingContainer from "@/components/global/LoadingContainer";

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<LoadingContainer />}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}
