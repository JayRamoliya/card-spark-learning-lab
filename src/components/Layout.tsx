
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  title: string;
  active: boolean;
}

const NavItem = ({ href, icon: Icon, title, active }: NavItemProps) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-brand-purple",
      active ? "bg-brand-lightPurple text-brand-purple" : "text-gray-700"
    )}
  >
    <Icon className="h-5 w-5" />
    <span>{title}</span>
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { stats } = useStore();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const routes = [
    {
      href: "/",
      title: "Dashboard",
      icon: Home,
    },
    {
      href: "/decks",
      title: "Decks",
      icon: BookOpen,
    },
    {
      href: "/stats",
      title: "Statistics",
      icon: BarChart3,
    },
    {
      href: "/settings",
      title: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-brand-purple" />
          <h1 className="text-xl font-bold">FlashMaster</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r w-64 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-brand-purple" />
              <h1 className="text-xl font-bold">FlashMaster</h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 flex-1">
            <nav className="space-y-2">
              {routes.map((route) => (
                <NavItem
                  key={route.href}
                  href={route.href}
                  icon={route.icon}
                  title={route.title}
                  active={pathname === route.href}
                />
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Current streak</div>
              <div className="text-sm font-medium flex items-center gap-1">
                <span>{stats.streakDays}</span>
                <span>days</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {/* Sidebar overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 lg:hidden z-10"
              onClick={toggleSidebar}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
