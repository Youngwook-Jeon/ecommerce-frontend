import Link from "next/link";
import Container from "@/components/global/Container";
import { isPublicProductApiError } from "@/common/errors/publicProductApiError";
import { parsePlpSearchParams } from "@/modules/catalog/lib/plpSearchParams";
import { ProductCatalogLayout } from "@/modules/catalog/ui/components/ProductCatalogLayout";
import { ProductSearchFeedback } from "@/modules/catalog/ui/components/ProductSearchFeedback";
import { searchPublicProducts } from "@/services/publicProductService";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
export default async function SearchPage({ searchParams }: SearchPageProps) {
  let plpParams;
  let productPage;
  try {
    plpParams = parsePlpSearchParams(await searchParams);
    productPage = await searchPublicProducts(plpParams);
    plpParams = { ...plpParams, q: productPage.query.q ?? undefined, sort: productPage.query.sort };
  } catch (error) {
    if (isPublicProductApiError(error)) {
      return <Container className="py-10"><ProductSearchFeedback status={error.status} code={error.code} /></Container>;
    }
    throw error;
  }
  return (
    <Container className="py-10">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">Home</Link>
      <header className="my-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {productPage.query.q ? `Results for “${productPage.query.q}”` : "All products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {productPage.totalElements.toLocaleString("en-US")} products
        </p>
      </header>
      <ProductCatalogLayout plpParams={plpParams} productPage={productPage} />
    </Container>
  );
}
