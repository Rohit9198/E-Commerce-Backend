import React from "react";
import { useDispatch, useSelector } from "react-redux";
import avatarDefault from "../assets/avatar.jpg";
import { Menu } from "lucide-react";
import { toggleNavbar } from "../store/slices/extraSlice";

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleNavbar())}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none"
          title="Toggle Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">{user?.name || "Admin"}</p>
          <p className="text-xs text-gray-500">{user?.email || "admin@example.com"}</p>
        </div>
        <img
          src={user?.avatar?.url || avatarDefault}
          alt={user?.name || "Admin"}
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
        />
      </div>
    </header>
  );
};

export default Header;