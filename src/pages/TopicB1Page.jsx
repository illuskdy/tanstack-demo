import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import CodeBlock from '../components/CodeBlock';
import { api } from '../mockApi';
import { validate } from '../utils/validation';

// ── Mutation state machine visualiser ────────────────
const MUTATION_STATES = [
  { key: 'idle',    label: 'idle',    color: '#9ca3af', bg: '#f9fafb' },
  { key: 'pending', label: 'pending', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'success', label: 'success', color: '#16a34a', bg: '#f0fdf4' },
  { key: 'error',   label: 'error',   color: '#dc2626', bg: '#fef2f2' },
];

function MutationStateBadge({ status }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {MUTATION_STATES.filter(s => s.key !== 'error' || status === 'error').map((s, i, arr) => (
        <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{
            padding: '0.15rem 0.55rem',
            borderRadius: 999,
            fontSize: '0.72rem',
            fontWeight: status === s.key ? 700 : 400,
            fontFamily: 'monospace',
            background: status === s.key ? s.bg : 'transparent',
            color: status === s.key ? s.color : '#d1d5db',
            border: `1.5px solid ${status === s.key ? s.color : '#e5e7eb'}`,
            transition: 'all 0.2s',
          }}>
            {status === s.key && '● '}{s.label}
          </span>
          {i < arr.length - 1 && (
            <span style={{ color: '#d1d5db', fontSize: '0.7rem' }}>→</span>
          )}
        </span>
      ))}
    </div>
  );
}

// ── Before: manual form state ─────────────────────────
function BeforeCreateForm() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  const [users,       setUsers]       = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listStale,   setListStale]   = useState(false);

  useEffect(() => {
    api.getUsers().then((data) => { setUsers(data); setListLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await api.createUser({ name, email });
      setSuccess(`Created: ${result.name} (id=${result.id})`);
      setName('');
      setEmail('');
      setListStale(true); // ← list is now out of date; we don't know to update it
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshList = () => {
    setListLoading(true);
    setListStale(false);
    api.getUsers().then((data) => { setUsers(data); setListLoading(false); });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alice Johnson" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alice@acme.com" />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" style={{ display: 'inline-block', marginRight: 6, width: 12, height: 12, borderWidth: 1.5 }} />Saving…</> : 'Create User'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setName(''); setEmail(''); setError(null); setSuccess(null); }}>
            ↺ Reset Form
          </button>
        </div>
        {error   && <div className="error-box"   style={{ marginTop: '0.5rem' }}>{error}</div>}
        {success && <div className="success-box" style={{ marginTop: '0.5rem' }}>{success}</div>}
      </form>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Users ({users.length})
          </div>
          <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }} onClick={refreshList}>
            ↻ Refresh List
          </button>
        </div>
        {listStale && (
          <div style={{ fontSize: '0.75rem', color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 5, padding: '0.35rem 0.65rem', marginBottom: '0.4rem' }}>
            ⚠️ List is stale — new user missing. You must refresh manually.
          </div>
        )}
        {listLoading ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading…</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {users.map((u) => (
              <li key={u.id} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 5, padding: '0.3rem 0.65rem' }}>
                <span style={{ fontWeight: 600, minWidth: 28, color: '#9ca3af' }}>#{u.id}</span>
                <span style={{ fontWeight: 600 }}>{u.name}</span>
                <span style={{ color: '#9ca3af' }}>{u.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── After: useMutation ───────────────────────────────
function AfterCreateForm() {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);

  const [users,       setUsers]       = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listStale,   setListStale]   = useState(false);

  useEffect(() => {
    api.getUsers().then((data) => { setUsers(data); setListLoading(false); });
  }, []);

  const validateEmail = (value) => {
    const err = validate.email(value);
    setEmailError(err);
    return err === null;
  };

  // useMutation manages the lifecycle of a single write operation (POST/PUT/DELETE).
  // It exposes `isPending`, `isError`, `isSuccess` states and a `mutate()` trigger.
  const createUser = useMutation({
    // mutationKey labels this mutation in DevTools. Not used for deduplication
    // the way queryKey is — mutations never share a cache entry.
    mutationKey: ['b1-createUser'],

    // mutationFn is called when `createUser.mutate(newUser)` fires (see handleSubmit).
    // It must return a promise; TanStack Query uses it to track pending/success/error state.
    mutationFn: (newUser) => api.createUser(newUser),

    // onSuccess fires after the API call resolves. Notice there is no
    // invalidateQueries call here — this is intentional for the B1 demo,
    // which shows the manual-refresh pattern instead of auto-invalidation.
    // The list must be refreshed by hand; setListStale signals that to the UI.
    onSuccess: () => {
      setName('');
      setEmail('');
      setEmailError(null);
      setListStale(true); // still stale — cache invalidation (B2) will fix this
    },
    // No onError handler here — createUser.isError / createUser.error can be
    // read directly in JSX instead of pushing state into separate useState calls.
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && !validateEmail(email)) return;
    createUser.mutate({ name, email });
  };

  const refreshList = () => {
    setListLoading(true);
    setListStale(false);
    api.getUsers().then((data) => { setUsers(data); setListLoading(false); });
  };

  return (
    <div>
      {/* Demo flow hints */}
      <div style={{ fontSize: '0.78rem', color: '#6b7280', background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 6, padding: '0.5rem 0.75rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>
        <strong style={{ color: '#374151' }}>Demo flow:</strong>
        {' '}1) Fill valid data → <em>Create User</em> → list stays stale (B2 fixes this).
        {' '}2) Leave Name empty or 1 char → submit → error shown in UI.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input className={`form-control${createUser.isError ? ' is-error' : ''}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Alice Johnson" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            className={`form-control${emailError ? ' is-error' : ''}`}
            value={email}
            onChange={(e) => { const val = e.target.value; setEmail(val); if (val) validateEmail(val); else setEmailError(null); }}
            placeholder="alice@acme.com"
          />
          {emailError && <span className="field-error">{emailError}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.4rem' }}>
          <button type="submit" className="btn btn-primary" disabled={createUser.isPending}>
            {createUser.isPending ? <><span className="spinner" style={{ display: 'inline-block', marginRight: 6, width: 12, height: 12, borderWidth: 1.5 }} />Saving…</> : 'Create User'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { createUser.reset(); setName(''); setEmail(''); setEmailError(null); setListStale(false); }}>
            ↺ Reset State
          </button>
        </div>
        <MutationStateBadge status={createUser.status} />
        {createUser.isError && (
          <div className="error-box" style={{ marginTop: '0.5rem' }}>{createUser.error.message}</div>
        )}
        {createUser.isSuccess && (
          <div className="success-box" style={{ marginTop: '0.5rem' }}>
            Created: {createUser.data.name} (id={createUser.data.id})
          </div>
        )}
      </form>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Users ({users.length})
          </div>
          <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }} onClick={refreshList}>
            ↻ Refresh List
          </button>
        </div>
        {listStale && (
          <div style={{ fontSize: '0.75rem', color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 5, padding: '0.35rem 0.65rem', marginBottom: '0.4rem' }}>
            ⚠️ Same stale problem — cache invalidation (B2) makes this automatic.
          </div>
        )}
        {listLoading ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading…</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {users.map((u) => (
              <li key={u.id} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 5, padding: '0.3rem 0.65rem' }}>
                <span style={{ fontWeight: 600, minWidth: 28, color: '#9ca3af' }}>#{u.id}</span>
                <span style={{ fontWeight: 600 }}>{u.name}</span>
                <span style={{ color: '#9ca3af' }}>{u.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Error demo: submit invalid data ──────────────────
function ErrorDemo() {
  const mut = useMutation({
    mutationFn: () => api.createUser({ name: '' }),  // always fails
  });
  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
        Try submitting empty name (will fail):
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-danger btn-sm" onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending ? 'Sending…' : 'Submit invalid data'}
        </button>
        {(mut.isError || mut.isSuccess) && (
          <button className="btn btn-ghost btn-sm" onClick={() => mut.reset()}>
            ↺ Reset
          </button>
        )}
      </div>
      {mut.isError && (
        <div className="error-box" style={{ marginTop: '0.5rem' }}>
          ❌ {mut.error.message}
        </div>
      )}
      {!mut.isIdle && !mut.isPending && !mut.isError && <div className="success-box" style={{ marginTop: '0.5rem' }}>✓ Success</div>}
    </div>
  );
}

export default function TopicB1Page() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="badge badge-group-b">Group B · Topic 1</span>
        <h1>useMutation Fundamentals</h1>
        <p>
          <code>useQuery</code> reads data. <code>useMutation</code> writes it. Same ergonomics —
          loading states, error handling, and success callbacks all built in.
        </p>
      </div>

      {/* Plain explanation */}
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '0.875rem 1.1rem', margin: '1.25rem 0', fontSize: '0.85rem' }}>
        <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.35rem' }}>💡 What useMutation does</strong>
        <p style={{ color: '#78350f', lineHeight: 1.7 }}>
          <code>useQuery</code> reads data from the server. <code>useMutation</code> sends data to the server — creating, updating, or deleting something.
          <strong> Without useMutation</strong>: you need 3 separate <code>useState</code> variables (loading, error, success) plus a <code>try/catch</code> block every time you submit a form.
          <strong> With useMutation</strong>: <code>isPending</code>, <code>isError</code>, and <code>isSuccess</code> are provided automatically — no manual state needed.
          You also get callback functions (<code>onSuccess</code>, <code>onError</code>) that run after the action finishes.
          The <strong>"Reset State"</strong> button calls <code>mutation.reset()</code>, which clears all the state back to idle so the form can be used again.
        </p>
      </div>

      {/* Comparison */}
      <h2 className="section-title">Before vs After — Create User Form</h2>
      <div className="comparison-grid">
        <div className="panel before-panel">
          <div className="panel-header">
            <span className="before-badge">Before</span>
            <h3>Manual async + try/catch state</h3>
          </div>

          {/* Before explanation */}
          <div className="panel-section" style={{ background: '#fff8f8' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              Submitting a form manually requires: a loading flag, an error state, a success state, and a try/catch/finally block.
              <strong> That's 3 useState declarations + try/catch just to handle one async action.</strong>
              Every form in your app repeats this exact pattern. The "Reset Form" button is manual cleanup code you have to write yourself.
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`function CreateUserForm() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await api.createUser(data);
      setSuccess(\`Created: \${result.name}\`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* inputs */}
      <button disabled={loading}>
        {loading ? 'Saving...' : 'Create'}
      </button>
      {error   && <p className="error">{error}</p>}
      {success && <p className="ok">{success}</p>}
    </form>
  );
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live Demo</div>
            <BeforeCreateForm />
          </div>
        </div>

        <div className="panel after-panel">
          <div className="panel-header">
            <span className="after-badge">After</span>
            <h3>useMutation — state & callbacks included</h3>
          </div>

          {/* After explanation */}
          <div className="panel-section" style={{ background: '#f0fdf4' }}>
            <div className="panel-label">What this means</div>
            <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
              <code>useMutation</code> gives you <code>isPending</code>, <code>isError</code>, <code>isSuccess</code>, and <code>error</code> automatically — no useState needed for those.
              You also get lifecycle callbacks (<code>onSuccess</code>, <code>onError</code>, <code>onSettled</code>) to run logic after the action.
              <strong> The "Reset State" button calls <code>mutation.reset()</code> — TanStack Query clears all state for you in one call.</strong>
              Watch the "Status" label change as you submit.
            </p>
          </div>

          <div className="panel-section">
            <div className="panel-label">Code</div>
            <CodeBlock code={`import { useMutation } from '@tanstack/react-query';

function CreateUserForm() {
  const createUser = useMutation({
    mutationFn: (newUser) =>
      api.createUser(newUser),

    onMutate: (variables) => {
      // called immediately when mutate() fires
      // use for optimistic updates
    },
    onSuccess: (data, variables, context) => {
      // called when mutationFn resolves
      console.log('Created:', data);
    },
    onError: (error, variables, context) => {
      // called when mutationFn throws
      console.error(error);
    },
    onSettled: (data, error) => {
      // called after success OR error
    },
  });

  return (
    <form onSubmit={e => {
      e.preventDefault();
      createUser.mutate({ name, email });
    }}>
      <button disabled={createUser.isPending}>
        {createUser.isPending
          ? 'Saving...'
          : 'Create User'}
      </button>
      {/* Reset back to idle state: */}
      <button onClick={() => createUser.reset()}>
        ↺ Reset State
      </button>
      {createUser.isError && (
        <p>{createUser.error.message}</p>
      )}
      {createUser.isSuccess && (
        <p>Created: {createUser.data.name}</p>
      )}
    </form>
  );
}`} />
          </div>
          <div className="demo-area">
            <div className="panel-label">Live Demo</div>
            <AfterCreateForm />
          </div>
        </div>
      </div>

      {/* Error demo */}
      <h2 className="section-title">Error State Demo</h2>
      <div className="insight">
        <strong>Important:</strong> Never show mutation errors in <code>console.error</code> only —
        always surface them in the UI. <code>isError</code> + <code>error.message</code> makes this trivial.
        Use <code>mutation.reset()</code> to clear the error so the user can try again.
      </div>

      <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 8, padding: '1rem', maxWidth: 400 }}>
        <ErrorDemo />
      </div>

      {/* mutate vs mutateAsync */}
      <h2 className="section-title">mutate vs mutateAsync</h2>
      <div className="comparison-grid">
        <div className="panel before-panel">
          <div className="panel-header">
            <span className="before-badge">mutate</span>
            <h3>Fire and forget (recommended)</h3>
          </div>
          <div className="panel-section">
            <CodeBlock code={`// Use mutate() for most cases.
// Errors are caught by onError callback.
// Does NOT return a promise.

const handleSubmit = () => {
  createUser.mutate(formData);
  // execution continues immediately
};`} />
          </div>
        </div>
        <div className="panel after-panel">
          <div className="panel-header">
            <span className="after-badge">mutateAsync</span>
            <h3>Awaitable (for sequential logic)</h3>
          </div>
          <div className="panel-section">
            <CodeBlock code={`// Use mutateAsync() when you need to
// chain operations or await the result.
// You must catch errors manually.

const handleSubmit = async () => {
  try {
    const user = await createUser
      .mutateAsync(formData);
    // user is the resolved value
    await navigateTo(\`/users/\${user.id}\`);
  } catch (err) {
    toast.error(err.message);
  }
};`} />
          </div>
        </div>
      </div>

      <div className="pitfalls-box">
        <h3>Note for the next demo</h3>
        <ul>
          <li>After creating a user, the list does NOT automatically refresh yet</li>
          <li>That's what cache invalidation fixes — Topic B2</li>
          <li>Without invalidation, the cache is stale and shows the old list</li>
        </ul>
      </div>
    </div>
  );
}