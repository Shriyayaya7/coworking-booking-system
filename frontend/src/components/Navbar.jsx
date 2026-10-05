import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-mark">W</span>
          <span>Workspace</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            Spaces
          </Link>

          {!user && (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>

              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </>
          )}

          {user && user.role === "member" && (
            <Link to="/dashboard" className="navbar-link">
              My Bookings
            </Link>
          )}

          {user && user.role === "admin" && (
            <Link to="/admin" className="navbar-link">
              Admin Dashboard
            </Link>
          )}

          {user && (
            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;