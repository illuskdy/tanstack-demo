import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/',           label: 'Home'              },
  { to: '/foundation', label: 'Foundation'        },
  { to: '/a1',         label: 'A1 · Server State' },
  { to: '/a2',         label: 'A2 · useQuery'     },
  { to: '/a3',         label: 'A3 · Caching'      },
  { to: '/b1',         label: 'B1 · useMutation'  },
  { to: '/b2',         label: 'B2 · Invalidation' },
  { to: '/b3',         label: 'B3 · Conventions'  },
  { to: '/all-in-one', label: '⚡ All In One',  highlight: true },
];

export default function NavBar() {
  const { pathname } = useLocation();
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">TanStack Query Showcase</Link>
        <div className="nav-sep" />
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link${l.highlight ? ' highlight' : ''}${pathname === l.to ? ' active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
