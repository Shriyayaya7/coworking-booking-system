import { useEffect, useState } from "react";

import {
  cancelBooking,
  getMyBookings,
} from "../services/bookingService";

function MemberDashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [cancelError, setCancelError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyBookings();

      setBookings(response.data.bookings);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoadingId(bookingId);
      setCancelError("");

      await cancelBooking(bookingId);

      await fetchBookings();
    } catch (err) {
      setCancelError(
        err.response?.data?.message ||
          "Failed to cancel booking."
      );
    } finally {
      setCancelLoadingId(null);
    }
  };

  if (loading) {
    return (
      <main className="page-container">
        <div className="state-card">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
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

  return (
    <main className="page-container">
      <div className="page-header">
        <span className="section-eyebrow">
          MEMBER AREA
        </span>

        <h1>My Bookings</h1>

        <p>
          View and manage your upcoming workspace
          bookings.
        </p>
      </div>

      {cancelError && (
        <div className="message message-error">
          {cancelError}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="state-card">
          <div className="empty-icon">▣</div>

          <h3>No upcoming bookings</h3>

          <p>
            You don't have any upcoming bookings yet.
          </p>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <article
              className="booking-card"
              key={booking._id}
            >
              <div className="booking-card-header">
                <div>
                  <span className="booking-label">
                    WORKSPACE BOOKING
                  </span>

                  <h2>
                    {booking.space?.name || "Space"}
                  </h2>
                </div>

                <span
                  className={`badge badge-${booking.status}`}
                >
                  {booking.status === "pending" &&
                    "Pending"}

                  {booking.status === "approved" &&
                    "Approved"}
                </span>
              </div>

              <div className="booking-details">
                <div className="booking-detail">
                  <span className="booking-detail-label">
                    Start
                  </span>

                  <strong>
                    {new Date(
                      booking.startTime
                    ).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </strong>
                </div>

                <div className="booking-detail">
                  <span className="booking-detail-label">
                    End
                  </span>

                  <strong>
                    {new Date(
                      booking.endTime
                    ).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </strong>
                </div>
              </div>

              {(booking.status === "pending" ||
                booking.status === "approved") && (
                <div className="booking-card-footer">
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() =>
                      handleCancelBooking(
                        booking._id
                      )
                    }
                    disabled={
                      cancelLoadingId === booking._id
                    }
                  >
                    {cancelLoadingId === booking._id
                      ? "Cancelling..."
                      : "Cancel Booking"}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MemberDashboardPage;