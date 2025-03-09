import Container from "@/components/global/Container";
import HomeNavbar from "../components/navbar/HomeNavbar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <>
      <HomeNavbar />
      <Container className="py-20">{children}</Container>
    </>
  );
};
