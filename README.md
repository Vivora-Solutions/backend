# Backend Structure

```
backend/
│
├── node_modules/
├── src/
│   ├── config/
│   │   └── supabaseClient.js         # Supabase client setup using API keys
│   ├── controllers/
│   │   └── userController.js         # Route handler logic (calls service functions)
│   ├── services/
│   │   └── userService.js            # Business logic (calls Supabase API)
│   ├── routes/
│   │   └── userRoutes.js             # Express routes for users
│   ├── middlewares/
│   │   └── authMiddleware.js         # Example: JWT or Supabase Auth validation
│   ├── utils/
│   │   └── logger.js                 # Custom logging or helpers
│   ├── app.js                        # Express app configuration
│   └── server.js                     # Server entry point (starts server)
│
├── .env                              # Environment variables (Supabase URL & key)
├── .gitignore
├── package.json
└── README.md
```
