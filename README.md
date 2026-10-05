# Coworking Space Desk & Room Booking System

A full-stack coworking space booking application that allows visitors to browse available workspaces, members to reserve desks and meeting rooms, and administrators to manage spaces, bookings, and maintenance windows.

The application is built using React, Node.js, Express, MongoDB, JWT authentication, and REST APIs.

---

## Features

### Visitor

* View available coworking spaces
* Search spaces by name
* Filter spaces by type
* Filter spaces by capacity
* Paginate through spaces
* View detailed information about a space
* Check real-time availability for a selected date/time range

### Member

* Register a new account
* Login securely
* JWT-based authentication
* Short-lived access tokens
* Refresh token rotation
* Book desks and meeting rooms
* Prevent overlapping bookings
* Prevent bookings during maintenance windows
* View personal bookings
* Cancel future pending or approved bookings
* Receive consistent validation and error responses

### Admin

* Secure admin authentication
* Create coworking spaces
* Edit coworking spaces
* Deactivate spaces
* View all bookings
* Search and filter bookings
* Approve pending bookings
* Reject pending bookings
* Automatically reject conflicting pending bookings when a booking is approved
* Create maintenance windows
* View maintenance windows
* Delete maintenance windows
* Prevent conflicting maintenance windows
* Prevent bookings during maintenance periods

---

## Tech Stack

### Frontend

* React
* React Router
* Axios
* Vite
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Tokens (JWT)
* bcryptjs
* Zod
* Express Rate Limit
* Cookie Parser
* CORS

### Development Tools

* Git
* GitHub
* Postman
* MongoDB / MongoDB Compass
* VS Code

---

## Project Architecture

The application follows a client-server architecture.

```text
React Frontend
      |
      | REST API
      ↓
Node.js + Express Backend
      |
      | Mongoose
      ↓
MongoDB
```

The frontend communicates with the backend through REST APIs.

The backend handles authentication, authorization, validation, booking logic, concurrency control, maintenance windows, and database operations.

---

## Project Structure

```text
coworking-booking-system/
│
├── README.md
├── .gitignore
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   │
│   └── src/
│       ├── app.js
│       ├── server.js
│       │
│       ├── config/
│       │   └── database.js
│       │
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── spaceController.js
│       │   ├── bookingController.js
│       │   └── maintenanceController.js
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── errorMiddleware.js
│       │   ├── rateLimiter.js
│       │   ├── roleMiddleware.js
│       │   └── validate.js
│       │
│       ├── models/
│       │   ├── User.js
│       │   ├── Space.js
│       │   ├── Booking.js
│       │   ├── Maintenance.js
│       │   └── RefreshToken.js
│       │
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── spaceRoutes.js
│       │   ├── bookingRoutes.js
│       │   └── maintenanceRoutes.js
│       │
│       ├── services/
│       │   ├── authService.js
│       │   ├── bookingService.js
│       │   ├── maintenanceService.js
│       │   └── availabilityService.js
│       │
│       ├── validators/
│       │   ├── authValidator.js
│       │   ├── bookingValidator.js
│       │   ├── spaceValidator.js
│       │   ├── maintenanceValidator.js
│       │   └── availabilityValidator.js
│       │
│       ├── utils/
│       │   ├── errors.js
│       │   └── jwt.js
│       │
│       └── scripts/
│           └── createAdmin.js
│
└── frontend/
    ├── package.json
    ├── package-lock.json
    │
    └── src/
        ├── assets/
        ├── components/
        ├── context/
        ├── layouts/
        ├── pages/
        ├── routes/
        ├── services/
        ├── App.css
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

---

## Authentication & Authorization

The application uses JWT-based authentication with separate access and refresh tokens.

### Access Token

The access token is short-lived and is used to authenticate protected API requests.

The frontend sends the access token using the `Authorization` header:

```text
Authorization: Bearer <access-token>
```

### Refresh Token

Refresh tokens are stored using an HTTP-only cookie.

When the access token expires, the frontend automatically calls the refresh endpoint to obtain a new access token.

Refresh tokens are rotated after successful refresh requests.

The previous refresh token is removed from the database when a new refresh token is issued.

### Password Security

User passwords are hashed using `bcryptjs` before being stored in MongoDB.

Passwords are never returned in API responses.

---

## Role-Based Authorization

The application supports two user roles:

```text
member
admin
```

### Member permissions

Members can:

* Browse spaces
* View space details
* Check availability
* Create bookings
* View their own bookings
* Cancel their own future bookings

### Admin permissions

Admins can:

* Manage spaces
* View all bookings
* Approve bookings
* Reject bookings
* Manage maintenance windows

Protected API routes use authentication middleware and role-based authorization middleware.

---

## Booking & Concurrency Handling

Preventing double booking is one of the important parts of this application.

A simple availability check can create a race condition:

```text
User A checks availability → Available
User B checks availability → Available

User A creates booking
User B creates booking

Result → Both bookings may conflict
```

To prevent this, booking creation uses a MongoDB transaction together with an atomic update on the selected space.

The simplified flow is:

```text
Booking Request
      |
      ↓
Validate request
      |
      ↓
Start MongoDB transaction
      |
      ↓
Acquire atomic space lock
      |
      ↓
Check overlapping bookings
      |
      ↓
Check maintenance windows
      |
      ↓
Create booking
      |
      ↓
Commit transaction
```

This ensures that simultaneous booking requests for the same space are serialized and conflicting bookings cannot both be successfully created.

The concurrency logic was tested using simultaneous booking requests, where only one conflicting request was allowed to succeed.

---

## Booking Rules

A booking must:

* Belong to an active space
* Have a valid start time
* Have an end time after the start time
* Not be in the past
* Not overlap with an existing pending booking
* Not overlap with an existing approved booking
* Not overlap with a maintenance window

### Booking Status

Bookings can have the following statuses:

```text
pending
approved
rejected
cancelled
```

### Admin Approval

When an administrator approves a pending booking:

1. The booking is checked again for conflicts.
2. Maintenance conflicts are checked.
3. The booking is changed to `approved`.
4. Other overlapping pending bookings for the same space are automatically rejected.

This prevents multiple pending requests from remaining valid after one booking has been approved.

---

## Maintenance Windows

Administrators can create maintenance windows for individual spaces.

A maintenance window contains:

* Space
* Start time
* End time
* Reason
* Admin who created it

The system prevents:

* Bookings during maintenance
* Overlapping maintenance windows
* Maintenance windows that conflict with existing bookings

Admins can also view and delete maintenance windows.

## Space Management

Spaces can represent different types of coworking resources.

Supported types:

desk
meeting_room

Each space can contain:

Name
Type
Description
Capacity
Amenities
Active/inactive status

Deleting a space is implemented as a soft delete by deactivating the space instead of permanently removing it from the database.

## Search, Filtering & Pagination

The public spaces API supports:

Text search by space name
Filtering by type
Minimum capacity
Maximum capacity
Pagination
Configurable page size

The frontend provides a responsive search and filtering interface for visitors.

## Availability

Visitors and members can check availability for a specific time range.

The availability API considers:

Pending bookings
Approved bookings
Maintenance windows

The response provides the requested time range along with conflicting bookings and maintenance windows.

## API Endpoints
Authentication
Method	Endpoint	Description	Access
POST	/api/auth/register	Register a member	Public
POST	/api/auth/login	Login	Public
POST	/api/auth/refresh	Refresh access token	Public with refresh cookie
POST	/api/auth/logout	Logout	Public with refresh cookie
GET	/api/auth/me	Get current user	Authenticated
Spaces
Method	Endpoint	Description	Access
GET	/api/spaces	List/search/filter spaces	Public
GET	/api/spaces/:id	Get space details	Public
GET	/api/spaces/:id/availability	Check availability	Public
POST	/api/spaces	Create space	Admin
PATCH	/api/spaces/:id	Update space	Admin
DELETE	/api/spaces/:id	Deactivate space	Admin
Bookings
Method	Endpoint	Description	Access
POST	/api/bookings	Create booking	Member
GET	/api/bookings/my	Get current member's bookings	Member
PATCH	/api/bookings/:id/cancel	Cancel own booking	Member
GET	/api/bookings	Get all bookings	Admin
PATCH	/api/bookings/:id/approve	Approve booking	Admin
PATCH	/api/bookings/:id/reject	Reject booking	Admin
Maintenance
Method	Endpoint	Description	Access
POST	/api/maintenance	Create maintenance window	Admin
GET	/api/maintenance	List maintenance windows	Admin
DELETE	/api/maintenance/:id	Delete maintenance window	Admin
Health Check
GET /api/health

Example response:

{
  "success": true,
  "message": "Coworking Booking API is running"
}
Validation & Error Handling

The backend uses Zod for request validation.

A centralized error-handling middleware provides consistent API responses.

Standard error
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE"
}
Validation error
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}

This provides a consistent structure for frontend error handling.

## Rate Limiting

Authentication endpoints are protected with rate limiting to reduce the risk of repeated login and registration attempts.

Rate limiting is applied to:

Login
Registration

## Database & Indexing

MongoDB is used as the primary database with Mongoose as the ODM.

Indexes are created for commonly queried fields such as:

User email
User role
Space type
Space capacity
Space active status
Booking space
Booking member
Booking start/end time
Booking status
Maintenance space
Maintenance start/end time
Refresh token expiration

These indexes help improve query performance for availability checks, booking management, filtering, and authentication.

## Environment Variables
# Backend

Create a .env file inside the backend directory.

Example:

PORT=5001

MONGO_URI=mongodb://127.0.0.1:27017/coworking_booking?replicaSet=rs0

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
# Frontend

Create a .env file inside the frontend directory.

Example:

VITE_API_URL=http://localhost:5001/api
Important

Never commit real environment variables or secrets to GitHub.

The .env files are excluded through .gitignore.

Use .env.example to document required environment variables.

## Installation & Setup
# Prerequisites

Make sure the following are installed:

Node.js
npm
MongoDB
Git
# 1. Clone the repository
git clone <your-github-repository-url>

Move into the project directory:

cd coworking-booking-system
# 2. Backend Setup

Navigate to the backend:

cd backend

Install dependencies:

npm install

Create the .env file and configure the required environment variables.

Start the backend in development mode:

npm run dev

The backend runs on:

http://localhost:5001
# 3. Frontend Setup

Open another terminal and navigate to the frontend:

cd frontend

Install dependencies:

npm install

Create the .env file:

VITE_API_URL=http://localhost:5001/api

Start the frontend:

npm run dev

The frontend runs on:

http://localhost:5173

## Creating an Admin Account

The backend includes a script for creating an administrator account.

From the backend directory:

npm run create-admin

The script creates the initial admin user.

For security reasons, production credentials should be stored securely and should not be committed to the repository.

## Running the Application

Start the backend:

cd backend
npm run dev

Start the frontend in another terminal:

cd frontend
npm run dev

Then open:

http://localhost:5173

## Testing

The application can be tested through the browser and API clients such as Postman.

# Authentication Testing
Test:

Successful registration
Duplicate email registration
Successful login
Invalid credentials
Access token authentication
Access token expiration
Refresh token rotation
Logout
Protected routes
Role-based authorization

# Space Testing
Test:

Space listing
Search
Type filtering
Capacity filtering
Pagination
Space details
Space creation
Space update
Space deactivation

# Booking Testing
Test:

Valid booking
Overlapping booking
Past booking
Maintenance conflict
Concurrent booking requests
Member booking list
Booking cancellation
Admin approval
Admin rejection
Automatic rejection of conflicting pending bookings

# Maintenance Testing
Test:

Create maintenance window
View maintenance windows
Delete maintenance window
Overlapping maintenance windows
Maintenance conflict with bookings
Member access restrictions


## Security

The application includes several security measures:

Password hashing using bcrypt
JWT authentication
Short-lived access tokens
HTTP-only refresh token cookies
Refresh token rotation
Role-based authorization
Input validation using Zod
Login and registration rate limiting
Environment variables for secrets
CORS configuration
Centralized error handling
MongoDB indexes
Transaction-based booking concurrency handling

## Future Improvements

Potential future improvements include:

Docker and Docker Compose support
Email notification service
Swagger/OpenAPI documentation
Postman collection
Automated unit and integration tests
CI/CD pipeline
Cloud deployment
Production monitoring and logging
Improved calendar-based booking UI
Real-time booking notifications

## Project Status

The core coworking space booking functionality has been implemented, including:

Public space browsing
Search and filtering
Availability checking
Member authentication
JWT access and refresh tokens
Member bookings
Concurrency-safe booking creation
Booking cancellation
Admin space management
Booking approval and rejection
Automatic conflict handling
Maintenance window management
Validation
Rate limiting
Centralized error handling
Responsive frontend

Additional deployment and infrastructure features can be added as future improvements.

## License

This project is created for learning, portfolio, and demonstration purposes.
