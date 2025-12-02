# GoodFinds

A community-driven platform for giving away unwanted items. Connect with people in your area to share items you no longer need and find treasures others are offering for free.

## 🌟 Features

- **Post Items**: Upload listings with photos, descriptions, and location
- **Browse Catalog**: Search and filter available items by category and condition
- **Claim System**: Claim items you're interested in
- **Pickup Confirmation**: Mark items as picked up when the exchange is complete
- **Review System**: Rate and review users based on your experience
- **User Profiles**: View posted and claimed items, track reputation scores
- **Authentication**: Secure sign-in with Clerk authentication

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Clerk (Authentication)
- Tailwind CSS

**Backend:**
- FastAPI (Python)
- MongoDB (Database)
- Motor (Async MongoDB driver)
- Clerk JWT verification
- Pytest (Testing)

## 📋 Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **MongoDB Atlas account** (or local MongoDB instance)
- **Clerk account** (for authentication)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd GoodFinds
```

### 2. Backend Setup

#### Create Environment File

Create a file named `.env` in the `backend/` directory:

```bash
# MongoDB Configuration
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/goodfinds?retryWrites=true&w=majority

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

#### Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Run the Backend

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 3. Frontend Setup

#### Create Environment File

Create a file named `.env.local` in the `frontend/` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Run the Frontend

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### 4. Run Both Servers Simultaneously

From the root directory:

```bash
npm install  # Install concurrently
npm run dev  # Runs both backend and frontend
```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
pytest
```

### Run Tests with Coverage

```bash
cd backend
source venv/bin/activate
pytest --cov=. --cov-report=html
```

This will generate a coverage report in the `htmlcov/` directory. Open `htmlcov/index.html` in your browser to view the detailed coverage report.

### Run Specific Test Files

```bash
# Test reviews functionality
pytest tests/test_reviews.py

# Test post upload use case
pytest tests/test_use_case_1_upload_listing.py

# Test claim item use case
pytest tests/test_use_case_2_claim_item.py

# Test search use case
pytest tests/test_use_case_3_search.py
```

### Test with Verbose Output

```bash
pytest -v  # Verbose mode
pytest -vv  # Extra verbose mode
```

## 🔧 Setting Up External Services

### MongoDB Atlas

1. Go to https://cloud.mongodb.com/
2. Create a free cluster
3. Create a database user with read/write access
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string and add it to `backend/.env` as `MONGODB_URL`

### Clerk Authentication

1. Go to https://dashboard.clerk.com/
2. Create a new application
3. Copy the **Publishable Key** and **Secret Key**
4. Add them to both `backend/.env` and `frontend/.env.local`
5. Configure allowed redirect URLs in Clerk dashboard:
   - Development: `http://localhost:3000`
   - Add production URLs when deploying

## 📁 Project Structure

```
GoodFinds/
├── backend/
│   ├── routes/          # API route handlers
│   │   ├── posts.py     # Post endpoints
│   │   ├── reviews.py   # Review endpoints
│   │   └── users.py     # User endpoints
│   ├── tests/           # Test files
│   ├── auth.py          # Clerk authentication
│   ├── db.py            # Database connection
│   ├── models.py        # Pydantic models
│   ├── utils.py         # Helper functions
│   └── main.py          # FastAPI application
├── frontend/
│   ├── app/             # Next.js pages
│   ├── components/      # React components
│   ├── lib/             # API utilities
│   └── types.ts         # TypeScript types
└── README.md
```

## 🔍 API Endpoints

### Posts
- `GET /posts` - Get all available posts
- `POST /posts` - Create a new post (authenticated)
- `GET /posts/{post_id}` - Get post by ID
- `PUT /posts/{post_id}` - Update post (authenticated, owner only)
- `DELETE /posts/{post_id}` - Delete post (authenticated, owner only)
- `POST /posts/{post_id}/claim` - Claim a post (authenticated)
- `POST /posts/{post_id}/pickup` - Confirm pickup (authenticated)

### Reviews
- `POST /reviews` - Create a review (authenticated)
- `GET /reviews/{review_id}` - Get review by ID
- `GET /reviews/poster/{poster_id}` - Get reviews for a user

### Users
- `GET /users/{user_id}/reputation` - Get user reputation and review count

## 🐛 Troubleshooting

### CORS Errors

- Verify `ALLOWED_ORIGINS` in `backend/.env` matches your frontend URL
- Check that there are no trailing slashes in URLs
- Ensure the frontend is using the correct `NEXT_PUBLIC_API_URL`

### Authentication Errors

- Ensure Clerk keys match between frontend and backend
- Check that redirect URLs are configured in Clerk dashboard
- Verify the Clerk publishable key format is correct

### Database Connection Errors

- Verify MongoDB connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network allows outbound connections to MongoDB

### Test Failures

- Make sure virtual environment is activated
- Install test dependencies: `pip install -r requirements-test.txt`
- Check that test database is accessible

## 🚀 Production Deployment

### Environment Variables for Production

**Backend:**
- Set `ALLOWED_ORIGINS` to your production frontend URL(s) (comma-separated)
- Use production Clerk keys
- Ensure MongoDB IP whitelist includes your server

**Frontend:**
- Set `NEXT_PUBLIC_API_URL` to your production API URL
- Use production Clerk keys
