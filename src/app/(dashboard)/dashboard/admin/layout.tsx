import {AdminDashboardLayout} from "@/modules/dashboard/ui/layouts/AdminDashboardLayout";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
};

export default Layout;
