// frontend/src/pages/Dashboard.jsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiCode,
  FiLogOut,
  FiFolder,
  FiUsers,
  FiCpu,
  FiPlus,
  FiX,
  FiRefreshCw,
  FiCalendar,
  FiUserPlus,
  FiArrowUpRight,
  FiBookOpen,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../api/axios.js";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  const [memberEmails, setMemberEmails] = useState({});
  const [addingMemberId, setAddingMemberId] = useState(null);

  const [error, setError] = useState("");

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/projects");

      const projectList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.projects)
          ? response.data.projects
          : [];

      setProjects(projectList);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error("Your session expired. Please log in again.");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Could not load projects. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Check authentication and load projects
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }

    fetchProjects();
  }, [fetchProjects, navigate]);

  // Create project
  const handleCreateProject = async (event) => {
    event.preventDefault();

    const trimmedName = projectName.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      toast.error("Please enter a project name.");
      return;
    }

    try {
      setCreating(true);

      const response = await api.post("/projects", {
        name: trimmedName,
        description: trimmedDescription,
      });

      const newProject = response.data?.project;

      if (newProject?._id) {
        setProjects((previous) => [
          newProject,
          ...previous.filter(
            (project) => project._id !== newProject._id
          ),
        ]);
      } else {
        await fetchProjects();
      }

      setProjectName("");
      setDescription("");
      setShowForm(false);

      toast.success(
        response.data?.message || "Project created successfully!"
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not create the project."
      );
    } finally {
      setCreating(false);
    }
  };

  // Add a teammate to a project
  const handleAddMember = async (event, projectId) => {
    event.preventDefault();

    const email = memberEmails[projectId]?.trim();

    if (!email) {
      toast.error("Please enter your teammate's email.");
      return;
    }

    try {
      setAddingMemberId(projectId);

      const response = await api.post(
        `/projects/${projectId}/members`,
        { email }
      );

      toast.success(
        response.data?.message ||
          "Team member added successfully!"
      );

      setMemberEmails((previous) => ({
        ...previous,
        [projectId]: "",
      }));

      await fetchProjects();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not add the team member. Check the email and try again."
      );
    } finally {
      setAddingMemberId(null);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  // Format project creation date
  const getProjectDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get project owner's name
  const getOwnerName = (owner) => {
    if (!owner) return "Unknown owner";

    if (typeof owner === "string") {
      return "Project owner";
    }

    return owner.name || owner.email || "Unknown owner";
  };

  // Count members across projects
  const totalMembers = projects.reduce((total, project) => {
    return total + (Array.isArray(project.members)
      ? project.members.length
      : 0);
  }, 0);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <Link className="dashboard-brand" to="/dashboard">
          <span className="brand-icon">
            <FiCode />
          </span>

          <span>
            <strong>CollabSphere</strong>
            <small>Build together. Grow together.</small>
          </span>
        </Link>

        <div className="header-actions">
          <div className="user-profile">
            <div className="user-avatar">
              {(user?.name || user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-details">
              <strong>{user?.name || "CollabSphere User"}</strong>
              <span>{user?.email || "Team workspace"}</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            type="button"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="dashboard-welcome">
          <div className="welcome-content">
            <span className="eyebrow">
              <span className="status-dot" />
              YOUR WORKSPACE
            </span>

            <h1>
              Let's build something
              <span className="gradient-text"> amazing.</span>
            </h1>

            <p>
              Manage your projects, bring your teammates together,
              and turn your ideas into reality.
            </p>
          </div>

          <button
            type="button"
            className="primary-button create-project-button"
            onClick={() => setShowForm(true)}
          >
            <FiPlus />
            Create Project
          </button>
        </section>

        {/* Dashboard Statistics */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon purple-icon">
              <FiFolder />
            </div>

            <div>
              <span>Total Projects</span>
              <strong>{projects.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon cyan-icon">
              <FiUsers />
            </div>

            <div>
              <span>Team Connections</span>
              <strong>{totalMembers}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pink-icon">
              <FiCpu />
            </div>

            <div>
              <span>AI Workspace</span>
              <strong className="stat-coming-soon">
                Coming Soon
              </strong>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="projects-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR WORK</span>
              <h2>My Projects</h2>
              <p>All your collaborative projects in one place.</p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={() => {
                setLoading(true);
                fetchProjects();
              }}
              disabled={loading}
              aria-label="Refresh projects"
              title="Refresh projects"
            >
              <FiRefreshCw
                className={loading ? "spin-icon" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="dashboard-message">
              <div className="loading-spinner" />
              <h3>Loading your projects...</h3>
              <p>Please wait a moment.</p>
            </div>
          ) : error ? (
            /* Error */
            <div className="dashboard-message error-message">
              <h3>Unable to load projects</h3>
              <p>{error}</p>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setLoading(true);
                  fetchProjects();
                }}
              >
                Try Again
              </button>
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <div className="empty-projects">
              <div className="empty-icon">
                <FiFolder />
              </div>

              <h3>Your workspace starts here</h3>

              <p>
                You haven't joined any projects yet. Create your
                first project and invite your teammates.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                <FiPlus />
                Create Your First Project
              </button>
            </div>
          ) : (
            /* Project Cards */
            <div className="projects-grid">
              {projects.map((project) => {
                const memberCount = Array.isArray(project.members)
                  ? project.members.length
                  : 0;

                return (
                  <article
                    className="project-card"
                    key={project._id}
                  >
                    <div className="project-card-top">
                      <div className="project-icon">
                        <FiCode />
                      </div>

                      <span className="project-status">
                        <span className="status-dot" />
                        Active
                      </span>
                    </div>

                    <h3>{project.name}</h3>

                    <p className="project-description">
                      {project.description ||
                        "No description added for this project yet."}
                    </p>

                    <div className="project-meta">
                      <div>
                        <FiUsers />
                        <span>
                          {memberCount}{" "}
                          {memberCount === 1 ? "member" : "members"}
                        </span>
                      </div>

                      <div>
                        <FiCalendar />
                        <span>
                          {getProjectDate(project.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="project-owner">
                      <span className="owner-label">
                        PROJECT OWNER
                      </span>

                      <strong>
                        {getOwnerName(project.owner)}
                      </strong>
                    </div>

                    {/* Project Notes Button */}
                    <div className="project-notes-action">
                      <button
                        type="button"
                        className="primary-button open-notes-button"
                        onClick={() =>
                          navigate(`/projects/${project._id}/notes`)
                        }
                      >
                        <FiBookOpen />
                        Open Project Notes
                        <FiArrowUpRight />
                      </button>
                    </div>

                    {/* Add Team Member */}
                    <div className="member-section">
                      <h4>
                        <FiUserPlus />
                        Invite a teammate
                      </h4>

                      <form
                        className="add-member-form"
                        onSubmit={(event) =>
                          handleAddMember(event, project._id)
                        }
                      >
                        <input
                          type="email"
                          placeholder="teammate@example.com"
                          aria-label={`Email to add to ${project.name}`}
                          value={memberEmails[project._id] || ""}
                          onChange={(event) =>
                            setMemberEmails((previous) => ({
                              ...previous,
                              [project._id]: event.target.value,
                            }))
                          }
                          required
                        />

                        <button
                          type="submit"
                          disabled={addingMemberId === project._id}
                        >
                          {addingMemberId === project._id
                            ? "Adding..."
                            : "Add Member"}
                        </button>
                      </form>

                      <p className="member-hint">
                        Your teammate must have a registered account.
                      </p>
                    </div>

                    <div className="project-card-footer">
                      <span>CollabSphere Workspace</span>
                      <FiArrowUpRight />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="upcoming-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR TOOLKIT</span>
              <h2>Collaboration Tools</h2>
              <p>Tools to help your team work better together.</p>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon purple-icon">
                <FiBookOpen />
              </div>

              <h3>Project Notes</h3>

              <p>
                Create, edit, and manage project notes and
                documentation in one place.
              </p>

              <span className="feature-badge">Available</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon cyan-icon">
                <FiUsers />
              </div>

              <h3>Team Workspace</h3>

              <p>
                Invite teammates and collaborate within shared
                projects.
              </p>

              <span className="feature-badge">In Progress</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon pink-icon">
                <FiCpu />
              </div>

              <h3>Gemini AI Assistant</h3>

              <p>
                Get assistance with code explanations, ideas,
                and project documentation.
              </p>

              <span className="feature-badge">Coming Soon</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>
            © {new Date().getFullYear()} CollabSphere. Built for
            collaboration.
          </p>

          <span>
            Made with <span className="footer-heart">♥</span> for
            builders
          </span>
        </footer>
      </main>

      {/* Create Project Modal */}
      {showForm && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !creating
            ) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">NEW WORKSPACE</span>

                <h2 id="create-project-title">
                  Create a project
                </h2>

                <p>Start something great with your team.</p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() => setShowForm(false)}
                disabled={creating}
                aria-label="Close form"
              >
                <FiX />
              </button>
            </div>

            <form
              className="create-project-form"
              onSubmit={handleCreateProject}
            >
              <label htmlFor="project-name">
                Project name
              </label>

              <input
                id="project-name"
                type="text"
                placeholder="e.g. Student Portal"
                value={projectName}
                onChange={(event) =>
                  setProjectName(event.target.value)
                }
                maxLength={100}
                required
              />

              <label htmlFor="project-description">
                Description <span>(optional)</span>
              </label>

              <textarea
                id="project-description"
                placeholder="What will your team build?"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                maxLength={1000}
                rows={4}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={creating}
                >
                  <FiPlus />
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;