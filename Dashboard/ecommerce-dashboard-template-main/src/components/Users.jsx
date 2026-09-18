import React, { useEffect, useState } from "react";
import avatar from "../assets/avatar.jpg";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import { fetchAllUsers, deleteUser } from "../store/slices/adminSlice";
import {
  Search,
  Trash2,
  Eye,
  X,
  Users as UsersIcon,
  AlertTriangle,
  LoaderCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  User,
} from "lucide-react";

const USERS_PER_PAGE = 10;

const RoleBadge = ({ role }) => {
  const isAdmin = (role || "").toLowerCase() === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        isAdmin
          ? "bg-purple-100 text-purple-700 border-purple-200"
          : "bg-blue-100 text-blue-700 border-blue-200"
      }`}
    >
      {isAdmin ? (
        <ShieldCheck className="w-3.5 h-3.5" />
      ) : (
        <User className="w-3.5 h-3.5" />
      )}
      {role || "User"}
    </span>
  );
};

const Users = () => {
  const dispatch = useDispatch();
  const { users, totalUsers, loading } = useSelector((state) => state.admin);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // View profile modal
  const [viewModal, setViewModal] = useState(null); // user object

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState(null); // userId

  useEffect(() => {
    dispatch(fetchAllUsers(currentPage));
  }, [dispatch, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    dispatch(deleteUser(deleteModal));
    setDeleteModal(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Users</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalUsers} registered user{totalUsers !== 1 ? "s" : ""} in total
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchAllUsers(currentPage))}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <LoaderCircle className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-sm font-medium">Loading users…</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <UsersIcon className="w-10 h-10" />
              <p className="text-sm font-medium">
                {searchQuery ? "No users match your search." : "No users found."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["User", "Email", "Role", "Joined On", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* User */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar?.url || avatar}
                            alt={user.name || "User"}
                            onError={(e) => {
                              e.currentTarget.src = avatar;
                            }}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {user.name || "—"}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              {(user.id || "").slice(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {user.email || "—"}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(user.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewModal(user)}
                            title="View Profile"
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(user.id)}
                            title="Delete User"
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer — Pagination */}
          {!loading && !searchQuery && totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4 text-xs text-gray-500">
              <span>
                Page {currentPage} of {totalPages} &middot;{" "}
                {totalUsers} users
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== p - 1) {
                      acc.push("…");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "…" ? (
                      <span key={`dots-${idx}`} className="px-1">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`w-7 h-7 rounded-lg border text-xs font-semibold transition-colors ${
                          currentPage === item
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {!loading && filteredUsers.length > 0 && (searchQuery || totalPages <= 1) && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              Showing {filteredUsers.length}{" "}
              {searchQuery ? "matching" : ""} user
              {filteredUsers.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* ── VIEW PROFILE MODAL ── */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">
                User Profile
              </h3>
              <button
                onClick={() => setViewModal(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar + Name */}
            <div className="flex flex-col items-center text-center mb-5">
              <img
                src={viewModal.avatar?.url || avatar}
                alt={viewModal.name || "User"}
                onError={(e) => {
                  e.currentTarget.src = avatar;
                }}
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 mb-3"
              />
              <h4 className="text-lg font-bold text-gray-800">
                {viewModal.name || "—"}
              </h4>
              <RoleBadge role={viewModal.role} />
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-gray-800 font-medium">
                    {viewModal.email || "—"}
                  </p>
                </div>
              </div>

              {viewModal.phone && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="text-gray-800 font-medium">{viewModal.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                    Joined On
                  </p>
                  <p className="text-gray-800 font-medium">
                    {formatDate(viewModal.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <UsersIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                    User ID
                  </p>
                  <p className="text-gray-600 font-mono text-xs break-all">
                    {viewModal.id || "—"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewModal(null)}
              className="w-full mt-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Delete User?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the user and all associated data.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

