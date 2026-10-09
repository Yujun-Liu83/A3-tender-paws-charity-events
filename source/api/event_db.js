/* ============================================================
   A3 Tender Paws - Database Helper
   ============================================================ */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'charityevents_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

try {
  pool = mysql.createPool(DB_CONFIG);
} catch (error) {
  console.error('Database connection failed:', error.message);
  pool = null;
}

async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database not available');
  }
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getCategories() {
  return query('SELECT id, name, description FROM categories ORDER BY id');
}

async function getOrganisations() {
  return query('SELECT id, name, slug, focus, email, city FROM organisations ORDER BY id');
}

// Admin list uses Active / Past / Suspended; the stored enum is
// upcoming / ongoing / suspended, so Active and Past are derived from the date.
function statusCondition(status, params) {
  const value = String(status).toLowerCase();
  if (value === 'active') {
    return " AND e.status != 'suspended' AND e.event_date >= CURDATE()";
  }
  if (value === 'past') {
    return " AND e.status != 'suspended' AND e.event_date < CURDATE()";
  }
  if (value === 'suspended') {
    return " AND e.status = 'suspended'";
  }
  params.push(status);
  return ' AND e.status = ?';
}

async function getEvents(filters = {}) {
  let sql = `
    SELECT e.id, e.title, c.name AS category, e.event_date AS date,
           e.location, e.status, e.image, e.description, e.purpose,
           e.price, e.service_type AS serviceType, e.latitude, e.longitude,
           (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registrationCount
    FROM events e
    JOIN categories c ON e.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.status) {
    sql += statusCondition(filters.status, params);
  }
  if (filters.category) {
    sql += ' AND c.name = ?';
    params.push(filters.category);
  }
  if (filters.serviceType) {
    sql += ' AND e.service_type = ?';
    params.push(filters.serviceType);
  }
  if (filters.keyword) {
    sql += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)';
    params.push(`%${filters.keyword}%`, `%${filters.keyword}%`, `%${filters.keyword}%`);
  }
  if (filters.open === '1' || filters.open === 'true' || filters.open === true || filters.open === 1) {
    sql += ` AND e.status != 'suspended'`;
  }

  sql += ' ORDER BY e.event_date ASC, e.id ASC';
  return query(sql, params);
}

async function getFeaturedEvents() {
  return query(`
    SELECT e.id, e.title, c.name AS category, e.event_date AS date,
           e.location, e.status, e.image, e.description, e.purpose, e.price,
           e.service_type AS serviceType, e.latitude, e.longitude
    FROM events e
    JOIN categories c ON e.category_id = c.id
    WHERE e.status != 'suspended'
    ORDER BY e.event_date ASC
  `);
}

async function eventExists(id) {
  const rows = await query('SELECT id FROM events WHERE id = ?', [id]);
  return rows.length > 0;
}

async function getEventById(id) {
  const [event] = await query(`
    SELECT e.id, e.title, c.name AS category, e.event_date AS date,
           e.location, e.status, e.image, e.description, e.purpose,
           e.price, e.service_type AS serviceType, e.latitude, e.longitude,
           e.category_id AS categoryId,
           o.id AS organisationId, o.name AS organisationName, o.slug AS organisationSlug,
           o.focus, o.email, o.city
    FROM events e
    JOIN categories c ON e.category_id = c.id
    JOIN organisations o ON e.organisation_id = o.id
    WHERE e.id = ?
  `, [id]);

  if (!event) return null;

  // Latest registrations first
  const registrations = await query(`
    SELECT id, name, email, phone, quantity,
           pet_experience AS petExperience, pet_types AS petTypes,
           registered_at AS registeredAt
    FROM registrations
    WHERE event_id = ?
    ORDER BY registered_at DESC, id DESC
  `, [id]);

  return {
    ...event,
    organisation: {
      id: event.organisationId,
      name: event.organisationName,
      slug: event.organisationSlug,
      focus: event.focus,
      email: event.email,
      city: event.city
    },
    registrations: registrations.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      quantity: r.quantity,
      petExperience: r.petExperience,
      petTypes: r.petTypes,
      registeredAt: r.registeredAt
    })),
    registrationCount: registrations.length
  };
}

async function createEvent(data) {
  const result = await query(`
    INSERT INTO events (title, category_id, organisation_id, event_date, location,
                        status, image, description, purpose, price, service_type,
                        latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.title, data.categoryId, data.organisationId, data.date, data.location,
    data.status, data.image, data.description, data.purpose, data.price,
    data.serviceType || null, data.latitude ?? null, data.longitude ?? null
  ]);
  return { id: result.insertId };
}

async function updateEvent(id, data) {
  await query(`
    UPDATE events
    SET title = ?, category_id = ?, organisation_id = ?, event_date = ?, location = ?,
        status = ?, image = ?, description = ?, purpose = ?, price = ?,
        service_type = ?, latitude = ?, longitude = ?
    WHERE id = ?
  `, [
    data.title, data.categoryId, data.organisationId, data.date, data.location,
    data.status, data.image, data.description, data.purpose, data.price,
    data.serviceType || null, data.latitude ?? null, data.longitude ?? null, id
  ]);
  return true;
}

async function deleteEvent(id) {
  // Deleting is only allowed when there are no registrations (otherwise 409).
  const [regCount] = await query(
    'SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?',
    [id]
  );

  if (regCount.count > 0) {
    const error = new Error('Event has existing registrations');
    error.code = 'REGISTRATIONS_EXIST';
    error.count = regCount.count;
    throw error;
  }

  await query('DELETE FROM events WHERE id = ?', [id]);
  return true;
}

async function createRegistration(eventId, data) {
  // Friendly duplicate check; the UNIQUE(event_id, email) key is the real guard.
  const [existing] = await query(
    'SELECT id FROM registrations WHERE event_id = ? AND email = ?',
    [eventId, data.email]
  );

  if (existing) {
    const error = new Error('Email already registered for this event');
    error.code = 'DUPLICATE_REGISTRATION';
    throw error;
  }

  try {
    const result = await query(`
      INSERT INTO registrations
        (event_id, name, email, phone, quantity, pet_experience, pet_types)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      eventId, data.name, data.email, data.phone, data.quantity,
      data.petExperience || null, data.petTypes || null
    ]);
    return { id: result.insertId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicate = new Error('Email already registered for this event');
      duplicate.code = 'DUPLICATE_REGISTRATION';
      throw duplicate;
    }
    throw error;
  }
}

module.exports = {
  query,
  getCategories,
  getOrganisations,
  getEvents,
  getFeaturedEvents,
  eventExists,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  createRegistration
};
