import { ADMIN } from "@/common/constants";
import { getAuthUserInfo } from "@/common/services/authService";
import { redirect } from "next/navigation";

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
    console.log("[AdminDashboardLayout]: ", authUserInfo)
  } catch (error) {
    console.error("Error fetching auth user info:", error);

    redirect("/");
  }

  return <div>{children}</div>;
};
