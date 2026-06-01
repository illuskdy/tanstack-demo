import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import CodeBlock from '../components/CodeBlock';
import { api } from '../mockApi';

// ── Before: no caching ────────────────────────────────
function BeforeListDetail({ onFetch }) {
  const [selectedId, setSelectedId] = useState(null);
  const [users, setUsers]           = useState(null);
  const [user, setUser]             = useState(null);
  const [listLoading, setLL]        = useState(true);
  const [detailLoading, setDL]      = useState(false);

  // Fetch list on mount
  useState(() => {
    let c = false;
    setLL(true);
    onFetch('list');
    api.getUsers().then((d) => { if (!c) { setUsers(d); setLL(false); } });
    return () => { c = true; };
  });

  const selectUser = (id) => {
    setSelectedId(id);
    setUser(null);
    setDL(true);
    onFetch(`user/${id}`);
    api.getUserById(id).then((d) => { setUser(d); setDL(false); });
  };

  if (listLoading) return <div className="loading-state"><div className="spinner" /> Loading list…</div>;

  return (
    <div className="list-detail-split">
      <div>
        {users.map((u) => (
          <div
            key={u.id}
            className={`user-list-item${selectedId === u.id ? ' selected' : ''}`}
            onClick={() => selectUser(u.id)}
          >
            <span>{u.name}</span>
            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>→</span>
          </div>
        ))}
      </div>
      <div>
        {!selectedId && <div className="empty-state">← Select a user</div>}
        {detailLoading && <div className="loading-state"><div className="spinner" /> Loading detail…</div>}
        {user && !detailLoading && (
          <div className="detail-card">
            <h4>{user.name}</h4>
            <div className="detail-row"><span className="detail-label">Email:</span><span>{user.email}</span></div>
            <div className="detail-row"><span className="detail-label">Role:</span><span className={`role-badge role-${user.role}`}>{user.role}</span></div>
            <div className="detail-row"><span className="detail-label">Dept:</span><span>{user.dept}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── After: useQuery with caching ──────────────────────
function AfterUserDetail({ userId, onFetch }) {
  const { data: user, isPending } = useQuery({
    queryKey: ['a3-users', userId],
    queryFn:  async () => { onFetch(`user/${userId}`); return api.getUserById(userId); },
    enabled:  !!userId,
    staleTime: 1000 * 60,
  });

  if (!userId) return <div className="empty-state">← Select a user</div>;
  if (isPending) return <div className="loading-state"><div className="spinner" /> Loading detail…</div>;
  if (!user)     return null;
  return (
    <div className="detail-card">
      <h4>{user.name}</h4>
      <div className="detail-row"><span className="detail-label">Email:</span><span>{user.email}</span></div>
      <div className="detail-row"><span className="detail-label">Role:</span><span className={`role-badge role-${user.role}`}>{user.role}</span></div>
      <div className="detail-row"><span className="detail-label">Dept:</span><span>{user.dept}</span></div>
    </div>
  );
}

function AfterListDetail({ onFetch }) {
  const [selectedId, setSelectedId] = useState(null);
  const { data: users, isPending, isFetching, refetch } = useQuery({
    queryKey: ['a3-users'],
    queryFn:  async () => { onFetch('list'); return api.getUsers(); },
    staleTime: 1000 * 60,
  });

  if (isPending) return <div className="loading-state"><div className="spinner" /> Loading list…</div>;
  return (
    <>
      <div className="demo-controls" style={{ marginBottom: '0.5rem' }}>
        <button className="btn btn-outline btn-sm" onClick={() => refetch()}>
          ↺ Manual Refresh
        </button>
        {isFetching && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Fetching…
          </span>
        )}
      </div>
      <div className="list-detail-split">
        <div>
          {users.map((u) => (
            <div
              key={u.id}
              className={`user-list-item${selectedId === u.id ? ' selected' : ''}`}
              onClick={() => setSelectedId(u.id)}
            >
              <span>{u.name}</span>
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>→</span>
            </div>
          ))}
        </div>
        <div>
          <AfterUserDetail userId={selectedId} onFetch={onFetch} />
        </div>
      </div>
    </>
  );
}

export default function TopicA3Page() {
  const fetchLog = useRef([]);
  const [log, setLog] = useState([]);
  const afterFetchLog = useRef([]);
  const [afterLog, setAfterLog] = useState([]);

  const addLog = (logRef, setLogFn, label) => {
    const entry = `${new Date().toLocaleTimeString()} → fetched ${label}`;
    logRef.current = [entry, ...logRef.current].slice(0, 8);
    setLogFn([...logRef.current]);
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="badge badge-group-a">Group A · Topic 3</span>
        <h1>Query Keys, Caching & Refetching</h1>
        <p>
          Understanding <code>queryKey</code>, <code>staleTime</code>, and <code>gcTime</code> is what
          separates competent TanStack Query usage from expert usage. Click user names to see caching in action.
        </p>
      </div>

      {/* Plain explanation */}
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '0.875rem 1.1rem', margin: '1.25rem 0', fontSize: '0.85rem' }}>
        <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.35rem' }}>💡 What queryKey, staleTime, and gcTime mean</strong>
        <p style={{ color: '#78350f', lineHeight: 1.7 }}>
          Every piece of data TanStack Query saves gets a label called a <code>queryKey</code>. If two components use the same label, they share the same saved data — no duplicate requests.
          <strong> <code>staleTime</code></strong> is how long that saved data is trusted as up-to-date. After it passes, the next component that reads the data will trigger a new fetch.
          <strong> <code>gcTime</code></strong> is how long the data stays in memory when nothing is using it — after that it is deleted.
          In the demo below: click a user → fetched. Click a different user → fetched. Click the first user again → <strong>instant, no new request</strong>, because the data was already saved under that user's <code>queryKey</code>.
        </p>
      </div>

      {/* Query Key explanation */}
      <h2 className="section-title">queryKey — the cache address</h2>
      <CodeBlock code={`// Always an array. Must include every variable the queryFn depends on.

useQuery({ queryKey: ['users'],           queryFn: fetchUsers });
useQuery({ queryKey: ['users', userId],   queryFn: () => fetchUser(userId) });
useQuery({ queryKey: ['users', 'list', { role: 'Admin' }], queryFn: ... });

// All users              → ['users']
// User #1                → ['users', 1]
// Admin user list        → ['users', 'list', { role: 'Admin' }]

// Rule: if the queryFn uses it, the queryKey must contain it.
// Violation = stale data because TQ doesn't know to re-run the query.`} />

      {/* staleTime vs gcTime */}
      <h2 className="section-title">staleTime vs gcTime</h2>
      <div className="comparison-grid">
        <div className="panel" style={{ borderColor: '#93c5fd' }}>
          <div className="panel-header" style={{ background: '#eff6ff' }}>
            <h3 style={{ color: '#1e40af' }}>⏱ staleTime</h3>
          </div>
          <div className="panel-section">
            <p style={{ fontSize: '0.875rem' }}>
              How long data is considered <strong>fresh</strong>. During this window,
              no automatic refetch happens — the cache is served as-is.
            </p>
            <br />
            <CodeBlock code={`// default: 0ms (immediately stale)
// Means: refetch on every window focus,
// mount, or reconnect.

useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 1000 * 60, // 1 minute fresh
});
// Data fetched once → served for 60s
// After 60s → next trigger causes refetch`} />
          </div>
        </div>
        <div className="panel" style={{ borderColor: '#c4b5fd' }}>
          <div className="panel-header" style={{ background: '#f5f3ff' }}>
            <h3 style={{ color: '#6d28d9' }}>🗑 gcTime (garbage collect)</h3>
          </div>
          <div className="panel-section">
            <p style={{ fontSize: '0.875rem' }}>
              How long <strong>inactive</strong> data stays in memory before being deleted.
              Inactive = no component is currently subscribed.
            </p>
            <br />
            <CodeBlock code={`// default: 5 minutes (300_000ms)
// After all components unsubscribe,
// data stays in memory for this long.
// Navigate away → gcTime timer starts.
// Navigate back in time → data is there.
// Navigate back after gcTime → refetch.

useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  gcTime: 1000 * 60 * 10, // 10 min
});`} />
          </div>
        </div>
      </div>

      <div className="insight">
        <strong>One-line summary:</strong> <code>staleTime</code> controls when data is considered outdated.
        <code> gcTime</code> controls when the data is thrown out of memory entirely.
        A query can be <em>stale but still in cache</em> — it serves stale data while refetching in the background.
      </div>

      {/* List + Detail Demo */}
      <h2 className="section-title">Live Demo — List + Detail Navigation</h2>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Click a user in the list to load their detail. Click back to the list and re-select the same user.
        Watch the request log below each panel.
      </p>

      <div className="comparison-grid">
        <div className="panel before-panel">
          <div className="panel-header">
            <span className="before-badge">Before</span>
            <h3>Re-fetches every click</h3>
          </div>

          {/* Before explanation */}
          <div className="panel-section" style={{ background: '#fff8f8' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              Without query keys, there's no concept of "I already have this user's data".
              Every time you select Alice, the app makes a fresh network request.
              <strong> Select Alice, select Bob, select Alice again — that's 3 requests</strong>, even though Alice's data didn't change.
              Each unique user selection hits the server from scratch.
            </p>
          </div>

          <div className="demo-area">
            <BeforeListDetail onFetch={(label) => addLog(fetchLog, setLog, label)} />
            <div style={{ marginTop: '0.75rem' }}>
              <div className="panel-label">Request Log</div>
              <div style={{ background: '#1e1e2e', borderRadius: 6, padding: '0.5rem 0.75rem', fontFamily: 'Fira Code, monospace', fontSize: '0.72rem', color: '#a6e3a1', maxHeight: 120, overflowY: 'auto' }}>
                {log.length === 0 && <div style={{ color: '#6b7280' }}>No requests yet…</div>}
                {log.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
          </div>
        </div>

        <div className="panel after-panel">
          <div className="panel-header">
            <span className="after-badge">After</span>
            <h3>Cached per queryKey — instant on revisit</h3>
          </div>

          {/* After explanation */}
          <div className="panel-section" style={{ background: '#f0fdf4' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              With <code>queryKey: ['users', userId]</code>, TanStack Query caches each user separately.
              <strong> Select Alice → fetched once, remembered. Select Bob → fetched. Select Alice again → instant, no log entry.</strong>
              The cache knows "I already have Alice" and serves her immediately.
              Use <strong>Manual Refresh</strong> to force the list to re-fetch from the server.
            </p>
          </div>

          <div className="demo-area">
            <AfterListDetail onFetch={(label) => addLog(afterFetchLog, setAfterLog, label)} />
            <div style={{ marginTop: '0.75rem' }}>
              <div className="panel-label">Request Log</div>
              <div style={{ background: '#1e1e2e', borderRadius: 6, padding: '0.5rem 0.75rem', fontFamily: 'Fira Code, monospace', fontSize: '0.72rem', color: '#a6e3a1', maxHeight: 120, overflowY: 'auto' }}>
                {afterLog.length === 0 && <div style={{ color: '#6b7280' }}>No requests yet…</div>}
                {afterLog.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dependent queries */}
      <h2 className="section-title">Dependent Queries — enabled option</h2>
      <CodeBlock code={`// Only run this query when userId is truthy
const { data: user } = useQuery({
  queryKey: ['users', userId],
  queryFn:  () => fetchUserById(userId),
  enabled:  !!userId,   // ← gate the query
});

// Refetch triggers (automatic):
// - Component mounts                 (refetchOnMount)
// - Browser window refocuses         (refetchOnWindowFocus)
// - Network reconnects               (refetchOnReconnect)
// - Manual: queryClient.invalidateQueries(...)
// - Polling: refetchInterval: 5000 (every 5s)

// Disable noisy ones globally:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});`} />

      <div className="pitfalls-box">
        <h3>The most common mistake</h3>
        <ul>
          <li>Using a variable inside <code>queryFn</code> but forgetting to add it to <code>queryKey</code></li>
          <li>Example: <code>queryKey: ['users']</code> but <code>queryFn: {'() => fetchUser(userId)'}</code></li>
          <li>Result: stale data when <code>userId</code> changes because TQ doesn't know to refetch</li>
          <li>Fix: <code>queryKey: ['users', userId]</code></li>
        </ul>
      </div>
    </div>
  );
}
