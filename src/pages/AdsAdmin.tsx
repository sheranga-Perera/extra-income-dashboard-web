import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { approveAdRequest, listAdRequests, rejectAdRequest, type AdRequestResponse } from '../api/ads';
import { useAuth } from '../context/AuthContext';

interface ApprovalDraft {
  startDate: string;
  endDate: string;
}

const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const;

export default function AdsAdmin() {
  const { user } = useAuth();
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('PENDING');
  const [requests, setRequests] = useState<AdRequestResponse[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ApprovalDraft>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadRequests = (nextStatus: typeof statusOptions[number]) => {
    if (!isAdmin) {
      return;
    }
    setLoading(true);
    setError(null);
    listAdRequests(nextStatus === 'ALL' ? undefined : nextStatus)
      .then((data) => {
        setRequests(data);
        const nextDrafts: Record<string, ApprovalDraft> = {};
        data.forEach((item) => {
          nextDrafts[item.id] = {
            startDate: item.startDate ?? '',
            endDate: item.endDate ?? ''
          };
        });
        setDrafts(nextDrafts);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAdmin) {
      setRequests([]);
      return;
    }
    loadRequests(status);
  }, [isAdmin, status]);

  const updateDraft = (id: string, field: keyof ApprovalDraft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { startDate: '', endDate: '' }),
        [field]: value
      }
    }));
  };

  const handleApprove = async (id: string) => {
    setActionError(null);
    const draft = drafts[id];
    try {
      await approveAdRequest(id, {
        startDate: draft?.startDate || undefined,
        endDate: draft?.endDate || undefined
      });
      loadRequests(status);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve request.');
    }
  };

  const handleReject = async (id: string) => {
    setActionError(null);
    try {
      await rejectAdRequest(id);
      loadRequests(status);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject request.');
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="panel">
          <h2>Ads Admin</h2>
          <p>Login is required to manage ad requests.</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link className="button" to="/login">Login</Link>
            <Link className="button button--ghost" to="/">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="panel">
          <h2>Ads Admin</h2>
          <p>Admin access is required.</p>
          <Link className="button button--ghost" to="/">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="jobs-header">
        <div>
          <h2>Ad Requests</h2>
          <p>Approve or reject paid advertisements before they appear to job seekers.</p>
        </div>
        <div className="jobs-summary">
          {loading ? 'Loading requests...' : `${requests.length} requests`}
        </div>
      </div>

      <div className="panel admin-toolbar">
        <div className="field">
          <label htmlFor="adStatus">Status filter</label>
          <select
            id="adStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof statusOptions[number])}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="notice notice--error">{error}</div>}
      {actionError && <div className="notice notice--error">{actionError}</div>}
      {!loading && requests.length === 0 && (
        <div className="panel jobs-empty">
          <h3>No requests found</h3>
          <p>Try another status filter.</p>
        </div>
      )}

      <div className="admin-grid">
        {requests.map((request) => (
          <article key={request.id} className="job-card admin-card">
            <div className="job-card__header">
              <div>
                <h3>{request.adTitle}</h3>
                <p className="job-company">{request.companyName}</p>
              </div>
              <span className="ad-badge">{request.status}</span>
            </div>
            <p className="job-description">{request.adDescription}</p>
            <div className="job-meta">
              <div>
                <span className="job-meta__label">Contact</span>
                <span>{request.contactPerson} • {request.contactEmail}</span>
              </div>
              <div>
                <span className="job-meta__label">Visibility</span>
                <span>
                  {request.viewsPerDay ? `${request.viewsPerDay} views/day` : 'n/a'}
                  {request.minutesPerDay ? ` • ${request.minutesPerDay} mins/day` : ''}
                </span>
              </div>
              <div>
                <span className="job-meta__label">Type</span>
                <span>{request.adType}</span>
              </div>
            </div>
            <div className="job-tags">
              {request.adGoal && <span className="job-tag">Goal: {request.adGoal}</span>}
              {request.mediaUrl && <span className="job-tag">Media URL provided</span>}
              {request.mediaContent && <span className="job-tag">Media file uploaded</span>}
            </div>
            <div className="admin-actions">
              <div className="field">
                <label>Start date</label>
                <input
                  type="date"
                  value={drafts[request.id]?.startDate ?? ''}
                  onChange={(event) => updateDraft(request.id, 'startDate', event.target.value)}
                />
              </div>
              <div className="field">
                <label>End date</label>
                <input
                  type="date"
                  value={drafts[request.id]?.endDate ?? ''}
                  onChange={(event) => updateDraft(request.id, 'endDate', event.target.value)}
                />
              </div>
              <div className="admin-actions__buttons">
                <button className="button" type="button" onClick={() => handleApprove(request.id)}>
                  Approve
                </button>
                <button className="button button--ghost" type="button" onClick={() => handleReject(request.id)}>
                  Reject
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
