import React from "react";
import {
  LayoutDashboard,
  ListOrdered,
  Package,
  Users as UsersIcon,
  User,
  LogOut,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleComponent, toggleNavbar } from "../store/slices/extraSlice";
import { logout } from "../store/slices/authSlice";

const SideBar = () => {
  const dispatch = useDispatch();
  const { openedComponent, isNavbarOpened } = useSelector((state) => state.extra);
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Orders", icon: ListOrdered },
    { name: "Products", icon: Package },
    { name: "Users", icon: UsersIcon },
    { name: "Profile", icon: User },
  ];

  const handleNavClick = (name) => {
    dispatch(toggleComponent(name));
    if (window.innerWidth < 768 && isNavbarOpened) {
      dispatch(toggleNavbar());
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {/* Mobile overlay */}
      {isNavbarOpened && (
        <div
          onClick={() => dispatch(toggleNavbar())}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${
          isNavbarOpened ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-md">
              E
            </div>
            <div>
              <h2 className="font-bold text-base tracking-wide text-white">E-Commerce</h2>
              <p className="text-xs text-slate-400">Admin Control</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(toggleNavbar())}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = openedComponent === item.name;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer / User & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name ? user.name[0] : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || "admin@example.com"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
