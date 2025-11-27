# Nexus Backend API

This is the Express.js backend for the Nexus Social Media Events App.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote instance)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexus
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**Important**: Change the `JWT_SECRET` to a secure random string in production.

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For macOS (using Homebrew)
brew services start mongodb-community

# For Linux
sudo systemctl start mongod

# For Windows
# MongoDB should start automatically as a service
```

### 4. Run the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/create-account` - Create new account
- `GET /api/auth/user-info` - Get user information (requires auth)
- `GET /api/auth/verifyusertype` - Verify user type/admin status (requires auth)

### Events
- `GET /api/event` - Get all events
- `GET /api/event/:id` - Get event by ID
- `POST /api/event` - Create new event (requires auth)
- `PUT /api/event/:id` - Update event (requires auth)
- `DELETE /api/event/:id` - Delete event (requires auth)
- `POST /api/event/:id/attend` - Attend event (requires auth)
- `POST /api/event/:id/interested` - Mark as interested (requires auth)

### Organizations
- `GET /api/organization` - Get all organizations
- `GET /api/organization/:id` - Get organization by ID
- `POST /api/organization` - Create organization (requires auth)
- `PUT /api/organization/:id` - Update organization (requires auth)
- `DELETE /api/organization/:id` - Delete organization (requires auth)
- `POST /api/organization/:id/follow` - Follow organization (requires auth)
- `POST /api/organization/:id/unfollow` - Unfollow organization (requires auth)

### Posts
- `GET /api/post` - Get all public posts
- `GET /api/post/user/:userId` - Get user's posts
- `GET /api/post/:id` - Get post by ID
- `POST /api/post` - Create post (requires auth)
- `PUT /api/post/:id` - Update post (requires auth)
- `DELETE /api/post/:id` - Delete post (requires auth)
- `POST /api/post/:id/like` - Like/unlike post (requires auth)
- `POST /api/post/:id/comment` - Add comment (requires auth)
- `POST /api/post/:id/report` - Report post (requires auth)
- `GET /api/post/admin/reported` - Get reported posts (requires admin)

### Buildings & Rooms
- `GET /api/building` - Get all buildings
- `POST /api/building` - Create building (requires auth)
- `GET /api/room?BID=<buildingId>` - Get rooms by building
- `POST /api/room` - Create room (requires auth)

### User Activities
- `GET /api/useractivities/academic-level/` - Get academic levels
- `GET /api/useractivities/major/` - Get majors

## Authentication

Protected endpoints require a JWT token in the `auth-token` header:

```javascript
headers: {
  'auth-token': 'your-jwt-token-here',
  'Content-Type': 'application/json'
}
```

The token is returned when logging in or creating an account.

## Database Schema

### User
- firstName, lastName, email, password
- userType (student/organization/admin)
- academicLevel, major, bio
- profileImage, coverImage
- interests, followers, following

### Event
- title, description, eventDate, eventTime
- location (building, room, address)
- organization, createdBy
- category, image, capacity
- attendees, interested, tags, status

### Post
- author, organization, content
- images, likes, comments, shares
- tags, visibility, isReported

### Organization
- name, email, description, category
- logo, coverImage
- members, admins, followers
- socialLinks

## Frontend Integration

The frontend is configured to connect to this backend at `http://localhost:5000/api/`.

To change the API URL, edit `src/Context/API/ApiRouter.jsx`:

```javascript
export const host = "http://localhost:5000/api/";
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env` is correct
- For remote MongoDB (e.g., MongoDB Atlas), use the connection string provided

### Port Already in Use
- Change the `PORT` in `.env` to a different port
- Update the frontend API URL accordingly

### CORS Errors
- The server is configured to allow all origins in development
- For production, configure specific allowed origins in `server.js`

## Development

The backend uses:
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Next Steps

1. Seed the database with initial data (optional)
2. Configure production environment variables
3. Set up proper error logging
4. Add rate limiting for API endpoints
5. Implement real-time features with Socket.io (for messaging)
