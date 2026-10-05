import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { createBooking } from "../services/bookingService";
import api from "../services/api";

const formatDateTime = (date) => {
  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function SpaceDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);
  const [availabilityError, setAvailabilityError] =
    useState("");

  const [bookingLoading, setBookingLoading] =
    useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] =
    useState("");

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/spaces/${id}`);

        setSpace(response.data.data.space);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load space details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSpace();
  }, [id]);

  const handleCheckAvailability = async (event) => {
    event.preventDefault();

    setAvailabilityError("");
    setBookingError("");

    if (!startTime || !endTime) {
      setAvailabilityError(
        "Please select both start and end time."
      );
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (end <= start) {
      setAvailabilityError(
        "End time must be after start time."
      );
      return;
    }

    if (start < now) {
      setAvailabilityError(
        "Start time cannot be in the past."
      );
      return;
    }

    try {
      setAvailabilityLoading(true);
      setAvailability(null);

      const response = await api.get(
        `/spaces/${id}/availability`,
        {
          params: {
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          },
        }
      );

      setAvailability(response.data.data);
    } catch (err) {
      setAvailabilityError(
        err.response?.data?.message ||
          "Failed to check availability."
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleBooking = async (event) => {
    event.preventDefault();

    setBookingError("");
    setBookingSuccess("");

    if (!user) {
      setBookingError(
        "Please login before booking a space."
      );
      return;
    }

    if (user.role !== "member") {
      setBookingError(
        "Only members can book a space."
      );
      return;
    }

    if (!startTime || !endTime) {
      setBookingError(
        "Please select both start and end time."
      );
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setBookingError(
        "End time must be after start time."
      );
      return;
    }

    if (start < new Date()) {
      setBookingError(
        "Booking start time cannot be in the past."
      );
      return;
    }

    try {
      setBookingLoading(true);

      await createBooking({
        spaceId: id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      setBookingSuccess(
        "Booking request created successfully. It is now pending approval."
      );

      const availabilityResponse = await api.get(
        `/spaces/${id}/availability`,
        {
          params: {
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          },
        }
      );

      setAvailability(
        availabilityResponse.data.data
      );
    } catch (err) {
      setBookingError(
        err.response?.data?.message ||
          "Failed to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="page-container">
        <div className="state-card">
          <div className="loading-spinner"></div>
          <p>Loading space details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <div className="message message-error">
          {error}
        </div>
      </main>
    );
  }

  if (!space) {
    return (
      <main className="page-container">
        <div className="state-card">
          <h3>Space not found</h3>
          <p>
            The workspace you're looking for doesn't
            exist or is no longer available.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      {/* Space Overview */}
      <section className="space-detail-hero card">
        <div className="space-detail-top">
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

        <div className="space-detail-content">
          <div className="space-detail-icon">
            {space.type === "meeting_room"
              ? "▦"
              : "▥"}
          </div>

          <div>
            <h1>{space.name}</h1>

            <p className="space-detail-description">
              {space.description ||
                "A comfortable workspace designed for productive work."}
            </p>

            <div className="space-detail-meta">
              <span>
                👤 {space.capacity}{" "}
                {space.capacity === 1
                  ? "person"
                  : "people"}
              </span>

              <span>
                {space.type === "meeting_room"
                  ? "Meeting Room"
                  : "Individual Desk"}
              </span>
            </div>
          </div>
        </div>

        {space.amenities?.length > 0 && (
          <div className="space-detail-amenities">
            <h2>Amenities</h2>

            <div className="amenities">
              {space.amenities.map((amenity) => (
                <span key={amenity}>{amenity}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Booking Area */}
      <div className="space-booking-layout">
        {/* Availability */}
        <section className="card">
          <div className="section-card-header">
            <span className="section-eyebrow">
              AVAILABILITY
            </span>

            <h2>Check Availability</h2>

            <p>
              Select a date and time to see whether this
              workspace is available.
            </p>
          </div>

          <form onSubmit={handleCheckAvailability}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">
                  Start Time
                </label>

                <input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">
                  End Time
                </label>

                <input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(event.target.value)
                  }
                />
              </div>
            </div>

            {availabilityError && (
              <div className="message message-error">
                {availabilityError}
              </div>
            )}

            <button
              type="submit"
              disabled={availabilityLoading}
            >
              {availabilityLoading
                ? "Checking..."
                : "Check Availability"}
            </button>
          </form>

          {availability && (
            <div className="availability-result">
              <div className="availability-range">
                <span>Selected range</span>

                <strong>
                  {formatDateTime(
                    availability.requestedRange
                      .startTime
                  )}{" "}
                  →{" "}
                  {formatDateTime(
                    availability.requestedRange
                      .endTime
                  )}
                </strong>
              </div>

              {availability.bookings.length === 0 &&
                availability.maintenance.length ===
                  0 && (
                  <div className="availability-success">
                    <div className="availability-status-icon">
                      ✓
                    </div>

                    <div>
                      <strong>Available</strong>

                      <p>
                        No bookings or maintenance
                        windows overlap this time.
                      </p>
                    </div>
                  </div>
                )}

              {availability.bookings.length > 0 && (
                <div className="availability-section">
                  <h3>Existing Bookings</h3>

                  {availability.bookings.map(
                    (booking) => (
                      <article
                        className="availability-item"
                        key={booking._id}
                      >
                        <div>
                          <strong>
                            {booking.status ===
                            "approved"
                              ? "Approved Booking"
                              : "Pending Booking"}
                          </strong>

                          <p>
                            {formatDateTime(
                              booking.startTime
                            )}{" "}
                            →{" "}
                            {formatDateTime(
                              booking.endTime
                            )}
                          </p>
                        </div>

                        <span
                          className={`badge badge-${booking.status}`}
                        >
                          {booking.status}
                        </span>
                      </article>
                    )
                  )}
                </div>
              )}

              {availability.maintenance.length > 0 && (
                <div className="availability-section">
                  <h3>Maintenance</h3>

                  {availability.maintenance.map(
                    (item) => (
                      <article
                        className="availability-item"
                        key={item._id}
                      >
                        <div>
                          <strong>
                            Maintenance
                          </strong>

                          <p>
                            {formatDateTime(
                              item.startTime
                            )}{" "}
                            →{" "}
                            {formatDateTime(
                              item.endTime
                            )}
                          </p>

                          {item.reason && (
                            <p>
                              Reason: {item.reason}
                            </p>
                          )}
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Booking */}
        <section className="card booking-action-card">
          <div className="section-card-header">
            <span className="section-eyebrow">
              BOOK THIS SPACE
            </span>

            <h2>Reserve your workspace</h2>

            <p>
              Select your preferred time above and
              submit a booking request.
            </p>
          </div>

          {!user && (
            <div className="message message-info">
              Please login before booking this space.
            </div>
          )}

          {user && user.role === "admin" && (
            <div className="message message-info">
              Admin accounts cannot create member
              bookings.
            </div>
          )}

          {user && user.role === "member" && (
            <form onSubmit={handleBooking}>
              <div className="booking-summary">
                <span>Selected time</span>

                <strong>
                  {startTime && endTime
                    ? `${formatDateTime(
                        startTime
                      )} → ${formatDateTime(endTime)}`
                    : "Select a start and end time above"}
                </strong>
              </div>

              {bookingError && (
                <div className="message message-error">
                  {bookingError}
                </div>
              )}

              {bookingSuccess && (
                <div className="message message-success">
                  {bookingSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  bookingLoading ||
                  !startTime ||
                  !endTime
                }
              >
                {bookingLoading
                  ? "Booking..."
                  : "Book This Space"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default SpaceDetailsPage;