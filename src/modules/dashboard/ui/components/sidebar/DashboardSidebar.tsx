import Logo from "@/common/ui/components/Logo";
import { DashboardSidebarNavAdmin } from "./DashboardSidebarNavAdmin";

interface DashboardSidebarProps {
  isAdmin: boolean;
}

export const DashboardSidebar = ({ isAdmin }: DashboardSidebarProps) => {
  return (
    <div className="w-[300px] border-r h-screen p-4 flex flex-col fixed top-0 left-0 bottom-0">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="mt-4 flex-grow">
        {isAdmin ? (
          <DashboardSidebarNavAdmin />
        ) : (
          <div>DashboardSidebarNavSeller</div>
        )}
      </div>
    </div>
  );
};
