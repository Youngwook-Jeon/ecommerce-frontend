import { redirect } from "next/navigation";

import { ADMIN } from "@/common/constants";
import { getAuthUserInfo } from "@/common/services/authService";
import { DashboardSidebar } from "../components/sidebar/DashboardSidebar";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export const AdminDashboardLayout = async ({
  children,
}: AdminDashboardLayoutProps) => {
  try {
    const authUserInfo = await getAuthUserInfo();
    if (
      !authUserInfo ||
      !authUserInfo.isAuthenticated ||
      !authUserInfo.roles.includes(ADMIN)
    ) {
      redirect("/");
    }
    console.log("[AdminDashboardLayout]: ", authUserInfo);
  } catch (error) {
    console.error("Error fetching auth user info:", error);

    redirect("/");
  }

  return (
    <div className="w-full h-full">
      <DashboardSidebar isAdmin />
      <div>
        {/* <DashboardNavbar /> */}
        <div>{children}</div>
      </div>
    </div>
  );
};
