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

-- 5. Doctors Master Roster (Authentic Indian Medical Officers & Specialists)
INSERT INTO doctors (id, doctor_name, facility_id, specialty, qualification, registration_number, experience_years, contact_number, shift_preference, status) VALUES
('DOC-01', 'Dr. Ramesh Bhosale', 'FAC-01', 'General Medicine / MO', 'MBBS, DNB', 'MMC/2011/04/1042', 14, '+91 98220 14512', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-02', 'Dr. Sneha Chitnis', 'FAC-01', 'Obstetrics & Gynaecology', 'MBBS, DGO', 'MMC/2015/08/2190', 10, '+91 98220 54123', 'General (9 AM - 5 PM)', 'ON_LEAVE'),
('DOC-03', 'Dr. Rahul Kamble', 'FAC-01', 'Paediatrics', 'MBBS, DCH', 'MMC/2018/11/3341', 7, '+91 98220 98711', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-04', 'Dr. Anand Kulkarni', 'FAC-01', 'General Surgery / Emergency', 'MBBS, MS', 'MMC/2009/03/0891', 16, '+91 98220 44556', 'Evening (2 PM - 8 PM)', 'ON_LEAVE'),
('DOC-05', 'Dr. Tanuja Shinde', 'FAC-01', 'Ayush Medical Officer', 'BAMS, MD', 'MCIM/2016/05/4412', 9, '+91 98220 22334', 'Morning (8 AM - 2 PM)', 'ABSENT'),
('DOC-11', 'Dr. Anita Deshmukh', 'FAC-02', 'Medical Superintendent', 'MBBS, MD', 'MMC/2005/02/0341', 20, '+91 98221 87634', 'General (9 AM - 5 PM)', 'PRESENT'),
('DOC-12', 'Dr. Sandeep Jadhav', 'FAC-02', 'Orthopaedics', 'MBBS, MS', 'MMC/2010/06/1823', 15, '+91 98221 11229', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-13', 'Dr. Pallavi Gore', 'FAC-02', 'Anaesthesia & ICU', 'MBBS, DA', 'MMC/2014/09/2456', 11, '+91 98221 33441', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-14', 'Dr. Suresh Iyer', 'FAC-02', 'General Surgery', 'MBBS, MS', 'MMC/2008/04/0912', 17, '+91 98221 55667', 'Evening (2 PM - 8 PM)', 'PRESENT'),
('DOC-15', 'Dr. Priya Nair', 'FAC-02', 'Obstetrics & Gynaecology', 'MBBS, MD', 'MMC/2016/07/3104', 9, '+91 98221 77889', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-16', 'Dr. Mahesh Kadam', 'FAC-02', 'Paediatrics & Neonatology', 'MBBS, DCH', 'MMC/2017/12/3890', 8, '+91 98221 88990', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-17', 'Dr. Sunita Kulkarni', 'FAC-02', 'Radiology & Sonography', 'MBBS, DMRD', 'MMC/2012/03/1567', 13, '+91 98221 22331', 'General (9 AM - 5 PM)', 'ON_LEAVE'),
('DOC-18', 'Dr. Arvind Patel', 'FAC-02', 'Casualty Medical Officer', 'MBBS, MEM', 'MMC/2019/01/4120', 6, '+91 98221 44552', 'Night (8 PM - 8 AM)', 'PRESENT'),
('DOC-31', 'Dr. Meena Gaikwad', 'FAC-03', 'Medical Officer In-Charge', 'MBBS, DPH', 'MMC/2013/05/2019', 12, '+91 98227 33445', 'General (9 AM - 5 PM)', 'PRESENT'),
('DOC-32', 'Dr. Rajesh Sharma', 'FAC-03', 'General Physician / NCD', 'MBBS', 'MMC/2018/02/3421', 7, '+91 98224 45678', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-33', 'Dr. Pooja Patil', 'FAC-03', 'Ayush Medical Officer', 'BAMS', 'MCIM/2019/08/4890', 6, '+91 98224 99001', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-21', 'Dr. Vikas Shinde', 'FAC-04', 'Medical Officer In-Charge', 'MBBS', 'MMC/2016/04/2890', 9, '+91 98225 11223', 'General (9 AM - 5 PM)', 'PRESENT'),
('DOC-22', 'Dr. Kavita Kulkarni', 'FAC-04', 'Obstetrics & Child Health', 'MBBS, DGO', 'MMC/2015/09/2311', 10, '+91 98225 99123', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-23', 'Dr. Rahul Jadhav', 'FAC-04', 'Emergency & Casualty MO', 'MBBS', 'MMC/2020/03/5012', 5, '+91 98225 44332', 'Evening (2 PM - 8 PM)', 'PRESENT'),
('DOC-51', 'Dr. Suresh Pawar', 'FAC-05', 'Medical Superintendent', 'MBBS, MS', 'MMC/2004/01/0198', 21, '+91 98226 99887', 'General (9 AM - 5 PM)', 'PRESENT'),
('DOC-52', 'Dr. Deepak Shirole', 'FAC-05', 'General Medicine', 'MBBS, MD', 'MMC/2011/07/1678', 14, '+91 98232 88901', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-53', 'Dr. Swati Gholap', 'FAC-05', 'Obstetrics & Gynaecology', 'MBBS, DGO', 'MMC/2014/10/2567', 11, '+91 98233 12456', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-71', 'Dr. Arun Jagtap', 'FAC-07', 'Medical Superintendent', 'MBBS, MD', 'MMC/2007/03/0789', 18, '+91 98228 77665', 'General (9 AM - 5 PM)', 'PRESENT'),
('DOC-72', 'Dr. Vikrant Shinde', 'FAC-07', 'General Surgery & Trauma', 'MBBS, MS', 'MMC/2012/08/1745', 13, '+91 98226 77890', 'Morning (8 AM - 2 PM)', 'PRESENT'),
('DOC-91', 'Dr. Deepak More', 'FAC-09', 'Medical Officer In-Charge', 'MBBS', 'MMC/2015/12/2678', 10, '+91 98230 12345', 'General (9 AM - 5 PM)', 'PRESENT'),
('DOC-101', 'Dr. Pooja Nimbalkar', 'FAC-10', 'Medical Officer In-Charge', 'MBBS, DNB', 'MMC/2013/09/2087', 12, '+91 98231 66789', 'General (9 AM - 5 PM)', 'PRESENT'),
('DOC-111', 'Dr. Ashok Patil', 'FAC-11', 'Chief Medical Superintendent', 'MBBS, MD', 'MMC/2003/05/0142', 22, '+91 98232 55667', 'General (9 AM - 5 PM)', 'PRESENT')
ON CONFLICT (id) DO NOTHING;

-- 6. Patients Master & Triage Register (Demographically Authentic Indian Patients)
INSERT INTO patients (id, token_number, uhid, name, age, gender, facility_id, department, chief_complaint, triage_priority, bp, pulse, spo2, temperature, attending_doctor, registration_time, status, bed_number) VALUES
('PAT-001', 101, 'ABHA-MH-2026-1042', 'Aarav Rajesh Deshmukh', 7, 'M', 'FAC-01', 'Pediatrics', 'High grade fever 102.4F with acute chills, bodyache and vomiting for 2 days', 'P3 - Urgent', '100/65', 108, 98, '102.4F', 'Dr. Rahul Kamble', '08:15 AM', 'In Consultation', NULL),
('PAT-002', 102, 'ABHA-MH-2026-1043', 'Sunita Tanaji Pawar', 28, 'F', 'FAC-01', 'Antenatal Care (ANC)', '32 weeks gestation routine 3rd trimester antenatal checkup with mild bilateral pedal edema', 'P4 - Non-Urgent', '124/82', 78, 99, '98.4F', 'Dr. Ramesh Bhosale', '08:30 AM', 'Waiting', NULL),
('PAT-003', 103, 'ABHA-MH-2026-1044', 'Tanaji Mahadev Mane', 59, 'M', 'FAC-01', 'Emergency', 'Retrosternal squeezing chest discomfort with diaphoresis and radiating left arm pain', 'P1 - Resuscitation', '162/98', 96, 93, '98.6F', 'Dr. Ramesh Bhosale', '08:45 AM', 'Observation', 'Emergency-01'),
('PAT-004', 104, 'ABHA-MH-2026-1045', 'Amit Ashok Chavan', 11, 'M', 'FAC-01', 'Pediatrics', 'Acute watery diarrhea (7 episodes) with moderate dehydration and dry buccal mucosa', 'P2 - Emergent', '95/60', 112, 98, '99.1F', 'Dr. Rahul Kamble', '09:05 AM', 'Admitted', 'Ped-02'),
('PAT-005', 105, 'ABHA-MH-2026-1046', 'Shweta Milind Thorat', 27, 'F', 'FAC-01', 'Antenatal Care (ANC)', 'First trimester severe morning sickness, inability to retain oral fluids, severe fatigue', 'P3 - Urgent', '106/70', 84, 99, '98.5F', 'Dr. Ramesh Bhosale', '09:20 AM', 'In Consultation', NULL),
('PAT-006', 106, 'ABHA-MH-2026-1047', 'Sanjay Dattatray Bhosale', 50, 'M', 'FAC-01', 'General OPD', 'Chronic lower back ache with radiating pain to right calf and numbness in great toe', 'P4 - Non-Urgent', '130/84', 74, 98, '98.2F', 'Dr. Ramesh Bhosale', '09:40 AM', 'Waiting', NULL),
('PAT-007', 201, 'ABHA-MH-2026-2081', 'Ganpatrao Tukaram Patil', 64, 'M', 'FAC-02', 'Geriatrics & NCD', 'Type-2 Diabetes mellitus review with fasting blood sugar 246 mg/dL, polyuria and blurred vision', 'P3 - Urgent', '148/92', 82, 97, '98.4F', 'Dr. Anita Deshmukh', '08:20 AM', 'In Consultation', NULL),
('PAT-008', 202, 'ABHA-MH-2026-2082', 'Priya Sandeep Shinde', 22, 'F', 'FAC-02', 'General OPD', 'Acute spasmodic dysmenorrhea with severe lower abdominal colic and nausea', 'P3 - Urgent', '112/74', 86, 99, '98.6F', 'Dr. Priya Nair', '08:35 AM', 'Waiting', NULL),
('PAT-009', 203, 'ABHA-MH-2026-2083', 'Manju Devi Sharma', 48, 'F', 'FAC-02', 'General OPD', 'Persistent epigastric burning sensation, sour belching and postprandial dyspepsia for 3 weeks', 'P4 - Non-Urgent', '128/80', 76, 98, '98.2F', 'Dr. Anita Deshmukh', '08:50 AM', 'Waiting', NULL),
('PAT-010', 204, 'ABHA-MH-2026-2084', 'Archana Vinayak Deshpande', 41, 'F', 'FAC-02', 'General OPD', 'Bilateral ocular redness, itching and mucopurulent discharge consistent with conjunctivitis', 'P4 - Non-Urgent', '118/76', 72, 99, '98.4F', 'Dr. Anita Deshmukh', '09:00 AM', 'Waiting', NULL),
('PAT-011', 205, 'ABHA-MH-2026-2085', 'Vikram Sambhaji Gaikwad', 45, 'M', 'FAC-02', 'Emergency & Trauma', 'Two-wheeler road skid trauma with 6cm deep contaminated laceration over right knee', 'P2 - Emergent', '136/88', 94, 98, '98.8F', 'Dr. Sandeep Jadhav', '09:15 AM', 'Observation', 'Trauma-02'),
('PAT-012', 206, 'ABHA-MH-2026-2086', 'Suresh Narayanan Iyer', 68, 'M', 'FAC-02', 'Emergency / ICU', 'Acute exacerbation of Chronic Obstructive Pulmonary Disease with tachypnea and cyanosis', 'P1 - Resuscitation', '155/94', 118, 88, '99.4F', 'Dr. Pallavi Gore', '09:25 AM', 'Admitted', 'ICU-01'),
('PAT-013', 301, 'ABHA-MH-2026-3012', 'Rohan Amit Verma', 14, 'M', 'FAC-03', 'Emergency', 'Colles-type left wrist deformity with acute swelling and pain after bicycle fall', 'P3 - Urgent', '110/72', 90, 99, '98.6F', 'Dr. Rajesh Sharma', '08:40 AM', 'Observation', NULL),
('PAT-014', 302, 'ABHA-MH-2026-3013', 'Gurpreet Singh Sandhu', 35, 'M', 'FAC-03', 'General OPD', 'Sudden onset generalized erythematous hives and facial pruritus following food intake', 'P3 - Urgent', '122/80', 88, 98, '98.5F', 'Dr. Meena Gaikwad', '09:10 AM', 'In Consultation', NULL),
('PAT-015', 303, 'ABHA-MH-2026-3014', 'Farhan Zahir Shaikh', 16, 'M', 'FAC-03', 'General OPD', 'Intense nocturnal itching with excoriated papules on finger webs (hostel room cluster)', 'P4 - Non-Urgent', '114/70', 75, 99, '98.2F', 'Dr. Pooja Patil', '09:30 AM', 'Waiting', NULL),
('PAT-016', 401, 'ABHA-MH-2026-4021', 'Lakshmi Ramaswamy Sundaram', 52, 'F', 'FAC-04', 'General OPD', 'Degenerative osteoarthritis bilateral knees with joint crepitus and impaired mobility', 'P4 - Non-Urgent', '134/86', 76, 98, '98.4F', 'Dr. Vikas Shinde', '08:30 AM', 'In Consultation', NULL),
('PAT-017', 402, 'ABHA-MH-2026-4022', 'Rahul Vilas Wagh', 26, 'M', 'FAC-04', 'Emergency', 'Class-III stray dog bite puncture wounds over right calf with active capillary bleeding', 'P2 - Emergent', '126/82', 92, 98, '98.8F', 'Dr. Rahul Jadhav', '08:55 AM', 'In Consultation', NULL),
('PAT-018', 403, 'ABHA-MH-2026-4023', 'Arvind Jayantilal Patel', 46, 'M', 'FAC-04', 'General OPD', 'Acute purulent maxillary sinusitis with periorbital throbbing headache and fever', 'P4 - Non-Urgent', '128/84', 80, 98, '100.2F', 'Dr. Vikas Shinde', '09:20 AM', 'Waiting', NULL),
('PAT-019', 501, 'ABHA-MH-2026-5091', 'Mohammed Asif Ansari', 38, 'M', 'FAC-05', 'General OPD', 'Chronic productive cough (>3 weeks) with low evening pyrexia, weight loss, hemoptysis streaks', 'P3 - Urgent', '120/78', 84, 96, '99.8F', 'Dr. Deepak Shirole', '08:30 AM', 'In Consultation', NULL),
('PAT-020', 502, 'ABHA-MH-2026-5092', 'Savita Baburao Shirole', 33, 'F', 'FAC-05', 'Maternity', 'Full-term pregnancy G2P1 admitted in active labor with regular uterine contractions every 3 min', 'P1 - Resuscitation', '128/84', 88, 99, '98.6F', 'Dr. Swati Gholap', '08:45 AM', 'Admitted', 'Maternity-03'),
('PAT-021', 503, 'ABHA-MH-2026-5093', 'Vandana Hemant Kulkarni', 63, 'F', 'FAC-05', 'General Surgery', 'Diabetic neuro-ischemic plantar ulcer over 1st metatarsal head with surrounding cellulitis', 'P2 - Emergent', '144/88', 86, 97, '99.2F', 'Dr. Suresh Pawar', '09:10 AM', 'Observation', 'Surg-01'),
('PAT-022', 601, 'ABHA-MH-2026-6011', 'Ananya Bhaskar Joshi', 4, 'F', 'FAC-06', 'Pediatrics', 'Acute bronchopneumonia with intercostal retractions, grunting and tachypnea (RR 46/min)', 'P2 - Emergent', '92/58', 128, 92, '101.8F', 'Dr. Sujata Shinde', '08:40 AM', 'Admitted', 'Ped-01'),
('PAT-023', 602, 'ABHA-MH-2026-6012', 'Nitin Prabhakar More', 37, 'M', 'FAC-06', 'Emergency', 'Blunt occupational head trauma at warehouse, 4cm scalp laceration requiring primary repair', 'P3 - Urgent', '132/86', 82, 98, '98.4F', 'Dr. Ganesh Thorat', '09:15 AM', 'Observation', NULL),
('PAT-024', 701, 'ABHA-MH-2026-7041', 'Deepa Venkat Reddy', 29, 'F', 'FAC-07', 'General OPD', 'Acute follicular tonsillitis with severe odynophagia, trismus and cervical lymphadenitis', 'P3 - Urgent', '116/74', 88, 99, '101.6F', 'Dr. Arun Jagtap', '08:30 AM', 'In Consultation', NULL),
('PAT-025', 702, 'ABHA-MH-2026-7042', 'Harish Devendra Salunke', 42, 'M', 'FAC-07', 'Emergency & Surgery', 'Acute right iliac fossa abdominal pain, rebound tenderness, high fever (suspected appendicitis)', 'P2 - Emergent', '130/85', 104, 98, '101.2F', 'Dr. Vikrant Shinde', '09:00 AM', 'Admitted', 'Surg-03'),
('PAT-026', 801, 'ABHA-MH-2026-8051', 'Sneha Nilesh Jadhav', 31, 'F', 'FAC-08', 'Antenatal Care (ANC)', 'Gestational hypertension (BP 154/98 mmHg) in 28th week of gestation with trace proteinuria', 'P2 - Emergent', '154/98', 86, 98, '98.6F', 'Dr. Kavita Joshi', '08:45 AM', 'In Consultation', NULL),
('PAT-027', 802, 'ABHA-MH-2026-8052', 'Santosh Bapu Shinde', 39, 'M', 'FAC-08', 'General OPD', 'Superficial 2nd-degree mechanical friction burn over left forearm from sugarcane crusher', 'P3 - Urgent', '124/80', 80, 99, '98.5F', 'Dr. Sanjay Patil', '09:15 AM', 'Observation', NULL),
('PAT-028', 803, 'ABHA-MH-2026-8053', 'Suman Ramprasad Gupta', 55, 'F', 'FAC-08', 'General OPD', 'Chronic fatigue, periorbital puffiness, cold intolerance (suboptimally controlled hypothyroidism)', 'P4 - Non-Urgent', '136/88', 66, 98, '97.8F', 'Dr. Sanjay Patil', '09:35 AM', 'Waiting', NULL),
('PAT-029', 901, 'ABHA-MH-2026-9021', 'Rajesh Pandurang Kulkarni', 62, 'M', 'FAC-09', 'NCD Clinic', 'Hypertensive urgency with severe occipital headache, dizziness and epistaxis (BP 182/108 mmHg)', 'P2 - Emergent', '182/108', 92, 96, '98.4F', 'Dr. Deepak More', '08:40 AM', 'Admitted', 'Bed-05'),
('PAT-030', 902, 'ABHA-MH-2026-9022', 'Rekha Manohar Gaikwad', 54, 'F', 'FAC-09', 'General OPD', 'Generalized anxiety symptoms with persistent sleep disturbance and tension band headaches', 'P4 - Non-Urgent', '130/82', 82, 98, '98.6F', 'Dr. Amit Salunke', '09:05 AM', 'Waiting', NULL),
('PAT-031', 1001, 'ABHA-MH-2026-1011', 'Pooja Santosh Rathod', 19, 'F', 'FAC-10', 'General OPD', 'Severe nutritional microcytic hypochromic anemia (Hb 6.8 g/dL) with syncope upon standing', 'P2 - Emergent', '98/62', 106, 97, '98.2F', 'Dr. Pooja Nimbalkar', '08:50 AM', 'Observation', 'Obs-01'),
('PAT-032', 1002, 'ABHA-MH-2026-1012', 'Meera Krishnan Nair', 25, 'F', 'FAC-10', 'General OPD', 'Acute urinary tract infection with burning micturition, increased frequency and lower abdominal pain', 'P3 - Urgent', '114/72', 78, 99, '99.0F', 'Dr. Sachin Jagtap', '09:20 AM', 'In Consultation', NULL),
('PAT-033', 1101, 'ABHA-MH-2026-1105', 'Balasaheb Vishnu Jagtap', 71, 'M', 'FAC-11', 'Urology & Geriatrics', 'Acute urinary retention secondary to benign prostatic hyperplasia, catheterized at triage', 'P2 - Emergent', '146/90', 84, 97, '98.4F', 'Dr. Vinod Kale', '08:30 AM', 'Admitted', 'Ward-04'),
('PAT-034', 1201, 'ABHA-MH-2026-1201', 'Neha Sachin Kadam', 8, 'F', 'FAC-12', 'Immunization & Wellness', 'National immunization schedule school-age booster and preventive health assessment', 'P4 - Non-Urgent', '102/66', 88, 99, '98.4F', 'Dr. Swati Gholap', '09:00 AM', 'Discharged', NULL),
('PAT-035', 1202, 'ABHA-MH-2026-1202', 'Kavita Dilip Kale', 36, 'F', 'FAC-12', 'Highway Emergency Post', 'Highway auto collision cervical strain injury with shoulder contusions, neurological exam intact', 'P3 - Urgent', '124/80', 84, 98, '98.6F', 'Dr. Pravin Kulkarni', '09:25 AM', 'Observation', 'Trauma-01')
ON CONFLICT (id) DO NOTHING;

