import { AuthUserInfoVm } from "@/common/schemas/auth";
import DarkMode from "@/common/ui/components/DarkMode";
import { UserMenu } from "@/common/ui/components/UserMenu";

interface DashboardHeaderProps {
  authUserInfo: AuthUserInfoVm;
}

export const DashboardHeader = ({ authUserInfo }: DashboardHeaderProps) => {
  return (
    <div className="fixed z-[20] md:left-[300px] left-0 top-0 right-0 p-4 bg-background/80 flex gap-4 items-center border-b-[1px]">
      <div className="flex items-center gap-2 ml-auto">
        <DarkMode />
        <UserMenu authUserInfo={authUserInfo} isFromDashboard />
      </div>
    </div>
  );
};
