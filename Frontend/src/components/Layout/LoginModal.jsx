import { useState, useEffect } from "react";
import { X, Mail, Lock, User, CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
} from "../../store/slices/authSlice";

const LoginModal = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const {
    authUser,
    isSigningUp,
    isLoggingIn,
    isRequestingForToken,
    isUpdatingPassword,
  } = useSelector((state) => state.auth);
  const { isAuthPopupOpen } = useSelector((state) => state.popup);

  const [mode, setMode] = useState("signin"); // signin | signup | forgot | forgot-success | reset

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Detect reset password URL and open popup with reset mode
  useEffect(() => {
    if (location.pathname.startsWith("/password/reset")) {
      setMode("reset");
      if (!isAuthPopupOpen) {
        dispatch(toggleAuthPopup());
      }
    }
  }, [location.pathname, dispatch, isAuthPopupOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.password &&
      (formData.password.length < 8 || formData.password.length > 16) &&
      mode !== "forgot"
    ) {
      toast.error("Password must be between 8 and 16 characters.");
      return;
    }

    if (
      (mode === "signup" || mode === "reset") &&
      formData.password !== formData.confirmPassword
    ) {
      toast.error("Passwords do not match!");
      return;
    }

    if (mode === "forgot") {
      dispatch(forgotPassword({ email: formData.email })).then((res) => {
        if (!res.error) {
          setMode("forgot-success");
        }
      });
      return;
    }

    if (mode === "reset") {
      const token = location.pathname.split("/").pop();
      dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      ).then((res) => {
        if (!res.error) {
          dispatch(toggleAuthPopup());
          setMode("signin");
        }
      });
      return;
    }

    if (mode === "signup") {
      dispatch(
        register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      );
    } else {
      dispatch(
        login({
          email: formData.email,
          password: formData.password,
        })
      );
    }

    if (authUser) {
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    }
  };

  if (!isAuthPopupOpen || authUser) return null;

  const isLoading =
    isSigningUp || isLoggingIn || isRequestingForToken || isUpdatingPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* OVERLAY BACKDROP */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-black/50"
        onClick={() => dispatch(toggleAuthPopup())}
      />

      {/* MODAL CARD */}
      <div className="relative z-10 glass-panel w-full max-w-md mx-4 animate-fade-in-up">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">
            {mode === "reset"
              ? "Reset Password"
              : mode === "signup"
              ? "Create Account"
              : mode === "forgot"
              ? "Forgot Password"
              : mode === "forgot-success"
              ? "Check Email"
              : "Welcome Back"}
          </h2>
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
            type="button"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* FORGOT PASSWORD SUCCESS VIEW */}
        {mode === "forgot-success" ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Password Reset Requested
            </h3>
            <p className="text-muted-foreground text-sm">
              We have processed your request for{" "}
              <span className="font-semibold text-foreground">
                {formData.email}
              </span>
              . Please check your inbox for instructions.
            </p>
            <button
              onClick={() => setMode("signin")}
              className="w-full gradient-primary text-primary-foreground py-3 rounded-lg hover:glow-on-hover animate-smooth font-semibold mt-4"
              type="button"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME FIELD (SIGNUP ONLY) */}
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
            )}

            {/* EMAIL FIELD (SIGNIN, SIGNUP, FORGOT) */}
            {mode !== "reset" && (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
            )}

            {/* PASSWORD FIELD (SIGNIN, SIGNUP, RESET) */}
            {mode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password (8-16 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  maxLength={16}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
            )}

            {/* CONFIRM PASSWORD FIELD (SIGNUP, RESET) */}
            {(mode === "signup" || mode === "reset") && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={8}
                  maxLength={16}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>
            )}

            {/* FORGOT PASSWORD LINK (SIGNIN MODE ONLY) */}
            {mode === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-primary text-primary-foreground py-3 rounded-lg hover:glow-on-hover animate-smooth font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>
                    {mode === "reset"
                      ? "Resetting Password..."
                      : mode === "signup"
                      ? "Creating Account..."
                      : mode === "forgot"
                      ? "Sending Link..."
                      : "Signing In..."}
                  </span>
                </>
              ) : (
                <span>
                  {mode === "reset"
                    ? "Reset Password"
                    : mode === "signup"
                    ? "Create Account"
                    : mode === "forgot"
                    ? "Send Reset Link"
                    : "Sign In"}
                </span>
              )}
            </button>
          </form>
        )}

        {/* MODE SWITCH FOOTER */}
        {mode !== "forgot-success" && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" && (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            )}

            {mode === "signup" && (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}

            {(mode === "forgot" || mode === "reset") && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-primary font-semibold hover:underline"
              >
                Back to Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
