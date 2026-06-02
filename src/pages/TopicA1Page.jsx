import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import CodeBlock from '../components/CodeBlock';
import { api } from '../mockApi';

// ── Before: manual fetch with no caching ─────────────────
function BrokenFetchDemo() {
  const [tab, setTab] = useState('list');
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const rcRef = useRef(0);

  useEffect(() => {
    if (tab !== 'list') return;
    setLoading(true);
    rcRef.current++;
    setRequestCount(rcRef.current);
    api.getUsers().then((d) => { setUsers(d); setLoading(false); });
  }, [tab]);

  return (
    <div>
      <div className="demo-stat-row">
        <div className="stat-chip highlight">
          <span className="stat-label">Server requests:</span>
          <span className="stat-val">{requestCount}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">Current view:</span>
          <span className="stat-val">{tab}</span>
        </div>
      </div>
      <div className="demo-controls">
        <button className="btn btn-outline btn-sm" onClick={() => setTab('list')}>Go to List</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setTab('other')}>Navigate Away</button>
        <button className="btn btn-ghost btn-sm" onClick={() => { rcRef.current = 0; setRequestCount(0); setUsers(null); setTab('other'); }}>
          Reset
        </button>
      </div>
      {tab === 'other' && (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>📋 Dashboard (other page)</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Revenue', 'Orders', 'Users'].map((k) => (
              <div key={k} style={{ flex: 1, background: 'white', borderRadius: 6, padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ fontWeight: 600, color: '#64748b' }}>{k}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#cbd5e1' }}>—</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#94a3b8' }}>← click "Go to List" to navigate back</div>
        </div>
      )}
      {tab === 'list' && loading && (
        <div className="loading-state"><div className="spinner" /> Fetching users…</div>
      )}
      {tab === 'list' && !loading && users && (
        <table className="user-table">
          <thead><tr><th>Name</th><th>Dept</th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id}><td>{u.name}</td><td>{u.dept}</td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

// ── After: TanStack Query inner component ─────────────────
function TanStackFetchInner({ onFetch }) {
  const wasFetchingRef = useRef(false);
  const [cacheHit, setCacheHit] = useState(false);

  const { data: users, isPending, refetch, isFetching } = useQuery({
    queryKey: ['a1-after-users'],
    queryFn: () => api.getUsers(),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (isFetching && !wasFetchingRef.current) onFetch();
    wasFetchingRef.current = isFetching;
  }, [isFetching, onFetch]);

  // Detect cache hit: component mounted with data already present (no fetch needed)
  useEffect(() => {
    if (!isPending && !isFetching) {
      setCacheHit(true);
      const t = setTimeout(() => setCacheHit(false), 2000);
      return () => clearTimeout(t);
    }
  }, []); // intentionally runs only on mount

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
        {cacheHit && (
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
            ⚡ From cache — instant!
          </span>
        )}
      </div>
      {isPending ? (
        <div className="loading-state"><div className="spinner" /> Loading…</div>
      ) : (
        <table className="user-table">
          <thead><tr><th>Name</th><th>Dept</th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id}><td>{u.name}</td><td>{u.dept}</td></tr>
          ))}</tbody>
        </table>
      )}
    </>
  );
}

// ── After: TanStack demo wrapper (mirrors BrokenFetchDemo) ─
function TanStackFetchDemo() {
  const [tab, setTab] = useState('list');
  const [requestCount, setRequestCount] = useState(0);
  const rcRef = useRef(0);

  return (
    <div>
      <div className="demo-stat-row">
        <div className="stat-chip highlight">
          <span className="stat-label">Server requests:</span>
          <span className="stat-val">{requestCount}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-label">Current view:</span>
          <span className="stat-val">{tab}</span>
        </div>
      </div>
      <div className="demo-controls">
        <button className="btn btn-outline btn-sm" onClick={() => setTab('list')}>Go to List</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setTab('other')}>Navigate Away</button>
        <button className="btn btn-ghost btn-sm" onClick={() => { rcRef.current = 0; setRequestCount(0); setTab('other'); }}>
          Reset
        </button>
      </div>
      {tab === 'other' && (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>📋 Dashboard (other page)</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Revenue', 'Orders', 'Users'].map((k) => (
              <div key={k} style={{ flex: 1, background: 'white', borderRadius: 6, padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ fontWeight: 600, color: '#64748b' }}>{k}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#cbd5e1' }}>—</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#94a3b8' }}>← click "Go to List" to navigate back</div>
        </div>
      )}
      {tab === 'list' && (
        <TanStackFetchInner
          onFetch={() => { rcRef.current++; setRequestCount(rcRef.current); }}
        />
      )}
    </div>
  );
}

export default function TopicA1Page() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="badge badge-group-a">Group A · Topic 1</span>
        <h1>Why TanStack Query? Server State vs Client State</h1>
        <p>
          Before writing a single line of TanStack Query, understand the problem it solves.
          The core distinction is <strong>server state</strong> vs <strong>client state</strong>.
        </p>
      </div>

      {/* Server vs Client State */}
      <h2 className="section-title">The Core Distinction</h2>

      <div className="state-compare">
        <div className="state-box state-server">
          <h4>🌐 Server State</h4>
          <ul>
            <li>Owned and persisted by the backend</li>
            <li>Can go stale at any time (other users change it)</li>
            <li>Fetched asynchronously — may fail</li>
            <li>Needs loading and error handling</li>
            <li>Examples: user list, product catalog, messages</li>
          </ul>
        </div>
        <div className="state-box state-client">
          <h4>💻 Client State</h4>
          <ul>
            <li>Owned by the browser / your component</li>
            <li>Always synchronous — never stale</li>
            <li>No network involved</li>
            <li>Examples: modal open/closed, selected tab, form input values</li>
          </ul>
        </div>
      </div>

      <div className="insight">
        <strong>TanStack Query is a server-state library, not a global state library.</strong>{' '}
        Don't use it for modal state or form inputs. Use it for anything that comes from (or goes to) a server.
      </div>

      {/* Plain explanation */}
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '0.875rem 1.1rem', margin: '1.25rem 0', fontSize: '0.85rem' }}>
        <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.35rem' }}>💡 What this means in plain terms</strong>
        <p style={{ color: '#78350f', lineHeight: 1.7 }}>
          In plain React, every time a component loads it sends a new request to the server — even if you loaded the same data 2 seconds ago.
          <strong> TanStack Query saves the result the first time and reuses it.</strong> This saved copy is called the <strong>cache</strong>.
          Click "Go to List" several times in the Before panel — the request counter climbs every time.
          In the After panel the counter stays at 1 after the first load because the cache is serving the data.
          The <strong>"Manual Refresh"</strong> button forces a new server request even when the cache is still valid.
        </p>
      </div>

      {/* Problems with manual fetching */}
      <h2 className="section-title">Problems with Manual Fetching</h2>

      <div className="comparison-grid">
        {/* Before panel */}
        <div className="panel before-panel">
          <div className="panel-header">
            <span className="before-badge">Before</span>
            <h3>Manual useEffect fetching — spot the problems</h3>
          </div>

          {/* Before explanation */}
          <div className="panel-section" style={{ background: '#fff8f8' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              Without a library, every React component fetches data completely on its own.
              It has no memory between visits, no sharing with other components, and no built-in retry.
              <strong> Every navigation triggers a fresh fetch — even for data you just loaded 2 seconds ago.</strong>
              Click "Go to List" multiple times and watch the request counter climb.
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`// Every component manages its own:
// - loading flag
// - error flag
// - data
// - cleanup (race condition guard)

function UsersList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);  // 🔴 reset every mount
    fetch('/api/users')
      .then(r => r.json())
      .then(d => {
        if (!cancelled) setData(d);
      })
      .catch(e => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);
  // ...
}

// Header.jsx — same fetch, again
function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/users/me')     // 🔴 duplicate
      .then(r => r.json())
      .then(setUser);
  }, []);
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live: navigate away and back — spinner every time</div>
            <BrokenFetchDemo />
          </div>
          <div className="panel-section">
            <div className="panel-label">Problems</div>
            <ul className="problem-list">
              <li>Spinner shows on <em>every</em> navigation — no caching</li>
              <li>Identical endpoints called multiple times across components</li>
              <li>15+ lines of boilerplate per fetch</li>
              <li>No automatic retry on failure</li>
              <li>No background refresh when user returns to tab</li>
              <li>No deduplication — 3 components can fire 3 identical requests simultaneously</li>
            </ul>
          </div>
        </div>

        {/* After panel */}
        <div className="panel after-panel">
          <div className="panel-header">
            <span className="after-badge">After</span>
            <h3>TanStack Query — how it solves each problem</h3>
          </div>

          {/* After explanation */}
          <div className="panel-section" style={{ background: '#f0fdf4' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              TanStack Query acts as a <strong>shared smart cache</strong> for your whole app.
              Fetch once, reuse everywhere — any component asking for the same <code>queryKey</code> gets the cached result instantly.
              Navigate away and back: <strong>no new request, instant data</strong>.
              Click "Manual Refresh" to force a fresh fetch (overrides the cache) — watch the counter go up by 1, not every navigation.
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`// Set up once at the app root:
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

// Now any component can do this:
function UsersList() {
  const { data, isPending, isError, error }
    = useQuery({
      queryKey: ['users'],
      queryFn: () =>
        fetch('/api/users').then(r => r.json()),
    });

  if (isPending) return <p>Loading...</p>;
  if (isError)   return <p>{error.message}</p>;
  return <ul>{data.map(u =>
    <li key={u.id}>{u.name}</li>)}</ul>;
}

// Header.jsx — SAME cache, zero extra request
function Header() {
  const { data: me } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchMe,
  });
  // ...
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live: navigate away and back — instant! Manual Refresh forces a new fetch.</div>
            <TanStackFetchDemo />
          </div>
          <div className="panel-section">
            <div className="panel-label">Solutions</div>
            <ul className="solution-list">
              <li>Data served from cache on re-navigation — instant</li>
              <li>Multiple components share one request via <code>queryKey</code></li>
              <li>4 lines replace 20+ lines of boilerplate</li>
              <li>Built-in retry with exponential backoff</li>
              <li>Auto-refetch on window focus and network reconnect</li>
              <li>Request deduplication — 3 components, 1 request</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pitfalls-box">
        <h3>Key mental model</h3>
        <ul>
          <li>Think of <code>useQuery</code> as a "smart subscription" to a server resource</li>
          <li>The <code>queryKey</code> is the cache key — same key = same cache entry, shared by all components</li>
          <li>TanStack Query does NOT replace Redux/Zustand for client state — use it only for server data</li>
        </ul>
      </div>
    </div>
  );
}
