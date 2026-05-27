# 🌍 Breathe ESG – Enterprise Carbon Intelligence Platform

Enterprise-grade ESG emissions intelligence platform built with Django REST Framework and React.

Designed as part of the Breathe ESG Tech Intern Assignment to simulate realistic enterprise sustainability reporting, ingestion workflows, auditability, and analyst operations.

---

# 🚀 Live Deployment

## Frontend (Vercel)

🔗 https://breathe-esg-topaz.vercel.app

## Backend API (Render)

🔗 https://breathe-esg-backend-7d2m.onrender.com

---

# ✨ Features

## ESG Ingestion Pipelines
- SAP fuel & procurement ingestion
- Utility electricity ingestion
- Corporate travel ingestion
- Multi-format parsing support
- File upload workflows

## Emissions Intelligence
- Scope 1 / 2 / 3 categorization
- Emissions normalization
- CO₂e calculations
- Monthly trend analytics
- Scope breakdown visualization

## Enterprise Workflow
- Analyst review workflow
- Approval / rejection pipeline
- Audit trail logging
- Immutable activity records
- Role-based access control

## Dashboard & UX
- Modern enterprise dashboard
- Real-time KPI cards
- Interactive charts
- Advanced filtering
- Responsive UI
- Professional analytics layout

---

# 🏗️ Architecture

```text
React + Vite (Vercel)
        ↓
Django REST API (Render)
        ↓
PostgreSQL / SQLite Fallback
```

---

# 🛠️ Tech Stack

## Backend
- Django
- Django REST Framework
- PostgreSQL
- Pandas
- SimpleJWT
- django-filter
- WhiteNoise

## Frontend
- React
- Vite
- TailwindCSS
- React Query
- Recharts
- Axios
- Lucide React

---

# 👥 Demo Credentials

| Role | Email | Password |
|------|------|------|
| Admin | admin@acme.com | password123 |
| Analyst | analyst@acme.com | password123 |
| Auditor | auditor@acme.com | password123 |

---

# 📂 Project Structure

```text
BREATHE_ESG/
│
├── backend/
│   ├── core/
│   ├── my_app/
│   ├── fixtures/
│   ├── scripts/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── MODEL.md
├── DECISIONS.md
├── SOURCES.md
├── TRADEOFFS.md
└── README.md
```

---

# 📘 Architecture Documentation

The repository includes additional architecture and engineering documentation:

- MODEL.md
- DECISIONS.md
- SOURCES.md
- TRADEOFFS.md

---

# ⚙️ Local Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/AmanKumar2202/Breathe_ESG.git
cd Breathe_ESG
```

---

# 🔧 Backend Setup

## Create Virtual Environment

```bash
cd backend

python -m venv venv
```

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Run Migrations

```bash
python manage.py migrate
```

---

## Seed Demo Data

```bash
python manage.py seed_data
```

---

## Start Backend Server

```bash
python manage.py runserver
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

# 🎨 Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🌐 Environment Variables

## Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```

---

## Backend (`backend/.env`)

```env
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=your_database_url
```

---

# 🚀 Deployment

## Frontend Deployment
- Hosted on Vercel

## Backend Deployment
- Hosted on Render
- Gunicorn production server
- WhiteNoise static serving

---

# 🔐 Authentication

JWT-based authentication using:

- Access Tokens
- Refresh Tokens
- Protected Routes
- Role-based permissions

---

# 📊 Dashboard Modules

- ESG KPI Dashboard
- Monthly Emissions Trends
- Scope Breakdown Charts
- Review Workflow Tracking
- Recent Ingestion Jobs
- Audit Activity Monitoring

---

# 🧠 Assignment Focus Areas

This implementation focuses heavily on:

- realistic ESG workflows
- auditability
- ingestion pipelines
- enterprise UX patterns
- scalable architecture
- data normalization
- operational transparency
- explicit engineering tradeoffs

---

# 📌 Future Improvements

Potential future enhancements:

- Docker support
- CI/CD pipelines
- Celery background jobs
- Redis queues
- WebSocket live ingestion updates
- Swagger/OpenAPI docs
- Multi-organization tenancy
- Advanced anomaly detection
- AI-assisted emissions classification

---

# 👨‍💻 Author

Aman Kumar

GitHub:
https://github.com/AmanKumar2202

---

# 📄 License

This project was built for the Breathe ESG Tech Intern Assignment and educational/demo purposes.