import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CodeBlock from '../components/CodeBlock';
import { api } from '../mockApi';
import { validate } from '../utils/validation';

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
    mutationKey: ['b3-createUser'],
    mutationFn: api.createUser,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['b3-users'] }),
  });
}

function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['b3-deleteUser'],
    mutationFn: api.deleteUser,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['b3-users'] }),
  });
}

// ── Component boundary label ───────────────────────────
function ComponentBox({ label, children, style }) {
  return (
    <div style={{ border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'white', ...style }}>
      <div style={{
        background: '#f0f4ff',
        borderBottom: '1px solid #c7d2fe',
        padding: '0.28rem 0.75rem',
        fontSize: '0.7rem',
        fontFamily: 'monospace',
        color: '#4338ca',
        fontWeight: 700,
        letterSpacing: '0.01em',
      }}>
        {label}
      </div>
      <div style={{ padding: '0.75rem' }}>
        {children}
      </div>
    </div>
  );
}

// ── Stats widget (uses useUsers) ──────────────────────
function UserStats() {
  const { data: users, isPending } = useUsers();
  if (isPending) return <div className="loading-state" style={{ minHeight: 60 }}><div className="spinner" /></div>;
  const counts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});
  return (
    <div>
      <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{users.length}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>total users</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Object.entries(counts).map(([role, count]) => (
          <div key={role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span className={`role-badge role-${role}`} style={{ fontSize: '0.65rem' }}>{role}</span>
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151' }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Detail card (uses useUser(id)) ────────────────────
function UserDetail({ userId }) {
  const { data: user, isPending } = useUser(userId);
  if (isPending) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
      <div className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> Loading…
    </div>
  );
  if (!user) return null;
  return (
    <div style={{ fontSize: '0.82rem' }}>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{user.name}</div>
      <div style={{ color: '#6b7280', marginBottom: 6, fontSize: '0.78rem' }}>{user.email}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
        <span className={`role-badge role-${user.role}`}>{user.role}</span>
        <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>{user.dept}</span>
      </div>
      <div style={{ fontSize: '0.67rem', color: '#9ca3af', fontFamily: 'monospace', background: '#f9fafb', borderRadius: 4, padding: '0.25rem 0.4rem' }}>
        queryKey: ['b3-users', {userId}]
      </div>
    </div>
  );
}

// ── Table (uses useUsers + useDeleteUser) ─────────────
function UserTable({ selectedId, onSelect }) {
  const { data: users, isPending, isFetching } = useUsers();
  const deleteUser = useDeleteUser();

  if (isPending) return <div className="loading-state"><div className="spinner" /> Loading…</div>;
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', minHeight: 20 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click a row to load detail via <code>useUser(id)</code></span>
        {isFetching && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Syncing…
          </span>
        )}
      </div>
      <table className="user-table">
        <thead><tr><th>Name</th><th>Role</th><th>Dept</th><th></th></tr></thead>
        <tbody>{users.map((u) => (
          <tr
            key={u.id}
            className={`clickable${selectedId === u.id ? ' selected' : ''}`}
            onClick={() => onSelect(u.id === selectedId ? null : u.id)}
          >
            <td>{u.name}</td>
            <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
            <td>{u.dept}</td>
            <td onClick={(e) => e.stopPropagation()}>
              <button
                className="btn btn-danger btn-xs"
                onClick={() => { if (selectedId === u.id) onSelect(null); deleteUser.mutate(u.id); }}
                disabled={deleteUser.isPending}
              >✕</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </>
  );
}

// ── Add form (uses useCreateUser) ─────────────────────
function AddUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const createUser = useCreateUser();

  const handleEmailChange = (val) => {
    setEmail(val);
    setEmailError(val ? validate.email(val) : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || emailError) return;
    createUser.mutate(
      { name, email: email.trim() || undefined },
      { onSuccess: () => { setName(''); setEmail(''); setEmailError(null); } }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <input
          className="form-control"
          style={{ maxWidth: 160 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (required)"
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            className={`form-control${emailError ? ' is-error' : ''}`}
            style={{ maxWidth: 200 }}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Email (optional)"
          />
          {emailError && <span className="field-error">{emailError}</span>}
        </div>
        <button
          type="submit"
          className="btn btn-success btn-sm"
          disabled={createUser.isPending || !name.trim() || !!emailError}
          style={{ alignSelf: 'flex-start' }}
        >
          {createUser.isPending ? 'Adding…' : '+ Add User'}
        </button>
        {createUser.isSuccess && (
          <span style={{ fontSize: '0.8rem', color: '#16a34a', alignSelf: 'center' }}>
            ✓ {createUser.data.name} added — both panels updated!
          </span>
        )}
      </div>
      {createUser.isError && (
        <div className="error-box" style={{ marginTop: '0.5rem' }}>{createUser.error.message}</div>
      )}
    </form>
  );
}

// ── Demo orchestrator ─────────────────────────────────
function B3LiveDemo() {
  const [selectedId, setSelectedId] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: '0.75rem', alignItems: 'start' }}>
        {/* Left column: stats + detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <ComponentBox label="<UserStats />  ← useUsers()">
            <UserStats />
          </ComponentBox>
          {selectedId ? (
            <ComponentBox label={`<UserDetail id={${selectedId}} />  ← useUser(id)`}>
              <UserDetail userId={selectedId} />
            </ComponentBox>
          ) : (
            <div style={{
              border: '1.5px dashed var(--border)', borderRadius: 8,
              padding: '1rem', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: '0.75rem',
            }}>
              ← click a row to load <code>{'<UserDetail />'}</code>
            </div>
          )}
        </div>
        {/* Right column: table */}
        <ComponentBox label="<UserTable />  ← useUsers() + useDeleteUser()">
          <UserTable selectedId={selectedId} onSelect={setSelectedId} />
        </ComponentBox>
      </div>
      {/* Bottom: add form */}
      <ComponentBox label="<AddUserForm />  ← useCreateUser()">
        <AddUserForm />
      </ComponentBox>
    </div>
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

      {/* Live demo */}
      <h2 className="section-title">Live Demo — 4 Components, 1 Shared Cache</h2>
      <div className="insight">
        Four separate components, each labelled with its name. <code>{'<UserStats />'}</code> and <code>{'<UserTable />'}</code>
        both call <code>useUsers()</code> — they share a single cache entry, so adding or deleting a user
        updates <strong>both simultaneously</strong> with no coordination code.
        Click a row to spawn <code>{'<UserDetail />'}</code>, which fires a separate <code>useUser(id)</code> query.
        None of the components contain any <code>useQuery</code> or <code>useMutation</code> — all of that is in the hooks.
      </div>

      <B3LiveDemo />

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
