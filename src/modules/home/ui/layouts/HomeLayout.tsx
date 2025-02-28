import Container from "@/components/global/Container";
import HomeNavbar from "../components/navbar/HomeNavbar";
import HomeProviders from "./HomeProviders";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <HomeProviders>
      <HomeNavbar />
      <Container className="py-20">{children}</Container>
    </HomeProviders>
  );
};
