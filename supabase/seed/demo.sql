-- DEVELOPMENT DEMO CONTENT — DO NOT RUN ON PRODUCTION.
-- These packages are invented examples used to exercise the package pages and filters.
-- They are flagged is_demo = true and the website hides them unless
-- NEXT_PUBLIC_SHOW_DEMO_CONTENT=true. Remove with:
--   delete from public.packages where is_demo;

insert into public.packages (slug, title, destination_id, summary, overview, duration_days, duration_nights,
  travel_styles, audiences, gallery, itinerary, inclusions, exclusions, hotel_category, transport, meals,
  visa_notes, valid_from, valid_until, cancellation_conditions, price_mode, price_amount, price_currency,
  price_basis, price_conditions, price_updated_at, min_travellers, featured, sort_order, status, is_demo)
values
('demo-coxs-bazar-family-break', 'Demo: Cox''s Bazar family beach break',
  (select id from public.destinations where slug = 'coxs-bazar'),
  'DEMO CONTENT — an example three-day family beach break used for testing.',
  'This is an invented example to show how a package page looks. It is not a real offer.',
  3, 2, array['Beach', 'Family'], array['family', 'group'],
  '[{"url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/At_the_beach_of_Cox%27s_Bazar_02.jpg/1920px-At_the_beach_of_Cox%27s_Bazar_02.jpg","alt":"Beach at Cox''s Bazar","credit":"Kritzolina, CC BY-SA 4.0, via Wikimedia Commons"}]',
  '[{"day":1,"title":"Arrival","description":"Example: arrive, check in and enjoy a sunset walk."},{"day":2,"title":"Marine Drive","description":"Example: a drive along the coast with stops."},{"day":3,"title":"Departure","description":"Example: free morning and return."}]',
  array['Example: 2 nights hotel', 'Example: airport transfers'], array['Example: flights', 'Personal expenses'],
  '3-star (example)', 'Private car (example)', 'Breakfast (example)', 'Not required for Bangladeshi nationals.',
  current_date, current_date + 180, 'Example: cancellation terms would be stated here.',
  'on_request', null, 'BDT', null, null, null, 2, true, 10, 'published', true),

('demo-kathmandu-pokhara', 'Demo: Kathmandu & Pokhara discovery',
  (select id from public.destinations where slug = 'nepal'),
  'DEMO CONTENT — an example five-day Nepal itinerary used for testing.',
  'This is an invented example to show "starting from" pricing with conditions. It is not a real offer.',
  5, 4, array['Mountains', 'Heritage'], array['couple', 'family', 'group'],
  '[{"url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/The_Annapurna_range_from_Pokhara.jpg/1920px-The_Annapurna_range_from_Pokhara.jpg","alt":"Annapurna range from Pokhara","credit":"Jmhullot, CC BY 3.0, via Wikimedia Commons"}]',
  '[{"day":1,"title":"Kathmandu","description":"Example arrival day."},{"day":2,"title":"Heritage sites","description":"Example sightseeing."},{"day":3,"title":"To Pokhara","description":"Example transfer."},{"day":4,"title":"Sunrise viewpoint","description":"Example excursion."},{"day":5,"title":"Departure","description":"Example return."}]',
  array['Example: 4 nights hotel', 'Example: transfers'], array['Example: international flights', 'Example: visa fees'],
  '3-star (example)', 'Shared/private transfers (example)', 'Breakfast (example)', 'Confirm current entry requirements before travel.',
  current_date, current_date + 120, 'Example: cancellation terms would be stated here.',
  'starting_from', 99999, 'BDT', 'per person, twin sharing (example)',
  'Example only: valid for selected dates and minimum 2 travellers, excluding flights.', current_date, 2,
  true, 20, 'published', true),

('demo-draft-package', 'Demo: unpublished draft package',
  (select id from public.destinations where slug = 'maldives'),
  'DEMO CONTENT — this draft must never appear publicly.', '', 4, 3, array['Beach'], array['couple'],
  '[]', '[]', '{}', '{}', null, null, null, null, null, null, null,
  'on_request', null, 'BDT', null, null, null, null, false, 30, 'draft', true);
