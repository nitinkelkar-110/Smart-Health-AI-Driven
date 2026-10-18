-- ============================================================================
-- MediGrid AI — PostgreSQL / Supabase Complete Database Schema
-- Multi-Facility Telemetry, Forecasting & Smart Resource Redistribution
-- ============================================================================

-- 1. Districts & Administrative Blocks
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100) NOT NULL,
    total_population BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Health Facilities (PHCs, CHCs, Sub-District Hospitals)
CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(30) CHECK (type IN ('PHC', 'CHC', 'Sub-District Hospital')),
    block VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    total_beds INT NOT NULL DEFAULT 10,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    population_served INT,
    operating_hours VARCHAR(100),
    operational_score INT DEFAULT 85,
    status VARCHAR(30) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users & Role-Based Access Control
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('DISTRICT_ADMIN', 'MEDICAL_OFFICER', 'LOGISTICS_COORDINATOR', 'PHARMACIST')),
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Medicine Master Catalog
CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    storage_conditions VARCHAR(100),
    is_essential BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Inventory Records (Facility-wise stock levels)
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(50) PRIMARY KEY,
    medicine_id VARCHAR(50) REFERENCES medicines(id),
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    quarantined_stock INT NOT NULL DEFAULT 0,
    reserved_for_transfer INT NOT NULL DEFAULT 0,
    average_daily_consumption DECIMAL(8, 2) NOT NULL DEFAULT 0.0,
    minimum_threshold INT NOT NULL DEFAULT 100,
    max_threshold INT NOT NULL DEFAULT 2000,
    expiry_date DATE NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_positive_stock CHECK (current_stock >= 0)
);

-- 6. Inventory Transactions & Stock Adjustments
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id VARCHAR(50) PRIMARY KEY,
    inventory_id VARCHAR(50) REFERENCES inventory(id) ON DELETE CASCADE,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    type VARCHAR(40) CHECK (type IN ('CONSUMPTION', 'STOCK_ADD', 'TRANSFER_OUT', 'TRANSFER_IN', 'DAMAGE_WRITE_OFF', 'EXPIRED_QUARANTINE')),
    quantity INT NOT NULL,
    batch_number VARCHAR(100),
    recorded_by VARCHAR(150),
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Patient Footfall & Daily Telemetry
CREATE TABLE IF NOT EXISTS patient_footfalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    opd_count INT NOT NULL DEFAULT 0,
    ipd_count INT NOT NULL DEFAULT 0,
    emergency_count INT NOT NULL DEFAULT 0,
    total_patients INT NOT NULL DEFAULT 0,
    normal_capacity INT NOT NULL,
    surge_percentage DECIMAL(5, 2),
    warning_flag BOOLEAN DEFAULT FALSE,
    warning_reason TEXT,
    hourly_distribution JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bed Availability Monitoring
CREATE TABLE IF NOT EXISTS bed_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    total_beds INT NOT NULL,
    occupied_beds INT NOT NULL,
    unavailable_beds INT NOT NULL DEFAULT 0,
    available_beds INT NOT NULL,
    occupancy_rate DECIMAL(5, 2) NOT NULL,
    specialty_distribution JSONB,
    last_verified TIMESTAMPTZ DEFAULT NOW(),
    verified_by VARCHAR(150)
);

-- 9. Doctor Attendance & Duty Shifts
CREATE TABLE IF NOT EXISTS doctor_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    duty_date DATE NOT NULL,
    scheduled_doctors INT NOT NULL,
    present_doctors INT NOT NULL,
    absent_doctors INT NOT NULL DEFAULT 0,
    on_leave_doctors INT NOT NULL DEFAULT 0,
    minimum_required INT NOT NULL,
    attendance_percentage DECIMAL(5, 2) NOT NULL,
    is_staffing_deficit BOOLEAN DEFAULT FALSE,
    roster_snapshot JSONB,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Diagnostic Test Availability Audits
CREATE TABLE IF NOT EXISTS diagnostic_tests (
    id VARCHAR(50) PRIMARY KEY,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    test_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) CHECK (status IN ('AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'MAINTENANCE', 'CONSUMABLES_OUT', 'NOT_REPORTED')),
    equipment_status VARCHAR(50),
    reagent_status VARCHAR(50),
    daily_tests_done INT DEFAULT 0,
    expected_restoration DATE,
    last_verified TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AI Demand Forecasts
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id VARCHAR(100) PRIMARY KEY,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    target_item VARCHAR(150) NOT NULL,
    category VARCHAR(30) CHECK (category IN ('MEDICINE', 'PATIENTS', 'BEDS', 'DIAGNOSTICS')),
    horizon_days INT NOT NULL CHECK (horizon_days IN (7, 14, 30)),
    projected_demand_total INT NOT NULL,
    estimated_shortage_date DATE,
    recommended_replenishment INT NOT NULL,
    confidence_score DECIMAL(5, 2),
    assumptions JSONB,
    trend_projection JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Smart Resource Redistribution Transfers
CREATE TABLE IF NOT EXISTS redistribution_transfers (
    id VARCHAR(100) PRIMARY KEY,
    source_facility_id VARCHAR(50) REFERENCES facilities(id),
    dest_facility_id VARCHAR(50) REFERENCES facilities(id),
    medicine_id VARCHAR(50) REFERENCES medicines(id),
    quantity INT NOT NULL,
    unit VARCHAR(30) NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM')),
    status VARCHAR(30) CHECK (status IN ('RECOMMENDED', 'APPROVED', 'DISPATCHED', 'RECEIVED', 'REJECTED', 'CANCELLED')),
    reason TEXT NOT NULL,
    distance_km DECIMAL(6, 2),
    eta_hours DECIMAL(4, 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by VARCHAR(150),
    approved_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    received_by VARCHAR(150),
    audit_notes TEXT
);

-- 13. At-Risk Facilities Tracking & Interventions
CREATE TABLE IF NOT EXISTS at_risk_facilities (
    id VARCHAR(50) PRIMARY KEY,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    risk_severity VARCHAR(20) CHECK (risk_severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    composite_risk_score INT NOT NULL,
    triggers JSONB NOT NULL,
    recommended_interventions JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'AWAITING_INTERVENTION',
    assigned_officer VARCHAR(150),
    notes TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Real-time System Alerts & Notifications
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    message TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(150),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Comprehensive Audit Trail Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    role VARCHAR(50),
    facility_id VARCHAR(50),
    details TEXT NOT NULL,
    ip_address VARCHAR(45),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Enablement
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE redistribution_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE at_risk_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated district health personnel
CREATE POLICY "Allow public read for demo mode" ON facilities FOR SELECT USING (true);
CREATE POLICY "Allow public read for inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Allow authenticated staff to update transfers" ON redistribution_transfers FOR ALL USING (true);
