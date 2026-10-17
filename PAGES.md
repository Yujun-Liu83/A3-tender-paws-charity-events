# Tender Paws A3 — Page & Route Reference

Angular 22 standalone SPA. All pages are Angular components routed by `app.routes.ts`;
the Express server serves the built bundle and falls back to `index.html` for SPA routing.

## Route table

| Route | Component | Purpose |
|---|---|---|
| `/home` | `HomeComponent` | Landing page: rescue/adoption entry points + featured events |
| `/search` | `SearchComponent` | Event search with category / service-type / status filters |
| `/event?id=:id` | `EventDetailComponent` | Single event detail, registration list, weather forecast |
| `/register?id=:id` | `RegistrationComponent` | Event registration form |
| `/admin` | `AdminListComponent` | Admin dashboard: all events with status filter + delete |
| `/admin/form?id=:id` | `AdminFormComponent` | Create / edit event form (edit mode shows linked registrations) |
| `/admin/registrations?id=:id` | `AdminRegistrationsComponent` | View / export registrations for one event |

---

## Public pages

### 1. `/home` — HomeComponent
- **Template:** `pages/home/home.component.html`
- **Data source:** `GET /api/events/featured`
- **Sections:** hero with Rescue / Adoption entries → "Our Services" quick links →
  "Current and Upcoming Services" list
- **Behaviour:**
  - Event cards render via shared `EventCardComponent`
  - Card status badge is derived from `event_date` vs today: suspended → Suspended,
    past date → Past, otherwise → Upcoming/Ongoing
  - Quick links deep-link into `/search?category=...` or `/search?service=...`
  - Scroll-reveal animation via `gsap-reveal` directive

### 2. `/search` — SearchComponent
- **Template:** `pages/search/search.component.html`
- **Data source:** `GET /api/events/search?q=&status=&category=&serviceType=`
- **Controls:** keyword search box, Status dropdown, Category dropdown (populated
  dynamically from `GET /api/categories`), Service Type dropdown
- **Behaviour:**
  - Reads URL query params on init (`category`, `service`, `status`, `q`) and
    pre-fills the form, then runs the first query
  - Submitting filters re-queries without resetting the form
  - Loading / empty / error states handled explicitly
  - Clicking a card navigates to `/event?id=:id`

### 3. `/event?id=:id` — EventDetailComponent
- **Template:** `pages/event-detail/event-detail.component.html`
- **Data sources:**
  - `GET /api/events/:id` → event info + `registrations[]` + organisation
  - `GET /api/weather?latitude=..&longitude=..` → 5-day forecast (only when
    coordinates exist; silently hidden otherwise)
- **Sections:** hero image + status/service badges → meta (date/location/price/category) →
  weather forecast strip → About / Purpose / Organised By → registration list → CTA
- **Behaviour:**
  - Registration list ordered by `registered_at DESC` (latest first)
  - Names and emails are masked (e.g. `A****`, `a***@example.com`)
  - Weather code mapped to readable label via the WMO lookup table
  - "Reserve a Place" button navigates to `/register?id=:id`; when event is
    suspended the button is replaced with a "registration closed" warning

### 4. `/register?id=:id` — RegistrationComponent
- **Template:** `pages/registration/registration.component.html`
- **Data sources:**
  - `GET /api/events/:id` → echo event summary on the form
  - `POST /api/events/:id/registrations` → submit registration
- **Form fields:** full name, email, phone, number of places (1–10), pet experience,
  pet types (Dog / Cat / Other multi-select)
- **Behaviour:**
  - Client-side validation: name length, email format, phone format, quantity range;
    failures shown via `alert()` with all errors at once
  - On success: form hides, confirmation message shows (name, places reserved, email)
  - On error: 400 shows server message, 409 shows "email already registered",
    404 shows "service not found"
  - If the event is suspended the form is hidden and a "registration closed" message shows

---

## Admin pages

### 5. `/admin` — AdminListComponent
- **Template:** `pages/admin-list/admin-list.component.html`
- **Data source:** `GET /api/admin/events?status=&q=`
- **Columns:** ID, Title, Category, Service Type, Date, Status, Registrations count, Actions
- **Behaviour:**
  - Status badge derived: suspended → Suspended, past date → Past, else → Active
  - Status dropdown (All / Active / Past / Suspended) reloads immediately
  - Search input debounced 300ms
  - Delete button: `confirm()` dialog → `DELETE /api/events/:id`; on 409 alerts
    "cannot be deleted because it has registrations"
  - "New Service" links to `/admin/form`; Edit links to `/admin/form?id=:id`;
    "View Registrations" links to `/admin/registrations?id=:id`

### 6. `/admin/form?id=:id` — AdminFormComponent
- **Template:** `pages/admin-form/admin-form.component.html`
- **Data sources:**
  - `GET /api/categories`, `GET /api/organisations` → dropdown options
  - `GET /api/events/:id` (edit mode) → pre-fill the form
  - `GET /api/events/:id/registrations` (edit mode) → show linked registrations
  - `POST /api/events` or `PUT /api/events/:id` → save
- **Fields:** title, category, organisation, date, location, status, price,
  latitude, longitude, image, service type, description, purpose
- **Behaviour:**
  - Both client-side validation (required fields, length ranges, latitude −90..90,
    longitude −180..180) and server-side validation on submit
  - Edit mode: form pre-filled, registrations listed below the form, danger-zone
    delete button (409-protected)
  - On success redirects back to `/admin`

### 7. `/admin/registrations?id=:id` — AdminRegistrationsComponent
- **Template:** `pages/admin-registrations/admin-registrations.component.html`
- **Data source:** `GET /api/events/:id/registrations` (+ `GET /api/events/:id` for title)
- **Columns:** ID, Name, Email, Phone, Places, Pet Experience, Pet Types, Registered At
- **Behaviour:**
  - Empty state when no registrations
  - "Export CSV" button generates a CSV blob and triggers a download named
    `registrations-<event-title>-<id>.csv`

---

## Shared building blocks

- **`core/api.service.ts`** — centralised HTTP wrapper (`HttpClient` via `firstValueFrom`),
  normalises errors into `ApiError` with HTTP status
- **`core/models.ts`** — TypeScript interfaces: `EventSummary`, `EventDetail`,
  `Registration`, `EventPayload`, `WeatherForecast`, `Category`, `Organisation`
- **`shared/site-header.component.ts`** — two variants: `public` (Home / Services / Admin)
  and `admin` (Dashboard / Public Site)
- **`shared/site-footer.component.ts`** — footer with copyright
- **`shared/event-card.component.ts`** — reusable event card used on home and search
- **`shared/format-date.pipe.ts`** — date formatting pipe
- **`shared/gsap-reveal.directive.ts`** — GSAP + ScrollTrigger reveal-on-scroll directive

## API ↔ client data flow

1. Component calls `ApiService.method()` (e.g. `getEvent(id)`)
2. `ApiService` issues an `HttpClient.request` to `/api/...`
3. Express route validates input, calls `event_db.js` query function
4. MySQL pool executes the prepared statement and returns rows
5. Express serialises to JSON (or `{ error, message }` on failure)
6. `ApiService` wraps non-2xx responses into `ApiError`
7. Component updates its state / event / registrations properties, which Angular
   renders into the template via control flow (`@switch`, `@if`, `@for`)
