import CartButton from "./CartButton";
import Logo from "../../../../../common/ui/components/Logo";
import NavSearch from "./NavSearch";
import TriggerButton from "./TriggerButton";
import AuthInfoLinks from "./AuthInfoLinks";
import Container from "@/components/global/Container";
import { getAuthUserInfo } from "@/common/services/authService";
import { getAllCookies, XSRF_COOKIE_NAME } from "@/common/services/fetchWrapper";
import DarkMode from "./DarkMode";
// import { adminTest, authTest } from "@/services/productService";

export default async function HomeNavbar() {
  const csrfToken = (await getAllCookies())[XSRF_COOKIE_NAME] || "";
  // const authTestRes = await authTest();
  try {
    // const res = await refreshToken();
    // console.log(res);
    // const adminTestRes = await adminTest();
    // console.log(adminTestRes);
  } catch (error) {
    // await refreshToken();
    console.log(error);
  }
  const authUserInfo = await getAuthUserInfo();
  await getAuthUserInfo();
  // console.log(authTestRes);
  // console.log(adminTestRes);
  console.log(authUserInfo);

  return (
    <nav className="border-b">
      <Container className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 py-8">
        <Logo />
        <NavSearch />
        <div className="flex gap-4 items-center">
          <DarkMode />
          <CartButton />
          <AuthInfoLinks csrfToken={csrfToken} authUserInfo={authUserInfo}>
            <TriggerButton />
          </AuthInfoLinks>
        </div>
      </Container>
    </nav>
  );
}
