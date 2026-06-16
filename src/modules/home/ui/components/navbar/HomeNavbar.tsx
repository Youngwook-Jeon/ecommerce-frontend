import CartButton from "./CartButton";
import { CategoryNavMenu } from "./CategoryNavMenu";
import Logo from "@/common/ui/components/Logo";
import NavSearch from "./NavSearch";
import Container from "@/components/global/Container";
import { getAuthUserInfo } from "@/common/services/authService";
import DarkMode from "@/common/ui/components/DarkMode";
import { UserMenu } from "@/common/ui/components/UserMenu";
import { AuthUserInfoVm } from "@/common/schemas/auth";
import { getPublicCategoryHierarchy } from "@/services/publicCategoryService";

export default async function HomeNavbar() {
  let authUserInfo: AuthUserInfoVm | undefined;
  try {
    authUserInfo = await getAuthUserInfo();
  } catch (error) {
    console.error("Error fetching auth user info:", error);
  }

  const categories = await getPublicCategoryHierarchy();

  return (
    <nav className="border-b">
      <Container className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 py-8">
        <div className="flex items-center gap-4">
          <Logo />
          <CategoryNavMenu categories={categories} />
        </div>
        <NavSearch />
        <div className="flex gap-4 items-center">
          <DarkMode />
          <CartButton />
          {authUserInfo && (
            <UserMenu
              authUserInfo={authUserInfo}
              isFromDashboard={false}
              isSeller
            />
          )}
        </div>
      </Container>
    </nav>
  );
}
