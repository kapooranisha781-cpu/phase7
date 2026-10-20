
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookOpen,
  FiEdit2,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../api/axios.js";
import "../styles/ProjectNotes.css";

export default function ProjectNotes() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadNotes = useCallback(async () => {
    if (!projectId) {
      setNotes([]);
      setErrorMessage("Project ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get(`/notes/${projectId}`);
      const data = response.data;

      const fetchedNotes = Array.isArray(data)
        ? data
        : Array.isArray(data?.notes)
          ? data.notes
          : null;

      if (!fetchedNotes) {
        throw new Error("The server returned an invalid notes response.");
      }

      setNotes(fetchedNotes);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error("Your session has expired. Please log in again.");
        navigate("/login", { replace: true });
        return;
      }

      const message =
        error.response?.data?.message ||
        "Unable to load project notes. Please try again.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingId(null);
  }

  function handleEdit(note) {
    if (!note?._id) {
      toast.error("This note cannot be edited.");
      return;
    }

    setEditingId(note._id);
    setTitle(note.title || "");
    setContent(note.content || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast.error("Please enter both a title and note content.");
      return;
    }

    if (trimmedTitle.length > 150) {
      toast.error("The note title cannot exceed 150 characters.");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/notes/${projectId}/${editingId}`, {
          title: trimmedTitle,
          content: trimmedContent,
        });

        toast.success("Note updated successfully!");
      } else {
        await api.post(`/notes/${projectId}`, {
          title: trimmedTitle,
          content: trimmedContent,
        });

        toast.success("Note created successfully!");
      }

      resetForm();
      await loadNotes();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Unable to save the note. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId) {
    if (!noteId || deletingId || saving) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this note? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(noteId);

      await api.delete(`/notes/${projectId}/${noteId}`);

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note._id !== noteId)
      );

      if (editingId === noteId) {
        resetForm();
      }

      toast.success("Note deleted successfully!");
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Unable to delete the note. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date) {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="notes-page">
      <header className="notes-header">
        <button
          type="button"
          className="notes-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        <div className="notes-brand">
          <span className="notes-brand-icon">
            <FiBookOpen />
          </span>

          <span>
            Collab<span>Sphere</span>
          </span>
        </div>
      </header>

      <section className="notes-content">
        <div className="notes-heading">
          <div>
            <p className="notes-eyebrow">PROJECT WORKSPACE</p>

            <h1>
              Project Notes<span>.</span>
            </h1>

            <p className="notes-description">
              Keep your team's ideas, meeting notes, and project
              details organized in one place.
            </p>
          </div>

          <div className="notes-count">
            <FiBookOpen />
            <span>
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </span>
          </div>
        </div>

        <section className="note-editor">
          <div className="note-editor-heading">
            <div className="note-editor-icon">
              {editingId ? <FiEdit2 /> : <FiPlus />}
            </div>

            <div>
              <h2>
                {editingId ? "Edit your note" : "Create a new note"}
              </h2>

              <p>
                {editingId
                  ? "Update your saved information."
                  : "Capture an idea before you forget it."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="note-title">Note title</label>

            <input
              id="note-title"
              type="text"
              placeholder="e.g. Team meeting notes"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              required
              disabled={saving}
            />

            <label htmlFor="note-content">Note content</label>

            <textarea
              id="note-content"
              placeholder="Write your ideas, tasks, decisions, or reminders..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              required
              disabled={saving}
            />

            <div className="note-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="note-cancel-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  <FiX />
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="note-save-button"
                disabled={saving || Boolean(deletingId)}
              >
                {saving ? (
                  <FiRefreshCw className="notes-spin-icon" />
                ) : editingId ? (
                  <FiSave />
                ) : (
                  <FiPlus />
                )}

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Note"
                    : "Save Note"}
              </button>
            </div>
          </form>
        </section>

        <section className="saved-notes-section">
          <div className="saved-notes-heading">
            <h2>Saved Notes</h2>
            <span>{notes.length}</span>
          </div>

          {loading ? (
            <div className="notes-message" role="status">
              Loading your notes...
            </div>
          ) : errorMessage ? (
            <div className="notes-message" role="alert">
              <h3>Unable to load notes</h3>
              <p>{errorMessage}</p>

              <button
                type="button"
                className="note-save-button"
                onClick={loadNotes}
              >
                <FiRefreshCw />
                Try Again
              </button>
            </div>
          ) : notes.length === 0 ? (
            <div className="notes-empty-state">
              <div className="notes-empty-icon">
                <FiBookOpen />
              </div>

              <h3>No notes yet</h3>

              <p>
                Create your first project note using the form above.
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <article
                  className="saved-note-card"
                  key={note._id}
                >
                  <div className="saved-note-top">
                    <span className="saved-note-icon">
                      <FiBookOpen />
                    </span>

                    <div className="saved-note-actions">
                      <button
                        type="button"
                        aria-label={`Edit ${note.title}`}
                        title="Edit note"
                        onClick={() => handleEdit(note)}
                        disabled={saving || Boolean(deletingId)}
                      >
                        <FiEdit2 />
                      </button>

                      <button
                        type="button"
                        className="delete-note-button"
                        aria-label={`Delete ${note.title}`}
                        title={
                          deletingId === note._id
                            ? "Deleting note"
                            : "Delete note"
                        }
                        onClick={() => handleDelete(note._id)}
                        disabled={
                          Boolean(deletingId) || saving
                        }
                      >
                        {deletingId === note._id ? (
                          <FiRefreshCw className="notes-spin-icon" />
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3>{note.title}</h3>

                  <p className="saved-note-content">
                    {note.content}
                  </p>

                  <div className="saved-note-footer">
                    <span>
                      {typeof note.author === "object"
                        ? note.author?.name || "Project member"
                        : "Project member"}
                    </span>

                    <span>
                      {formatDate(note.updatedAt || note.createdAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
