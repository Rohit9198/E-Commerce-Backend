import React, { useState } from "react";
import avatarDefault from "../assets/avatar.jpg";
import Header from "./Header";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAdminProfile,
  updateAdminPassword,
} from "../store/slices/authSlice";
import { LoaderCircle, ShieldCheck } from "lucide-react";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar?.url || avatarDefault
  );
  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", profileData.name);
    data.append("email", profileData.email);
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }
    dispatch(updateAdminProfile(data));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    dispatch(updateAdminPassword(passwordData));
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
          <p className="text-sm text-gray-500">Update account settings and password</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Info Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Personal Information
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={avatarPreview}
                  alt="Admin Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 cursor-pointer">
                    <span className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md transition text-xs">
                      Change Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400">JPG, PNG or WEBP</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition"
                >
                  {loading ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Security & Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  placeholder="8-16 characters"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmNewPassword: e.target.value,
                    })
                  }
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition"
                >
                  {loading ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;