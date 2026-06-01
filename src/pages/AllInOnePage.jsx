import { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import { useUsers } from '../hooks/queries/useUsers';
import { useUser } from '../hooks/queries/useUser';
import { useCreateUser } from '../hooks/mutations/useCreateUser';
import { useUpdateUser } from '../hooks/mutations/useUpdateUser';
import { useDeleteUser } from '../hooks/mutations/useDeleteUser';
import { validateUserForm, hasErrors } from '../utils/validation';

// ── User Detail Panel ─────────────────────────────────
function UserDetail({ userId, onClose, onEdit }) {
  const { data: user, isPending } = useUser(userId);

  if (isPending) return (
    <div className="aio-card">
      <div className="aio-card-header"><h3>Loading…</h3></div>
      <div className="aio-card-body">
        <div className="loading-state"><div className="spinner" /> Fetching detail…</div>
      </div>
    </div>
  );
  if (!user) return null;
  return (
    <div className="aio-card">
      <div className="aio-card-header">
        <h3>{user.name}</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={() => onEdit(user)}>Edit</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="aio-card-body">
        <div className="detail-card" style={{ border: 'none', padding: 0 }}>
          <div className="detail-row"><span className="detail-label">Email:</span><span>{user.email}</span></div>
          <div className="detail-row"><span className="detail-label">Role:</span><span className={`role-badge role-${user.role}`}>{user.role}</span></div>
          <div className="detail-row"><span className="detail-label">Dept:</span><span>{user.dept}</span></div>
          <div className="detail-row"><span className="detail-label">ID:</span><span style={{ color: '#6b7280', fontFamily: 'monospace' }}>#{user.id}</span></div>
        </div>
        <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#6b7280' }}>
          ℹ Cached with <code>queryKey: ['users', {user.id}]</code>
        </div>
      </div>
    </div>
  );
}

// ── Edit Form ─────────────────────────────────────────
function EditUserForm({ user, onDone }) {
  const [name,   setName]   = useState(user.name);
  const [email,  setEmail]  = useState(user.email);
  const [role,   setRole]   = useState(user.role);
  const [dept,   setDept]   = useState(user.dept);
  const [errors, setErrors] = useState({});
  const updateUser = useUpdateUser();

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: null }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateUserForm({ name, email });
    if (hasErrors(errs)) { setErrors(errs); return; }
    updateUser.mutate({ id: user.id, data: { name, email, role, dept } }, {
      onSuccess: onDone,
    });
  };

  return (
    <div className="aio-card">
      <div className="aio-card-header">
        <h3>Edit — {user.name}</h3>
        <button className="btn btn-ghost btn-sm" onClick={onDone}>✕</button>
      </div>
      <div className="aio-card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              className={`form-control${errors.name ? ' is-error' : ''}`}
              value={name}
              onChange={(e) => { setName(e.target.value); clearError('name'); }}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              className={`form-control${errors.email ? ' is-error' : ''}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
              placeholder="user@example.com"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>User</option><option>Manager</option><option>Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <input className="form-control" value={dept} onChange={(e) => setDept(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
          </div>
          {updateUser.isError && (
            <div className="error-box" style={{ marginTop: '0.5rem' }}>{updateUser.error.message}</div>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Create Form ───────────────────────────────────────
function CreateUserForm({ onDone }) {
  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [role,   setRole]   = useState('User');
  const [dept,   setDept]   = useState('');
  const [errors, setErrors] = useState({});
  const createUser = useCreateUser();

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: null }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateUserForm({ name, email });
    if (hasErrors(errs)) { setErrors(errs); return; }
    createUser.mutate({ name, email, role, dept }, {
      onSuccess: () => { setName(''); setEmail(''); setDept(''); setErrors({}); onDone(); },
    });
  };

  return (
    <div className="aio-card">
      <div className="aio-card-header">
        <h3>New User</h3>
        <button className="btn btn-ghost btn-sm" onClick={onDone}>✕</button>
      </div>
      <div className="aio-card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              className={`form-control${errors.name ? ' is-error' : ''}`}
              value={name}
              onChange={(e) => { setName(e.target.value); clearError('name'); }}
              placeholder="Jane Doe"
              autoFocus
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              className={`form-control${errors.email ? ' is-error' : ''}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
              placeholder="jane@acme.com"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>User</option><option>Manager</option><option>Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <input className="form-control" value={dept} onChange={(e) => setDept(e.target.value)} placeholder="Engineering" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-success" disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating…' : '+ Create User'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
          </div>
          {createUser.isError && (
            <div className="error-box" style={{ marginTop: '0.5rem' }}>{createUser.error.message}</div>
          )}
        </form>
      </div>
    </div>
  );
}

// ── User List ─────────────────────────────────────────
function UserList({ selectedId, onSelect }) {
  const { data: users, isPending, isFetching } = useUsers();
  const deleteUser = useDeleteUser();

  if (isPending) return (
    <div className="aio-card">
      <div className="aio-card-header"><h3>Users</h3></div>
      <div className="aio-card-body">
        <div className="loading-state"><div className="spinner" /> Loading…</div>
      </div>
    </div>
  );

  return (
    <div className="aio-card">
      <div className="aio-card-header">
        <h3>
          Users{' '}
          <span style={{
            background: '#4f46e5', color: 'white',
            borderRadius: 999, padding: '0.1rem 0.45rem',
            fontSize: '0.72rem', fontWeight: 700, marginLeft: 4,
          }}>
            {users?.length ?? 0}
          </span>
        </h3>
        {isFetching && <div className="spinner" style={{ width: 14, height: 14 }} />}
      </div>
      <div style={{ overflow: 'auto', maxHeight: 400 }}>
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className={`clickable${selectedId === u.id ? ' selected' : ''}`}
                onClick={() => onSelect(u.id)}
              >
                <td>{u.name}</td>
                <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-danger btn-xs"
                    disabled={deleteUser.isPending}
                    onClick={() => { if (selectedId === u.id) onSelect(null); deleteUser.mutate(u.id); }}
                  >✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function AllInOnePage() {
  const [selectedId, setSelectedId]   = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [creating, setCreating]       = useState(false);
  const [activeTab, setActiveTab]     = useState('demo');

  const handleSelect = (id) => {
    setSelectedId(id === selectedId ? null : id);
    setEditingUser(null);
    setCreating(false);
  };

  const handleEdit = (user) => { setEditingUser(user); setCreating(false); };
  const handleCreate = () => { setCreating(true); setEditingUser(null); setSelectedId(null); };
  const handleDone = () => { setEditingUser(null); setCreating(false); };

  return (
    <div className="page">
      <div className="page-header">
        <span className="badge badge-joint">Joint Session</span>
        <h1>⚡ All In One — Full CRUD Demo</h1>
        <p>
          Everything combined in a single live app: <code>useQuery</code>, <code>useMutation</code>,
          cache invalidation, custom hooks, and real-time Devtools. Open the Devtools (bottom-right) to watch the cache.
        </p>
      </div>

      {/* Tab switch */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
        {[['demo', '🚀 Live Demo'], ['hooks', '🪝 Custom Hooks'], ['patterns', '📋 Conventions']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === id ? 700 : 500,
              color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === id ? 'var(--primary)' : 'transparent'}`,
              marginBottom: -2,
              fontFamily: 'inherit',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Demo Tab ── */}
      {activeTab === 'demo' && (
        <>
          <div className="insight" style={{ marginBottom: '1.25rem' }}>
            <strong>How to explore:</strong> Click a user to view detail. Use Edit to update. Use ✕ to delete.
            Click "+ New User" to create. Watch how the list auto-updates after every write.
            <strong> Check the React Query Devtools (bottom-right)</strong> to see each cache entry.
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button className="btn btn-success" onClick={handleCreate}>+ New User</button>
          </div>

          <div className="aio-layout">
            {/* Left: list */}
            <div>
              <UserList selectedId={selectedId} onSelect={handleSelect} />
            </div>

            {/* Right: detail / edit / create */}
            <div>
              {creating && <CreateUserForm onDone={handleDone} />}
              {editingUser && <EditUserForm user={editingUser} onDone={handleDone} />}
              {!creating && !editingUser && selectedId && (
                <UserDetail userId={selectedId} onClose={() => setSelectedId(null)} onEdit={handleEdit} />
              )}
              {!creating && !editingUser && !selectedId && (
                <div style={{
                  background: 'white', border: '1.5px dashed var(--border)',
                  borderRadius: 10, padding: '3rem',
                  textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem',
                }}>
                  ← Select a user to see their detail,<br />or click "+ New User" to add one.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Hooks Tab ── */}
      {activeTab === 'hooks' && (
        <>
          <div className="insight">
            These are the actual custom hooks powering this demo. They live in <code>src/hooks/queries/</code> and{' '}
            <code>src/hooks/mutations/</code> — components just import and call the hooks.
          </div>
          <h2 className="section-title">Query Hooks</h2>
          <CodeBlock code={`// src/hooks/queries/useUsers.js
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn:  api.getUsers,
    staleTime: 1000 * 30,
  });
}

// src/hooks/queries/useUser.js
export function useUser(id) {
  return useQuery({
    queryKey: ['users', id],
    queryFn:  () => api.getUserById(id),
    enabled:  !!id,          // only runs when id is truthy
    staleTime: 1000 * 30,
  });
}`} />
          <h2 className="section-title">Mutation Hooks</h2>
          <CodeBlock code={`// src/hooks/mutations/useCreateUser.js
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// src/hooks/mutations/useUpdateUser.js
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateUser(id, data),
    onSuccess: (updated) => {
      // invalidate the list
      qc.invalidateQueries({ queryKey: ['users'] });
      // immediately update the detail cache (no extra request!)
      qc.setQueryData(['users', updated.id], updated);
    },
  });
}

// src/hooks/mutations/useDeleteUser.js
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['users'] }),
  });
}`} />
          <h2 className="section-title">Validation</h2>
          <CodeBlock code={`// src/utils/validation.js
const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

export const validate = {
  name:  (v) => (!v || v.trim().length < 2) ? 'Name must be at least 2 characters' : null,
  email: (v) => (!v || !v.trim()) ? null
              : !EMAIL_REGEX.test(v.trim()) ? 'Invalid email format' : null,
};

export function validateUserForm({ name, email }) {
  return { name: validate.name(name), email: validate.email(email) };
}

// Usage in a form:
const handleSubmit = (e) => {
  e.preventDefault();
  const errs = validateUserForm({ name, email });
  if (hasErrors(errs)) { setErrors(errs); return; }
  createUser.mutate({ name, email, role, dept });
};`} />
          <h2 className="section-title">Hook Summary</h2>
          <div className="hook-list">
            {['useUsers()', 'useUser(id)', 'useCreateUser()', 'useUpdateUser()', 'useDeleteUser()'].map((h) => (
              <span key={h} className="hook-chip">{h}</span>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            5 hooks replace all fetching boilerplate. Components import only what they need.
          </p>
        </>
      )}

      {/* ── Patterns Tab ── */}
      {activeTab === 'patterns' && (
        <>
          <h2 className="section-title">Presentation Structure (30–40 min)</h2>
          <table className="conventions-table">
            <thead><tr><th>Segment</th><th>Who</th><th>Topic</th></tr></thead>
            <tbody>
              <tr><td>Intro</td><td>Group A</td><td>Current fetching pain points + server vs client state</td></tr>
              <tr><td>A2</td><td>Group A</td><td>useQuery demo with Devtools</td></tr>
              <tr><td>A3</td><td>Group A</td><td>Query keys, staleTime, list+detail caching</td></tr>
              <tr><td>B1</td><td>Group B</td><td>useMutation — create form with loading & error</td></tr>
              <tr><td>B2</td><td>Group B</td><td>Invalidation — auto-refreshing list after writes</td></tr>
              <tr><td>B3</td><td>Group B</td><td>Custom hooks + folder structure + team conventions</td></tr>
              <tr><td>Joint</td><td>All</td><td>Before/after diff of the real refactored screen</td></tr>
              <tr><td>Q&A</td><td>All</td><td>Next migration targets + future topics (infinite, suspense)</td></tr>
            </tbody>
          </table>

          <h2 className="section-title">Pre-Demo Checklist</h2>
          <div className="pitfalls-box">
            <h3>Run through 15 min before presenting:</h3>
            <ul>
              <li>Dev server running and all demo screens load without errors</li>
              <li>React Query Devtools panel opens and is visible on screen</li>
              <li>Browser DevTools Network tab accessible</li>
              <li>Test data seeded so lists aren't empty</li>
              <li>Old branch checked out in a second tab for before/after comparisons</li>
              <li>Each pair has agreed on who drives and who narrates</li>
            </ul>
          </div>

          <h2 className="section-title">Common Pitfalls to Warn the Team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="panel before-panel">
              <div className="panel-header"><span className="before-badge">Wrong</span><h3>Common mistakes</h3></div>
              <div className="panel-section">
                <CodeBlock code={`// ❌ Wrapping useQuery in useEffect
useEffect(() => {
  useQuery({ ... }); // hooks can't go here
}, []);

// ❌ Copying query data to useState
const { data } = useQuery({ ... });
useEffect(() => {
  setLocalState(data); // ← anti-pattern
}, [data]);

// ❌ Missing dep in queryKey
useQuery({
  queryKey: ['users'],       // ← forgot userId!
  queryFn: () => getUser(userId),
});`} />
              </div>
            </div>
            <div className="panel after-panel">
              <div className="panel-header"><span className="after-badge">Correct</span><h3>The right way</h3></div>
              <div className="panel-section">
                <CodeBlock code={`// ✅ useQuery at component top level
function MyComponent() {
  const { data } = useQuery({ ... });
}

// ✅ Read directly from useQuery
function MyComponent() {
  const { data } = useQuery({ ... });
  // use data directly — no useState needed
  return <div>{data?.name}</div>;
}

// ✅ queryKey includes every dep
useQuery({
  queryKey: ['users', userId], // ← included
  queryFn:  () => getUser(userId),
});`} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
