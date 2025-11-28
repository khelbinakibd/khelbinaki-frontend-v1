import { Link, NavLink, Outlet } from "react-router";
import { useState } from "react";
import {
  Menu,
  X,
  Settings,
  HelpCircle,
  ChevronRight,
  User
} from "lucide-react";
import { navConfig } from "../Config/navConfig";
import { useAuth } from "../Hooks/useAuth";


//  admin menus   

//  Get all turf  ,  get all users 

const DashboardLayout = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = user && user.role ? navConfig[user.role] ?? [] : [];

  // Sidebar menu items with icons
  const sidebarMenuItems = [...links];



  const bottomItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Support & Help', path: '/contact' }
  ];

  const SidebarContent = () => (
    <div className="h-full fixed bg-gradient-to-b from-green-700 to-green-800 text-white flex flex-col z-10">
      {/* Header */}
      <div className="p-4 border-b border-green-600/40">
        <div className="flex items-center justify-between mt-16">
          <Link to="/" className="flex items-center gap-3">
            <img src="/khelbiNakiLogo.png" alt="Logo" className="w-10 h-10 rounded-lg bg-white p-1" />
            {!isCollapsed && (
              <span className="font-bold text-lg tracking-wide">KhelbiNaki</span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 hover:bg-green-600/40 rounded transition-colors"
          >
            <ChevronRight
              size={16}
              className={`rounded transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            />
          </button>
        </div>
      </div>

      {/* Workspace Section */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <User size={14} />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-medium opacity-90">{user?.name}</span>
          )}
        </div>

      </div>

      {/* Menu Section */}
      <div className="flex-1 p-4">
        {!isCollapsed && (
          <div className="text-xs font-medium opacity-70 mb-3 tracking-wider">MENU</div>
        )}
        <div className="space-y-1">
          {sidebarMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-lg transition-colors group 
     ${isActive ? "bg-green-600/40" : "hover:bg-green-600/40"}`
              }
            >
              {item.icon && <item.icon size={18} className="text-white/90 group-hover:text-white" />}
              {!isCollapsed && (
                <span className="text-sm">{item.label}</span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-green-600/40">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={"/contact"}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-600/40 transition-colors group"
            >
              <item.icon size={18} className="text-white/90 group-hover:text-white" />
              {!isCollapsed && (
                <span className="text-sm">{item.label}</span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-green-700 text-white rounded-lg shadow-lg hover:bg-green-800 transition-colors"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block h-screen ${isCollapsed ? 'w-16' : 'w-48'} transition-all duration-300 ease-in-out`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <SidebarContent />
      </aside>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
