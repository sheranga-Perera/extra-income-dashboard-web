import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteSetting,
  listSettings,
  saveSetting,
  type DashboardSettingResponse
} from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function DashboardConfig() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<DashboardSettingResponse[]>([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadSettings = () => {
    if (!isAdmin) {
      setSettings([]);
      return;
    }
    setLoading(true);
    setError(null);
    listSettings()
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load settings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, [isAdmin]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!key.trim()) {
      setError('Setting key is required.');
      return;
    }
    try {
      await saveSetting(key.trim(), {
        value: value.trim() || undefined,
        description: description.trim() || undefined
      });
      setKey('');
      setValue('');
      setDescription('');
      setSuccess('Setting saved.');
      loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setting.');
    }
  };

  const handleEdit = (setting: DashboardSettingResponse) => {
    setKey(setting.key);
    setValue(setting.value ?? '');
    setDescription(setting.description ?? '');
  };

  const handleDelete = async (settingKey: string) => {
    setError(null);
    setSuccess(null);
    try {
      await deleteSetting(settingKey);
      setSuccess('Setting deleted.');
      loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete setting.');
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="panel">
          <h2>Dashboard Configuration</h2>
          <p>Login is required to manage dashboard settings.</p>
          <Link className="button" to="/login">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="jobs-header">
        <div>
          <h2>Dashboard Configuration</h2>
          <p>Manage operational settings used by the dashboard.</p>
        </div>
        <div className="jobs-summary">{loading ? 'Loading...' : `${settings.length} settings`}</div>
      </div>

      {error && <div className="notice notice--error">{error}</div>}
      {success && <div className="notice">{success}</div>}

      <form className="panel jobs-search" onSubmit={handleSave}>
        <div className="jobs-search__fields">
          <div className="field">
            <label htmlFor="settingKey">Key</label>
            <input
              id="settingKey"
              placeholder="support.whatsapp"
              value={key}
              onChange={(event) => setKey(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="settingValue">Value</label>
            <input
              id="settingValue"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="settingDescription">Description</label>
            <input
              id="settingDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <div className="jobs-search__actions">
          <button className="button" type="submit">Save Setting</button>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => {
              setKey('');
              setValue('');
              setDescription('');
            }}
          >
            Clear
          </button>
        </div>
      </form>

      <div className="admin-grid">
        {settings.map((setting) => (
          <article key={setting.key} className="job-card admin-card">
            <div className="job-card__header">
              <div>
                <h3>{setting.key}</h3>
                <p className="job-company">{setting.description || 'No description'}</p>
              </div>
              <span className="job-date">{new Date(setting.updatedAt).toLocaleString('en-LK')}</span>
            </div>
            <p className="job-description">{setting.value || 'No value set'}</p>
            <div className="jobs-search__actions">
              <button className="button button--ghost" type="button" onClick={() => handleEdit(setting)}>
                Edit
              </button>
              <button className="button button--ghost" type="button" onClick={() => handleDelete(setting.key)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
