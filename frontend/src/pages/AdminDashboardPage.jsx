import { useEffect, useMemo, useState } from "react";

import api from "../services/api";
import {
  createMaintenance,
  getMaintenance,
  deleteMaintenance,
} from "../services/maintenanceService";

function AdminDashboardPage() {
  // =============================
  // Booking state
  // =============================

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] =
    useState("all");

  // =============================
  // Space state
  // =============================

  const [spaces, setSpaces] = useState([]);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [spacesError, setSpacesError] = useState("");

  // =============================
  // Create space state
  // =============================

  const [spaceName, setSpaceName] = useState("");
  const [spaceType, setSpaceType] = useState("desk");
  const [spaceDescription, setSpaceDescription] =
    useState("");
  const [spaceCapacity, setSpaceCapacity] = useState("");
  const [spaceAmenities, setSpaceAmenities] = useState("");

  const [createSpaceLoading, setCreateSpaceLoading] =
    useState(false);
  const [createSpaceError, setCreateSpaceError] =
    useState("");
  const [createSpaceSuccess, setCreateSpaceSuccess] =
    useState("");

  // =============================
  // Edit space state
  // =============================

  const [editingSpaceId, setEditingSpaceId] =
    useState(null);

  const [editSpaceName, setEditSpaceName] = useState("");
  const [editSpaceType, setEditSpaceType] =
    useState("desk");
  const [editSpaceDescription, setEditSpaceDescription] =
    useState("");
  const [editSpaceCapacity, setEditSpaceCapacity] =
    useState("");
  const [editSpaceAmenities, setEditSpaceAmenities] =
    useState("");

  const [editSpaceLoading, setEditSpaceLoading] =
    useState(false);
  const [editSpaceError, setEditSpaceError] = useState("");
  const [editSpaceSuccess, setEditSpaceSuccess] =
    useState("");

  // =============================
  // Space deactivate state
  // =============================

  const [spaceActionLoadingId, setSpaceActionLoadingId] =
    useState(null);
  const [spaceActionError, setSpaceActionError] =
    useState("");

  // =============================
  // Maintenance state
  // =============================

  const [maintenanceSpaceId, setMaintenanceSpaceId] =
    useState("");

  const [maintenanceStartTime, setMaintenanceStartTime] =
    useState("");

  const [maintenanceEndTime, setMaintenanceEndTime] =
    useState("");

  const [maintenanceReason, setMaintenanceReason] =
    useState("");

  const [maintenanceLoading, setMaintenanceLoading] =
    useState(false);

  const [maintenanceError, setMaintenanceError] =
    useState("");

  const [maintenanceSuccess, setMaintenanceSuccess] =
    useState("");

  const [maintenanceWindows, setMaintenanceWindows] =
    useState([]);

  const [maintenanceListLoading, setMaintenanceListLoading] =
    useState(true);

  const [maintenanceListError, setMaintenanceListError] =
    useState("");

  const [
    maintenanceDeleteLoadingId,
    setMaintenanceDeleteLoadingId,
  ] = useState(null);

  // =============================
  // Fetch bookings
  // =============================

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings");

      setBookings(response.data.data.bookings);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Fetch spaces
  // =============================

  const fetchSpaces = async () => {
    try {
      setSpacesLoading(true);
      setSpacesError("");

      const response = await api.get("/spaces");

      setSpaces(response.data.data.spaces);
    } catch (err) {
      setSpacesError(
        err.response?.data?.message ||
          "Failed to load spaces."
      );
    } finally {
      setSpacesLoading(false);
    }
  };

  // =============================
  // Fetch maintenance
  // =============================

  const fetchMaintenance = async () => {
    try {
      setMaintenanceListLoading(true);
      setMaintenanceListError("");

      const response = await getMaintenance();

      setMaintenanceWindows(response.data.maintenance);
    } catch (err) {
      setMaintenanceListError(
        err.response?.data?.message ||
          "Failed to load maintenance windows."
      );
    } finally {
      setMaintenanceListLoading(false);
    }
  };

  // =============================
  // Create space
  // =============================

  const handleCreateSpace = async (event) => {
    event.preventDefault();

    try {
      setCreateSpaceLoading(true);
      setCreateSpaceError("");
      setCreateSpaceSuccess("");

      const amenities = spaceAmenities
        .split(",")
        .map((amenity) => amenity.trim())
        .filter(Boolean);

      await api.post("/spaces", {
        name: spaceName,
        type: spaceType,
        description: spaceDescription,
        capacity: Number(spaceCapacity),
        amenities,
      });

      setCreateSpaceSuccess(
        "Space created successfully."
      );

      setSpaceName("");
      setSpaceType("desk");
      setSpaceDescription("");
      setSpaceCapacity("");
      setSpaceAmenities("");

      await fetchSpaces();
    } catch (err) {
      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors?.length > 0) {
        setCreateSpaceError(
          validationErrors[0].message
        );
      } else {
        setCreateSpaceError(
          err.response?.data?.message ||
            "Failed to create space."
        );
      }
    } finally {
      setCreateSpaceLoading(false);
    }
  };

  // =============================
  // Start editing space
  // =============================

  const handleEditClick = (space) => {
    setEditingSpaceId(space._id);

    setEditSpaceName(space.name);
    setEditSpaceType(space.type);
    setEditSpaceDescription(
      space.description || ""
    );
    setEditSpaceCapacity(space.capacity);
    setEditSpaceAmenities(
      space.amenities?.join(", ") || ""
    );

    setEditSpaceError("");
    setEditSpaceSuccess("");
  };

  // =============================
  // Cancel editing
  // =============================

  const handleCancelEdit = () => {
    setEditingSpaceId(null);

    setEditSpaceName("");
    setEditSpaceType("desk");
    setEditSpaceDescription("");
    setEditSpaceCapacity("");
    setEditSpaceAmenities("");

    setEditSpaceError("");
    setEditSpaceSuccess("");
  };

  // =============================
  // Update space
  // =============================

  const handleUpdateSpace = async (event) => {
    event.preventDefault();

    try {
      setEditSpaceLoading(true);
      setEditSpaceError("");
      setEditSpaceSuccess("");

      const amenities = editSpaceAmenities
        .split(",")
        .map((amenity) => amenity.trim())
        .filter(Boolean);

      await api.patch(
        `/spaces/${editingSpaceId}`,
        {
          name: editSpaceName,
          type: editSpaceType,
          description: editSpaceDescription,
          capacity: Number(editSpaceCapacity),
          amenities,
        }
      );

      setEditSpaceSuccess(
        "Space updated successfully."
      );

      await fetchSpaces();

      setEditingSpaceId(null);
    } catch (err) {
      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors?.length > 0) {
        setEditSpaceError(
          validationErrors[0].message
        );
      } else {
        setEditSpaceError(
          err.response?.data?.message ||
            "Failed to update space."
        );
      }
    } finally {
      setEditSpaceLoading(false);
    }
  };

  // =============================
  // Deactivate space
  // =============================

  const handleDeactivateSpace = async (space) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${space.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSpaceActionLoadingId(space._id);
      setSpaceActionError("");

      await api.delete(`/spaces/${space._id}`);

      await fetchSpaces();
    } catch (err) {
      setSpaceActionError(
        err.response?.data?.message ||
          "Failed to deactivate space."
      );
    } finally {
      setSpaceActionLoadingId(null);
    }
  };

  // =============================
  // Create maintenance
  // =============================

  const handleCreateMaintenance = async (event) => {
    event.preventDefault();

    setMaintenanceError("");
    setMaintenanceSuccess("");

    if (!maintenanceSpaceId) {
      setMaintenanceError(
        "Please select a space."
      );
      return;
    }

    if (
      !maintenanceStartTime ||
      !maintenanceEndTime
    ) {
      setMaintenanceError(
        "Please select both start and end time."
      );
      return;
    }

    const start = new Date(
      maintenanceStartTime
    );

    const end = new Date(
      maintenanceEndTime
    );

    if (end <= start) {
      setMaintenanceError(
        "End time must be after start time."
      );
      return;
    }

    try {
      setMaintenanceLoading(true);

      await createMaintenance({
        spaceId: maintenanceSpaceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        reason: maintenanceReason,
      });

      setMaintenanceSuccess(
        "Maintenance window created successfully."
      );

      setMaintenanceSpaceId("");
      setMaintenanceStartTime("");
      setMaintenanceEndTime("");
      setMaintenanceReason("");

      await fetchMaintenance();
    } catch (err) {
      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors?.length > 0) {
        setMaintenanceError(
          validationErrors[0].message
        );
      } else {
        setMaintenanceError(
          err.response?.data?.message ||
            "Failed to create maintenance window."
        );
      }
    } finally {
      setMaintenanceLoading(false);
    }
  };

  // =============================
  // Delete maintenance
  // =============================

  const handleDeleteMaintenance = async (
    maintenanceId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance window?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMaintenanceDeleteLoadingId(
        maintenanceId
      );
      setMaintenanceListError("");

      await deleteMaintenance(maintenanceId);

      await fetchMaintenance();
    } catch (err) {
      setMaintenanceListError(
        err.response?.data?.message ||
          "Failed to delete maintenance window."
      );
    } finally {
      setMaintenanceDeleteLoadingId(null);
    }
  };

  // =============================
  // Approve booking
  // =============================

  const handleApprove = async (bookingId) => {
    try {
      setActionLoadingId(bookingId);
      setActionError("");

      await api.patch(
        `/bookings/${bookingId}/approve`
      );

      await fetchBookings();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Failed to approve booking."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =============================
  // Reject booking
  // =============================

  const handleReject = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(bookingId);
      setActionError("");

      await api.patch(
        `/bookings/${bookingId}/reject`,
        {
          reason: "Rejected by admin",
        }
      );

      await fetchBookings();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Failed to reject booking."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =============================
  // Initial data loading
  // =============================

  useEffect(() => {
    fetchBookings();
    fetchSpaces();
    fetchMaintenance();
  }, []);

  // =============================
  // Booking filters
  // =============================

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search = bookingSearch
        .trim()
        .toLowerCase();

      const matchesSearch =
        !search ||
        booking.space?.name
          ?.toLowerCase()
          .includes(search) ||
        booking.member?.name
          ?.toLowerCase()
          .includes(search) ||
        booking.member?.email
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        bookingStatusFilter === "all" ||
        booking.status === bookingStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    bookings,
    bookingSearch,
    bookingStatusFilter,
  ]);

  // =============================
  // Dashboard statistics
  // =============================

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const approvedBookings = bookings.filter(
    (booking) => booking.status === "approved"
  ).length;

  const activeSpaces = spaces.filter(
    (space) => space.isActive
  ).length;

  const maintenanceCount =
    maintenanceWindows.length;

  return (
    <main className="admin-page">
      <div className="page-container">
        {/* =============================
            Header
        ============================= */}

        <div className="admin-page-header">
          <div>
            <span className="section-eyebrow">
              ADMIN AREA
            </span>

            <h1>Admin Dashboard</h1>

            <p>
              Manage workspaces, bookings, and
              maintenance windows from one place.
            </p>
          </div>
        </div>

        {/* =============================
            Statistics
        ============================= */}

        <section className="admin-stats">
          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              ▥
            </div>

            <div>
              <span>Active Spaces</span>
              <strong>{activeSpaces}</strong>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              ◷
            </div>

            <div>
              <span>Pending Bookings</span>
              <strong>{pendingBookings}</strong>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              ✓
            </div>

            <div>
              <span>Approved Bookings</span>
              <strong>{approvedBookings}</strong>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              ⚙
            </div>

            <div>
              <span>Maintenance</span>
              <strong>{maintenanceCount}</strong>
            </div>
          </article>
        </section>

        {/* =============================
            Manage Spaces
        ============================= */}

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <span className="section-eyebrow">
                WORKSPACES
              </span>

              <h2>Manage Spaces</h2>

              <p>
                Create and manage desks and meeting
                rooms available for members.
              </p>
            </div>
          </div>

          <div className="admin-space-layout">
            {/* Create Space */}

            <section className="card admin-form-card">
              <div className="section-card-header">
                <span className="section-eyebrow">
                  NEW SPACE
                </span>

                <h2>Add a workspace</h2>

                <p>
                  Create a new desk or meeting room.
                </p>
              </div>

              {createSpaceError && (
                <div className="message message-error">
                  {createSpaceError}
                </div>
              )}

              {createSpaceSuccess && (
                <div className="message message-success">
                  {createSpaceSuccess}
                </div>
              )}

              <form
                onSubmit={handleCreateSpace}
                className="admin-form"
              >
                <div className="form-group">
                  <label htmlFor="spaceName">
                    Name
                  </label>

                  <input
                    id="spaceName"
                    type="text"
                    value={spaceName}
                    onChange={(event) =>
                      setSpaceName(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Premium Desk 01"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="spaceType">
                      Type
                    </label>

                    <select
                      id="spaceType"
                      value={spaceType}
                      onChange={(event) =>
                        setSpaceType(
                          event.target.value
                        )
                      }
                    >
                      <option value="desk">
                        Desk
                      </option>

                      <option value="meeting_room">
                        Meeting Room
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="spaceCapacity">
                      Capacity
                    </label>

                    <input
                      id="spaceCapacity"
                      type="number"
                      min="1"
                      value={spaceCapacity}
                      onChange={(event) =>
                        setSpaceCapacity(
                          event.target.value
                        )
                      }
                      placeholder="e.g. 4"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="spaceDescription">
                    Description
                  </label>

                  <textarea
                    id="spaceDescription"
                    value={spaceDescription}
                    onChange={(event) =>
                      setSpaceDescription(
                        event.target.value
                      )
                    }
                    placeholder="Describe the workspace"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="spaceAmenities">
                    Amenities
                  </label>

                  <input
                    id="spaceAmenities"
                    type="text"
                    value={spaceAmenities}
                    onChange={(event) =>
                      setSpaceAmenities(
                        event.target.value
                      )
                    }
                    placeholder="WiFi, Power Outlet, TV"
                  />

                  <span className="form-help">
                    Separate amenities with commas.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={createSpaceLoading}
                >
                  {createSpaceLoading
                    ? "Creating..."
                    : "Create Space"}
                </button>
              </form>
            </section>

            {/* Existing Spaces */}

            <section className="card admin-list-card">
              <div className="section-card-header">
                <span className="section-eyebrow">
                  EXISTING SPACES
                </span>

                <h2>Workspace list</h2>

                <p>
                  View and update your current
                  workspaces.
                </p>
              </div>

              {spaceActionError && (
                <div className="message message-error">
                  {spaceActionError}
                </div>
              )}

              {spacesLoading && (
                <div className="admin-inline-state">
                  <div className="loading-spinner"></div>
                  <p>Loading spaces...</p>
                </div>
              )}

              {!spacesLoading && spacesError && (
                <div className="message message-error">
                  {spacesError}
                </div>
              )}

              {!spacesLoading &&
                !spacesError &&
                spaces.length === 0 && (
                  <div className="admin-empty-state">
                    <div className="empty-icon">
                      ▥
                    </div>

                    <h3>No spaces yet</h3>

                    <p>
                      Create your first workspace
                      using the form.
                    </p>
                  </div>
                )}

              {!spacesLoading &&
                !spacesError &&
                spaces.length > 0 && (
                  <div className="admin-space-list">
                    {spaces.map((space) => (
                      <article
                        className="admin-space-card"
                        key={space._id}
                      >
                        {editingSpaceId ===
                        space._id ? (
                          <form
                            onSubmit={
                              handleUpdateSpace
                            }
                            className="admin-edit-form"
                          >
                            <div className="admin-edit-header">
                              <div>
                                <span className="booking-label">
                                  EDIT SPACE
                                </span>

                                <h3>
                                  {space.name}
                                </h3>
                              </div>
                            </div>

                            {editSpaceError && (
                              <div className="message message-error">
                                {editSpaceError}
                              </div>
                            )}

                            {editSpaceSuccess && (
                              <div className="message message-success">
                                {editSpaceSuccess}
                              </div>
                            )}

                            <div className="form-group">
                              <label
                                htmlFor={`edit-name-${space._id}`}
                              >
                                Name
                              </label>

                              <input
                                id={`edit-name-${space._id}`}
                                type="text"
                                value={
                                  editSpaceName
                                }
                                onChange={(event) =>
                                  setEditSpaceName(
                                    event.target.value
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label
                                  htmlFor={`edit-type-${space._id}`}
                                >
                                  Type
                                </label>

                                <select
                                  id={`edit-type-${space._id}`}
                                  value={
                                    editSpaceType
                                  }
                                  onChange={(event) =>
                                    setEditSpaceType(
                                      event.target.value
                                    )
                                  }
                                >
                                  <option value="desk">
                                    Desk
                                  </option>

                                  <option value="meeting_room">
                                    Meeting Room
                                  </option>
                                </select>
                              </div>

                              <div className="form-group">
                                <label
                                  htmlFor={`edit-capacity-${space._id}`}
                                >
                                  Capacity
                                </label>

                                <input
                                  id={`edit-capacity-${space._id}`}
                                  type="number"
                                  min="1"
                                  value={
                                    editSpaceCapacity
                                  }
                                  onChange={(event) =>
                                    setEditSpaceCapacity(
                                      event.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <label
                                htmlFor={`edit-description-${space._id}`}
                              >
                                Description
                              </label>

                              <textarea
                                id={`edit-description-${space._id}`}
                                value={
                                  editSpaceDescription
                                }
                                onChange={(event) =>
                                  setEditSpaceDescription(
                                    event.target.value
                                  )
                                }
                                rows="3"
                              />
                            </div>

                            <div className="form-group">
                              <label
                                htmlFor={`edit-amenities-${space._id}`}
                              >
                                Amenities
                              </label>

                              <input
                                id={`edit-amenities-${space._id}`}
                                type="text"
                                value={
                                  editSpaceAmenities
                                }
                                onChange={(event) =>
                                  setEditSpaceAmenities(
                                    event.target.value
                                  )
                                }
                                placeholder="WiFi, TV, Whiteboard"
                              />
                            </div>

                            <div className="admin-edit-actions">
                              <button
                                type="submit"
                                disabled={
                                  editSpaceLoading
                                }
                              >
                                {editSpaceLoading
                                  ? "Saving..."
                                  : "Save Changes"}
                              </button>

                              <button
                                type="button"
                                className="button-secondary"
                                onClick={
                                  handleCancelEdit
                                }
                                disabled={
                                  editSpaceLoading
                                }
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="admin-space-card-header">
                              <div>
                                <span
                                  className={`space-type ${
                                    space.type ===
                                    "meeting_room"
                                      ? "space-type-room"
                                      : "space-type-desk"
                                  }`}
                                >
                                  {space.type ===
                                  "meeting_room"
                                    ? "Meeting Room"
                                    : "Desk"}
                                </span>

                                <h3>
                                  {space.name}
                                </h3>
                              </div>

                              <span
                                className={
                                  space.isActive
                                    ? "admin-status-active"
                                    : "admin-status-inactive"
                                }
                              >
                                {space.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>

                            {space.description && (
                              <p className="admin-space-description">
                                {space.description}
                              </p>
                            )}

                            <div className="admin-space-meta">
                              <span>
                                👤{" "}
                                {space.capacity}{" "}
                                {space.capacity ===
                                1
                                  ? "person"
                                  : "people"}
                              </span>
                            </div>

                            {space.amenities
                              ?.length > 0 && (
                              <div className="amenities">
                                {space.amenities.map(
                                  (amenity) => (
                                    <span
                                      key={amenity}
                                    >
                                      {amenity}
                                    </span>
                                  )
                                )}
                              </div>
                            )}

                            <div className="admin-card-actions">
                              <button
                                type="button"
                                className="button-secondary"
                                onClick={() =>
                                  handleEditClick(
                                    space
                                  )
                                }
                              >
                                Edit Space
                              </button>

                              {space.isActive && (
                                <button
                                  type="button"
                                  className="button-danger"
                                  onClick={() =>
                                    handleDeactivateSpace(
                                      space
                                    )
                                  }
                                  disabled={
                                    spaceActionLoadingId ===
                                    space._id
                                  }
                                >
                                  {spaceActionLoadingId ===
                                  space._id
                                    ? "Deactivating..."
                                    : "Deactivate"}
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </article>
                    ))}
                  </div>
                )}
            </section>
          </div>
        </section>

        {/* =============================
            Maintenance
        ============================= */}

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <span className="section-eyebrow">
                MAINTENANCE
              </span>

              <h2>Maintenance Windows</h2>

              <p>
                Temporarily block workspaces when they
                are unavailable for maintenance.
              </p>
            </div>
          </div>

          <div className="admin-maintenance-layout">
            {/* Create maintenance */}

            <section className="card admin-form-card">
              <div className="section-card-header">
                <span className="section-eyebrow">
                  BLOCK TIME
                </span>

                <h2>Schedule maintenance</h2>

                <p>
                  Create a maintenance window for a
                  workspace.
                </p>
              </div>

              {maintenanceError && (
                <div className="message message-error">
                  {maintenanceError}
                </div>
              )}

              {maintenanceSuccess && (
                <div className="message message-success">
                  {maintenanceSuccess}
                </div>
              )}

              <form
                onSubmit={handleCreateMaintenance}
                className="admin-form"
              >
                <div className="form-group">
                  <label htmlFor="maintenanceSpace">
                    Space
                  </label>

                  <select
                    id="maintenanceSpace"
                    value={maintenanceSpaceId}
                    onChange={(event) =>
                      setMaintenanceSpaceId(
                        event.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Select a space
                    </option>

                    {spaces
                      .filter(
                        (space) => space.isActive
                      )
                      .map((space) => (
                        <option
                          key={space._id}
                          value={space._id}
                        >
                          {space.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="maintenanceStartTime">
                    Start Time
                  </label>

                  <input
                    id="maintenanceStartTime"
                    type="datetime-local"
                    value={
                      maintenanceStartTime
                    }
                    onChange={(event) =>
                      setMaintenanceStartTime(
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maintenanceEndTime">
                    End Time
                  </label>

                  <input
                    id="maintenanceEndTime"
                    type="datetime-local"
                    value={
                      maintenanceEndTime
                    }
                    onChange={(event) =>
                      setMaintenanceEndTime(
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maintenanceReason">
                    Reason
                  </label>

                  <input
                    id="maintenanceReason"
                    type="text"
                    value={maintenanceReason}
                    onChange={(event) =>
                      setMaintenanceReason(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Electrical maintenance"
                  />
                </div>

                <button
                  type="submit"
                  disabled={maintenanceLoading}
                >
                  {maintenanceLoading
                    ? "Creating..."
                    : "Create Maintenance Window"}
                </button>
              </form>
            </section>

            {/* Existing maintenance */}

            <section className="card admin-list-card">
              <div className="section-card-header">
                <span className="section-eyebrow">
                  SCHEDULED
                </span>

                <h2>Current maintenance</h2>

                <p>
                  Manage existing maintenance
                  windows.
                </p>
              </div>

              {maintenanceListLoading && (
                <div className="admin-inline-state">
                  <div className="loading-spinner"></div>
                  <p>
                    Loading maintenance windows...
                  </p>
                </div>
              )}

              {!maintenanceListLoading &&
                maintenanceListError && (
                  <div className="message message-error">
                    {maintenanceListError}
                  </div>
                )}

              {!maintenanceListLoading &&
                !maintenanceListError &&
                maintenanceWindows.length === 0 && (
                  <div className="admin-empty-state">
                    <div className="empty-icon">
                      ⚙
                    </div>

                    <h3>
                      No maintenance windows
                    </h3>

                    <p>
                      Scheduled maintenance will
                      appear here.
                    </p>
                  </div>
                )}

              {!maintenanceListLoading &&
                !maintenanceListError &&
                maintenanceWindows.length > 0 && (
                  <div className="maintenance-list">
                    {maintenanceWindows.map(
                      (maintenance) => (
                        <article
                          className="maintenance-card"
                          key={maintenance._id}
                        >
                          <div className="maintenance-card-header">
                            <div>
                              <span className="booking-label">
                                MAINTENANCE
                              </span>

                              <h3>
                                {maintenance.space
                                  ?.name ||
                                  "Space"}
                              </h3>
                            </div>

                            <span className="admin-status-maintenance">
                              Scheduled
                            </span>
                          </div>

                          <div className="maintenance-details">
                            <div>
                              <span>
                                Start
                              </span>

                              <strong>
                                {new Date(
                                  maintenance.startTime
                                ).toLocaleString(
                                  [],
                                  {
                                    dateStyle:
                                      "medium",
                                    timeStyle:
                                      "short",
                                  }
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                End
                              </span>

                              <strong>
                                {new Date(
                                  maintenance.endTime
                                ).toLocaleString(
                                  [],
                                  {
                                    dateStyle:
                                      "medium",
                                    timeStyle:
                                      "short",
                                  }
                                )}
                              </strong>
                            </div>
                          </div>

                          {maintenance.reason && (
                            <p className="maintenance-reason">
                              {maintenance.reason}
                            </p>
                          )}

                          <div className="admin-card-actions">
                            <button
                              type="button"
                              className="button-danger"
                              onClick={() =>
                                handleDeleteMaintenance(
                                  maintenance._id
                                )
                              }
                              disabled={
                                maintenanceDeleteLoadingId ===
                                maintenance._id
                              }
                            >
                              {maintenanceDeleteLoadingId ===
                              maintenance._id
                                ? "Deleting..."
                                : "Delete Maintenance"}
                            </button>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}
            </section>
          </div>
        </section>

        {/* =============================
            Bookings
        ============================= */}

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <span className="section-eyebrow">
                BOOKINGS
              </span>

              <h2>Booking Management</h2>

              <p>
                Review and manage member workspace
                booking requests.
              </p>
            </div>
          </div>

          <section className="card admin-bookings-card">
            <div className="booking-filters">
              <div className="form-group">
                <label htmlFor="bookingSearch">
                  Search bookings
                </label>

                <input
                  id="bookingSearch"
                  type="text"
                  value={bookingSearch}
                  onChange={(event) =>
                    setBookingSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by member, email, or space"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookingStatus">
                  Status
                </label>

                <select
                  id="bookingStatus"
                  value={bookingStatusFilter}
                  onChange={(event) =>
                    setBookingStatusFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All statuses
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>

            {actionError && (
              <div className="message message-error">
                {actionError}
              </div>
            )}

            {loading && (
              <div className="admin-inline-state">
                <div className="loading-spinner"></div>
                <p>Loading bookings...</p>
              </div>
            )}

            {!loading && error && (
              <div className="message message-error">
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              filteredBookings.length === 0 && (
                <div className="admin-empty-state">
                  <div className="empty-icon">
                    ▣
                  </div>

                  <h3>No bookings found</h3>

                  <p>
                    Try changing your search or
                    status filter.
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              filteredBookings.length > 0 && (
                <div className="admin-booking-list">
                  {filteredBookings.map(
                    (booking) => (
                      <article
                        className="admin-booking-card"
                        key={booking._id}
                      >
                        <div className="admin-booking-header">
                          <div>
                            <span className="booking-label">
                              WORKSPACE BOOKING
                            </span>

                            <h3>
                              {booking.space
                                ?.name ||
                                "Space"}
                            </h3>
                          </div>

                          <span
                            className={`badge badge-${booking.status}`}
                          >
                            {booking.status ===
                              "pending" &&
                              "Pending"}

                            {booking.status ===
                              "approved" &&
                              "Approved"}

                            {booking.status ===
                              "rejected" &&
                              "Rejected"}

                            {booking.status ===
                              "cancelled" &&
                              "Cancelled"}
                          </span>
                        </div>

                        <div className="admin-booking-member">
                          <div className="admin-member-avatar">
                            {booking.member?.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "M"}
                          </div>

                          <div>
                            <strong>
                              {booking.member
                                ?.name ||
                                "Unknown member"}
                            </strong>

                            <span>
                              {booking.member
                                ?.email ||
                                "Unknown email"}
                            </span>
                          </div>
                        </div>

                        <div className="admin-booking-details">
                          <div>
                            <span>
                              Start
                            </span>

                            <strong>
                              {new Date(
                                booking.startTime
                              ).toLocaleString(
                                [],
                                {
                                  dateStyle:
                                    "medium",
                                  timeStyle:
                                    "short",
                                }
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              End
                            </span>

                            <strong>
                              {new Date(
                                booking.endTime
                              ).toLocaleString(
                                [],
                                {
                                  dateStyle:
                                    "medium",
                                  timeStyle:
                                    "short",
                                }
                              )}
                            </strong>
                          </div>
                        </div>

                        {booking.status ===
                          "pending" && (
                          <div className="admin-card-actions">
                            <button
                              type="button"
                              onClick={() =>
                                handleApprove(
                                  booking._id
                                )
                              }
                              disabled={
                                actionLoadingId ===
                                booking._id
                              }
                            >
                              {actionLoadingId ===
                              booking._id
                                ? "Processing..."
                                : "Approve Booking"}
                            </button>

                            <button
                              type="button"
                              className="button-danger"
                              onClick={() =>
                                handleReject(
                                  booking._id
                                )
                              }
                              disabled={
                                actionLoadingId ===
                                booking._id
                              }
                            >
                              {actionLoadingId ===
                              booking._id
                                ? "Processing..."
                                : "Reject"}
                            </button>
                          </div>
                        )}
                      </article>
                    )
                  )}
                </div>
              )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboardPage;