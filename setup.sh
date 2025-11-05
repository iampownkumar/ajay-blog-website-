#!/bin/bash

echo "🚀 Setting up Ajay's Blog Website with Admin Panel"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed. Please install MongoDB first."
    echo "Visit: https://www.mongodb.com/try/download/community"
    exit 1
fi

echo "✅ Node.js and MongoDB are installed"

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Environment file created. Please update .env with your settings."
fi

# Create uploads directory
if [ ! -d uploads ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB service: 'mongod'"
echo "2. Update .env file if needed"
echo "3. Start the server: 'npm run dev'"
echo "4. Open your browser to: http://localhost:3000"
echo "5. Access admin panel at: http://localhost:3000/admin"
echo ""
echo "🔑 Default admin login:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to change the default password in production!"
