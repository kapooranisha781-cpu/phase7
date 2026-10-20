import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCode, FiLock, FiMail, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/axios.js";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password || !form.confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password: form.password,
      });

      toast.success(response.data.message || "Account created successfully!");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to create your account."
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
          <Link to="/register" className="brand">
            <span className="brand-icon"><FiCode /></span>
            <span>Collab<span className="brand-accent">Sphere</span></span>
          </Link>

          <div className="showcase-content">
            <span className="eyebrow">
              <span className="status-dot" />
              YOUR SPACE TO BUILD TOGETHER
            </span>

            <h1>
              Great ideas
              <br />
              are built <span>together.</span>
            </h1>

            <p>
              Bring your team, projects, and code into one collaborative
              workspace. Build something extraordinary.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon"><FiCode /></span>
                <div>
                  <strong>One workspace</strong>
                  <p>Keep your development work organized.</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon"><FiUser /></span>
                <div>
                  <strong>Better collaboration</strong>
                  <p>Build and grow with your team.</p>
                </div>
              </div>
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
              <span className="form-kicker">GET STARTED</span>
              <h2>Create your account</h2>
              <p>Join your workspace and start building together.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <label htmlFor="name">Full name</label>
              <div className="input-wrap">
                <FiUser className="input-icon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  maxLength={80}
                  required
                />
              </div>

              <label htmlFor="register-email">Email address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <label htmlFor="register-password">Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <label htmlFor="confirm-password">Confirm password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Enter your password again"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
                {!loading && <FiArrowRight />}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <p className="form-note">
              <FiLock /> Your password is securely hashed on the server.
            </p>
          </div>

          <p className="mobile-footer">Create. Collaborate. Innovate.</p>
        </div>
      </section>
    </main>
  );
}