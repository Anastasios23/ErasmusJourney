# Backend Server Setup

## Quick Start

To resolve the "Failed to fetch" errors, you need to start the backend server:

```bash
# Navigate to the server directory
cd server

# Install dependencies (if not already done)
npm install

# Start the backend server
npm run dev
```

The server will start on `http://localhost:5000`

## Alternative Start Methods

### Method 1: Direct Node.js

```bash
cd server
node index.js
```

### Method 2: Using the start script

```bash
cd server
./start.sh
```

## What the Backend Provides

- User authentication (login/register)
- Form data persistence
- Admin panel data
- Health check endpoint for connection status
- SQLite database storage

## Troubleshooting

1. **Port 5000 already in use**: The server will show an error if port 5000 is occupied
2. **Database issues**: The server creates a SQLite database automatically
3. **CORS errors**: The server is configured to allow frontend connections

## Offline Mode

If you can't start the backend, the frontend will work in offline mode:

- Forms will save data locally
- Authentication will use fallback mode
- Connection status indicator will show "Offline Mode"

## Default Admin Account

- Email: `admin@erasmusjourney.com`
- Password: Set via `DEFAULT_ADMIN_PASSWORD` environment variable
