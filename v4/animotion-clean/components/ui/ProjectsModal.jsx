'use client';
import { useState, useEffect, useCallback } from 'react';
import Spinner from './Spinner';
import { getProjects, deleteProject } from '../../lib/db';
import { isDbConfigured } from '../../lib/db';

export default function ProjectsModal({ userId, onLoad, onClose }) {
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [deleting,  setDeleting]  = useState(null);
  const [error,     setError]     = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    const list = await getProjects(userId);
    setProjects(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    setDeleting(projectId);
    const ok = await deleteProject(userId, projectId);
    if (ok) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } else {
      setError('Failed to delete project. Please try again.');
    }
    setDeleting(null);
  };

  const fmt = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch { return ''; }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-strong w-full max-w-[520px] max-h-[80vh] flex flex-col animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-black text-lg">📁 My Projects</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Open or manage your saved animations</p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {!isDbConfigured() && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
              <p className="text-xs font-black text-amber-700 dark:text-amber-400 mb-0.5">⚠️ Database not configured</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 font-semibold">
                Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable cloud project saving.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-10">
              <Spinner size={8} />
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎬</div>
              <p className="font-black text-base text-gray-600 dark:text-gray-400 mb-1">No saved projects yet</p>
              <p className="text-xs text-gray-400 font-semibold">
                Click "Save Project" in the editor to save your first animation.
              </p>
            </div>
          )}

          {!loading && projects.map((project) => (
            <div key={project.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-blue-50/40 dark:bg-gray-800/40 hover:border-primary transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-xl flex-shrink-0">
                🎨
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[13px] truncate">{project.name}</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  {project.fps} fps · Updated {fmt(project.updated_at)}
                </p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onLoad(project.id)}
                  className="btn btn-primary text-xs py-1.5 px-3"
                >
                  Open
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={deleting === project.id}
                  className="btn btn-danger text-xs py-1.5 px-3"
                >
                  {deleting === project.id
                    ? <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                    : '🗑'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button onClick={onClose} className="btn btn-secondary text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
