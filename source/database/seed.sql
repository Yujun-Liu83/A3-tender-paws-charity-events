-- ============================================================
-- PROG2002 Web Development II - Charity Events website
-- A3 project: B / Tender Paws (Rescue + Adoption)
-- Sample data for charityevents_db
--
-- Run schema.sql first, then this file.
--   mysql -u root -p < source/database/seed.sql
--
-- Contents: 4 categories, 3 organisations, 8 events, 12 registrations
-- ============================================================

USE charityevents_db;

SET NAMES utf8mb4;

-- Cleared child-first so the foreign keys stay valid on a re-import.
DELETE FROM registrations;
DELETE FROM events;
DELETE FROM categories;
DELETE FROM organisations;

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
INSERT INTO categories (id, name, description) VALUES
  (1, 'Rescue', 'Street and wildlife rescue missions that bring animals to safety quickly.'),
  (2, 'Adoption', 'Meet-and-greet sessions that match rescued animals with lasting homes.'),
  (3, 'Shelter', 'Daily shelter care that keeps kennels clean, calm and comfortable.'),
  (4, 'Volunteer', 'Practical volunteer shifts that keep local rescue work moving.');

-- ------------------------------------------------------------
-- organisations
-- ------------------------------------------------------------
INSERT INTO organisations (id, name, slug, focus, email, city) VALUES
  (1, 'Tender Paws Rescue Network', 'tender-paws-rescue-network', 'Rescue', 'hello@tenderpawsrescue.org', 'Harbor'),
  (2, 'Tender Paws Adoption Centre', 'tender-paws-adoption-centre', 'Adoption', 'adopt@tenderpawsadoption.org', 'Northside'),
  (3, 'Tender Paws Foster Collective', 'tender-paws-foster-collective', 'Volunteer', 'foster@tenderpawsfoster.org', 'East District');

-- ------------------------------------------------------------
-- events
-- category_id references categories.id
-- organisation_id references organisations.id
-- service_type is one of: rescue-support / adoption-guidance / foster-care / shelter-shift
-- ------------------------------------------------------------
INSERT INTO events
  (id, title, category_id, organisation_id, event_date, location, status, image, description, purpose, price, service_type, latitude, longitude)
VALUES
  (1, 'Street Dog First Response', 1, 1, '2026-10-12', 'Harbor Animal Clinic', 'upcoming', 'P-01.jpg',
   'Learn safe intake steps and help the rescue team prepare a care plan for found dogs.',
   'Give every found dog a safe intake and a clear care plan from the first hour.',
   'Free entry', 'rescue-support', -33.868800, 151.209300),
  (2, 'Meet-and-Greet Adoption Hour', 2, 2, '2026-10-12', 'Tender Paws Adoption Room', 'upcoming', 'AC-01.jpg',
   'Meet ready-to-adopt animals and learn how to prepare a calm, safe home.',
   'Introduce adopters to the right animal so every match lasts.',
   'Free entry', 'adoption-guidance', -33.867900, 151.207300),
  (3, 'Shelter Intake Shift', 3, 1, '2026-11-02', 'Tender Paws Shelter', 'upcoming', 'P-05.jpg',
   'Support feeding, enrichment and kennel preparation during a practical shelter shift.',
   'Keep every kennel fed, calm and ready so new arrivals settle faster.',
   'Free entry', 'shelter-shift', -33.873000, 151.206000),
  (4, 'Foster Care Orientation', 3, 3, '2026-10-19', 'Northside Shelter', 'upcoming', 'AC-02.jpg',
   'Understand short-term foster routines, supplies and the support available to carers.',
   'Prepare foster carers so animals rest in a home instead of a kennel.',
   'Free · donations welcome', 'foster-care', -33.814000, 151.001000),
  (5, 'Adoption Guidance Clinic', 2, 2, '2026-11-02', 'Tender Paws Community Room', 'upcoming', 'AC-03.jpg',
   'Talk through matching, introductions and the first weeks after adoption.',
   'Guide families through the first weeks so adoptions are never returned.',
   'Free entry', 'adoption-guidance', -33.870000, 151.215000),
  (6, 'Emergency Dog Rescue Drill', 1, 1, '2026-11-21', 'Harbor Animal Clinic', 'upcoming', 'AC-05.jpg',
   'Practise safe capture, transport and first checks for dogs found in danger.',
   'Keep a trained rescue team ready for animals in immediate danger.',
   'Free entry', 'rescue-support', -33.868800, 151.209300),
  (7, 'Kennel Enrichment Session', 3, 1, '2026-12-05', 'Tender Paws Shelter', 'upcoming', 'P-06.jpg',
   'Build enrichment toys and run gentle play routines for animals waiting in shelter.',
   'Keep shelter animals mentally active while they wait for a home.',
   'Free entry', 'shelter-shift', -33.873000, 151.206000),
  (8, 'Foster Family Meetup', 4, 3, '2026-12-12', 'Riverside Park', 'suspended', 'AC-08.jpg',
   'Meet other foster families, share practical tips and plan the next care round.',
   'Keep foster families connected so more animals can be cared for at home.',
   'Suggested donation 50', 'foster-care', -33.865000, 151.220000);

-- ------------------------------------------------------------
-- registrations (at least 10 records; latest first on event pages)
-- pet_experience is 'yes' / 'no'; pet_types is a comma-separated list
-- ------------------------------------------------------------
INSERT INTO registrations
  (event_id, name, email, phone, quantity, pet_experience, pet_types, registered_at)
VALUES
  (1, 'Ava Thompson',   'ava.thompson@example.com',   '0412000101', 2, 'yes', 'Dog',            '2026-09-15 10:30:00'),
  (1, 'Noah Patel',     'noah.patel@example.com',     '0412000102', 1, 'no',  'Cat, Other',     '2026-09-14 14:22:00'),
  (1, 'Mia Nguyen',     'mia.nguyen@example.com',     '0412000103', 3, 'yes', 'Dog, Cat',       '2026-09-13 09:15:00'),
  (2, 'Liam O''Brien',  'liam.obrien@example.com',    '0412000104', 1, 'yes', 'Dog',            '2026-09-15 11:05:00'),
  (2, 'Sofia Rossi',    'sofia.rossi@example.com',    '0412000105', 2, 'no',  'Cat',            '2026-09-12 16:45:00'),
  (2, 'Ethan Clarke',   'ethan.clarke@example.com',   '0412000106', 1, 'yes', 'Dog, Other',     '2026-09-11 11:20:00'),
  (3, 'Grace Kim',      'grace.kim@example.com',      '0412000107', 1, 'yes', 'Dog',            '2026-09-10 13:55:00'),
  (3, 'Oliver Brown',   'oliver.brown@example.com',   '0412000108', 2, 'no',  'Cat',            '2026-09-09 08:30:00'),
  (4, 'Chloe Martin',   'chloe.martin@example.com',   '0412000109', 3, 'yes', 'Dog, Cat',       '2026-09-15 09:40:00'),
  (5, 'Jack Wilson',    'jack.wilson@example.com',    '0412000110', 1, 'no',  'Other',          '2026-09-08 15:10:00'),
  (6, 'Ruby Anderson',  'ruby.anderson@example.com',  '0412000111', 2, 'yes', 'Dog',            '2026-09-07 12:40:00'),
  (7, 'Leo Fernandez',  'leo.fernandez@example.com',  '0412000112', 1, 'no',  'Cat',            '2026-09-06 17:25:00');
