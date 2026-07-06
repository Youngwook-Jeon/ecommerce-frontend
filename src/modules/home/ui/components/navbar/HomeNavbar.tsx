import CartButton from "./CartButton";
import { CategoryNavMenu } from "./CategoryNavMenu";
import Logo from "@/common/ui/components/Logo";
import NavSearch from "./NavSearch";
import Container from "@/components/global/Container";
import DarkMode from "@/common/ui/components/DarkMode";
import { UserMenu } from "@/common/ui/components/UserMenu";
import { AuthUserInfoVm } from "@/common/schemas/auth";
import type { CategoryDtoVm } from "@/common/schemas/category";

interface HomeNavbarProps {
  authUserInfo: AuthUserInfoVm;
  categories: CategoryDtoVm[];
}

export default function HomeNavbar({
  authUserInfo,
  categories,
}: HomeNavbarProps) {
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
          <UserMenu
            authUserInfo={authUserInfo}
            isFromDashboard={false}
            isSeller
          />
        </div>
      </Container>
    </nav>
  );
}
