-- ============================================================================
-- MediGrid AI — Database Seed Dataset
-- District: Pune Rural Directorate (12 PHCs & CHCs)
-- ============================================================================

-- 1. Districts
INSERT INTO districts (id, name, state, total_population) VALUES
('DIST-PUNE-RURAL', 'Pune Rural District', 'Maharashtra', 3200000)
ON CONFLICT (id) DO NOTHING;

-- 2. Facilities
INSERT INTO facilities (id, name, type, block, district, latitude, longitude, total_beds, contact_person, phone, population_served, operating_hours, operational_score, status) VALUES
('FAC-01', 'PHC Paud', 'PHC', 'Mulshi', 'Pune Rural', 18.5332, 73.6128, 12, 'Dr. Ramesh Bhosale', '+91 98220 14512', 28400, '24/7 Emergency & OPD (8am - 2pm)', 58, 'CRITICAL_INTERVENTION'),
('FAC-02', 'CHC Haveli', 'CHC', 'Haveli', 'Pune Rural', 18.5204, 73.8567, 30, 'Dr. Anita Deshmukh', '+91 98221 87634', 64200, '24/7 Full Facility', 92, 'OPERATIONAL'),
('FAC-03', 'PHC Wagholi', 'PHC', 'Haveli', 'Pune Rural', 18.5808, 73.9787, 10, 'Dr. Sanjay Patil', '+91 98224 45678', 34500, '24/7 Emergency & OPD (8am - 2pm)', 84, 'OPERATIONAL'),
('FAC-04', 'PHC Velhe', 'PHC', 'Velhe', 'Pune Rural', 18.2974, 73.6375, 8, 'Dr. Kavita Kulkarni', '+91 98225 99123', 19800, 'Day OPD & On-Call Emergency', 61, 'DEGRADED'),
('FAC-05', 'CHC Junnar', 'CHC', 'Junnar', 'Pune Rural', 19.2067, 73.8763, 35, 'Dr. Vikrant Shinde', '+91 98226 77890', 78900, '24/7 Full Facility', 88, 'OPERATIONAL'),
('FAC-06', 'PHC Otur', 'PHC', 'Junnar', 'Pune Rural', 19.2612, 73.9167, 10, 'Dr. Meena Gaikwad', '+91 98227 33451', 24100, 'Day OPD & Primary Maternity', 74, 'OPERATIONAL'),
('FAC-07', 'PHC Khed', 'PHC', 'Khed', 'Pune Rural', 18.8475, 73.9134, 12, 'Dr. Rahul Jadhav', '+91 98228 11234', 31200, '24/7 Emergency & OPD', 79, 'OPERATIONAL'),
('FAC-08', 'CHC Chakan', 'CHC', 'Khed', 'Pune Rural', 18.7615, 73.8576, 28, 'Dr. Sunita More', '+91 98229 55678', 58700, '24/7 Industrial & Trauma Center', 86, 'OPERATIONAL'),
('FAC-09', 'PHC Bhor', 'PHC', 'Bhor', 'Pune Rural', 18.1500, 73.8447, 10, 'Dr. Amit Salunke', '+91 98230 44567', 22800, 'Day OPD & On-Call Emergency', 69, 'OPERATIONAL'),
('FAC-10', 'PHC Saswad', 'PHC', 'Purandar', 'Pune Rural', 18.3444, 74.0286, 14, 'Dr. Pooja Nimbalkar', '+91 98231 66789', 36100, '24/7 Emergency & Maternity', 89, 'OPERATIONAL'),
('FAC-11', 'CHC Daund', 'CHC', 'Daund', 'Pune Rural', 18.4658, 74.5815, 32, 'Dr. Deepak Shirole', '+91 98232 88901', 71400, '24/7 Full Facility', 91, 'OPERATIONAL'),
('FAC-12', 'PHC Narayangaon', 'PHC', 'Junnar', 'Pune Rural', 19.1205, 73.9781, 12, 'Dr. Swati Gholap', '+91 98233 12456', 29300, '24/7 Highway Emergency Post', 82, 'OPERATIONAL')
ON CONFLICT (id) DO NOTHING;

-- 3. Essential Medicines Catalog
INSERT INTO medicines (id, code, name, generic_name, category, unit, storage_conditions, is_essential) VALUES
('MED-01', 'AMX-500', 'Amoxicillin 500mg', 'Amoxicillin Trihydrate', 'Antibiotics', 'capsules', 'Cool dry place below 25C', TRUE),
('MED-02', 'PCM-650', 'Paracetamol 650mg', 'Paracetamol', 'Analgesics & Antipyretics', 'tablets', 'Room temperature', TRUE),
('MED-03', 'ORS-21G', 'ORS Sachets 21.8g', 'Oral Rehydration Salts IP', 'Rehydration & Electrolytes', 'sachets', 'Moisture protected', TRUE),
('MED-04', 'INS-100', 'Regular Human Insulin 100IU', 'Regular Soluble Insulin', 'Endocrine & Diabetes', 'vials', 'Refrigerated 2-8C', TRUE),
('MED-05', 'ASV-10M', 'Anti-Snake Venom 10ml', 'Polyvalent Snake Antivenom IP', 'Emergency & Critical Care', 'vials', 'Refrigerated 2-8C', TRUE),
('MED-06', 'ART-COM', 'Artemether-Lumefantrine', 'ACT Co-formulation', 'Antimalarials', 'tablets', 'Protected from light', TRUE),
('MED-07', 'OXY-5IU', 'Oxytocin 5 IU/ml Injection', 'Oxytocin IP', 'Maternal & Obstetric Care', 'ampoules', 'Refrigerated 2-8C', TRUE),
('MED-08', 'AZI-500', 'Azithromycin 500mg', 'Azithromycin Dihydrate', 'Antibiotics', 'tablets', 'Dry place below 30C', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Sample Inventory Records
INSERT INTO inventory (id, medicine_id, facility_id, batch_number, current_stock, quarantined_stock, reserved_for_transfer, average_daily_consumption, minimum_threshold, max_threshold, expiry_date) VALUES
('INV-01', 'MED-01', 'FAC-01', 'AMX-2024-B1', 120, 0, 0, 85.0, 400, 2500, '2025-11-30'),
('INV-02', 'MED-01', 'FAC-02', 'AMX-2024-B9', 2850, 0, 300, 95.0, 600, 3500, '2026-04-15'),
('INV-03', 'MED-05', 'FAC-01', 'ASV-2024-E2', 2, 0, 0, 3.0, 15, 60, '2025-08-10'),
('INV-04', 'MED-05', 'FAC-02', 'ASV-2024-S1', 38, 0, 6, 2.5, 10, 50, '2026-06-30'),
('INV-05', 'MED-04', 'FAC-04', 'INS-2024-V4', 8, 0, 0, 5.0, 25, 120, '2025-09-20'),
('INV-06', 'MED-04', 'FAC-05', 'INS-2024-V9', 95, 0, 15, 6.0, 30, 150, '2026-03-31')
ON CONFLICT (id) DO NOTHING;
