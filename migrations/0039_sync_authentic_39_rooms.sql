-- ============================================================================
-- HOTEL SAI INTERNATIONAL - RAYAGADA (AUTHENTIC 39 ROOMS PROPERTY SYNC)
-- Replaces old 40 generic dummy rooms with the authentic 39 rooms layout
-- ============================================================================

PRAGMA foreign_keys = OFF;

-- Remove dummy child records referencing non-existent floor 1 rooms (101-110) & 209-210
DELETE FROM folio_transactions WHERE room_number LIKE '1%' OR room_number IN ('209', '210');
DELETE FROM maintenance_work_orders WHERE room_number LIKE '1%' OR room_number IN ('209', '210');
DELETE FROM digital_keycards WHERE room_number LIKE '1%' OR room_number IN ('209', '210');
DELETE FROM bookings WHERE room_number LIKE '1%' OR room_number IN ('209', '210');

-- Remove non-existent dummy rooms (Floor 1 has no guest rooms, only Lobby/Reception/Banquets)
DELETE FROM rooms WHERE floor = 1 OR room_number IN ('209', '210');

-- Upsert Floor 2: Deluxe Rooms & Suites (8 Keys: 201 - 208)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('201', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '1 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('202', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '2 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('203', 'Premium Suite', 'PRSUITE', 2, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('204', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', 'Available', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('205', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', 'Available', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Available'),
('206', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '1 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('207', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '1 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied'),
('208', 'Deluxe Room', 'EXEDEL', 2, 2199.00, 2, 1, 'Queen Orthopedic', '1 Pax', '["Premium AC","City View Balcony","Work Desk","Free Breakfast","In-Room Dining"]', 'Occupied')
ON CONFLICT(room_number) DO UPDATE SET
  tier = excluded.tier,
  room_type = excluded.room_type,
  floor = excluded.floor,
  tariff = excluded.tariff,
  capacity_adults = excluded.capacity_adults,
  bed_type = excluded.bed_type;

-- Upsert Floor 3: Executive Rooms & Suites (15 Keys: 301 - 316, excluding 313)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('301', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('302', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('303', 'Premium Suite', 'SUITE', 3, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('304', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', '2 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('305', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('306', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('307', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('308', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('309', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'OOO', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Maintenance'),
('310', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('311', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('312', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('314', 'Premium Suite', 'SUITE', 3, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('315', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('316', 'Executive Room', 'EXEDEL', 3, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available')
ON CONFLICT(room_number) DO UPDATE SET
  tier = excluded.tier,
  room_type = excluded.room_type,
  floor = excluded.floor,
  tariff = excluded.tariff,
  capacity_adults = excluded.capacity_adults,
  bed_type = excluded.bed_type;

-- Upsert Floor 4: Executive Rooms & Suites (16 Keys: 401 - 416)
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('401', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('402', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('403', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('404', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('405', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('406', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('407', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', 'Available', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Available'),
('408', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('409', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('410', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('411', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', '2 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('412', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', '2 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('413', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', '1 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('414', 'Premium Suite', 'SUITE', 4, 3999.00, 4, 2, 'Imperial King + Sofa Bed', 'Suite', '["Living Area","Master Bedroom","Fruit Basket","Priority Room Service","Free Local Shuttle"]', 'Available'),
('415', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', '2 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied'),
('416', 'Executive Room', 'EXEDEL', 4, 2899.00, 3, 1, 'King Enterprise', '2 Pax', '["Ergonomic Workstation","Enterprise Wi-Fi","Mini Bar","Free Laundry Credit","Station Transit"]', 'Occupied')
ON CONFLICT(room_number) DO UPDATE SET
  tier = excluded.tier,
  room_type = excluded.room_type,
  floor = excluded.floor,
  tariff = excluded.tariff,
  capacity_adults = excluded.capacity_adults,
  bed_type = excluded.bed_type;

PRAGMA foreign_keys = ON;
