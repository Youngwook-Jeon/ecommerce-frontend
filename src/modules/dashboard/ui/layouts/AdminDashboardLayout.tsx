import { redirect } from "next/navigation";

import { ADMIN } from "@/common/constants";
import { getAuthUserInfo } from "@/common/services/authService";
import { DashboardSidebar } from "../components/sidebar/DashboardSidebar";
import { DashboardHeader } from "../components/header/DashboardHeader";
import { AuthUserInfoVm } from "@/common/schemas/auth";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export const AdminDashboardLayout = async ({
  children,
}: AdminDashboardLayoutProps) => {
  let authUserInfo: AuthUserInfoVm | undefined;
  try {
    authUserInfo = await getAuthUserInfo();
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
      <div className="ml-[300px]">
        <DashboardHeader authUserInfo={authUserInfo} />
        <div className="w-full mt-[75px] p-4">{children}</div>
      </div>
    </div>
  );
};
