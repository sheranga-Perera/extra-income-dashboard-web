import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">Extra Income Dashboard</Link>
      <div className="navbar__links">
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            {/*
            <Link to="/register" className="button button--ghost">
                Create Admin
            </Link>
            */}
          </>
        ) : (
          <>
            <Link to="/">Ads</Link>
            <Link to="/admins">Admins</Link>
            <Link to="/config">Config</Link>
            <button className="button" type="button" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
