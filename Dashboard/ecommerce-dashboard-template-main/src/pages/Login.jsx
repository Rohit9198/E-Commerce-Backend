import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { login } from "../store/slices/authSlice";
const Login = () => {
  const { formData, setFormData } = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const dispatch = useDispatch();
  const handleLogin = (e) => {
    e.preventDefault();
    const data = new formData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    dispatch(login(data));
  };

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated && user.role === "Admin") {
    return <Navigate to="/" />;
  }
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200 px-4">
        <div className="bg-white shadow-lg rounded-2xl max-w-md w-full p-8 sm:p-10">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Welcome Back
          </h2>
          <form onSubmit={handleLogin} className="spay-y-5">
            <div className="p-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onCanPlay={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-gray-300 rounded-xl"
              />
            </div>
            <div className="p-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onCanPlay={handleChange}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-gray-300 rounded-xl"
              />
            </div>
            <div className="px-2 flex justify-between items-center text-sm text-grya-500">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="w-4 h-4" />
                <label htmlFor="remember">Remember Me</label>
              </div>
              <div>
                <Link to={"/password/forgot"} type="button" className="text-blue-600 hover:underline">
                Forgot Password?
                </Link>
              </div>
              <div className="px-2">
                <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
                ></button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
