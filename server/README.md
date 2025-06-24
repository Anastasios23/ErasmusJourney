# Erasmus Journey Backend

This backend server handles form data storage and retrieval for the Erasmus Journey platform.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Database

The application uses SQLite for simplicity. The database file (`erasmus.db`) will be created automatically when you first start the server.

### API Endpoints

#### Form Data Storage

- `POST /api/basic-information` - Save basic student information
- `POST /api/course-matching` - Save course matching data
- `POST /api/accommodation` - Save accommodation information
- `POST /api/living-expenses` - Save living expenses data
- `POST /api/help-future-students` - Save mentorship data

#### Data Retrieval

- `GET /api/submissions` - Get all form submissions (admin)
- `GET /api/submission/:id` - Get detailed submission by ID

### Frontend Integration

The frontend is configured to connect to the backend automatically. Make sure both servers are running:

1. Backend: `npm run dev` (in `/server` directory) - runs on port 5000
2. Frontend: `npm run dev` (in root directory) - runs on port 8080

### Environment Variables

Create a `.env` file in the server directory if you need to customize:

```
PORT=5000
DATABASE_PATH=./erasmus.db
```

### Production Deployment

For production, consider:

- Using PostgreSQL instead of SQLite
- Adding authentication and authorization
- Implementing rate limiting
- Adding data validation middleware
- Setting up proper error handling and logging

## Database Schema

The database includes the following tables:

- `basic_information` - Student personal and academic info
- `course_matching` - Course details and matching data
- `courses` - Individual course records
- `accommodation` - Housing information
- `living_expenses` - Budget and expense data
- `help_future_students` - Mentorship and contact details

All tables include timestamps and foreign key relationships for data integrity.
