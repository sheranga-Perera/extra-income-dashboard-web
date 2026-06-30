import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  approveAdRequest,
  discontinueAdRequest,
  fetchAdSummary,
  listAdRequests,
  rejectAdRequest,
  type AdRequestResponse,
  type AdSummaryResponse
} from '../api/ads';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'DISCONTINUED', 'ALL'] as const;

export default function AdsAdmin() {
  const { user } = useAuth();
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('PENDING');
  const [requests, setRequests] = useState<AdRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdSummaryResponse | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadRequests = (nextStatus: typeof statusOptions[number]) => {
    if (!isAdmin) {
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      listAdRequests(nextStatus === 'ALL' ? undefined : nextStatus),
      fetchAdSummary()
    ])
      .then(([data, nextSummary]) => {
        setRequests(data);
        setSummary(nextSummary);
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

  const handleApprove = async (id: string) => {
    setActionError(null);
    try {
      await approveAdRequest(id);
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

  const handleDiscontinue = async (id: string) => {
    setActionError(null);
    try {
      await discontinueAdRequest(id);
      loadRequests(status);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to discontinue advertisement.');
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

      <div className="dashboard-cards">
        <div className="metric-card">
          <span className="metric-card__label">Pending</span>
          <strong>{summary?.pending ?? 0}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Approved</span>
          <strong>{summary?.approved ?? 0}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Active now</span>
          <strong>{summary?.active ?? 0}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Rejected</span>
          <strong>{summary?.rejected ?? 0}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-card__label">Discontinued</span>
          <strong>{summary?.discontinued ?? 0}</strong>
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
              {request.status === 'PENDING' && (
                <>
                  <div className="field">
                    <label>Start date</label>
                    <div className="readonly-field">{request.startDate ?? 'Not set'}</div>
                  </div>
                  <div className="field">
                    <label>End date</label>
                    <div className="readonly-field">{request.endDate ?? 'Not set'}</div>
                  </div>
                  <div className="admin-actions__buttons">
                    <button className="button" type="button" onClick={() => handleApprove(request.id)}>
                      Approve
                    </button>
                    <button className="button button--ghost" type="button" onClick={() => handleReject(request.id)}>
                      Reject
                    </button>
                  </div>
                </>
              )}
              {request.status === 'APPROVED' && (
                <div className="admin-actions__buttons">
                  <button className="button button--danger" type="button" onClick={() => handleDiscontinue(request.id)}>
                    Discontinue advertisement
                  </button>
                </div>
              )}
              {(request.status === 'REJECTED' || request.status === 'DISCONTINUED') && (
                <div className="admin-actions__note">
                  No actions available for {request.status.toLowerCase()} advertisements.
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
