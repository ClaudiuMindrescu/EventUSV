# Setup & Installation Guide

**Author:** Mîndrescu Claudiu Daniel

**Target Audience**: Development team, DevOps engineers, system administrators

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Docker Setup](#docker-setup)
5. [Local Development Setup](#local-development-setup)
6. [Database Initialization](#database-initialization)
7. [Environment Configuration](#environment-configuration)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Minimum Requirements**:
- OS: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- RAM: 4GB (8GB recommended)
- Disk Space: 2GB
- CPU: 2 cores (4 cores recommended)

### Required Software

1. **Docker & Docker Compose**
   ```bash
   # Windows: Download from https://www.docker.com/products/docker-desktop
   # macOS: brew install docker docker-compose
   # Linux: sudo apt-get install docker.io docker-compose
   
   docker --version  # Verify installation
   ```

2. **Node.js & npm**
   ```bash
   # Download from https://nodejs.org/ (LTS version)
   node --version   # Should be 18.0.0 or higher
   npm --version    # Should be 9.0.0 or higher
   ```

3. **Python**
   ```bash
   # Download from https://www.python.org/ (3.10 or higher)
   python --version
   pip --version
   ```

4. **Git**
   ```bash
   git --version    # Should be 2.30.0 or higher
   ```

5. **Text Editor/IDE** (recommended)
   - Visual Studio Code
   - JetBrains WebStorm
   - Sublime Text

### Accounts & Credentials

- **Supabase Account** (https://supabase.com)
  - Create free account
  - Create new project
  - Obtain API keys

---

## Initial Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/eventusv.git
cd EventUSV

# Verify directory structure
ls -la
# Should show: docker-compose.yml, backend/, frontend/, package.json, README.md
```

### Step 2: Install Dependencies

**Frontend Dependencies**:
```bash
cd frontend
npm install
cd ..
```

**Backend Dependencies** (local development):
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
cd ..
```

---

## Supabase Configuration

### Step 1: Create Supabase Project

1. Navigate to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Enter project details:
   - **Name**: EventUSV
   - **Database Password**: Create strong password
   - **Region**: Select closest to your location
   - **Pricing Plan**: Free tier for development

### Step 2: Obtain API Keys

1. Go to Project Settings → API
2. Copy the following:
   - **Project URL** (supabase_url)
   - **anon key** (supabase_key)

### Step 3: Initialize Database

In Supabase Dashboard:

1. Go to SQL Editor
2. Create new query
3. Run the following SQL:

```sql
-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'STUDENT',
  is_organizer BOOLEAN DEFAULT FALSE,
  department_id UUID,
  phone_number VARCHAR(20),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  preferences JSONB DEFAULT '{}',
  PRIMARY KEY (id)
);

-- Create departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  short_name VARCHAR(50),
  description TEXT,
  head_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  capacity INTEGER,
  parking_available BOOLEAN DEFAULT FALSE,
  accessibility BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  short_description VARCHAR(500) NOT NULL,
  full_description TEXT,
  category VARCHAR(50) NOT NULL,
  location_id UUID REFERENCES locations(id),
  date_start TIMESTAMP NOT NULL,
  date_end TIMESTAMP NOT NULL,
  image_url TEXT,
  registration_link TEXT,
  qr_code_data TEXT,
  organizer_id UUID NOT NULL REFERENCES profiles(id),
  capacity INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'OPEN',
  is_paid BOOLEAN DEFAULT FALSE,
  price NUMERIC(8,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create participation table
CREATE TABLE participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  event_id BIGINT NOT NULL REFERENCES events(id),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attended BOOLEAN DEFAULT FALSE,
  attended_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'REGISTERED',
  check_in_code VARCHAR(50) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);

-- Create feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id BIGINT NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  rating SMALLINT NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  tags TEXT[],
  is_anonymous BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_date_start ON events(date_start);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_participation_user_id ON participation(user_id);
CREATE INDEX idx_participation_event_id ON participation(event_id);
CREATE INDEX idx_feedback_event_id ON feedback(event_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- Enable Row-Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Organizers can insert events"
  ON events FOR INSERT
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  USING (organizer_id = auth.uid());

-- RLS Policies for participation
CREATE POLICY "Users can view own participation"
  ON participation FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own participation"
  ON participation FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own participation"
  ON participation FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for feedback
CREATE POLICY "Anyone can view feedback"
  ON feedback FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own feedback"
  ON feedback FOR DELETE
  USING (user_id = auth.uid());
```

### Step 4: Enable Authentication

1. In Supabase Dashboard, go to Authentication → Providers
2. Enable Email provider (default)
3. Optional: Enable Google OAuth
   - Get OAuth credentials from Google Cloud Console
   - Add to Supabase

---

## Docker Setup

### Docker File Structure

**Backend Dockerfile**:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
```

### Docker Compose Configuration

The `docker-compose.yml` orchestrates both services with shared environment.

---

## Local Development Setup

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd EventUSV

# Create .env file (see Environment Configuration section)

# Build and start containers
docker-compose up --build

# Output should show:
# - Backend running on http://localhost:8000
# - Frontend running on http://localhost:5173
```

### Option 2: Local Installation (Advanced)

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install
npm run dev
```

### Option 3: Using VS Code Dev Containers

1. Install "Dev Containers" extension
2. Press F1 and select "Dev Containers: Open in Container"
3. VS Code will start the development environment

---

## Environment Configuration

### Create .env File

In project root directory, create `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anonymous-key-here

# Backend Configuration
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0
DEBUG=False

# Frontend Configuration
FRONTEND_PORT=5173
FRONTEND_HOST=localhost

# Environment
ENVIRONMENT=development
```

### Create .env.local (Frontend)

In `frontend/` directory, create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anonymous-key-here
VITE_API_BASE_URL=http://localhost:8000
```

### Create .env.production (for production builds)

```env
SUPABASE_URL=https://your-production-url.supabase.co
SUPABASE_KEY=production-key-here
BACKEND_PORT=8000
ENVIRONMENT=production
DEBUG=False
```

---

## Database Initialization

### Step 1: Create Test Data

```bash
# Using Supabase Dashboard SQL Editor

-- Create test department
INSERT INTO departments (name, short_name, description)
VALUES ('Computer Science', 'CS', 'Department of Computer Science');

-- Create test location
INSERT INTO locations (name, address, city, country, capacity)
VALUES (
  'Main Hall',
  '123 University Ave',
  'Bucharest',
  'Romania',
  500
);

-- Create test event
INSERT INTO events (
  title, short_description, full_description,
  category, location_id, date_start, date_end,
  organizer_id, capacity, status
)
VALUES (
  'Tech Meetup',
  'Discuss latest technologies',
  'This is a comprehensive tech meetup...',
  'TECH',
  'location-uuid-here',
  '2024-06-15 18:00:00',
  '2024-06-15 20:00:00',
  'organizer-uuid-here',
  100,
  'OPEN'
);
```

### Step 2: Verify Data

```bash
# Check tables are populated
SELECT COUNT(*) FROM departments;
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM locations;
```

---

## Verification & Testing

### Backend Verification

```bash
# Test API is running
curl http://localhost:8000/

# Expected output:
# {"message":"EventUSV API is running"}

# Check API documentation
# Open http://localhost:8000/docs
```

### Frontend Verification

```bash
# Test frontend is running
# Open http://localhost:5173 in browser
# Should see login page or home page
```

### Database Connection Test

```bash
# Test database connectivity
curl http://localhost:8000/api/events \
  -H "Authorization: Bearer test-token"
```

### Authentication Test

```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test-password"
  }'
```

---

## Troubleshooting

### Issue: Docker containers won't start

**Solution**:
```bash
# Check Docker daemon is running
docker ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Issue: Port 8000/5173 already in use

**Solution**:
```bash
# Windows: Find process using port
netstat -ano | findstr :8000

# macOS/Linux: Find process
lsof -i :8000

# Kill process and try again
```

### Issue: Supabase connection error

**Solution**:
- Verify `.env` file contains correct `SUPABASE_URL` and `SUPABASE_KEY`
- Check Supabase project is active
- Verify API keys have not been regenerated

### Issue: Database migrations failed

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
# In Supabase Dashboard:
# 1. Go to Settings → Database
# 2. Click "Reset database"
# 3. Re-run migration SQL

# Or drop and recreate tables
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS participation CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

### Issue: Frontend cannot connect to backend

**Solution**:
- Verify backend is running on `http://localhost:8000`
- Check CORS configuration in `backend/app/main.py`
- Verify `VITE_API_BASE_URL` is correctly set
- Clear browser cache and try again

### Issue: npm dependencies conflict

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Python virtual environment issues

**Solution**:
```bash
# Delete and recreate venv
rm -rf backend/venv

# Create new virtual environment
python -m venv backend/venv

# Activate and install dependencies
source backend/venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r backend/requirements.txt
```

---

## First Run Checklist

- [ ] Git repository cloned
- [ ] Docker and Docker Compose installed
- [ ] Node.js and npm installed
- [ ] Python 3.10+ installed
- [ ] Supabase project created
- [ ] API keys obtained and saved to `.env`
- [ ] Database tables created
- [ ] Authentication enabled in Supabase
- [ ] `.env` file configured
- [ ] Docker containers started successfully
- [ ] Frontend accessible at http://localhost:5173
- [ ] Backend API accessible at http://localhost:8000
- [ ] API documentation accessible at http://localhost:8000/docs
- [ ] Can log in with test account
- [ ] Can view events in frontend

---

## Next Steps

1. Review [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for development workflow
2. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API endpoints
3. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

---

**Document Version**: 1.0  
**Last Updated**: June 2024  
**Prepared by**: Mîndrescu Claudiu Daniel
