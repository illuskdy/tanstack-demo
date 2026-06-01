import { Link } from 'react-router-dom';

const sections = [
  {
    badge: 'badge-foundation',
    badgeLabel: 'Foundation',
    to: '/foundation',
    title: 'Foundation — React Hooks & Codebase',
    desc: 'useEffect deep-dive, custom hooks, and how to identify current fetching pain points.',
  },
  {
    badge: 'badge-group-a',
    badgeLabel: 'Group A · Topic 1',
    to: '/a1',
    title: 'A1 — Server State vs Client State',
    desc: 'Why TanStack Query exists, and the problems it solves over manual fetching.',
  },
  {
    badge: 'badge-group-a',
    badgeLabel: 'Group A · Topic 2',
    to: '/a2',
    title: 'A2 — useQuery Fundamentals',
    desc: 'QueryClient setup, the four core fields, and watching the Devtools in action.',
  },
  {
    badge: 'badge-group-a',
    badgeLabel: 'Group A · Topic 3',
    to: '/a3',
    title: 'A3 — Query Keys, Caching & Refetching',
    desc: 'staleTime vs gcTime, automatic refetch triggers, and dependent queries.',
  },
  {
    badge: 'badge-group-b',
    badgeLabel: 'Group B · Topic 1',
    to: '/b1',
    title: 'B1 — useMutation Fundamentals',
    desc: 'Writing data back to the server: mutationFn, callbacks, and loading/error states.',
  },
  {
    badge: 'badge-group-b',
    badgeLabel: 'Group B · Topic 2',
    to: '/b2',
    title: 'B2 — Cache Invalidation',
    desc: 'The glue between mutations and queries — auto-refreshing lists after writes.',
  },
  {
    badge: 'badge-group-b',
    badgeLabel: 'Group B · Topic 3',
    to: '/b3',
    title: 'B3 — Project Integration & Conventions',
    desc: 'Custom hook extraction, folder structure, and team-wide query key naming patterns.',
  },
  {
    badge: 'badge-joint',
    badgeLabel: 'Joint',
    to: '/all-in-one',
    title: '⚡ All In One — Full CRUD Demo',
    desc: 'Everything combined: queries, mutations, invalidation, and custom hooks in one live app.',
  },
];

export default function Home() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="badge badge-joint">Learning Plan</span>
        <h1>TanStack Query Showcase</h1>
        <p>
          A one-day intern discussion & team presentation guide. Each section shows the
          <strong> "before" approach</strong> side-by-side with the <strong>"after" TanStack Query approach</strong>,
          with live interactive demos throughout.
        </p>
      </div>

      <div className="insight">
        <strong>How to use this:</strong> Visit each section in order for the guided experience,
        or jump to any topic directly. Each page has live code + running demos — open the
        React Query Devtools (bottom-right corner) to see the cache in real time.
      </div>

      <div className="cards-grid">
        {sections.map((s) => (
          <Link key={s.to} to={s.to} className="card">
            <div className="card-badge">
              <span className={`badge ${s.badge}`}>{s.badgeLabel}</span>
            </div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </Link>
        ))}
      </div>

      <hr className="divider" />

      <div className="pitfalls-box">
        <h3>Common Pitfalls — warn the team</h3>
        <ul>
          <li>Don't wrap <code>useQuery</code> in a <code>useEffect</code> — it defeats the purpose.</li>
          <li>Don't copy query data into <code>useState</code> — read it directly from <code>useQuery</code>.</li>
          <li>Always include every <code>queryFn</code> dependency in the <code>queryKey</code> array.</li>
          <li>Invalidate after mutations, or stale data will appear in the UI.</li>
          <li>Keep the Devtools panel open while developing — it's the fastest way to debug cache behavior.</li>
        </ul>
      </div>
    </div>
  );
}
