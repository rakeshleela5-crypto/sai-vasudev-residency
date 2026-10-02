-- ============================================================================
-- HOTEL SAI INTERNATIONAL - RAYAGADA (AUTHENTIC 18 ROOMS PROPERTY SYNC)
-- Replaces previous rooms with the authentic 18 rooms from the original handwritten data
-- ============================================================================

PRAGMA foreign_keys = OFF;

-- Remove all existing room dependencies to start fresh with the 18 rooms
DELETE FROM bookings;
DELETE FROM room_service_requests;
DELETE FROM food_orders;
DELETE FROM checkout_inspections;
DELETE FROM rooms;

-- Ground Floor (7 Keys: 101 - 107) -> Mapped to floor 1 due to schema constraints
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('101', 'Deluxe Room', 'DELUXE', 1, 1500.00, 1, 1, 'Queen Single', '1 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker"]', 'Available'),
('102', 'Deluxe Room', 'DELUXE', 1, 1500.00, 1, 1, 'Queen Size', '1 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker"]', 'Available'),
('103', 'Deluxe Room', 'DELUXE', 1, 2000.00, 2, 1, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker"]', 'Available'),
('104', 'Executive Room', 'EXEDEL', 1, 2500.00, 2, 1, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('105', 'Executive Room', 'EXEDEL', 1, 2500.00, 2, 1, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('106', 'Deluxe Room', 'DELUXE', 1, 2000.00, 2, 1, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker"]', 'Available'),
('107', 'Executive Room', 'EXEDEL', 1, 2500.00, 2, 1, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available');

-- First Floor (11 Keys: 201 - 211) -> Mapped to floor 2 due to schema constraints
INSERT INTO rooms (room_number, tier, room_type, floor, tariff, capacity_adults, capacity_children, bed_type, pax, amenities, status)
VALUES
('201', 'Premium Suite', 'PRSUITE', 2, 3000.00, 2, 1, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('202', 'Deluxe Room', 'DELUXE', 2, 1500.00, 1, 0, 'Small size bed (Queen)', '1 Single Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker"]', 'Available'),
('203', 'Premium Suite', 'PRSUITE', 2, 3000.00, 2, 1, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('204', 'Executive Room', 'EXEDEL', 2, 2500.00, 2, 1, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('205', 'Executive Room', 'EXEDEL', 2, 2500.00, 2, 1, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('206', 'Executive Room', 'EXEDEL', 2, 2500.00, 2, 2, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('207', 'Executive Room', 'EXEDEL', 2, 2500.00, 2, 2, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('208', 'Standard Deluxe', 'DELUXE', 2, 2000.00, 2, 2, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('209', 'Standard Deluxe', 'DELUXE', 2, 2000.00, 2, 2, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('210', 'Standard Deluxe', 'DELUXE', 2, 2000.00, 2, 2, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available'),
('211', 'Premium Suite', 'PRSUITE', 2, 3000.00, 2, 2, 'King Size', '2 Adult', '["WIFI", "TV", "Hotwater 24/7", "Coffee maker", "SOFA", "Hair dryer", "Fridge"]', 'Available');

PRAGMA foreign_keys = ON;
