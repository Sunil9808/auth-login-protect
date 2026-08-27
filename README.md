# Auth Login & Protect

A secure API that handles user authentication (Sign Up, Log In, and Log Out) and protects specific routes using Supabase Auth and JWT tokens.

## Project Overview

This API demonstrates modern web security practices by:
- Managing user accounts with Supabase Authentication
- Issuing secure JSON Web Tokens (JWTs)
- Verifying tokens to protect admin-only and user-only endpoints
- Using reusable middleware for token verification
- Documenting all endpoints in Swagger UI

## Tech Stack

- **Backend**: Node.js + Express.js
- **Authentication**: Supabase Auth
- **Documentation**: Swagger UI / OpenAPI 3.0
- **Environment Management**: dotenv

## Setup Instructions

### Prerequisites

- Node.js 14+ installed
- A Supabase project (free account at [supabase.com](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/Sunil9808/auth-login-protect.git
cd auth-login-protect
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
PORT=3000
```

**How to find your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to **Project Settings → API**
3. Copy your **Project URL** and **Anon Key**

### 4. Run the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

You should see:
```
✅ Server running on http://localhost:3000
📚 Swagger UI at http://localhost:3000/docs
```

## API Reference

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/auth/signup` | POST | ❌ No | Create a new user account |
| `/auth/login` | POST | ❌ No | Authenticate user & receive JWT |
| `/auth/logout` | POST | ✅ Yes | Terminate user session |
| `/public/info` | GET | ❌ No | Read public information |
| `/protected/profile` | GET | ✅ Yes | Read private user profile |
| `/protected/dashboard` | GET | ✅ Yes | Read user dashboard |

## Usage Examples

### Sign Up

```bash
curl -i -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"password123"}'
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user-uuid",
    "email": "test@example.com",
    "created_at": "2024-08-27T10:00:00Z"
  }
}
```

### Log In

```bash
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"password123"}'
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh-token-here",
  "user": {
    "id": "user-uuid",
    "email": "test@example.com"
  }
}
```

### Access Protected Route

```bash
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "message": "This is your private profile",
  "user": {
    "id": "user-uuid",
    "email": "test@example.com",
    "created_at": "2024-08-27T10:00:00Z",
    "updated_at": "2024-08-27T10:00:00Z"
  }
}
```

### Access Public Route

```bash
curl -i http://localhost:3000/public/info
```

**Response (200 OK):**
```json
{
  "message": "Welcome stranger! This info is public."
}
```

### Log Out

```bash
curl -i -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (204 No Content)**

## Status Codes

- **201 Created**: User account successfully created
- **200 OK**: Successful login, profile read, or successful request
- **204 No Content**: Successful logout
- **400 Bad Request**: Missing required fields or invalid input
- **401 Unauthorized**: Missing, invalid, or expired token

## Swagger UI Documentation

Visit http://localhost:3000/docs to interact with all endpoints:

1. Click the **"Authorize"** 🔒 button
2. Paste your JWT token from `/auth/login`
3. Click **"Try it out"** on any protected endpoint

## Key Features

### 1. **Authentication Middleware**
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token validity with Supabase
- Automatically protects routes that use the middleware

### 2. **Input Validation**
- Checks for required fields (email, password)
- Returns 400 Bad Request if fields are missing

### 3. **Token Verification**
- Verifies JWT signature and expiration
- Returns 401 Unauthorized for invalid/expired tokens
- Attaches user data to request for route handlers

### 4. **Secure Routes**
- Public routes (no auth required)
- Protected routes (JWT required)

## Security Best Practices

✅ **Implemented:**
- Environment variables for secrets (never commit `.env`)
- JWT tokens for stateless authentication
- Token verification before accessing protected data
- Proper HTTP status codes (401 vs 400)
- CORS enabled for cross-origin requests
- Input validation on all endpoints

⚠️ **Additional Recommendations:**
- Use HTTPS in production
- Implement rate limiting on auth endpoints
- Add token refresh logic
- Log authentication events
- Use strong password requirements

## Project Structure

```
auth-login-protect/
├── server.js              # Main server with all routes and middleware
├── package.json           # Dependencies
├── .env.example           # Environment variable template
├── .env                   # (NOT committed) Your actual secrets
├── .gitignore             # Ignores .env and node_modules
└── README.md              # This file
```

## Stages Completed

- ✅ **Stage 0**: Setup Supabase & Server
- ✅ **Stage 1**: Sign Up & Log In routes
- ✅ **Stage 2**: Public & Protected endpoints
- ✅ **Stage 3**: Token Verification
- ✅ **Stage 4**: Middleware Protection & Logout
- ✅ **Stage 5**: Swagger UI Documentation
- ✅ **Stage 6**: GitHub Repository & README

## Testing Checklist

- [ ] Server starts without errors
- [ ] `/auth/signup` creates new users (201)
- [ ] `/auth/login` returns JWT token (200)
- [ ] `/public/info` accessible without auth (200)
- [ ] `/protected/profile` requires valid token (401 without token)
- [ ] `/protected/profile` returns user data with valid token (200)
- [ ] Invalid token returns 401
- [ ] `/auth/logout` terminates session (204)
- [ ] Swagger UI shows lock icons on protected routes
- [ ] Bearer token authorization works in Swagger UI

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "SUPABASE_URL is undefined"
Ensure your `.env` file exists and contains valid credentials.

### "401 Unauthorized" on protected routes
- Check that your token is being passed in the header
- Verify the format: `Authorization: Bearer <token>`
- Ensure the token hasn't expired

### Port already in use
Change the `PORT` in `.env` or run:
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process
```

## Contributing

This is an educational project. Feel free to fork and modify!

## License

ISC

---

**Built with ❤️ for learning secure API development**
