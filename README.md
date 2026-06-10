# EventUSV - Event Management Platform

**Author:** Mîndrescu Claudiu Daniel

**Version:** 0.1.0

**Last Updated:** June 2024

---

## 📋 Executive Summary

EventUSV is a comprehensive, cloud-native event management platform designed for academic institutions, particularly tailored for university environments. The platform enables students, organizers, and administrators to efficiently manage, discover, and participate in campus events through a modern, responsive web interface.

### Key Features

- **Event Discovery & Management**: Comprehensive event catalog with advanced filtering and search capabilities
- **User Authentication & Authorization**: Secure authentication via Supabase with role-based access control (RBAC)
- **Event Participation**: Real-time event registration, capacity management, and attendance tracking
- **Feedback System**: Post-event feedback collection and analysis
- **Calendar Integration**: Visual event scheduling and calendar management
- **Admin Dashboard**: Administrative tools for event oversight and platform management
- **Responsive Design**: Mobile-first approach with Tailwind CSS styling

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│          (React 18 + Vite + Tailwind CSS)                   │
│  - Single Page Application (SPA)                             │
│  - Component-based architecture                              │
│  - Real-time state management                                │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTP/REST
               ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                           │
│          (FastAPI + Uvicorn + Supabase)                     │
│  - RESTful API endpoints                                     │
│  - Authentication middleware                                 │
│  - Business logic layer                                      │
└──────────────┬──────────────────────────────────────────────┘
               │ PostgreSQL Protocol
               ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│              (Supabase PostgreSQL DB)                        │
│  - Relational database                                       │
│  - Real-time subscriptions                                   │
│  - Row-level security (RLS)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.1
- **Styling**: Tailwind CSS 3.4.4
- **Routing**: React Router DOM 7.14.2
- **Icons**: Lucide React 1.11.0
- **Backend Integration**: Supabase JavaScript Client 2.105.0

**Backend:**
- **Framework**: FastAPI
- **Server**: Uvicorn (ASGI)
- **Database Client**: Supabase Python Client
- **Validation**: Pydantic with email validation
- **Environment Management**: python-dotenv

**Infrastructure:**
- **Containerization**: Docker & Docker Compose
- **Database**: Supabase (PostgreSQL 14+)
- **Authentication**: Supabase Auth (JWT-based)

---

## 📁 Project Structure

```
EventUSV/
├── backend/
│   ├── Dockerfile                    # Backend container configuration
│   ├── requirements.txt              # Python dependencies
│   └── app/
│       ├── main.py                   # FastAPI application entry point
│       ├── api/                      # API route modules
│       │   ├── __init__.py
│       │   ├── auth.py              # Authentication endpoints
│       │   ├── events.py            # Event CRUD operations
│       │   ├── users.py             # User profile management
│       │   ├── participation.py     # Event registration
│       │   └── feedback.py          # Feedback endpoints
│       ├── models/                   # Pydantic data models
│       │   ├── __init__.py
│       │   ├── event.py             # Event model
│       │   ├── user.py              # User model
│       │   ├── participation.py     # Participation model
│       │   └── feedback.py          # Feedback model
│       └── schemas/                  # Pydantic schemas for validation
│           ├── __init__.py
│           ├── event.py
│           ├── user.py
│           ├── participation.py
│           └── feedback.py
│
├── frontend/
│   ├── Dockerfile                    # Frontend container configuration
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # NPM dependencies & scripts
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Root component
│       ├── index.css                 # Global styles
│       ├── components/               # Reusable React components
│       │   ├── AddEvent.jsx
│       │   ├── EventCard.jsx
│       │   ├── EventDetails.jsx
│       │   ├── EventList.jsx
│       │   ├── FeedbackForm.jsx
│       │   ├── Login.jsx
│       │   └── Navbar.jsx
│       ├── pages/                    # Page-level components
│       │   ├── Home.jsx
│       │   ├── EventsPage.jsx
│       │   ├── EventDetailPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── MyEvents.jsx
│       │   ├── Profile.jsx
│       │   ├── Settings.jsx
│       │   ├── AdminDashboard.jsx
│       │   └── Calendar.jsx
│       └── utils/
│           └── supabase.ts           # Supabase client initialization
│
├── docker-compose.yml                # Multi-container orchestration
├── package.json                      # Root-level dependencies
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose installed (v20.10+)
- Node.js 18+ (for local development)
- Python 3.10+ (for local backend development)
- Supabase account and project

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd EventUSV
   ```

2. **Create `.env` file in project root:**
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   
   # Backend Configuration
   BACKEND_PORT=8000
   
   # Frontend Configuration
   FRONTEND_PORT=5173
   ```

3. **Start the application with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

---

## 📚 Documentation

Complete documentation is available in the following files:

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - Detailed system architecture and design patterns
- [**API_DOCUMENTATION.md**](./API_DOCUMENTATION.md) - Complete API endpoint reference
- [**DATABASE_SCHEMA.md**](./DATABASE_SCHEMA.md) - Database structure and relationships
- [**SETUP_GUIDE.md**](./SETUP_GUIDE.md) - Detailed installation and configuration guide
- [**DEVELOPMENT_GUIDE.md**](./DEVELOPMENT_GUIDE.md) - Development best practices and guidelines
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Production deployment procedures

---

## 🔐 Security Considerations

### Authentication & Authorization

- **JWT-based Authentication**: Supabase Auth provides secure, stateless authentication
- **Role-Based Access Control**: Users have roles (STUDENT, ORGANIZER, ADMIN)
- **Token Management**: Tokens stored securely in browser localStorage with HTTP-only considerations
- **Row-Level Security (RLS)**: Database-level security policies enforce data isolation

### Data Protection

- **CORS Configuration**: Restricted to authorized origins in production
- **Environment Variables**: Sensitive credentials never committed to version control
- **Input Validation**: Pydantic schemas validate all incoming data
- **HTTPS**: SSL/TLS encryption required in production

---

## 📊 Database Overview

The platform uses a PostgreSQL database (via Supabase) with the following primary entities:

- **Users/Profiles**: User accounts with roles and preferences
- **Events**: Event details with metadata
- **Participation**: Event registration records
- **Feedback**: Post-event feedback and ratings
- **Departments**: Organizational units for universities

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed schema information.

---

## 🛠️ Development Workflow

### Local Development Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

---

## 🐳 Docker & Container Orchestration

The application is containerized using Docker with the following services:

- **backend**: FastAPI service on port 8000
- **frontend**: React development/build service on port 5173

Docker Compose manages both services with:
- Shared environment variables via `.env`
- Volume mounts for live development
- Network isolation and service discovery

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment strategies.

---

## 📈 Performance & Scalability

### Current Architecture Considerations

- **Stateless Backend**: Horizontal scaling compatible
- **CDN-Ready Frontend**: Vite builds optimized production bundles
- **Database Optimization**: Supabase provides built-in caching and optimization
- **API Rate Limiting**: Can be implemented via Supabase or middleware

### Future Optimization Opportunities

- Implement caching strategies (Redis)
- Add API request batching
- Optimize database queries with proper indexing
- Implement progressive web app (PWA) features
- Add image optimization and lazy loading

---

## 🤝 Contributing

### Code Style

- **Python**: Follow PEP 8 standards
- **JavaScript/JSX**: Use ESLint configuration
- **Git Commits**: Use conventional commit format

### Pull Request Process

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push to branch: `git push origin feature/feature-name`
4. Create Pull Request with detailed description

---

## 📝 License

This project is provided as-is for educational and institutional use.

---

## 📧 Support & Contact

For questions, issues, or suggestions:
- Create an issue in the repository
- Contact the development team

---

## 🎓 Academic Context

EventUSV is designed specifically for academic environments, supporting:
- Student event discovery and participation
- Organizer event management capabilities
- Administrative oversight and analytics
- Department-based organization

This documentation adheres to academic standards suitable for computer science and engineering master's degree programs.

---

**Document Version**: 1.0  
**Last Review**: June 2024  
**Prepared by**: Mîndrescu Claudiu Daniel
