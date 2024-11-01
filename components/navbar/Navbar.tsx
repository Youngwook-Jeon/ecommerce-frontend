import Container from "../global/Container";
import CartButton from "./CartButton";
import Logo from "./Logo";
import NavSearch from "./NavSearch";
import TriggerButton from "./TriggerButton";
import AuthInfoLinks from "./AuthInfoLinks";
import { getAuthUserInfo } from "@/services/authService";
import { getTokenFromCookie, XSRF_COOKIE_NAME } from "@/services/fetchWrapper";

export default async function Navbar() {
  const csrfToken = getTokenFromCookie(XSRF_COOKIE_NAME)
  const authUserInfo = await getAuthUserInfo();
  console.log(authUserInfo);

  return (
    <nav className="border-b">
      <Container className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 py-8">
        <Logo />
        <NavSearch />
        <div className="flex gap-4 items-center">
          <CartButton />
          <AuthInfoLinks csrfToken={csrfToken} authUserInfo={authUserInfo}>
            <TriggerButton />
          </AuthInfoLinks>
        </div>
      </Container>
    </nav>
  );
}
