# Tender Paws A3 — Charity Events Website

PROG2002 Web Development II — Assessment 3. A dynamic charity events platform for
animal rescue and adoption services. Public visitors browse, search and register for
events; organisers manage events and view registrations through an admin area.

## Features

- **Public client side (Angular SPA):** home, search/filter, event detail, registration
- **Admin side (Angular SPA):** event list (Active/Past/Suspended), create/edit form,
  registrations viewer with CSV export, delete protection (409 when registrations exist)
- **Registration flow:** form validation, duplicate-email protection (UNIQUE constraint),
  success confirmation
- **Event detail:** registrations listed latest-first with masked contact details,
  5-day Open-Meteo weather forecast based on event coordinates
- **REST API** built with Node.js + Express, backed by MySQL
- **Responsive UI** with GSAP scroll-reveal animations

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | **Angular 22** (standalone components, routing, HttpClient, Reactive Forms) |
| Backend | **Node.js + Express.js** (REST API, static hosting for the Angular build) |
| Database | **MySQL** (mysql2/promise, connection pool, foreign keys, UNIQUE constraints) |
| External API | **Open-Meteo** weather forecast (server-side proxy with in-memory cache) |
| Animation | GSAP + ScrollTrigger |

## Project Structure

```
A3/
├── source/
│   ├── client/                  # Angular 22 standalone SPA
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.routes.ts        # Route table (7 routes)
│   │   │   │   ├── app.config.ts        # providers: router + HttpClient
│   │   │   │   ├── core/
│   │   │   │   │   ├── api.service.ts   # Centralised HTTP client (firstValueFrom)
│   │   │   │   │   └── models.ts       # TypeScript interfaces
│   │   │   │   ├── pages/
│   │   │   │   │   ├── home/           # HomeComponent
│   │   │   │   │   ├── search/         # SearchComponent
│   │   │   │   │   ├── event-detail/   # EventDetailComponent
│   │   │   │   │   ├── registration/  # RegistrationComponent
│   │   │   │   │   ├── admin-list/     # AdminListComponent
│   │   │   │   │   ├── admin-form/     # AdminFormComponent (create/edit)
│   │   │   │   │   └── admin-registrations/  # AdminRegistrationsComponent
│   │   │   │   └── shared/             # Header, footer, event-card, pipes, gsap directive
│   │   │   ├── css/                    # Global + per-page stylesheets
│   │   │   └── main.ts
│   │   ├── angular.json
│   │   └── package.json
│   ├── api/                      # Express REST API
│   │   ├── server.js            # Routes, validation, weather proxy, SPA fallback
│   │   └── event_db.js           # MySQL pool + all query functions
│   └── database/
│       ├── schema.sql            # CREATE TABLE statements
│       ├── seed.sql              # INSERT sample data
│       └── database-final.sql     # Single-file schema + seed for deployment
├── .env.example
├── package.json                  # Root scripts (start the API server)
└── README.md
```

## Setup

1. **Install backend dependencies**
   ```bash
   npm install
   ```

2. **Install and build the Angular client**
   ```bash
   cd source/client
   npm install
   npm run build
   cd ../..
   ```
   The build output lands in `source/client/dist/client/browser/`, which Express serves.

3. **Create the database and import sample data**
   ```bash
   mysql -u root -p < source/database/schema.sql
   mysql -u root -p < source/database/seed.sql
   ```

4. **Configure environment variables** (optional — see `.env.example`)
   Defaults: port `3102`, database `charityevents_db`, MySQL user `root`.

5. **Start the server**
   ```bash
   npm start
   ```
   Open http://localhost:3102 — Express serves the Angular build and the REST API.

## API Endpoints

### Public
| Method | Path | Description |
|---|---|---|
| GET | `/api/categories` | All event categories |
| GET | `/api/organisations` | All rescue/adoption organisations |
| GET | `/api/events` | Event list; query params: `status`, `category`, `serviceType`, `keyword`, `open` |
| GET | `/api/events/featured` | Non-suspended events for the home page |
| GET | `/api/events/search` | Search alias with `q` keyword |
| GET | `/api/events/:id` | Single event detail **including its registrations (latest-first)** |
| GET | `/api/events/:id/registrations` | Registrations for one event |
| POST | `/api/events/:id/registrations` | Submit a new registration |
| GET | `/api/weather?latitude=..&longitude=..` | Open-Meteo proxy (5-day forecast, cached 10 min) |

### Admin
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/events` | Admin event list (same query params as `/api/events`) |
| POST | `/api/events` | Create a new event |
| PUT | `/api/events/:id` | Update an existing event |
| DELETE | `/api/events/:id` | Delete an event (rejected with 409 if registrations exist) |

### Status codes
| Scenario | Code |
|---|---|
| Success (read / update) | 200 |
| Resource created | 201 |
| Invalid payload / validation error | 400 |
| Event not found | 404 |
| Duplicate registration / event has registrations blocking delete | 409 |
| Server / upstream error | 500 / 502 |

All error responses return JSON `{ error, message }` — no SQL or stack traces are exposed.

## Database

### Tables
- `organisations` — rescue/adoption organisation details
- `categories` — event types (Rescue / Adoption / Shelter / Volunteer)
- `events` — event details incl. `service_type`, `status` (upcoming/ongoing/suspended),
  `latitude`, `longitude` (for the weather forecast)
- `registrations` — user registrations; **UNIQUE(event_id, email)** prevents duplicate
  sign-ups, foreign key to `events` with `ON DELETE CASCADE`

### Sample data
- 4 categories, 3 organisations, 8 events (with coordinates), 12 registrations

## Deployment

Each student deploys their own instance to the SCU cPanel:
- Express API serves the built Angular SPA (`dist/client/browser/`) and the REST routes
- MySQL database imported from `database-final.sql`
- Set `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` as environment variables
