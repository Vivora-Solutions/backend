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
├── package-lock.json
└── README.md
```


# TimeSlot Logic
## Create
1. There is a schedule for the week, when initializing the stylist (Default)
2. Can add additional schedules on top of them, which prioratize the new schedule for a particular day.
3. Can have leaves for a particular day
## Update/Delete
1. Default can be updated
2. Additionals can be updated
3. Leaves can be updated
## Special
1. Can have sudden changes in schedule - add additional schedule to work on top of existing one
2. Can have more breaks - Add additional schedule - (in BREAK MODE) - in backend, it will [change the Default(for every week)]/[add additionals, considering the block for a particular day]