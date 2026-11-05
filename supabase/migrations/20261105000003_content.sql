-- Preema Aviation — production starter content.
-- Contains only verified business details (name, office address) and general, non-promissory copy.
-- Phone, WhatsApp, e-mail, social links and the establishment year are intentionally left empty / hidden
-- until the owner confirms them in /admin/settings.

insert into public.site_settings (id, business_name, tagline, address, map_url, established_year, show_established_year,
  seo_title, seo_description)
values (1, 'Preema Aviation',
  'A world of possibilities. One journey away.',
  'Union Mahbuba Garden, 8th Floor, opposite Padma Diagnostic, 86 New Circular Road, Siddheshwari, Dhaka 1217, Bangladesh',
  'https://www.google.com/maps/search/?api=1&query=Union+Mahbuba+Garden%2C+86+New+Circular+Road%2C+Siddheshwari%2C+Dhaka+1217',
  1994, false,
  'Preema Aviation — Air tickets, visas, holidays and business travel from Dhaka',
  'Preema Aviation is a Dhaka-based travel agency helping individuals, families, businesses and NGOs with air ticketing, visa assistance, hotels, tour packages and group travel.')
on conflict (id) do nothing;

insert into public.private_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
insert into public.services (slug, title, summary, body, highlights, inquiry_type, sort_order, status) values
('air-ticketing', 'Domestic & international air ticketing',
 'Flight options, fare conditions explained in plain language, and ticketing support for domestic and international journeys.',
$t$Tell us where you need to go and when, and a consultant will look for suitable flight options for your dates, budget and preferences.

## How we help
- Compare routings, timings and cabin classes across available airlines.
- Explain baggage allowances, change rules and refund conditions before you decide.
- Arrange one-way, return and multi-city itineraries.
- Coordinate tickets for families, groups and organisations.

## Good to know
Fares and seat availability change frequently and are only secured once a ticket has been issued. Any quotation we share states its validity and the conditions that apply.$t$,
 array['One-way, return and multi-city itineraries', 'Fare rules explained before you pay', 'Support for families, groups and organisations'],
 'flight', 10, 'published'),

('visa-assistance', 'Visa assistance',
 'Guidance on documentation and application steps for the country you plan to visit.',
$t$Visa requirements differ by destination, nationality and purpose of travel, and they change from time to time. Our team helps you understand what the relevant authority currently asks for and how to prepare your application.

## How we help
- Share the current checklist for your destination and visa type, based on official guidance.
- Review your documents for completeness before submission.
- Explain appointment, submission and collection steps where applicable.
- Coordinate flights and hotel reservations that support your application.

## Important
The decision to grant a visa rests entirely with the relevant embassy, consulate or immigration authority. Preema Aviation cannot guarantee approval or processing times.

Please do not send passport scans or identity documents through the website. A consultant will tell you how to share documents securely when they are needed.$t$,
 array['Destination-specific checklists', 'Document review before submission', 'No guaranteed outcomes — honest guidance'],
 'visa', 20, 'published'),

('hotel-bookings', 'Hotel bookings',
 'Accommodation that suits your trip, budget and preferred standard — at home and abroad.',
$t$Whether you need a business hotel close to a meeting venue or a family-friendly resort, we can source options that match your dates, location and budget.

## How we help
- Shortlist hotels by area, category and budget.
- Confirm room types, meal plans and cancellation terms in writing.
- Combine accommodation with flights and transfers where useful.

Rates and availability are confirmed only when the hotel or supplier accepts the booking.$t$,
 array['Options by area, category and budget', 'Room and cancellation terms in writing', 'Combine with flights and transfers'],
 'hotel', 30, 'published'),

('tour-packages', 'Tour packages & customised holidays',
 'Ready-made packages and tailor-made holidays for families, couples and groups.',
$t$Choose from our published packages or ask us to design a holiday around your interests, travel dates and budget.

## How we help
- Suggest destinations that suit your season, budget and travel style.
- Combine flights, hotels, transfers and sightseeing into one plan.
- Adjust itineraries for families with children, older travellers or special interests.

Every package is subject to confirmation of availability and the conditions stated in your written quotation.$t$,
 array['Published packages and tailor-made plans', 'Flights, hotels and transfers in one plan', 'Clear inclusions and exclusions'],
 'holiday', 40, 'published'),

('corporate-ngo-travel', 'Corporate & NGO travel',
 'Organised travel arrangements for businesses, development organisations and their teams.',
$t$We support organisations that need dependable arrangements for staff, consultants, delegates and visitors.

## How we help
- Business and economy flight arrangements on domestic and international routes.
- Group bookings for workshops, conferences and field visits.
- Hotel coordination and travel documentation support.
- Booking records to help with your internal approvals and reconciliation.
- After-sales assistance for changes and cancellations.

See the corporate travel page for details or send us an organisation inquiry.$t$,
 array['Flights, hotels and documentation', 'Booking records for your finance team', 'One point of contact for your organisation'],
 'corporate', 50, 'published'),

('group-travel', 'Group travel',
 'Coordinated travel for families, friends, institutions and organisations travelling together.',
$t$Travelling as a group involves more moving parts. We help coordinate flights, rooms and itineraries so everyone has the right information.

## How we help
- Group flight requests and seat coordination where available.
- Room allocation and hotel coordination.
- Itinerary planning for study tours, family events and organisational trips.

Group fares and hotel blocks are subject to supplier conditions, deposits and deadlines, which we explain before you commit.$t$,
 array['Flights and rooms for groups', 'One coordinated itinerary', 'Supplier deadlines explained up front'],
 'holiday', 60, 'published'),

('event-ticketing-consulting', 'Event ticketing & travel consulting',
 'Help with event-related travel and practical advice for planning a trip.',
$t$Planning travel around a conference, exhibition, sporting or cultural event? We help plan the journey around the event and, where available through legitimate channels, assist with related tickets.

We also offer travel consulting for travellers who want advice on routing, timing, budgets and documentation before they commit.$t$,
 array['Travel planned around your event', 'Practical advice before you book'],
 'contact', 70, 'published'),

('after-sales-support', 'After-sales assistance',
 'Help with schedule changes, cancellations, refunds and reissues after you have booked.',
$t$Plans change. If you booked with us, we can help you understand your options and process requests with the airline or supplier.

## We can help with
- Schedule changes made by the airline.
- Date or route changes and ticket reissues.
- Cancellations and refund requests.
- Name corrections where the airline permits them.

## Please note
Every change or refund depends on the fare rules and supplier terms of your booking. Airline penalties, fare differences and applicable service fees may apply, and refund timelines are set by the airline or supplier.$t$,
 array['Changes, reissues and refunds', 'Clear explanation of fees before processing'],
 'contact', 80, 'published');

-- ---------------------------------------------------------------------------
-- Destinations (inspiration — not purchasable packages)
-- Images: Wikimedia Commons, licences recorded per row.
-- ---------------------------------------------------------------------------
insert into public.destinations (slug, name, country, region, is_domestic, summary, overview, travel_styles, experiences,
  planning_notes, hero_image_url, hero_image_alt, image_credit, image_source_url, featured, sort_order, status) values
('coxs-bazar', 'Cox''s Bazar', 'Bangladesh', 'Chattogram Division', true,
 'Long sandy beaches on the Bay of Bengal, fresh seafood and easy weekend escapes from Dhaka.',
$t$Cox's Bazar is Bangladesh's best-known seaside destination, with a long stretch of beach along the Bay of Bengal. It suits short family breaks, group trips and relaxed couples' getaways.

Travellers often combine beach time with drives along the Marine Drive towards Teknaf, visits to nearby hills and waterfalls, and, in season, onward travel to Saint Martin's Island.$t$,
 array['Beach', 'Family', 'Weekend break', 'Group'],
 array['Sunset walks on the beach', 'A drive along the Marine Drive', 'Fresh seafood in town', 'Day trips to nearby hills and waterfalls'],
$t$The dry, cooler months are the most popular time to visit and accommodation can fill quickly around public holidays. Flights from Dhaka are short; road and rail options are also available. Ask us about current schedules and hotel availability for your dates.$t$,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/At_the_beach_of_Cox%27s_Bazar_02.jpg/1920px-At_the_beach_of_Cox%27s_Bazar_02.jpg',
 'Visitors walking along the wide sandy beach at Cox''s Bazar',
 'Kritzolina, CC BY-SA 4.0, via Wikimedia Commons',
 'https://commons.wikimedia.org/wiki/File:At_the_beach_of_Cox%27s_Bazar_02.jpg', true, 10, 'published'),

('sylhet-sreemangal', 'Sylhet & Sreemangal', 'Bangladesh', 'Sylhet Division', true,
 'Rolling tea gardens, clear rivers and green hills in Bangladesh''s north-east.',
$t$The Sylhet region is known for its tea estates, rivers and wetlands. Sreemangal is often described as the tea capital of the country, and the area around Jaflong and Ratargul offers river and swamp-forest scenery.

It is a rewarding choice for nature lovers, families and small groups looking for a calmer break.$t$,
 array['Nature', 'Family', 'Short break'],
 array['Walks through tea gardens in Sreemangal', 'River views at Jaflong', 'A boat ride through the Ratargul swamp forest', 'Tasting local tea'],
$t$Seasons change the landscape considerably: the monsoon brings green scenery and high water, while winter is drier and cooler. Flights, trains and road transfers connect Dhaka with Sylhet. We can suggest an itinerary to suit your dates.$t$,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tea_gardens_in_Sreemangal_08.jpg/1920px-Tea_gardens_in_Sreemangal_08.jpg',
 'Neatly trimmed rows of tea bushes on a hillside in Sreemangal',
 'Kritzolina, CC BY-SA 4.0, via Wikimedia Commons',
 'https://commons.wikimedia.org/wiki/File:Tea_gardens_in_Sreemangal_08.jpg', true, 20, 'published'),

('maldives', 'Maldives', 'Maldives', 'South Asia', false,
 'Island resorts, turquoise lagoons and slow days by the sea.',
$t$The Maldives is a chain of coral atolls in the Indian Ocean, popular for honeymoons, anniversaries and restful family holidays. Many visitors stay on resort islands, while local islands offer a more budget-conscious alternative.$t$,
 array['Beach', 'Honeymoon', 'Luxury', 'Family'],
 array['Snorkelling over coral reefs', 'Sunset cruises', 'Overwater or beach villas', 'Exploring a local island'],
$t$Transfers from the airport to resort islands can be by speedboat or seaplane and are often priced separately. Resort meal plans vary widely, so compare inclusions carefully. Ask us to confirm current entry requirements for your nationality before you travel.$t$,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Aerial_shot%2C_Maldives.jpg/1920px-Aerial_shot%2C_Maldives.jpg',
 'Aerial view of small islands surrounded by turquoise lagoons in the Maldives',
 'Dr. Ondřej Havelka, CC BY-SA 4.0, via Wikimedia Commons',
 'https://commons.wikimedia.org/wiki/File:Aerial_shot,_Maldives.jpg', true, 30, 'published'),

('thailand', 'Thailand', 'Thailand', 'Southeast Asia', false,
 'Lively cities, island beaches and warm hospitality.',
$t$Thailand combines busy city life in Bangkok with beach destinations such as Phuket, Krabi and the surrounding islands. It suits families, couples, friends and first-time international travellers.$t$,
 array['City', 'Beach', 'Family', 'Shopping'],
 array['Temples and markets in Bangkok', 'Island hopping around Phi Phi', 'Thai cooking and street food', 'Shopping and entertainment'],
$t$Island weather varies by coast and season, which affects boat trips. Domestic flights or ferries are usually needed between regions. Entry requirements depend on your nationality and can change — we will confirm the current position from official sources when you inquire.$t$,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Isla_Phi_Phi_Lay%2C_Tailandia%2C_2013-08-19%2C_DD_04.JPG/1920px-Isla_Phi_Phi_Lay%2C_Tailandia%2C_2013-08-19%2C_DD_04.JPG',
 'Limestone cliffs rising from clear green water at Phi Phi Leh, Thailand',
 'Diego Delso, CC BY-SA 3.0, via Wikimedia Commons',
 'https://commons.wikimedia.org/wiki/File:Isla_Phi_Phi_Lay,_Tailandia,_2013-08-19,_DD_04.JPG', true, 40, 'published'),

('malaysia', 'Malaysia', 'Malaysia', 'Southeast Asia', false,
 'Modern skylines, rainforest highlands and island escapes.',
$t$Malaysia offers a mix of city breaks in Kuala Lumpur, cooler highland retreats and island destinations such as Langkawi and Penang. It is a convenient choice for families and for combining business with leisure.$t$,
 array['City', 'Family', 'Nature', 'Shopping'],
 array['The Kuala Lumpur skyline and Petronas Towers', 'Cable car rides in Langkawi', 'Food streets of Penang', 'Highland tea estates'],
$t$Kuala Lumpur works well as a base, with short domestic flights to islands. Ask us to confirm current entry requirements for your nationality and purpose of travel.$t$,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Kuala_Lumpur_Malaysia_Petronas-Twin-Towers-01.jpg/1920px-Kuala_Lumpur_Malaysia_Petronas-Twin-Towers-01.jpg',
 'The Petronas Twin Towers rising above Kuala Lumpur',
 'CEphoto, Uwe Aranas, CC BY-SA 3.0, via Wikimedia Commons',
 'https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_Malaysia_Petronas-Twin-Towers-01.jpg', false, 50, 'published'),

('singapore', 'Singapore', 'Singapore', 'Southeast Asia', false,
 'A compact, efficient city with gardens, attractions and great food.',
$t$Singapore is easy to get around and packs a lot into a short stay — waterfront architecture, gardens, family attractions and an outstanding food scene. It is also a common stopover and business destination.$t$,
 array['City', 'Family', 'Business'],
 array['Marina Bay at dusk', 'Gardens and conservatories', 'Family attractions on Sentosa', 'Hawker centre dining'],
$t$Singapore is relatively expensive, so we can help balance hotel location and budget. Entry requirements depend on nationality — we will confirm the current requirements from official sources.$t$,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Singapore_Marina_Bay_Dusk_2018-02-27.jpg/1920px-Singapore_Marina_Bay_Dusk_2018-02-27.jpg',
 'Marina Bay in Singapore lit up at dusk',
 'Benh LIEU SONG, CC BY-SA 4.0, via Wikimedia Commons',
 'https://commons.wikimedia.org/wiki/File:Singapore_Marina_Bay_Dusk_2018-02-27.jpg', false, 60, 'published'),

('dubai', 'Dubai', 'United Arab Emirates', 'Middle East', false,
 'Skyline views, desert experiences and world-class shopping.',
$t$Dubai is a major travel hub and a popular destination for family holidays, shopping trips and business travel. Visitors enjoy modern architecture, desert excursions and a wide range of hotels.$t$,
 array['City', 'Family', 'Shopping', 'Business'],
 array['The Dubai Marina waterfront', 'An evening desert excursion', 'Shopping festivals and malls', 'Day trips to Abu Dhabi'],
$t$Summer is very hot; the cooler months are the busiest. Hotel rates vary considerably with events and holidays. Ask us to confirm current entry requirements for your nationality.$t$,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dubai_Marina_Skyline_93.jpg/1920px-Dubai_Marina_Skyline_93.jpg',
 'Towers of the Dubai Marina skyline beside the water',
 'Khanshahab06, CC BY-SA 4.0, via Wikimedia Commons',
 'https://commons.wikimedia.org/wiki/File:Dubai_Marina_Skyline_93.jpg', true, 70, 'published'),

('nepal', 'Nepal', 'Nepal', 'South Asia', false,
 'Himalayan views, lakeside towns and heritage cities — close to home.',
$t$Nepal is a short flight from Dhaka and offers mountain scenery, heritage sites in the Kathmandu Valley and relaxed lakeside stays in Pokhara. It suits families, friends and adventurous travellers alike.$t$,
 array['Mountains', 'Nature', 'Heritage', 'Adventure'],
 array['Sunrise over the Annapurna range', 'Boating on Phewa Lake in Pokhara', 'Heritage squares of the Kathmandu Valley', 'Gentle hikes and viewpoints'],
$t$Mountain visibility is usually best in clear, dry months. Road journeys between cities can take longer than distances suggest. Ask us to confirm current entry requirements for your nationality.$t$,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/The_Annapurna_range_from_Pokhara.jpg/1920px-The_Annapurna_range_from_Pokhara.jpg',
 'Snow-capped peaks of the Annapurna range seen from Pokhara',
 'Jmhullot, CC BY 3.0, via Wikimedia Commons',
 'https://commons.wikimedia.org/wiki/File:The_Annapurna_range_from_Pokhara.jpg', false, 80, 'published'),

('turkiye', 'Türkiye', 'Türkiye', 'Europe & Asia', false,
 'Historic Istanbul, the landscapes of Cappadocia and Mediterranean coastlines.',
$t$Türkiye brings together history, culture and varied landscapes. Many itineraries combine Istanbul's historic peninsula with the rock formations of Cappadocia and time on the coast.$t$,
 array['Heritage', 'City', 'Couples', 'Family'],
 array['Historic sites and bazaars of Istanbul', 'Early-morning views over Cappadocia', 'Cruising the Bosphorus', 'Coastal towns on the Mediterranean'],
$t$Distances are large, so internal flights are often used between regions. Hot-air balloon flights depend on weather and are confirmed locally. Ask us to confirm current entry requirements for your nationality.$t$,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Cappadocia_Balloon_Inflating_Wikimedia_Commons.JPG/1920px-Cappadocia_Balloon_Inflating_Wikimedia_Commons.JPG',
 'A hot-air balloon being inflated at dawn in Cappadocia',
 'Benh LIEU SONG, CC BY-SA 3.0, via Wikimedia Commons',
 'https://commons.wikimedia.org/wiki/File:Cappadocia_Balloon_Inflating_Wikimedia_Commons.JPG', true, 90, 'published');

-- ---------------------------------------------------------------------------
-- FAQs
-- ---------------------------------------------------------------------------
insert into public.faqs (question, answer, category, show_on_home, sort_order, status) values
('Can I book and pay for a flight directly on this website?',
 'Not yet. The website is for sending a travel inquiry. A consultant reviews your request, contacts you with suitable options and a written quotation, and explains how to confirm and pay.',
 'Booking', true, 10, 'published'),
('Are fares guaranteed once you send me a quotation?',
 'No. Airfares and seat availability can change until the ticket is issued. Each quotation states how long it is valid and the conditions that apply.',
 'Booking', true, 20, 'published'),
('Can you guarantee that my visa will be approved?',
 'No. Visa decisions are made solely by the relevant embassy, consulate or immigration authority. We help you understand the requirements and prepare a complete application, but we cannot guarantee the outcome or the processing time.',
 'Visa', true, 30, 'published'),
('What do I need to start a visa assistance inquiry?',
 'Only basic information: destination, nationality, country of residence, purpose of travel, intended travel date and number of applicants. Please do not upload passport scans or identity documents on the website — your consultant will explain how to share documents securely if needed.',
 'Visa', false, 40, 'published'),
('Can you help if my plans change after booking?',
 'Yes. We assist with schedule changes, date changes, reissues, cancellations and refund requests for bookings made with us. Every change depends on the airline or supplier''s rules, and penalties, fare differences or service fees may apply.',
 'After-sales', true, 50, 'published'),
('Do you arrange corporate, NGO and group travel?',
 'Yes. We arrange flights, hotels and documentation support for organisations and groups. Use the corporate travel inquiry form to tell us about your typical routes and volume.',
 'Corporate', false, 60, 'published'),
('Can you customise a holiday package?',
 'Yes. You can ask for changes to a published package or request a holiday designed around your dates, interests and budget.',
 'Holidays', false, 70, 'published'),
('What happens after I submit an inquiry?',
 'You receive a reference number on screen as soon as your inquiry is saved. A consultant will contact you by phone or e-mail using the details you provided. Keep your reference number handy when you speak to us.',
 'Booking', true, 80, 'published'),
('In which currency will I be quoted?',
 'Quotations are normally in Bangladeshi Taka (৳). If you need a quotation in another currency, mention it in your inquiry.',
 'Booking', false, 90, 'published');

-- ---------------------------------------------------------------------------
-- Policy drafts (flagged for owner review before public launch)
-- ---------------------------------------------------------------------------
insert into public.pages (slug, title, body, needs_owner_review, status, seo_description) values
('privacy', 'Privacy policy',
$t$This draft explains how Preema Aviation handles personal information submitted through this website. It must be reviewed by the owner (and, where appropriate, a legal adviser) before public launch.

## Who we are
Preema Aviation is a travel agency based at Union Mahbuba Garden, 8th Floor, 86 New Circular Road, Siddheshwari, Dhaka 1217, Bangladesh.

## What we collect
When you send an inquiry we collect the details you enter: your name, phone number, optional e-mail address, the travel details you describe (such as destinations, dates and number of travellers) and any notes you add. For organisation inquiries we also collect the organisation name, your role and business e-mail.

We do not ask for passport scans, national identity documents or payment card details through this website.

We also record limited technical information needed to protect the website from abuse, such as a one-way hashed form of your IP address and the time of submission.

## How we use it
- To respond to your inquiry and prepare travel options or quotations.
- To contact you about your request by phone, e-mail or messaging apps you choose to use.
- To keep records of inquiries and bookings for service and accounting purposes.
- To prevent spam and misuse of the website.

We do not sell your personal information.

## Who can see it
Inquiries are visible only to authorised Preema Aviation staff. When you go ahead with a booking, we share the necessary details with airlines, hotels, tour operators and other suppliers to make the arrangements, and with authorities where required by law.

## How long we keep it
We keep inquiry records for as long as needed to provide our services and meet legal, accounting and dispute-resolution requirements. [Owner to confirm retention period.]

## Your choices
You can ask us to correct or delete the personal information you submitted, subject to records we are required to keep. Contact us using the details on the contact page.

## Security
We use access controls and secure hosting to protect inquiry data. No system is completely secure, so please share sensitive documents only through the method your consultant provides.

## Changes
We may update this policy. The current version is always published on this page.$t$,
 true, 'published', 'How Preema Aviation collects, uses and protects personal information submitted through its website.'),

('terms', 'Terms and booking conditions',
$t$These draft terms describe how inquiries, quotations and bookings with Preema Aviation work. They must be reviewed by the owner (and, where appropriate, a legal adviser) before public launch.

## Inquiries are not bookings
Submitting a form on this website sends an inquiry. It does not reserve seats, rooms or services and does not create a payment obligation. A booking exists only after you accept a written quotation, the required payment is received and the airline or supplier confirms the service.

## Quotations, fares and availability
- Fares, rates and availability can change at any time until a ticket is issued or a supplier confirms a booking.
- Each quotation states its validity period, what is included and what is not.
- Supplier-imposed charges (such as airline fares, taxes and hotel rates) are shown separately from any Preema Aviation service fee where applicable.

## Packages
Package descriptions on this website are subject to confirmation. Where a "starting from" price is shown, it applies only under the stated conditions (for example travel dates, room sharing and minimum travellers) and is not a quotation.

## Visa assistance
Visa decisions rest solely with the relevant embassy, consulate or immigration authority. We cannot guarantee approval, processing times or the return of fees paid to authorities or service centres.

## Travel documents
You are responsible for holding a valid passport, visas, health documents and any other documents required for your journey, and for ensuring that names on bookings match your travel documents exactly.

## Changes, cancellations and refunds
- All changes, reissues, cancellations and refunds are subject to the rules of the airline, hotel or supplier.
- Penalties, fare differences and applicable service fees may apply.
- Refund timelines are determined by the airline or supplier; we will process requests promptly and keep you informed.

## Payments
Accepted payment methods and deadlines are stated in your quotation or invoice. [Owner to confirm payment methods and service fee policy.]

## Liability
Preema Aviation arranges services provided by independent airlines, hotels and other suppliers and is not responsible for their acts or omissions, schedule changes or service failures, except as required by applicable law.

## Contact
Questions about these terms can be sent using the details on the contact page.$t$,
 true, 'published', 'How inquiries, quotations, bookings, changes and refunds work with Preema Aviation.');
