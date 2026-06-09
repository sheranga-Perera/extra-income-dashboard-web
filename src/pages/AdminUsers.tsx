import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createAdmin, deleteAdmin, listAdmins, type AdminUserResponse } from '../api/admins';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUserResponse[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadAdmins = () => {
    if (!isAdmin) {
      setAdmins([]);
      return;
    }
    setLoading(true);
    setError(null);
    listAdmins()
      .then(setAdmins)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load admin users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdmins();
  }, [isAdmin]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      await createAdmin({ username: username.trim(), password });
      setUsername('');
      setPassword('');
      setSuccess('Admin user created.');
      loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      await deleteAdmin(id);
      setSuccess('Admin user deleted.');
      loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin user.');
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="panel">
          <h2>Admin Users</h2>
          <p>Login is required to manage dashboard admin users.</p>
          <Link className="button" to="/login">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="jobs-header">
        <div>
          <h2>Admin Users</h2>
          <p>Create and remove dashboard administrators.</p>
        </div>
        <div className="jobs-summary">{loading ? 'Loading...' : `${admins.length} admins`}</div>
      </div>

      {error && <div className="notice notice--error">{error}</div>}
      {success && <div className="notice">{success}</div>}

      <form className="panel jobs-search" onSubmit={handleCreate}>
        <div className="jobs-search__fields">
          <div className="field">
            <label htmlFor="adminUsername">Username</label>
            <input
              id="adminUsername"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="adminPassword">Password</label>
            <input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>
        <div className="jobs-search__actions">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </form>

      <div className="admin-grid">
        {admins.map((admin) => (
          <article key={admin.id} className="job-card admin-card">
            <div className="job-card__header">
              <div>
                <h3>{admin.username}</h3>
                <p className="job-company">{admin.role}</p>
              </div>
              <button className="button button--ghost" type="button" onClick={() => handleDelete(admin.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
