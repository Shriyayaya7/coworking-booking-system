import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

function HomePage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/spaces", {
        params: {
          search: search || undefined,
          type: type || undefined,
          minCapacity: minCapacity || undefined,
          maxCapacity: maxCapacity || undefined,
          page,
          limit: 6,
        },
      });

      setSpaces(response.data.data.spaces);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load coworking spaces."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [page]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (page !== 1) {
      setPage(1);
    } else {
      fetchSpaces();
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="page-container">
          <div className="hero-content">
            <span className="hero-badge">
              ✦ Flexible workspace for modern teams
            </span>

            <h1>
              Find a workspace
              <br />
              that works for you.
            </h1>

            <p>
              Book desks and meeting rooms in just a few clicks.
              Find the right space, check availability, and get
              to work.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="page-container">
          <div className="search-card">
            <div className="search-card-header">
              <div>
                <h2>Find your workspace</h2>
                <p>
                  Search by space name, type, or capacity.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch}>
              <div className="search-grid">
                <div className="form-group search-field">
                  <label htmlFor="search">Search</label>

                  <input
                    id="search"
                    type="text"
                    placeholder="e.g. Premium Desk"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type</label>

                  <select
                    id="type"
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value)
                    }
                  >
                    <option value="">All Types</option>
                    <option value="desk">Desk</option>
                    <option value="meeting_room">
                      Meeting Room
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="minCapacity">
                    Min Capacity
                  </label>

                  <input
                    id="minCapacity"
                    type="number"
                    min="1"
                    placeholder="Any"
                    value={minCapacity}
                    onChange={(event) =>
                      setMinCapacity(event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxCapacity">
                    Max Capacity
                  </label>

                  <input
                    id="maxCapacity"
                    type="number"
                    min="1"
                    placeholder="Any"
                    value={maxCapacity}
                    onChange={(event) =>
                      setMaxCapacity(event.target.value)
                    }
                  />
                </div>

                <div className="search-button-wrapper">
                  <button
                    type="submit"
                    disabled={loading}
                    className="search-button"
                  >
                    {loading ? "Searching..." : "Search Spaces"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Spaces Section */}
      <section className="spaces-section">
        <div className="page-container">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">
                WORKSPACES
              </span>

              <h2>Explore our spaces</h2>

              <p>
                Choose a workspace that fits your needs.
              </p>
            </div>

            {pagination && (
              <span className="space-count">
                {pagination.total}{" "}
                {pagination.total === 1 ? "space" : "spaces"}
              </span>
            )}
          </div>

          {loading && (
            <div className="state-card">
              <div className="loading-spinner"></div>
              <p>Loading spaces...</p>
            </div>
          )}

          {!loading && error && (
            <div className="message message-error">
              {error}
            </div>
          )}

          {!loading && !error && spaces.length === 0 && (
            <div className="state-card">
              <div className="empty-icon">⌕</div>

              <h3>No spaces found</h3>

              <p>
                Try changing your search or filter options.
              </p>
            </div>
          )}

          {!loading && !error && spaces.length > 0 && (
            <div className="spaces-grid">
              {spaces.map((space) => (
                <article className="space-card" key={space._id}>
                  <div className="space-card-top">
                    <span
                      className={`space-type ${
                        space.type === "meeting_room"
                          ? "space-type-room"
                          : "space-type-desk"
                      }`}
                    >
                      {space.type === "meeting_room"
                        ? "Meeting Room"
                        : "Desk"}
                    </span>

                    <span className="availability-dot">
                      ● Available
                    </span>
                  </div>

                  <div className="space-card-icon">
                    {space.type === "meeting_room"
                      ? "▦"
                      : "▥"}
                  </div>

                  <h3>{space.name}</h3>

                  {space.description && (
                    <p className="space-description">
                      {space.description}
                    </p>
                  )}

                  <div className="space-meta">
                    <span>👤 {space.capacity} capacity</span>
                  </div>

                  {space.amenities?.length > 0 && (
                    <div className="amenities">
                      {space.amenities
                        .slice(0, 3)
                        .map((amenity) => (
                          <span key={amenity}>
                            {amenity}
                          </span>
                        ))}

                      {space.amenities.length > 3 && (
                        <span>
                          +{space.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    to={`/spaces/${space._id}`}
                    className="view-space-button"
                  >
                    View Space
                    <span>→</span>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="button-secondary"
                disabled={page === 1 || loading}
                onClick={() =>
                  setPage((current) => current - 1)
                }
              >
                ← Previous
              </button>

              <span>
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                className="button-secondary"
                disabled={
                  page === pagination.totalPages || loading
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default HomePage;