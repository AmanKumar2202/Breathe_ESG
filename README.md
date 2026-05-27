# Breathe ESG – Tech Intern Assignment

Enterprise ESG emissions intelligence platform built with Django REST Framework and React.

## Features

- Multi-source ESG ingestion pipeline
- SAP fuel/procurement parsing
- Utility electricity ingestion
- Corporate travel emissions ingestion
- Scope 1 / 2 / 3 categorization
- Analyst review workflow
- Immutable audit logging
- Multi-tenant architecture
- Enterprise dashboard UI
- Role-based access control

---

## Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL
- Pandas

### Frontend
- React
- Vite
- TailwindCSS
- React Query
- Recharts

---

## Demo Credentials

| Role | Email | Password |
|------|------|------|
| Admin | admin@acme.com | admin123 |
| Analyst | analyst@acme.com | analyst123 |
| Auditor | auditor@acme.com | auditor123 |

---

## Architecture Docs

- MODEL.md
- DECISIONS.md
- SOURCES.md
- TRADEOFFS.md

---

## Local Setup

### Backend

```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

### Frontend
Vercel

### Backend
Render

---

## Assignment Notes

This project was built as part of the Breathe ESG Tech Intern Assignment.

The focus of the implementation was:
- realistic ESG ingestion workflows
- auditability
- data normalization
- enterprise analyst UX
- explicit architectural tradeoffs