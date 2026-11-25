import { Outlet, useNavigate } from "react-router-dom";

import { logout } from "@/app/auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/layout/app-sidebar";
import { AppHeader } from "@/app/layout/app-header";

function Layout() {
  const navigate = useNavigate();
  const user = useCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader user={user} onLogout={handleLogout} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
