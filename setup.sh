#!/bin/bash
set -e

echo "🚀 Setting up Realtime Bidding Platform..."

# Copy environment variables if not exists
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install pipenv
pipenv install --dev

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Setup complete!"
echo ""
echo "🏃‍♂️ To run the application with Docker:"
echo "   docker-compose up"
echo ""
echo "🏃‍♂️ To run the application without Docker:"
echo "   Backend: cd backend && pipenv run uvicorn app.main:app --reload"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "📝 API Documentation will be available at:"
echo "   http://localhost:8000/docs"
echo ""
echo "🌐 Frontend will be available at:"
echo "   http://localhost:3000" 