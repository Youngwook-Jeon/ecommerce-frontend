import Container from "@/components/global/Container";
import { HomeAuthShell } from "@/modules/home/ui/components/HomeAuthShell";
import { getPublicCategoryHierarchy } from "@/services/publicCategoryService";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export async function HomeLayout({ children }: HomeLayoutProps) {
  const categories = await getPublicCategoryHierarchy();

  return (
    <HomeAuthShell categories={categories}>
      <Container className="py-20">{children}</Container>
    </HomeAuthShell>
  );
}
