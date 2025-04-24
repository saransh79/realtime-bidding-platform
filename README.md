# Realtime Bidding Platform

A full-stack realtime bidding platform built with FastAPI and Next.js, using WebSockets for real-time communication. This application allows users to create auctions, place bids in real-time, and receive instantaneous updates about auction activities.

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Auction Management**: Create, browse, and manage auctions
- **Realtime Bidding**: Place bids with instant price updates using WebSockets
- **Live Updates**: Watch auction activity in real-time with updates on new bids
- **Outbid Notifications**: Receive notifications when someone outbids you
- **Responsive UI**: Modern, responsive interface built with Tailwind CSS

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - SQL toolkit and ORM for database interactions
- **WebSockets** - For real-time bidirectional communication
- **JWT** - For secure authentication
- **Docker** - For containerization and easy deployment

### Frontend
- **Next.js** - React framework for production
- **React Hooks** - For state management and component logic
- **Tailwind CSS** - For styling and responsive design
- **WebSockets** - For real-time bidding updates

## Architecture

The application follows a client-server architecture:

1. **Backend API Server (FastAPI)**:
   - RESTful API endpoints for CRUD operations
   - WebSocket endpoints for real-time updates
   - JWT-based authentication
   - SQLite database (can be replaced with PostgreSQL)

2. **Frontend Web Application (Next.js)**:
   - Server-side rendering for better SEO and performance
   - Client-side WebSocket connections for real-time updates
   - Responsive UI built with Tailwind CSS
   - Form handling with React Hook Form

3. **Real-time Communication**:
   - WebSockets for bidirectional communication
   - Server broadcasts bid updates to all connected clients
   - Targeted notifications for outbid users

## Setup and Installation

### Prerequisites
- Docker and Docker Compose (recommended)
- Node.js 16+ (if running frontend locally)
- Python 3.9+ (if running backend locally)

### Quick Start with Docker

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/realtime-bidding-platform.git
   cd realtime-bidding-platform
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Start the application with Docker Compose:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Using the Setup Script

Run the included setup script:
```bash
chmod +x setup.sh
./setup.sh
```

#### Manual Setup (Backend)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   pip install pipenv
   pipenv install --dev
   ```

3. Run the development server:
   ```bash
   pipenv run uvicorn app.main:app --reload
   ```

#### Manual Setup (Frontend)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## WebSocket Endpoints

- `/ws/auctions/{auction_id}` - Connect to a specific auction for real-time updates
- `/ws/live-feed` - Connect to a global feed of auction activity

## Project Structure

```
realtime-bidding-platform/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── database/       # Database models and connection
│   │   ├── routes/         # API route handlers
│   │   ├── schemas/        # Pydantic models/schemas
│   │   ├── services/       # Business logic
│   │   ├── websockets/     # WebSocket handlers
│   │   └── main.py         # Application entry point
│   ├── Dockerfile          # Backend Docker configuration
│   └── Pipfile             # Python dependencies
├── frontend/               # Next.js frontend
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Next.js pages
│   ├── public/             # Static assets
│   ├── styles/             # CSS styles
│   ├── Dockerfile          # Frontend Docker configuration
│   └── package.json        # JavaScript dependencies
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # Project documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Acknowledgements

- This project was built with FastAPI and Next.js
- Using Tailwind CSS for styling
- Real-time communication with WebSockets 