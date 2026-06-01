import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import CodeBlock from '../components/CodeBlock';
import { api } from '../mockApi';

// ── Before: raw useEffect ─────────────────────────────
function BeforeList({ onFetch }) {
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoad(true);
    onFetch();
    api.getUsers()
      .then((d) => { if (!cancelled) { setData(d); setLoad(false); } })
      .catch((e) => { if (!cancelled) { setError(e); setLoad(false); } });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /> Loading…</div>;
  if (error)   return <div className="error-box">{error.message}</div>;
  return (
    <table className="user-table">
      <thead><tr><th>Name</th><th>Dept</th><th>Role</th></tr></thead>
      <tbody>{data.map((u) => (
        <tr key={u.id}>
          <td>{u.name}</td>
          <td>{u.dept}</td>
          <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
        </tr>
      ))}</tbody>
    </table>
  );
}

// ── After: useQuery with manual refresh ───────────────────
function AfterList({ onFetch }) {
  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['a2-users'],
    queryFn:  api.getUsers,
    staleTime: 1000 * 60,
  });

  const wasFetchingRef = useRef(false);
  const onFetchRef = useRef(onFetch);
  onFetchRef.current = onFetch;
  useEffect(() => {
    if (isFetching && !wasFetchingRef.current) onFetchRef.current();
    wasFetchingRef.current = isFetching;
  }, [isFetching]);

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
      {isPending ? (
        <div className="loading-state"><div className="spinner" /> Loading…</div>
      ) : isError ? (
        <div className="error-box">{error.message}</div>
      ) : (
        <table className="user-table">
          <thead><tr><th>Name</th><th>Dept</th><th>Role</th></tr></thead>
          <tbody>{data.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.dept}</td>
              <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </>
  );
}

export default function TopicA2Page() {
  const beforeRef = useRef(0);
  const afterRef  = useRef(0);
  const [beforeReq, setBeforeReq] = useState(0);
  const [afterReq,  setAfterReq]  = useState(0);
  const [beforeKey, setBeforeKey] = useState(0);
  const [afterKey,  setAfterKey]  = useState(0);
  const [beforeVis, setBeforeVis] = useState(true);
  const [afterVis,  setAfterVis]  = useState(true);

  const remount = (setKey, setVis) => {
    setVis(false);
    setTimeout(() => { setKey((k) => k + 1); setVis(true); }, 80);
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="badge badge-group-a">Group A · Topic 2</span>
        <h1>useQuery Fundamentals</h1>
        <p>
          Replace useState + useEffect with a single <code>useQuery</code> call. Watch the Devtools
          panel (bottom-right) to see the query lifecycle in real time.
        </p>
      </div>

      {/* Plain explanation */}
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '0.875rem 1.1rem', margin: '1.25rem 0', fontSize: '0.85rem' }}>
        <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.35rem' }}>💡 What useQuery does</strong>
        <p style={{ color: '#78350f', lineHeight: 1.7 }}>
          Normally, loading data requires 3 separate state variables (<code>data</code>, <code>loading</code>, <code>error</code>) and a <code>useEffect</code> — that is 15+ lines just to fetch one thing.
          <strong> <code>useQuery</code> handles all of that in one call.</strong> You give it a name (<code>queryKey</code>) and a function that fetches the data (<code>queryFn</code>), and it hands back <code>data</code>, <code>isPending</code>, and <code>isError</code> automatically.
          It also saves the result so the next time you ask for the same <code>queryKey</code>, it returns the saved copy instead of hitting the server again.
          The <strong>"Manual Refresh"</strong> button forces a new request even when a saved copy already exists.
        </p>
      </div>

      {/* Setup */}
      <h2 className="section-title">Step 0 — App Setup (once, at root)</h2>
      <CodeBlock code={`// npm install @tanstack/react-query @tanstack/react-query-devtools

// src/main.jsx or App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,      // data fresh for 1 minute
      retry: 1,                  // retry failed requests once
      refetchOnWindowFocus: true, // refresh when user returns to tab
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourAppRoutes />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}`} />

      {/* Side by Side */}
      <h2 className="section-title">Before vs After — Live Demo</h2>

      <div className="comparison-grid">
        {/* Before */}
        <div className="panel before-panel">
          <div className="panel-header">
            <span className="before-badge">Before</span>
            <h3>useState + useEffect (20+ lines)</h3>
          </div>

          {/* Before explanation */}
          <div className="panel-section" style={{ background: '#fff8f8' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              The "old way" requires <strong>3 useState variables</strong> just to track a single API call (data, loading, error).
              You also need <code>useEffect</code> with a cleanup function to prevent race conditions.
              This exact boilerplate gets copy-pasted into every component that loads data.
              <strong> Click "Simulate Navigation" and watch the counter — every remount fires a new request.</strong>
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`import { useState, useEffect } from 'react';

function UsersList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);          // reset on every mount
    fetch('/api/users')
      .then(r => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
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
  }, []); // ← empty dep = runs every mount

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>{error.message}</p>;
  return <ul>{data.map(u =>
    <li key={u.id}>{u.name}</li>)}</ul>;
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live Demo</div>
            <div className="demo-stat-row">
              <div className="stat-chip highlight">
                <span className="stat-label">Server requests:</span>
                <span className="stat-val">{beforeReq}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-label">Fetches on every navigation</span>
              </div>
            </div>
            <div className="demo-controls">
              <button className="btn btn-outline btn-sm"
                onClick={() => remount(setBeforeKey, setBeforeVis)}>
                ↺ Simulate Navigation
              </button>
              <button className="btn btn-ghost btn-sm"
                onClick={() => { beforeRef.current = 0; setBeforeReq(0); }}>
                Reset counter
              </button>
            </div>
            {beforeVis && (
              <BeforeList
                key={beforeKey}
                onFetch={() => { beforeRef.current++; setBeforeReq(beforeRef.current); }}
              />
            )}
          </div>
        </div>

        {/* After */}
        <div className="panel after-panel">
          <div className="panel-header">
            <span className="after-badge">After</span>
            <h3>useQuery (4 lines, cached)</h3>
          </div>

          {/* After explanation */}
          <div className="panel-section" style={{ background: '#f0fdf4' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              <code>useQuery</code> replaces the entire before block. It gives you <code>data</code>, <code>isPending</code>,
              and <code>isError</code> automatically — no manual useState.
              The <code>queryKey</code> is the cache identifier: any component using <code>['a2-users']</code> shares the same cached result.
              <strong> Click "Simulate Navigation" — the counter stays at 1. The cache is serving subsequent renders.
              Click "Manual Refresh" to force a new server request.</strong>
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`import { useQuery } from '@tanstack/react-query';

function UsersList() {
  const {
    data,
    isPending,   // true when no data yet
    isError,
    error,
    refetch,     // manually trigger a fresh fetch
  } = useQuery({
    queryKey: ['users'],    // ← cache key (array)
    queryFn: async () => {
      const r = await fetch('/api/users');
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
  });

  if (isPending) return <p>Loading...</p>;
  if (isError)   return <p>{error.message}</p>;
  return (
    <ul>
      {data.map(u =>
        <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}

// That's it. ~18 lines removed.
// Cache, dedup, retries — all included.`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live Demo — navigate back → instant! Refresh forces a new fetch.</div>
            <div className="demo-stat-row">
              <div className="stat-chip highlight">
                <span className="stat-label">Server requests:</span>
                <span className="stat-val">{afterReq}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-label">Cache serves subsequent navigations</span>
              </div>
            </div>
            <div className="demo-controls">
              <button className="btn btn-outline btn-sm"
                onClick={() => remount(setAfterKey, setAfterVis)}>
                ↺ Simulate Navigation
              </button>
              <button className="btn btn-ghost btn-sm"
                onClick={() => { afterRef.current = 0; setAfterReq(0); }}>
                Reset counter
              </button>
            </div>
            {afterVis && (
              <AfterList
                key={afterKey}
                onFetch={() => { afterRef.current++; setAfterReq(afterRef.current); }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="insight">
        <strong>Watch the counters:</strong> Click "Simulate Navigation" several times on each panel.
        The Before counter climbs every time. The After counter stays at 1 — the cache is serving
        subsequent renders. The Devtools (bottom-right) shows the query status: fetching → fresh → stale.
        Use <strong>Manual Refresh</strong> in the After panel to force a fresh fetch on demand.
      </div>

      {/* The 4 core fields */}
      <h2 className="section-title">The 4 Core Fields from useQuery</h2>
      <CodeBlock code={`const {
  data,       // the resolved value from queryFn (undefined until first success)
  isPending,  // true if no data exists yet (first load)
  isError,    // true if queryFn threw
  error,      // the thrown Error object (or null)

  // Bonus fields you'll use later:
  isFetching, // true while any fetch is in flight (including background refetch)
  isStale,    // true if data is older than staleTime
  refetch,    // function to manually trigger a refetch
  status,     // 'pending' | 'success' | 'error'
} = useQuery({ queryKey, queryFn });`} />

      <div className="pitfalls-box">
        <h3>What to look for in the Devtools</h3>
        <ul>
          <li><strong>fetching →</strong> query is in flight</li>
          <li><strong>fresh →</strong> data is cached and within staleTime (no auto-refetch)</li>
          <li><strong>stale →</strong> data exists but is old; will refetch on next trigger</li>
          <li><strong>inactive →</strong> no component is subscribed; data stays until gcTime expires</li>
        </ul>
      </div>
    </div>
  );
}
