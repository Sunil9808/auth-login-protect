const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(express.json());
app.use(cors());

// ============================
// MIDDLEWARE: Auth Verification
// ============================
const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Extract token from "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = parts[1];

  // Verify token with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Attach user to request
  req.user = data.user;
  next();
};

// ============================
// AUTH ROUTES
// ============================

// POST /auth/signup - Create new user account
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Sign up with Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({
    message: 'User created successfully',
    user: {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
    },
  });
});

// POST /auth/login - Authenticate user & return JWT
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: 'Invalid login credentials' });
  }

  return res.status(200).json({
    message: 'Login successful',
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  });
});

// POST /auth/logout - Terminate user session (Protected)
app.post('/auth/logout', verifyAuth, async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];

  // Sign out with Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(204).send();
});

// ============================
// PUBLIC ROUTES
// ============================

// GET /public/info - Public endpoint (no auth required)
app.get('/public/info', (req, res) => {
  return res.status(200).json({
    message: 'Welcome stranger! This info is public.',
  });
});

// ============================
// PROTECTED ROUTES
// ============================

// GET /protected/profile - Read private user profile (Protected)
app.get('/protected/profile', verifyAuth, (req, res) => {
  return res.status(200).json({
    message: 'This is your private profile',
    user: {
      id: req.user.id,
      email: req.user.email,
      created_at: req.user.created_at,
      updated_at: req.user.updated_at,
    },
  });
});

// GET /protected/dashboard - Additional protected route for testing
app.get('/protected/dashboard', verifyAuth, (req, res) => {
  return res.status(200).json({
    message: 'Welcome to your dashboard',
    user_id: req.user.id,
    user_email: req.user.email,
  });
});

// ============================
// SWAGGER UI DOCUMENTATION
// ============================

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Auth Login & Protect API',
    description:
      'Secure API with user authentication using Supabase, JWT token verification, and protected routes',
    version: '1.0.0',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token for authentication',
      },
    },
  },
  paths: {
    '/auth/signup': {
      post: {
        summary: 'Create a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'securepassword123' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        created_at: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad Request - Missing email or password',
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user and receive JWT token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'securepassword123' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    access_token: { type: 'string' },
                    refresh_token: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad Request - Missing email or password',
          },
          401: {
            description: 'Unauthorized - Invalid credentials',
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Terminate user session',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          204: {
            description: 'Logout successful',
          },
          401: {
            description: 'Unauthorized - Invalid or missing token',
          },
        },
      },
    },
    '/public/info': {
      get: {
        summary: 'Get public information',
        tags: ['Public'],
        responses: {
          200: {
            description: 'Public information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/protected/profile': {
      get: {
        summary: 'Get private user profile (Protected)',
        tags: ['Protected'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        created_at: { type: 'string' },
                        updated_at: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Invalid or missing token',
          },
        },
      },
    },
    '/protected/dashboard': {
      get: {
        summary: 'Get user dashboard (Protected)',
        tags: ['Protected'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user_id: { type: 'string' },
                    user_email: { type: 'string' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Invalid or missing token',
          },
        },
      },
    },
  },
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ============================
// START SERVER
// ============================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI at http://localhost:${PORT}/docs`);
});

module.exports = { app, supabase };
