-- ============================================================================
-- MediGrid AI — Production SQL Analytical Queries
-- High performance queries for inventory run-rates, donor matching, and risk
-- ============================================================================

-- 1. Identify Facilities Facing Imminent Medicine Stockouts (< 3 Days)
SELECT 
    f.name AS facility_name,
    f.block,
    m.name AS medicine_name,
    i.batch_number,
    (i.current_stock - i.quarantined_stock - i.reserved_for_transfer) AS usable_stock,
    i.average_daily_consumption,
    ROUND((i.current_stock - i.quarantined_stock - i.reserved_for_transfer) / NULLIF(i.average_daily_consumption, 0), 1) AS days_until_stockout
FROM inventory i
JOIN facilities f ON i.facility_id = f.id
JOIN medicines m ON i.medicine_id = m.id
WHERE (i.current_stock - i.quarantined_stock - i.reserved_for_transfer) / NULLIF(i.average_daily_consumption, 0) < 3.0
ORDER BY days_until_stockout ASC;

-- 2. Find Safe Donor Facilities with Confirmed Surpluses
-- Protects 7-day run-rate + minimum safety threshold before declaring transferable surplus
SELECT 
    f.id AS donor_facility_id,
    f.name AS donor_facility_name,
    f.latitude,
    f.longitude,
    m.id AS medicine_id,
    m.name AS medicine_name,
    (i.current_stock - i.quarantined_stock - i.reserved_for_transfer - i.minimum_threshold - (i.average_daily_consumption * 7)) AS transferable_surplus
FROM inventory i
JOIN facilities f ON i.facility_id = f.id
JOIN medicines m ON i.medicine_id = m.id
WHERE (i.current_stock - i.quarantined_stock - i.reserved_for_transfer - i.minimum_threshold - (i.average_daily_consumption * 7)) > 0;

-- 3. Haversine Nearest Safe Donor Matcher (Mulshi PHC Paud Example)
-- Calculates distance between recipient and donor facilities in KM
SELECT 
    donor_f.name AS donor_facility,
    donor_f.phone,
    m.name AS medicine,
    (6371 * acos(
        cos(radians(18.5332)) * cos(radians(donor_f.latitude)) *
        cos(radians(donor_f.longitude) - radians(73.6128)) +
        sin(radians(18.5332)) * sin(radians(donor_f.latitude))
    )) AS distance_km
FROM inventory i
JOIN facilities donor_f ON i.facility_id = donor_f.id
JOIN medicines m ON i.medicine_id = m.id
WHERE i.medicine_id = 'MED-01'
  AND donor_f.id != 'FAC-01'
  AND (i.current_stock - i.quarantined_stock - i.reserved_for_transfer - i.minimum_threshold - (i.average_daily_consumption * 7)) > 0
ORDER BY distance_km ASC
LIMIT 3;

-- 4. Real-time Bed Occupancy & Staffing Deficit Summary
SELECT 
    f.name AS facility_name,
    f.type,
    b.total_beds,
    b.available_beds,
    b.occupancy_rate,
    d.scheduled_doctors,
    d.present_doctors,
    d.is_staffing_deficit
FROM facilities f
LEFT JOIN bed_availability b ON f.id = b.facility_id
LEFT JOIN doctor_attendance d ON f.id = d.facility_id AND d.duty_date = CURRENT_DATE
ORDER BY b.occupancy_rate DESC;
