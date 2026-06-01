import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import CodeBlock from '../components/CodeBlock';
import { api } from '../mockApi';

// ── Before: inline useEffect ─────────────────────────────
function UserListBefore({ onFetch }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    if (onFetch) onFetch();
    api.getUsers()
      .then((users) => { if (!cancelled) { setData(users); setIsLoading(false); } })
      .catch((err)  => { if (!cancelled) { setError(err);  setIsLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  if (isLoading) return <div className="loading-state"><div className="spinner" /> Fetching from server…</div>;
  if (error)     return <div className="error-box">{error.message}</div>;
  return (
    <table className="user-table">
      <thead><tr><th>Name</th><th>Role</th></tr></thead>
      <tbody>
        {data.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── After: custom useFetch hook ──────────────────────────
function useFetch(url, onFetch) {
  const [data, setData]       = useState(null);
  const [isLoading, setLoad]  = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoad(true);
    if (onFetch) onFetch();
    api.getUsers()          // url ignored in mock — always same data
      .then((d) => { if (!cancelled) { setData(d); setLoad(false); } })
      .catch((e) => { if (!cancelled) { setError(e); setLoad(false); } });
    return () => { cancelled = true; };
  }, [url]);

  return { data, isLoading, error };
}

function UserListHook({ onFetch }) {
  const { data, isLoading, error } = useFetch('/api/users', onFetch);
  if (isLoading) return <div className="loading-state"><div className="spinner" /> Fetching from server…</div>;
  if (error)     return <div className="error-box">{error.message}</div>;
  return (
    <table className="user-table">
      <thead><tr><th>Name</th><th>Role</th></tr></thead>
      <tbody>
        {data.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── After + TanStack Query ───────────────────────────────
function UserListQuery({ onFetch }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['foundation-users'],
    queryFn:  async () => { if (onFetch) onFetch(); return api.getUsers(); },
    staleTime: 1000 * 60,
  });
  if (isPending) return <div className="loading-state"><div className="spinner" /> Fetching from server…</div>;
  if (isError)   return <div className="error-box">{error.message}</div>;
  return (
    <table className="user-table">
      <thead><tr><th>Name</th><th>Role</th></tr></thead>
      <tbody>
        {data.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Page ─────────────────────────────────────────────────
export default function FoundationPage() {
  const beforeReqRef  = useRef(0);
  const hookReqRef    = useRef(0);
  const queryReqRef   = useRef(0);
  const [beforeReq,  setBeforeReq]  = useState(0);
  const [hookReq,    setHookReq]    = useState(0);
  const [queryReq,   setQueryReq]   = useState(0);
  const [beforeKey,  setBeforeKey]  = useState(0);
  const [hookKey,    setHookKey]    = useState(0);
  const [queryKey2,  setQueryKey2]  = useState(0);
  const [beforeVis,  setBeforeVis]  = useState(true);
  const [hookVis,    setHookVis]    = useState(true);
  const [queryVis,   setQueryVis]   = useState(true);

  const remount = (setKey, setVis) => {
    setVis(false);
    setTimeout(() => { setKey((k) => k + 1); setVis(true); }, 80);
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="badge badge-foundation">Foundation</span>
        <h1>React Hooks Deep-Dive</h1>
        <p>
          TanStack Query is built on custom hooks. Before learning it, all interns must understand
          <code> useState</code>, <code>useEffect</code>, and how custom hooks compose them.
        </p>
      </div>

      {/* ── Topic 1 ── */}
      <h2 className="section-title">Topic 1 — The Old Way: useState + useEffect</h2>

      <div className="topic-intro">
        <h2>What to learn</h2>
        <ul>
          <li><strong>useState</strong>: state triggers re-renders, never mutate directly, functional updater form</li>
          <li><strong>useEffect</strong>: dependency array, cleanup functions, why effects run after render</li>
          <li><strong>Common bugs</strong>: missing deps, infinite loops, stale closures, race conditions</li>
          <li><strong>Custom hooks</strong>: any function starting with <code>use</code> that calls other hooks — just composition</li>
        </ul>
      </div>

      <div className="comparison-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {/* Panel 1: Raw useEffect */}
        <div className="panel before-panel">
          <div className="panel-header">
            <span className="before-badge">Before</span>
            <h3>Inline useEffect</h3>
          </div>
          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`function UsersList() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading]
        = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(json => {
        if (!cancelled) setData(json);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;
  return <ul>{data.map(u =>
    <li key={u.id}>{u.name}</li>)}</ul>;
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live Demo</div>
            <div className="demo-stat-row">
              <div className="stat-chip highlight">
                <span className="stat-label">API requests:</span>
                <span className="stat-val">{beforeReq}</span>
              </div>
            </div>
            <div className="demo-controls">
              <button className="btn btn-outline btn-sm"
                onClick={() => { beforeReqRef.current = 0; setBeforeReq(0); remount(setBeforeKey, setBeforeVis); }}>
                ↺ Simulate Navigation
              </button>
            </div>
            {beforeVis && (
              <UserListBefore key={beforeKey} onFetch={() => { beforeReqRef.current++; setBeforeReq(beforeReqRef.current); }} />
            )}
          </div>
        </div>

        {/* Panel 2: Custom useFetch hook */}
        <div className="panel" style={{ borderColor: '#f59e0b' }}>
          <div className="panel-header" style={{ background: '#fffbeb' }}>
            <span style={{ background: '#d97706', color: 'white', padding: '0.1rem 0.45rem', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Step 2</span>
            <h3>Custom useFetch Hook</h3>
          </div>
          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading]
        = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (!cancelled) setData(json);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [url]);

  return { data, isLoading, error };
}

// Usage — much cleaner component:
function UsersList() {
  const { data, isLoading } =
    useFetch('/api/users');
  // ...
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live Demo</div>
            <div className="demo-stat-row">
              <div className="stat-chip highlight">
                <span className="stat-label">API requests:</span>
                <span className="stat-val">{hookReq}</span>
              </div>
            </div>
            <div className="demo-controls">
              <button className="btn btn-outline btn-sm"
                onClick={() => { hookReqRef.current = 0; setHookReq(0); remount(setHookKey, setHookVis); }}>
                ↺ Simulate Navigation
              </button>
            </div>
            {hookVis && (
              <UserListHook key={hookKey} onFetch={() => { hookReqRef.current++; setHookReq(hookReqRef.current); }} />
            )}
          </div>
        </div>

        {/* Panel 3: TanStack Query */}
        <div className="panel after-panel">
          <div className="panel-header">
            <span className="after-badge">After</span>
            <h3>TanStack Query (useQuery)</h3>
          </div>
          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`// useQuery is a very smart useFetch
// with built-in caching, dedup,
// background refetch, and more.

import { useQuery } from
  '@tanstack/react-query';

function UsersList() {
  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users')
      .then(r => r.json()),
    staleTime: 1000 * 60, // 1 min
  });

  if (isPending) return <p>Loading...</p>;
  if (isError)   return <p>{error.message}</p>;
  return (
    <ul>
      {data.map(u =>
        <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live Demo — navigate away and back, data is instant!</div>
            <div className="demo-stat-row">
              <div className="stat-chip highlight">
                <span className="stat-label">API requests:</span>
                <span className="stat-val">{queryReq}</span>
              </div>
            </div>
            <div className="demo-controls">
              <button className="btn btn-outline btn-sm"
                onClick={() => remount(setQueryKey2, setQueryVis)}>
                ↺ Simulate Navigation (cache hit!)
              </button>
            </div>
            {queryVis && (
              <UserListQuery key={queryKey2} onFetch={() => { queryReqRef.current++; setQueryReq(queryReqRef.current); }} />
            )}
          </div>
        </div>
      </div>

      <div className="insight">
        <strong>Key insight:</strong> All three panels show the same data. The left two re-fetch every
        navigation. The right panel hits the cache after the first load — <strong>API requests stays at 1</strong>.
        This is what TanStack Query buys you.
      </div>

      {/* ── Topic 2 ── */}
      <h2 className="section-title">Topic 2 — Codebase Walkthrough</h2>

      <div className="topic-intro">
        <h2>Before learning the new way, map your current fetching patterns</h2>
        <ul>
          <li>Where do API calls live? (services folder, inline components, custom api client?)</li>
          <li>How are loading and error states displayed to users?</li>
          <li>Where is the <strong>same data fetched in multiple places</strong>? (biggest wins for caching)</li>
          <li>Any existing patterns to preserve when migrating? (error toasts, auth refresh, logging)</li>
        </ul>
      </div>

      <div className="comparison-grid">
        <div className="panel before-panel">
          <div className="panel-header">
            <span className="before-badge">Current Pattern</span>
            <h3>Component → Service → fetch → state</h3>
          </div>
          <div className="panel-section">
            <div className="panel-label">Typical current flow</div>
            <CodeBlock code={`// UserSettingsPage.jsx (same data as Header!)
function UserSettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔴 DUPLICATE REQUEST — Header also
    // fetches the current user profile!
    userService.getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  // ...
}

// Header.jsx (same endpoint, again)
function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    userService.getCurrentUser() // 🔴
      .then(setUser);
  }, []);
  // ...
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Pain Points</div>
            <ul className="problem-list">
              <li>Same endpoint called twice — two network requests for identical data</li>
              <li>Loading states managed separately in each component</li>
              <li>Spinner shown every time you navigate to the screen</li>
              <li>Race condition risk if user navigates quickly</li>
              <li>No way to "refresh all user data" from one place</li>
            </ul>
          </div>
        </div>
        <div className="panel after-panel">
          <div className="panel-header">
            <span className="after-badge">With TanStack Query</span>
            <h3>Shared cache — one request, many subscribers</h3>
          </div>
          <div className="panel-section">
            <div className="panel-label">Refactored flow</div>
            <CodeBlock code={`// hooks/useCurrentUser.js
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () =>
      userService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

// UserSettingsPage.jsx
function UserSettingsPage() {
  // ✅ Reads from cache — no extra request
  const { data: user, isPending }
    = useCurrentUser();
  // ...
}

// Header.jsx
function Header() {
  // ✅ Same cache entry — zero extra cost
  const { data: user } = useCurrentUser();
  // ...
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Benefits</div>
            <ul className="solution-list">
              <li>One network request shared across all subscribers</li>
              <li>Loading state is coordinated — all components update together</li>
              <li>Automatic background refresh when the user returns to the tab</li>
              <li>Invalidate once → all components reflect the new data</li>
              <li>React Query Devtools show cache health in real time</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pitfalls-box">
        <h3>Foundation Checkpoint — every intern should answer these:</h3>
        <ul>
          <li>What does useEffect's dependency array actually do?</li>
          <li>What is a custom hook, and why is it useful?</li>
          <li>Where in your codebase do you currently fetch data, and what are the pain points?</li>
          <li>Which screen are you going to refactor, and why?</li>
        </ul>
      </div>
    </div>
  );
}
