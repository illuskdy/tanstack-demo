import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CodeBlock from '../components/CodeBlock';
import { api } from '../mockApi';

// ── Custom hooks (as they'd live in src/hooks/) ───────
function useUsers() {
  return useQuery({
    queryKey: ['b3-users'],
    queryFn:  api.getUsers,
    staleTime: 1000 * 60,
  });
}

function useUser(id) {
  return useQuery({
    queryKey: ['b3-users', id],
    queryFn:  () => api.getUserById(id),
    enabled:  !!id,
    staleTime: 1000 * 60,
  });
}

function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createUser,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['b3-users'] }),
  });
}

function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['b3-users'] }),
  });
}

// ── Component using custom hooks (clean!) ─────────────
function CleanUsersList() {
  const { data: users, isPending, isFetching, refetch } = useUsers();
  const deleteUser = useDeleteUser();

  if (isPending) return <div className="loading-state"><div className="spinner" /> Loading…</div>;
  return (
    <>
      <div className="demo-controls" style={{ marginBottom: '0.5rem' }}>
        <button className="btn btn-outline btn-sm" onClick={() => refetch()} disabled={isFetching}>
          ↺ Manual Refresh
        </button>
        {isFetching && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Fetching…
          </span>
        )}
      </div>
      <table className="user-table">
        <thead><tr><th>Name</th><th>Role</th><th>Dept</th><th></th></tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
            <td>{u.dept}</td>
            <td>
              <button className="btn btn-danger btn-xs"
                onClick={() => deleteUser.mutate(u.id)}
                disabled={deleteUser.isPending}>✕</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </>
  );
}

export default function TopicB3Page() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="badge badge-group-b">Group B · Topic 3</span>
        <h1>Project Integration & Conventions</h1>
        <p>
          Extract queries and mutations into custom hooks. Components become declarative — they say
          <em> what</em> they need, not <em>how</em> to fetch it.
        </p>
      </div>

      {/* Plain explanation */}
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '0.875rem 1.1rem', margin: '1.25rem 0', fontSize: '0.85rem' }}>
        <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.35rem' }}>💡 Why we move fetch logic into its own function</strong>
        <p style={{ color: '#78350f', lineHeight: 1.7 }}>
          When you write <code>useQuery</code> directly inside a component, that component owns all the fetch details — the <code>queryKey</code>, the <code>queryFn</code>, the <code>staleTime</code>.
          <strong> If two components need the same data, they copy the entire block.</strong> If the API changes, you have to update every copy.
          A custom hook is just a regular JavaScript function that wraps <code>useQuery</code>. You put all the details in it once, then every component just calls <code>useUsers()</code> to get the data — one line instead of 15.
          <strong> Change the API endpoint? Update the hook file once. All components that use it get the fix automatically.</strong>
          Use <strong>Manual Refresh</strong> in the demo to see <code>refetch</code> in action — the component calls it without knowing any fetch details.
        </p>
      </div>

      {/* Custom hook extraction */}
      <h2 className="section-title">Extract into Custom Hooks</h2>

      <div className="comparison-grid">
        <div className="panel before-panel">
          <div className="panel-header">
            <span className="before-badge">Before</span>
            <h3>Fetching logic inline in component</h3>
          </div>

          {/* Before explanation */}
          <div className="panel-section" style={{ background: '#fff8f8' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              When you put <code>useQuery</code> directly inside a component, that component "owns" the fetch logic.
              <strong> If two components need the same data, they duplicate the entire block</strong> — queryKey, staleTime, queryFn, error handling.
              If the API changes, you hunt down every copy. The component is doing two jobs at once: fetching AND rendering.
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`// UsersList.jsx — all fetching inline
function UsersList() {
  const { data, isPending, isError, error }
    = useQuery({
      queryKey: ['users'],
      queryFn: async () => {
        const r = await fetch('/api/users');
        if (!r.ok) throw new Error('Failed');
        return r.json();
      },
      staleTime: 1000 * 60,
    });

  // Problem: if UserHeader also needs
  // users, it duplicates this block.
  // Problems multiply as the team grows.
}`} />
          </div>
        </div>

        <div className="panel after-panel">
          <div className="panel-header">
            <span className="after-badge">After</span>
            <h3>Reusable hooks — component is 1 line</h3>
          </div>

          {/* After explanation */}
          <div className="panel-section" style={{ background: '#f0fdf4' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              The hook file (<code>useUsers.js</code>) owns ALL the fetch details.
              <strong> The component just calls <code>useUsers()</code></strong> — one line. It gets back <code>data</code>, <code>isPending</code>, <code>refetch</code>, and everything else.
              Ten components can use the same hook and always share the same cache entry.
              Change the API? Update the hook file once. Components don't change.
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`// src/hooks/queries/useUsers.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn:  api.getUsers,
    staleTime: 1000 * 60,
  });
}

// src/hooks/queries/useUser.js
export function useUser(id) {
  return useQuery({
    queryKey: ['users', id],
    queryFn:  () => api.getUserById(id),
    enabled:  !!id,
  });
}

// src/hooks/mutations/useCreateUser.js
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// Usage — component is now declarative:
function UsersList() {
  const { data, isPending, refetch } = useUsers();
  const deleteUser = useDeleteUser();
  // ... 3 lines instead of 20
}`} />
          </div>
        </div>
      </div>

      {/* Live demo of clean component */}
      <h2 className="section-title">Live Demo — Component Using Custom Hooks</h2>
      <div className="insight">
        The component below uses <code>useUsers()</code> and <code>useDeleteUser()</code> — no <code>useQuery</code> or
        <code> useMutation</code> visible. The component is purely about rendering.
        The <strong>Manual Refresh</strong> button calls <code>refetch()</code> returned by <code>useUsers()</code> — the component doesn't know how fetching works, it just uses what the hook provides.
      </div>

      <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden', maxWidth: 600 }}>
        <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="after-badge">Live</span>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>CleanUsersList.jsx (using custom hooks)</h3>
        </div>
        <div style={{ padding: '1rem' }}>
          <CleanUsersList />
        </div>
      </div>

      {/* Folder structure */}
      <h2 className="section-title">Suggested Folder Structure</h2>
      <div className="comparison-grid">
        <div className="panel" style={{ borderColor: '#93c5fd' }}>
          <div className="panel-header" style={{ background: '#eff6ff' }}>
            <h3 style={{ color: '#1e40af' }}>Option A — Centralized hooks</h3>
          </div>
          <div className="panel-section">
            <CodeBlock code={`src/
  hooks/
    queries/
      useUsers.js
      useUser.js
      useProducts.js
    mutations/
      useCreateUser.js
      useUpdateUser.js
      useDeleteUser.js
  services/
    api.js        ← raw API functions
  components/
    UsersList.jsx ← uses hooks, no fetching`} />
            <div className="insight" style={{ marginTop: '0.5rem' }}>
              Best for: small-medium teams. Easy to find all data hooks in one place.
            </div>
          </div>
        </div>
        <div className="panel" style={{ borderColor: '#86efac' }}>
          <div className="panel-header" style={{ background: '#f0fdf4' }}>
            <h3 style={{ color: '#15803d' }}>Option B — Co-located by feature</h3>
          </div>
          <div className="panel-section">
            <CodeBlock code={`src/
  features/
    users/
      api.js         ← user-specific API
      useUsers.js    ← co-located hook
      UsersList.jsx
      UserDetail.jsx
    products/
      api.js
      useProducts.js
      ProductGrid.jsx
  shared/
    hooks/
      useCurrentUser.js`} />
            <div className="insight" style={{ marginTop: '0.5rem' }}>
              Best for: large teams with feature ownership. Scales better.
            </div>
          </div>
        </div>
      </div>

      {/* Query key naming */}
      <h2 className="section-title">Query Key Naming Conventions</h2>
      <CodeBlock code={`// Recommended: factory functions avoid typos and enable easy invalidation

// queryKeys.js
export const queryKeys = {
  users: {
    all:    ()       => ['users'],
    lists:  ()       => ['users', 'list'],
    list:   (filter) => ['users', 'list', filter],
    detail: (id)     => ['users', 'detail', id],
  },
  products: {
    all:    ()       => ['products'],
    detail: (id)     => ['products', id],
  },
};

// Usage
useQuery({
  queryKey: queryKeys.users.detail(userId),
  queryFn:  () => api.getUser(userId),
});

// Invalidate all user queries after any write:
queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });

// Invalidate only the list (not detail):
queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });`} />

      {/* Global defaults */}
      <h2 className="section-title">Recommended Global Defaults</h2>
      <CodeBlock code={`const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,     // 1 min fresh — adjust per endpoint
      gcTime:    1000 * 60 * 5, // 5 min in memory — fine for most apps
      retry: 1,                 // retry once on failure (default is 3)
      refetchOnWindowFocus: false, // set true if real-time data matters
    },
    mutations: {
      // global onError to show toast notifications:
      onError: (error) => {
        toast.error(error.message ?? 'Something went wrong');
      },
    },
  },
});`} />

      {/* Team conventions table */}
      <h2 className="section-title">Team Conventions Summary</h2>
      <table className="conventions-table">
        <thead>
          <tr><th>Topic</th><th>Convention</th><th>Why</th></tr>
        </thead>
        <tbody>
          <tr><td>Hook location</td><td><code>src/hooks/queries/</code> and <code>src/hooks/mutations/</code></td><td>Easy to find, team-wide consistency</td></tr>
          <tr><td>Query key shape</td><td><code>['entity', id]</code> or use a factory</td><td>Enables prefix-based invalidation</td></tr>
          <tr><td>Default staleTime</td><td>60 seconds globally</td><td>Reduces unnecessary requests without sacrificing freshness</td></tr>
          <tr><td>Invalidation scope</td><td>Invalidate the parent key after writes</td><td>Catches list + detail with one call</td></tr>
          <tr><td>Error handling</td><td>Global <code>onError</code> in QueryClient for toasts</td><td>Consistent UX without per-mutation error code</td></tr>
          <tr><td>Devtools</td><td>Always open during development</td><td>Fastest way to debug cache issues</td></tr>
        </tbody>
      </table>
    </div>
  );
}
