/* ============================================================
   A3 Tender Paws - API Server
   ============================================================ */

const express = require('express');
const path = require('path');
const db = require('./event_db');

const app = express();
const PORT = process.env.PORT || 3102;

// Angular build output (dist/client/browser) is what the SPA is served from.
const CLIENT_DIR = path.join(__dirname, '../client/dist/client/browser');

// Middleware
app.use(express.json());
app.use(express.static(CLIENT_DIR));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Shared validation for event create/update payloads.
const VALID_STATUS = ['upcoming', 'ongoing', 'suspended'];

// Validates and normalises the coordinates supplied by the admin form, so the
// Open-Meteo lookup always receives in-range values.
function readCoordinates(data) {
  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);

  if (
    data.latitude === undefined || data.latitude === null || data.latitude === '' ||
    data.longitude === undefined || data.longitude === null || data.longitude === '' ||
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function validateEventPayload(data) {
  if (!data || typeof data !== 'object') {
    return 'Invalid request body';
  }
  if (!data.title || String(data.title).trim().length < 2 || String(data.title).trim().length > 60) {
    return 'Title must be between 2 and 60 characters';
  }
  if (!data.date || isNaN(new Date(data.date).getTime())) {
    return 'A valid date is required';
  }
  if (!data.location || String(data.location).trim().length < 2 || String(data.location).trim().length > 60) {
    return 'Location must be between 2 and 60 characters';
  }
  if (!data.image) {
    return 'Image is required';
  }
  if (!data.description || String(data.description).trim().length === 0) {
    return 'Description is required';
  }
  if (!data.purpose || String(data.purpose).trim().length === 0) {
    return 'Purpose is required';
  }
  if (data.status && !VALID_STATUS.includes(data.status)) {
    return 'Status must be one of upcoming, ongoing or suspended';
  }
  if (!readCoordinates(data)) {
    return 'Latitude (-90..90) and longitude (-180..180) are required';
  }
  return null;
}

function normaliseEventPayload(data) {
  const coordinates = readCoordinates(data);
  return {
    title: String(data.title).trim(),
    categoryId: parseInt(data.categoryId, 10) || 1,
    organisationId: parseInt(data.organisationId, 10) || 1,
    date: String(data.date).slice(0, 10),
    location: String(data.location).trim(),
    status: VALID_STATUS.includes(data.status) ? data.status : 'upcoming',
    image: String(data.image).trim(),
    description: String(data.description).trim(),
    purpose: String(data.purpose).trim(),
    price: data.price ? String(data.price).trim() : 'Free entry',
    serviceType: data.serviceType ? String(data.serviceType).trim() : null,
    latitude: coordinates ? coordinates.latitude : null,
    longitude: coordinates ? coordinates.longitude : null
  };
}

// API Routes
// ----------

// GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch categories' });
  }
});

// GET /api/organisations
app.get('/api/organisations', async (req, res) => {
  try {
    const organisations = await db.getOrganisations();
    res.json(organisations);
  } catch (error) {
    console.error('Error fetching organisations:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch organisations' });
  }
});

// GET /api/weather?latitude=..&longitude=..
// Server-side proxy for Open-Meteo so the browser never talks to a third party
// directly and identical lookups can be cached in memory.
const weatherCache = new Map();
const WEATHER_TTL_MS = 10 * 60 * 1000;

app.get('/api/weather', async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);

  if (
    req.query.latitude === undefined || req.query.longitude === undefined ||
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Valid latitude and longitude are required'
    });
  }

  const key = `${latitude},${longitude}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.at < WEATHER_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const url = 'https://api.open-meteo.com/v1/forecast'
      + `?latitude=${latitude}&longitude=${longitude}`
      + '&daily=weather_code,temperature_2m_max,temperature_2m_min'
      + '&timezone=auto&forecast_days=5';

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo responded with ${response.status}`);
    }

    const payload = await response.json();
    const data = {
      latitude: payload.latitude,
      longitude: payload.longitude,
      timezone: payload.timezone,
      daily: payload.daily
        ? {
            time: payload.daily.time || [],
            weatherCode: payload.daily.weather_code || [],
            temperatureMax: payload.daily.temperature_2m_max || [],
            temperatureMin: payload.daily.temperature_2m_min || []
          }
        : null
    };

    weatherCache.set(key, { at: Date.now(), data });
    res.json(data);

  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(502).json({ error: 'UPSTREAM_ERROR', message: 'Weather service is unavailable' });
  }
});

// GET /api/events
app.get('/api/events', async (req, res) => {
  try {
    const events = await db.getEvents({
      status: req.query.status,
      category: req.query.category,
      serviceType: req.query.serviceType,
      keyword: req.query.keyword || req.query.q,
      open: req.query.open
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch events' });
  }
});

// GET /api/events/featured
app.get('/api/events/featured', async (req, res) => {
  try {
    const events = await db.getFeaturedEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch featured events' });
  }
});

// GET /api/events/search
app.get('/api/events/search', async (req, res) => {
  try {
    const events = await db.getEvents({
      status: req.query.status,
      category: req.query.category,
      serviceType: req.query.serviceType,
      keyword: req.query.q || req.query.keyword,
      open: req.query.open
    });
    res.json(events);
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Search failed' });
  }
});

// POST /api/events
app.post('/api/events', async (req, res) => {
  try {
    const invalid = validateEventPayload(req.body);
    if (invalid) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: invalid });
    }
    const result = await db.createEvent(normaliseEventPayload(req.body));
    res.status(201).json({ id: result.id });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to create event' });
  }
});

// GET /api/events/:id
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await db.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch event' });
  }
});

// GET /api/events/:id/registrations
app.get('/api/events/:id/registrations', async (req, res) => {
  try {
    const event = await db.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found' });
    }
    res.json(event.registrations || []);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch registrations' });
  }
});

// POST /api/events/:id/registrations
app.post('/api/events/:id/registrations', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, email, phone, quantity, petExperience, petTypes } = req.body || {};

    // Validation
    if (!name || String(name).trim().length < 2 || String(name).trim().length > 100) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Name must be between 2 and 100 characters' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Please provide a valid email address' });
    }
    const quantityNumber = parseInt(quantity, 10);
    if (!quantity || isNaN(quantityNumber) || quantityNumber < 1 || quantityNumber > 10) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Quantity must be between 1 and 10' });
    }
    if (!phone || String(phone).trim().length < 8 || String(phone).trim().length > 20) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Please provide a valid phone number' });
    }

    // Event must exist
    const event = await db.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found' });
    }
    if (event.status === 'suspended') {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Registration is closed for this event' });
    }

    const types = Array.isArray(petTypes) ? petTypes.join(', ') : (petTypes ? String(petTypes) : null);

    const result = await db.createRegistration(eventId, {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      quantity: quantityNumber,
      petExperience: petExperience ? String(petExperience).trim() : null,
      petTypes: types
    });

    res.status(201).json({
      id: result.id,
      eventId: parseInt(eventId, 10),
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      quantity: quantityNumber,
      registeredAt: new Date().toISOString()
    });

  } catch (error) {
    if (error.code === 'DUPLICATE_REGISTRATION') {
      return res.status(409).json({
        error: 'CONFLICT',
        message: 'This email is already registered for this event'
      });
    }
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to create registration' });
  }
});

// PUT /api/events/:id
app.put('/api/events/:id', async (req, res) => {
  try {
    const invalid = validateEventPayload(req.body);
    if (invalid) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: invalid });
    }
    const exists = await db.eventExists(req.params.id);
    if (!exists) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found' });
    }
    await db.updateEvent(req.params.id, normaliseEventPayload(req.body));
    res.json({ id: parseInt(req.params.id, 10) });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to update event' });
  }
});

// DELETE /api/events/:id
app.delete('/api/events/:id', async (req, res) => {
  try {
    const exists = await db.eventExists(req.params.id);
    if (!exists) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found' });
    }
    await db.deleteEvent(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    if (error.code === 'REGISTRATIONS_EXIST') {
      return res.status(409).json({
        error: 'CONFLICT',
        message: 'Cannot delete this event because it has registrations',
        registrationCount: error.count
      });
    }
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to delete event' });
  }
});

// Admin list alias (same data as /api/events when no status is supplied)
app.get('/api/admin/events', async (req, res) => {
  try {
    const events = await db.getEvents({
      status: req.query.status,
      keyword: req.query.q
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching admin events:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch events' });
  }
});

// Unknown API routes return JSON (never HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Resource not found' });
});

// Missing image/static assets must 404 instead of falling through to the SPA
// shell, otherwise the browser receives index.html (HTTP 200, text/html) and
// renders a silent broken image.
app.use('/assets', (req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Asset not found' });
});

// Fallback - serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Tender Paws A3 server running at http://localhost:${PORT}`);
});
