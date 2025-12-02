#!/bin/bash

# GoodFinds Environment Setup Script
# This script creates .env.example files for easy setup

echo "🚀 Setting up GoodFinds environment files..."
echo ""

# Create backend .env.example
cat > backend/.env.example << 'EOF'
# MongoDB Configuration
# Get your connection string from MongoDB Atlas: https://cloud.mongodb.com/
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/goodfinds?retryWrites=true&w=majority

# Clerk Authentication
# Get these from your Clerk Dashboard: https://dashboard.clerk.com/
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# CORS Configuration
# Comma-separated list of allowed origins for CORS
# For development: http://localhost:3000
# For production: https://yourdomain.com,https://www.yourdomain.com
ALLOWED_ORIGINS=http://localhost:3000

# Server Configuration (optional)
# PORT=8000
# HOST=0.0.0.0
EOF

echo "✅ Created backend/.env.example"

# Create frontend .env.local.example
cat > frontend/.env.local.example << 'EOF'
# Backend API URL
# For development: http://localhost:8000
# For production: https://your-api-domain.com
NEXT_PUBLIC_API_URL=http://localhost:8000

# Clerk Authentication
# Get these from your Clerk Dashboard: https://dashboard.clerk.com/
# Make sure these match your backend Clerk credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Note: Variables prefixed with NEXT_PUBLIC_ are exposed to the browser
# Never put sensitive secrets in NEXT_PUBLIC_ variables!
EOF

echo "✅ Created frontend/.env.local.example"
echo ""
echo "📝 Next steps:"
echo "1. Copy backend/.env.example to backend/.env and fill in your values"
echo "2. Copy frontend/.env.local.example to frontend/.env.local and fill in your values"
echo "3. See README.md for detailed instructions"
echo ""
echo "💡 Quick copy commands:"
echo "   cp backend/.env.example backend/.env"
echo "   cp frontend/.env.local.example frontend/.env.local"
echo ""
echo "✨ Done! Happy coding!"

