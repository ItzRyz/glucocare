# GlucoCare 🩺

> **Intelligent Diabetes Management Platform** — Built for Hackathon Himtif

GlucoCare is a full-stack web application that helps patients and healthcare professionals manage diabetes through AI-powered predictions, real-time telemedicine, and comprehensive health tracking.

🔗 **Live:** [glucocare-ai.vercel.app](https://glucocare-ai.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Machine Learning Models](#machine-learning-models)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Roles & Permissions](#roles--permissions)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

---

## Overview

GlucoCare is a multi-role health platform designed to bridge the gap between diabetic patients and their doctors. It combines:

- **AI/ML diagnosis** — in-process TypeScript machine learning models for diabetes risk prediction
- **Telemedicine** — real-time doctor-patient chat rooms with medical record generation
- **Health monitoring** — blood glucose tracking, weekly assessments, and personalized dietary guidelines
- **Role-based access control** — Patients, Doctors, and Admins each have a tailored experience powered by Clerk Organizations

---

## Features

### 🧑‍⚕️ For Patients
| Feature | Description |
|---|---|
| **ML Diagnosis** | Submit symptoms and get diabetes risk predictions from two ML models |
| **Glucose Tracking** | Log blood sugar levels, categorized by meal context (fasting, post-meal, etc.) |
| **Appointments** | Book and manage appointments with doctors |
| **Telemedicine** | Real-time chat with assigned doctors |
| **Weekly Assessment** | Track weekly diet and exercise compliance, report symptoms |
| **Medical Records** | View SOAP-format medical records from doctor consultations |
| **Allergy Management** | Record and manage personal allergy information |
| **Dietary Guidelines** | Personalized nutrition guidance for diabetic management |

### 🩺 For Doctors
| Feature | Description |
|---|---|
| **Patient Dashboard** | View all assigned patients and their health history |
| **Medical Records** | Create SOAP notes (Subjective, Objective, Assessment, Plan) |
| **Prescriptions** | Write digital prescriptions with drug name, dosage, and instructions |
| **Lab Results** | Record and review laboratory test results |
| **Vital Signs** | Log vital measurements (blood pressure, heart rate, temperature, BMI) |
| **Telemedicine** | Chat-based consultations with patients |
| **ML Predictions** | View AI-generated diabetes risk predictions for patients |

### 🛠️ For Admins
| Feature | Description |
|---|---|
| **Admin Dashboard** | Platform-wide statistics (users, appointments, glucose records, predictions) |
| **User Management** | View and manage all registered users |
| **Role Management** | Create and assign roles with granular menu-level permissions (CRUD) |
| **Menu Management** | Configure which menus each role can access |
| **ML Status** | Real-time status of the in-process ML model service |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.9 | Full-stack React framework (App Router) |
| **React** | 19.2.4 | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Utility-first styling |
| **Framer Motion** | ^12 | Animations and transitions |
| **Recharts** | ^3 | Data visualization charts |
| **Lucide React** | ^1.21 | Icon library |
| **Radix UI** | ^1.6 | Accessible headless UI primitives |
| **shadcn/ui** | ^4.11 | Pre-built component library |

### Backend & Database
| Technology | Version | Purpose |
|---|---|---|
| **Next.js API Routes** | — | RESTful API (TypeScript) |
| **Prisma** | ^7.8 | ORM and database client |
| **PostgreSQL** | — | Primary relational database |
| **Clerk** | ^7.5 | Authentication, organizations & RBAC |

### Machine Learning
| Technology | Purpose |
|---|---|
| **TypeScript (custom)** | In-process ML models — no external service required |
| **Logistic Regression** | Binary diabetes classification via gradient descent |
| **Random Forest** | Ensemble decision tree classifier with bootstrap sampling |
| **Python / Flask** | Local development backend (not used in production) |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Vercel** | Hosting, serverless deployment, CI/CD |
| **Vercel Serverless Functions** | Next.js API routes run as Lambda functions |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│              React 19 + Next.js App Router                  │
│         Framer Motion · Recharts · Tailwind CSS             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│              Vercel Serverless (Next.js API Routes)         │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │  Auth (Clerk)│  │  Prisma ORM   │  │  ML Engine (TS)  │ │
│  │  RBAC/Orgs   │  │  PostgreSQL   │  │  Random Forest   │ │
│  └──────────────┘  └───────────────┘  │  Logistic Reg.   │ │
│                                       └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     PostgreSQL Database                     │
│         (Users, Records, Appointments, Predictions)         │
└─────────────────────────────────────────────────────────────┘
```

> **Key design decision:** The ML models run entirely in-process as TypeScript within the Next.js Lambda function. There is no separate Python microservice in production — this eliminates network latency, cold-start failures, and Vercel bundle size issues.

---

## Machine Learning Models

Both models are implemented from scratch in [`src/lib/ml-model.ts`](./src/lib/ml-model.ts) with no external ML libraries.

### Input Features (16 total)

| Feature | Type | Description |
|---|---|---|
| `Age` | Number | Patient age in years |
| `Gender` | String (`Male`/`Female`) | Biological sex |
| `Polyuria` | String (`Yes`/`No`) | Excessive urination |
| `Polydipsia` | String (`Yes`/`No`) | Excessive thirst |
| `sudden weight loss` | String (`Yes`/`No`) | Unexplained weight loss |
| `weakness` | String (`Yes`/`No`) | General weakness |
| `Polyphagia` | String (`Yes`/`No`) | Excessive hunger |
| `Genital thrush` | String (`Yes`/`No`) | Genital yeast infection |
| `visual blurring` | String (`Yes`/`No`) | Blurred vision |
| `Itching` | String (`Yes`/`No`) | Persistent itching |
| `Irritability` | String (`Yes`/`No`) | Irritability |
| `delayed healing` | String (`Yes`/`No`) | Slow wound healing |
| `partial paresis` | String (`Yes`/`No`) | Partial limb weakness |
| `muscle stiffness` | String (`Yes`/`No`) | Muscle stiffness |
| `Alopecia` | String (`Yes`/`No`) | Hair loss |
| `Obesity` | String (`Yes`/`No`) | Obesity |

### Output

```json
{
  "status": "success",
  "model": "Random Forest",
  "prediction": "Positive",
  "probability": "78.50%"
}
```

### Model 1: Logistic Regression
- Gradient descent optimization (`lr=0.1`, `max_iter=1000`)
- StandardScaler for age normalization
- Sigmoid activation for binary classification

### Model 2: Random Forest
- 10 decision tree estimators
- Bootstrap sampling with seeded random number generator
- Max tree depth: 5
- Gini impurity splitting criterion
- Prediction by majority vote across all trees

### Training Data
The models train on a **synthetic 500-row dataset** generated deterministically (seed=42) at Lambda cold-start, with an 80/20 train/test split. The original CSV dataset (`api/diabetes_data_upload.csv`) is used when running locally with the Flask development server.

---

## Database Schema

### Core Models

```
User ─── Role ─── MenuAccess ─── Menu
 │
 ├── GlucoseRecord (blood sugar logs)
 ├── DiagnosisPrediction (ML results)
 ├── WeeklyAssessment (weekly check-ins)
 ├── Allergy
 ├── Appointment (patient ↔ doctor)
 ├── ChatRoom (telemedicine)
 │    └── Message
 └── MedicalRecord (SOAP notes)
      ├── MedicalDiagnosis (ICD codes)
      ├── VitalSign (BP, HR, temp, BMI)
      ├── LabResult
      └── Prescription
           └── PrescriptionItem
```

### Key Models

| Model | Description |
|---|---|
| `User` | Synced from Clerk. Linked to a role. |
| `Role` | Maps to Clerk org role slug. Controls menu access. |
| `MenuAccess` | Per-role CRUD permissions on each menu item |
| `GlucoseRecord` | Blood sugar log with type (fasting/post-meal) and category |
| `DiagnosisPrediction` | Stored ML prediction with input features, result, and probability |
| `WeeklyAssessment` | Weekly diet/exercise/symptoms self-report |
| `MedicalRecord` | SOAP-format doctor notes linked to a chat session |
| `Appointment` | Scheduled patient-doctor meeting with status tracking |
| `ChatRoom` | Real-time telemedicine session between patient and doctor |

---

## API Reference

All routes are protected by Clerk authentication. Base URL: `/api`

### Diagnose (ML Predictions)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/diagnose` | List all predictions for current user |
| `POST` | `/api/diagnose` | Run ML prediction (body: features + `model`) |
| `GET` | `/api/diagnose/:id` | Get a specific prediction |

**POST body example:**
```json
{
  "model": "randomforest",
  "Age": "45",
  "Gender": "Male",
  "Polyuria": "Yes",
  "Polydipsia": "Yes",
  "save": true
}
```

### Glucose Records

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/glucose` | List glucose records |
| `POST` | `/api/glucose` | Log a new blood sugar reading |
| `GET` | `/api/glucose/evaluate` | Get evaluation of recent glucose trend |
| `GET/PUT/DELETE` | `/api/glucose/:id` | Manage a specific record |

### Appointments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/appointments` | List appointments |
| `POST` | `/api/appointments` | Book an appointment |
| `GET` | `/api/appointments/slots` | Get available time slots |
| `GET/PUT/DELETE` | `/api/appointments/:id` | Manage a specific appointment |

### Medical Records

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/medical-records` | List records |
| `POST` | `/api/medical-records` | Create a SOAP record |
| `GET/PUT/DELETE` | `/api/medical-records/:id` | Manage a specific record |

### Telemedicine (Chat)

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/chat/rooms` | List/create chat rooms |
| `GET/PUT` | `/api/chat/rooms/:id` | Manage a room |
| `GET/POST` | `/api/chat/messages` | List/send messages |
| `GET/DELETE` | `/api/chat/messages/:id` | Manage a message |

### Assessments

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/assessments` | List/create weekly assessments |
| `GET` | `/api/assessments/:id` | Get a specific assessment |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform statistics + ML status |
| `GET` | `/api/admin/sidebar` | Role-based sidebar menu |

### Reference Data

| Endpoint | Description |
|---|---|
| `GET /api/roles` | List all roles |
| `GET /api/menus` | List all menus |
| `GET /api/menu-access` | Menu access rules |
| `GET /api/users` | List users (admin only) |
| `GET /api/doctors` | List available doctors |
| `GET /api/statuses` | List status options |
| `GET /api/types` | List type options |
| `GET /api/categories` | List categories |
| `GET /api/allergies` | List patient allergies |
| `GET /api/health` | Server health check |

---

## Roles & Permissions

GlucoCare uses **Clerk Organizations** with three roles:

| Role | Clerk Slug | Description |
|---|---|---|
| **Patient** | `org:patient` | Regular user, self-service health tracking |
| **Doctor** | `org:doctor` | Healthcare provider, manages patient records |
| **Admin** | `org:admin` | Platform administrator, full system access |

Menu access (Read/Create/Update/Delete) is configured per role via the Admin panel and stored in the `MenuAccess` table.

---

## Project Structure

```
glucocare/
├── api/                        # Python Flask dev server (local only)
│   ├── index.py                # Flask app entry point
│   ├── routes.py               # Flask route definitions
│   ├── model_service.py        # Python ML models (dev reference)
│   └── diabetes_data_upload.csv
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding script
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── layout.tsx          # Root layout
│   │   ├── admin/              # Admin panel pages
│   │   ├── appointments/       # Appointment booking
│   │   ├── assessment/         # Weekly assessments
│   │   ├── dashboard/          # Patient/doctor dashboard
│   │   ├── diagnose/           # ML diagnosis page
│   │   ├── guidelines/         # Dietary guidelines
│   │   ├── records/            # Medical history
│   │   ├── telemedicine/       # Chat interface
│   │   └── api/                # API route handlers
│   │
│   ├── components/
│   │   ├── landing/            # Public landing page sections
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── admin/              # Admin components
│   │   ├── diagnose/           # ML form components
│   │   ├── appointments/       # Appointment UI
│   │   ├── assessment/         # Assessment forms
│   │   ├── records/            # Medical record views
│   │   ├── telemedicine/       # Chat UI components
│   │   ├── guidelines/         # Dietary content
│   │   ├── layout/             # Navbar, sidebar
│   │   └── ui/                 # Reusable base components
│   │
│   ├── lib/
│   │   ├── ml-model.ts         # ✨ TypeScript ML engine (production)
│   │   ├── api-client.ts       # Frontend API helper functions
│   │   ├── api-response.ts     # Standardized API response helpers
│   │   ├── rbac.ts             # Role-based access control helpers
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── glucose-evaluate.ts # Blood sugar evaluation logic
│   │   └── flask-url.ts        # Flask URL resolver (dev only)
│   │
│   └── types/                  # TypeScript type definitions
│
├── .vercelignore               # Files excluded from Vercel deployment
├── next.config.ts              # Next.js configuration + API rewrites
├── requirements.txt            # Python dependencies (dev only)
└── package.json
```

---

## Local Development

### Prerequisites
- Node.js 20+
- Python 3.12 (optional, for Flask dev server)
- PostgreSQL database
- Clerk account

### 1. Clone & Install

```bash
git clone https://github.com/ItzRyz/glucocare.git
cd glucocare
npm install
```

### 2. Configure Environment

Create a `.env` file at the project root:

```bash
cp .env.example .env
# Fill in your values
```

### 3. Setup Database

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### 4. Run Development Server

**Option A — Next.js only** (ML runs in TypeScript, no Python needed):
```bash
npm run dev
```

**Option B — With Flask dev server** (uses real CSV dataset + Python ML):
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run flask-dev
```

App runs at **http://localhost:3000**

---

## Deployment

GlucoCare is deployed to **Vercel** using the CLI:

```bash
# Deploy to production (force fresh build, no cache)
npx vercel --prod --force
```

> ⚠️ Always use `--force` to avoid Vercel reusing stale build caches that may contain old dependencies.

### Vercel Build Process
1. `prisma generate` — generates Prisma client
2. `next build` — compiles Next.js (Turbopack)
3. Python runtime installs `flask` and `flask-cors`
4. Deploys to Vercel Serverless infrastructure

### `.vercelignore`
The following are excluded from the deployment bundle to stay within the 245 MB Lambda limit:

```
.next
node_modules
**/.venv
**/.venv/**
api/.venv
api/.venv/**
*.log
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | ✅ | Clerk backend secret key |
| `CLERK_WEBHOOK_SECRET` | ✅ | Clerk webhook signing secret |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk public key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | ✅ | Post sign-in redirect path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | ✅ | Post sign-up redirect path |
| `NEXT_PUBLIC_DEFAULT_ROLE_PATIENT_KEY` | ✅ | Clerk role ID for Patient |
| `NEXT_PUBLIC_DEFAULT_ROLE_DOCTOR_KEY` | ✅ | Clerk role ID for Doctor |
| `NEXT_PUBLIC_DEFAULT_ROLE_ADMIN_KEY` | ✅ | Clerk role ID for Admin |
| `NEXT_PUBLIC_CLERK_DEFAULT_ORG_ID` | ✅ | Default Clerk organization ID |
| `FLASK_API_URL` | ❌ | Override Flask API base URL (optional) |

---

## Key Design Decisions

### Why TypeScript ML instead of Python?
Vercel Lambda has a **245 MB bundle size limit**. The Python scientific stack (`scikit-learn`, `numpy`, `pandas`) alone exceeds 300 MB. By implementing Logistic Regression and Random Forest from scratch in TypeScript, the ML engine runs directly inside the Next.js Lambda with zero additional bundle cost.

### Why no HTTP proxy to Flask in production?
Next.js server-side `fetch()` calls bypass `next.config.ts` rewrites — they make real external HTTP requests. On Vercel, this means internal Flask calls get blocked by Vercel's deployment protection. The in-process TypeScript solution eliminates this entirely.

### Why Clerk Organizations?
Clerk Organizations provide a battle-tested multi-role authentication system with org-scoped JWT claims (`orgRole`), webhooks for user sync, and built-in UI components — significantly reducing auth boilerplate while enabling fine-grained RBAC.

---

## License

MIT — Built for Hackathon Himtif 2026
