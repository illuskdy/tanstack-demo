import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CodeBlock from '../components/CodeBlock';
import { api } from '../mockApi';
import { validate } from '../utils/validation';

// ── Before: no invalidation ───────────────────────────
function BeforeUserList() {
  const [users, setUsers] = useState(null);
  const [listLoading, setLL] = useState(true);
  const [adding, setAdding]  = useState(false);
  const [name,  setName]     = useState('');
  const [msg, setMsg]        = useState('');
  const [staleWarning, setStaleWarning] = useState(false);

  useState(() => {
    api.getUsers().then((d) => { setUsers(d); setLL(false); });
  });

  const handleAdd = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await api.createUser({ name });
      setMsg(`✓ "${name}" created — but the list is STALE. Click Refresh to see it.`);
      setName('');
      setStaleWarning(true);
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setAdding(false);
    }
  };

  const handleRefresh = () => {
    setLL(true);
    setStaleWarning(false);
    api.getUsers().then((d) => { setUsers(d); setLL(false); setMsg(''); });
  };

  const handleDelete = async (id) => {
    await api.deleteUser(id);
    setMsg('Deleted — list is STALE again. Click Refresh.');
    setStaleWarning(true);
  };

  return (
    <div>
      {staleWarning && (
        <div className="warning-box">⚠ Data is stale — list does not reflect the last write.</div>
      )}
      <div className="demo-controls">
        <input className="form-control" style={{ maxWidth: 160 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="New user name" />
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={adding}>
          {adding ? '…' : '+ Add'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleRefresh}>
          ↺ Manual Refresh
        </button>
      </div>
      {msg && <div style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.5rem 0' }}>{msg}</div>}
      {listLoading
        ? <div className="loading-state"><div className="spinner" /> Loading…</div>
        : (
          <table className="user-table">
            <thead><tr><th>Name</th><th>Dept</th><th></th></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.dept}</td>
                <td>
                  <button className="btn btn-danger btn-xs" onClick={() => handleDelete(u.id)}>✕</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )
      }
    </div>
  );
}

// ── After: invalidation + email validation ────────────
function AfterUserList() {
  const queryClient = useQueryClient();
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [msg, setMsg]     = useState('');

  const { data: users, isPending, isFetching, refetch } = useQuery({
    queryKey: ['b2-users'],
    queryFn:  api.getUsers,
    staleTime: 1000 * 60,
  });

  const validateEmail = (value) => {
    const err = validate.email(value);
    setEmailError(err);
    return err === null;
  };

  const createUser = useMutation({
    mutationFn: (data) => api.createUser(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['b2-users'] });
      setMsg(`✓ "${created.name}" added — list auto-refreshed!`);
      setName('');
      setEmail('');
      setEmailError(null);
    },
    onError: (e) => setMsg(`Error: ${e.message}`),
  });

  const deleteUser = useMutation({
    mutationFn: (id) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2-users'] });
      setMsg('✓ Deleted — list auto-refreshed!');
    },
  });

  const handleAdd = () => {
    if (!name.trim()) return;
    // Validate email before submitting — catch invalid format
    if (!validateEmail(email)) return;
    createUser.mutate({ name, email: email.trim() || undefined });
  };

  return (
    <div>
      {msg && <div className="success-box" style={{ marginBottom: '0.65rem' }}>{msg}</div>}

      {/* Name + Email inputs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <input
          className="form-control"
          style={{ maxWidth: 140 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (required)"
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            className={`form-control${emailError ? ' is-error' : ''}`}
            style={{ maxWidth: 185 }}
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
            placeholder="Email (optional)"
          />
          {emailError && (
            <span className="field-error">{emailError}</span>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleAdd}
          disabled={createUser.isPending}
          style={{ alignSelf: 'flex-start' }}
        >
          {createUser.isPending ? '…' : '+ Add'}
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => refetch()}
          disabled={isFetching}
          style={{ alignSelf: 'flex-start' }}
        >
          {isFetching ? '…' : '↺ Refresh'}
        </button>
      </div>

      {isPending
        ? <div className="loading-state"><div className="spinner" /> Loading…</div>
        : (
          <table className="user-table">
            <thead><tr><th>Name</th><th>Dept</th><th></th></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.dept}</td>
                <td>
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={() => deleteUser.mutate(u.id)}
                    disabled={deleteUser.isPending}
                  >✕</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )
      }
    </div>
  );
}

export default function TopicB2Page() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="badge badge-group-b">Group B · Topic 2</span>
        <h1>Cache Invalidation</h1>
        <p>
          The glue between mutations and queries. One line —
          <code> queryClient.invalidateQueries()</code> — ties writes back to reads.
        </p>
      </div>

      {/* Plain explanation */}
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '0.875rem 1.1rem', margin: '1.25rem 0', fontSize: '0.85rem' }}>
        <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.35rem' }}>💡 Why the list doesn't update after a write</strong>
        <p style={{ color: '#78350f', lineHeight: 1.7 }}>
          When you add or delete a user, TanStack Query does not automatically know the saved list has changed — it still holds the old copy in the cache.
          <strong> <code>invalidateQueries</code></strong> is how you tell it: "that saved data is outdated — fetch it again."
          Without this call, the list stays stale after every write and the user has to refresh manually to see the change.
          <strong> With it, the list re-fetches on its own</strong> the moment the mutation succeeds — no manual refresh needed.
          The <strong>email validation</strong> in the After demo runs client-side before the mutation fires, so a bad format is caught instantly without hitting the server at all.
        </p>
      </div>

      {/* Side by Side */}
      <h2 className="section-title">Before vs After — Add & Delete Users</h2>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Add a user or delete one. Watch whether the list updates automatically.
        In the "After" demo, try typing an invalid email like <code>notanemail</code> to see client-side validation catch it.
      </p>

      <div className="comparison-grid">
        <div className="panel before-panel">
          <div className="panel-header">
            <span className="before-badge">Before</span>
            <h3>Manual refresh required after every write</h3>
          </div>

          {/* Before explanation */}
          <div className="panel-section" style={{ background: '#fff8f8' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              After adding or deleting a user, <strong>the list doesn't know anything changed</strong>.
              The cache is stale — it still holds the old data. You have to click "Manual Refresh" yourself to re-fetch.
              In a real app, users would see an outdated list after every write unless you manually wire up the refresh logic everywhere.
              This gets messy fast when multiple components show the same data.
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`// After a mutation, the list is stale.
// You must manually trigger a re-fetch.

const handleAdd = async () => {
  await api.createUser(data);
  // ❌ List doesn't know something changed.
  // User must click Refresh or you must
  // re-fetch in a callback — but which
  // components are listening?
  setMsg('Created! Click Refresh to see it.');
};

const handleRefresh = () => {
  // Have to re-call the same fetch logic
  // from scratch in the component.
  setLoading(true);
  api.getUsers().then(setUsers)
     .finally(() => setLoading(false));
};`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live Demo — notice the stale warning after writes</div>
            <BeforeUserList />
          </div>
        </div>

        <div className="panel after-panel">
          <div className="panel-header">
            <span className="after-badge">After</span>
            <h3>Auto-refresh via invalidation + email validation</h3>
          </div>

          {/* After explanation */}
          <div className="panel-section" style={{ background: '#f0fdf4' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              After every successful mutation, <code>invalidateQueries</code> marks the cached user list as outdated and triggers an automatic re-fetch.
              <strong> No manual refresh button needed</strong> — the list updates on its own.
              <strong> Email validation</strong> runs client-side before the mutation fires: type <code>notanemail</code> and click Add — the error is caught instantly without hitting the server.
              The <strong>"↺ Refresh"</strong> button lets you manually force a fresh fetch at any time.
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`import {
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { validate } from '../utils/validation';

function UserList() {
  const queryClient = useQueryClient();
  const [emailError, setEmailError] = useState(null);

  const { data, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  });

  const createUser = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      // ✅ One line — auto-refreshes all
      // queries matching ['users'] prefix
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    },
  });

  const handleAdd = () => {
    // Client-side validation before mutating:
    const err = validate.email(email);
    if (err) { setEmailError(err); return; }
    createUser.mutate({ name, email });
  };

  // Manual refresh also available:
  // <button onClick={() => refetch()}>↺ Refresh</button>
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">
              Live Demo — list auto-refreshes. Try typing <code>bad@</code> as email to see validation.
            </div>
            <AfterUserList />
          </div>
        </div>
      </div>

      <div className="insight">
        <strong>Key line:</strong> <code>queryClient.invalidateQueries({'{ queryKey: [\'users\'] }'})</code>
        marks the cache entry as stale and triggers a background refetch. Any component subscribed to
        that query key will re-render with fresh data. No prop drilling, no event buses, no manual state sync.
      </div>

      {/* How invalidation works */}
      <h2 className="section-title">How invalidation matching works (prefix-based)</h2>
      <CodeBlock code={`// These queries exist in the cache:
// ['users']
// ['users', 1]
// ['users', 2]
// ['users', 'list', { role: 'Admin' }]

// Invalidate by prefix:
queryClient.invalidateQueries({ queryKey: ['users'] });
// ↑ Invalidates ALL FOUR — any key starting with 'users'

queryClient.invalidateQueries({ queryKey: ['users', 1] });
// ↑ Invalidates only ['users', 1]

// Exact match (no prefix):
queryClient.invalidateQueries({
  queryKey: ['users'],
  exact: true,
});
// ↑ Invalidates only ['users'], not the detail queries`} />

      {/* Optimistic updates teaser */}
      <h2 className="section-title">Advanced: Optimistic Updates (teaser)</h2>
      <CodeBlock code={`// For instant UI feedback before the server responds:
const deleteUser = useMutation({
  mutationFn: api.deleteUser,

  onMutate: async (id) => {
    // 1. Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['users'] });

    // 2. Snapshot current cache
    const previous = queryClient.getQueryData(['users']);

    // 3. Optimistically update cache
    queryClient.setQueryData(['users'], (old) =>
      old.filter(u => u.id !== id)
    );

    return { previous }; // context for rollback
  },

  onError: (_err, _id, context) => {
    // 4. On failure, roll back to the snapshot
    queryClient.setQueryData(['users'], context.previous);
  },

  onSettled: () => {
    // 5. Always re-sync with server
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
// Result: delete appears instant in UI, rolls back if server fails.`} />
    </div>
  );
}
