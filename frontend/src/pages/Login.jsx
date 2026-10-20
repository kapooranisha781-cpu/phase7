import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCode, FiLock, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/axios.js";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password: form.password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("The server returned an invalid login response.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(response.data.message || "Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <section className="auth-layout">
        <div className="auth-showcase">
          <Link to="/login" className="brand">
            <span className="brand-icon"><FiCode /></span>
            <span>Collab<span className="brand-accent">Sphere</span></span>
          </Link>

          <div className="showcase-content">
            <span className="eyebrow">
              <span className="status-dot" />
              YOUR SPACE TO BUILD TOGETHER
            </span>

            <h1>
              Your team's
              <br />
              next big thing
              <br />
              starts <span>here.</span>
            </h1>

            <p>
              Sign in to get back to your projects, connect with your
              collaborators, and turn ideas into reality.
            </p>

            <div className="showcase-quote">
              <div className="quote-line" />
              <p>
                “Alone we can do so little; together we can do so much.”
              </p>
              <span>Build better, together.</span>
            </div>
          </div>

          <p className="showcase-footer">Create. Collaborate. Innovate.</p>
        </div>

        <div className="auth-form-side">
          <div className="mobile-brand">
            <span className="brand-icon"><FiCode /></span>
            <span>Collab<span className="brand-accent">Sphere</span></span>
          </div>

          <div className="auth-card">
            <div className="form-heading">
              <span className="form-kicker">WELCOME BACK</span>
              <h2>Sign in to CollabSphere</h2>
              <p>Your workspace is waiting for you.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <label htmlFor="login-email">Email address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <label htmlFor="login-password">Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <FiArrowRight />}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Create account</Link>
            </p>

            <p className="form-note">
              <FiLock /> Your workspace is protected by authentication.
            </p>
          </div>

          <p className="mobile-footer">Create. Collaborate. Innovate.</p>
        </div>
      </section>
    </main>
  );
}