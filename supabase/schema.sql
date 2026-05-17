-- ============================================================
-- Airo — AI Clinical Copilot — Full Database Schema
-- Run once in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. HOSPITALS
-- Core institution table. Supports hospital chains, 
-- telemedicine platforms, and rural clinics uniformly.
-- ============================================================
CREATE TABLE IF NOT EXISTS hospitals (
  hospital_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('hospital', 'clinic', 'telemedicine', 'rural_health_centre', 'diagnostic_centre')),
  address           TEXT,
  city              TEXT,
  state             TEXT,
  pincode           TEXT,
  phone             TEXT,
  email             TEXT,
  website           TEXT,
  -- ABDM (Ayushman Bharat Digital Mission) facility identifier
  abdm_facility_id  TEXT UNIQUE,
  logo_url          TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  metadata          JSONB NOT NULL DEFAULT '{}',  -- flexible config per hospital
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. DEPARTMENTS
-- Organises doctors by clinical specialty within a hospital.
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  department_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id    UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
  name           TEXT NOT NULL,   -- e.g. "Cardiology", "General Medicine"
  code           TEXT,            -- short code e.g. "CARD", "GM"
  head_doctor_id UUID,            -- set after doctors table creation via FK alter
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. DOCTORS
-- Clinicians who use the AI copilot. Linked to one hospital
-- and one department. MCI registration for compliance.
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id          UUID REFERENCES hospitals(hospital_id) ON DELETE SET NULL,
  department_id        UUID REFERENCES departments(department_id) ON DELETE SET NULL,
  -- Identity
  full_name            TEXT NOT NULL,
  email                TEXT UNIQUE NOT NULL,
  phone                TEXT,
  gender               TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  -- Clinical credentials
  specialization       TEXT NOT NULL,   -- e.g. "Cardiologist", "General Practitioner"
  designation          TEXT,            -- e.g. "Senior Consultant", "Resident"
  mci_registration_no  TEXT UNIQUE,     -- Medical Council of India reg number
  years_of_experience  INT,
  languages_spoken     TEXT[] NOT NULL DEFAULT '{en}',  -- ISO 639-1 codes
  -- Documents & profile
  profile_image_url    TEXT,
  certificate_url      TEXT,
  id_document_url      TEXT,
  digital_signature    TEXT,            -- for signed prescriptions
  -- System state
  is_onboarded         BOOLEAN NOT NULL DEFAULT FALSE,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at        TIMESTAMPTZ,
  -- Preferences
  preferred_language   TEXT NOT NULL DEFAULT 'en',
  soap_template        JSONB,           -- custom SOAP note structure per doctor
  notification_prefs   JSONB NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Now set the FK for department head
ALTER TABLE departments
  ADD CONSTRAINT departments_head_doctor_fk
  FOREIGN KEY (head_doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL;

-- ============================================================
-- 4. PATIENTS
-- ABDM-aligned patient records. ABHA ID is the unique
-- national health identifier under the Ayushman Bharat scheme.
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  patient_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id             UUID REFERENCES hospitals(hospital_id) ON DELETE SET NULL,
  -- Identity
  full_name               TEXT NOT NULL,
  email                   TEXT,
  phone                   TEXT,
  gender                  TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  date_of_birth           DATE,
  age                     INT,            -- stored for quick access; compute from dob when possible
  blood_group             TEXT CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown')),
  -- ABDM health identifier
  abha_id                 TEXT UNIQUE,    -- 14-digit Ayushman Bharat Health Account ID
  abha_address            TEXT,           -- e.g. patient@abdm
  -- Address
  address                 TEXT,
  city                    TEXT,
  state                   TEXT,
  pincode                 TEXT,
  -- Emergency contact
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_rel   TEXT,
  -- Clinical background (populated over time)
  known_allergies         JSONB NOT NULL DEFAULT '[]',  -- [{name, severity, reaction}]
  chronic_conditions      JSONB NOT NULL DEFAULT '[]',  -- [{name, icd10, since}]
  current_medications     JSONB NOT NULL DEFAULT '[]',  -- [{drug, dosage, frequency}]
  vaccination_history     JSONB NOT NULL DEFAULT '[]',
  family_history          JSONB NOT NULL DEFAULT '{}',
  -- Flags
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. CONSULTATIONS
-- The core session entity. One consultation = one patient visit
-- or telemedicine call. Stores audio, full transcript, and
-- metadata for the AI pipeline.
-- ============================================================
CREATE TABLE IF NOT EXISTS consultations (
  consultation_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id          UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
  patient_id         UUID NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
  hospital_id        UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE RESTRICT,
  -- Scheduling
  status             TEXT NOT NULL DEFAULT 'scheduled'
                       CHECK (status IN ('scheduled','in_progress','completed','cancelled','no_show')),
  consultation_type  TEXT NOT NULL DEFAULT 'in_person'
                       CHECK (consultation_type IN ('in_person','telemedicine','follow_up','emergency')),
  chief_complaint    TEXT,          -- brief reason for visit entered by doctor/receptionist
  scheduled_at       TIMESTAMPTZ,
  started_at         TIMESTAMPTZ,
  ended_at           TIMESTAMPTZ,
  duration_seconds   INT,           -- computed on end
  -- Multilingual transcription (Whisper output)
  language_detected  TEXT,          -- ISO 639-1 code detected by Whisper
  audio_url          TEXT,          -- signed URL for playback
  audio_storage_path TEXT,          -- internal bucket path
  audio_duration_sec INT,
  transcript_raw     TEXT,          -- raw Whisper output
  transcript_cleaned TEXT,          -- post-processed, diarised transcript
  speaker_segments   JSONB,         -- [{speaker, start_sec, end_sec, text}]
  -- ABDM EHR sync
  abdm_synced        BOOLEAN NOT NULL DEFAULT FALSE,
  abdm_synced_at     TIMESTAMPTZ,
  abdm_record_id     TEXT,          -- reference ID in ABDM system
  -- Extra
  notes              TEXT,          -- freeform doctor notes not in SOAP
  room_number        TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. SOAP NOTES
-- Structured clinical note generated by the AI copilot.
-- Each section is stored separately for granular feedback.
-- Versioned: doctor edits create a new row referencing
-- the prior version via parent_note_id.
-- ============================================================
CREATE TABLE IF NOT EXISTS soap_notes (
  note_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id      UUID NOT NULL REFERENCES consultations(consultation_id) ON DELETE CASCADE,
  doctor_id            UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
  patient_id           UUID NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
  -- Core SOAP sections (AI-generated, doctor-editable)
  subjective           TEXT,   -- S: patient-reported symptoms, history, complaints
  objective            TEXT,   -- O: vitals, exam findings, observable data
  assessment           TEXT,   -- A: differential diagnosis, clinical impression
  plan                 TEXT,   -- P: treatment, medications, referrals, follow-up
  -- Med-BERT extracted entities stored as structured JSON
  extracted_symptoms   JSONB NOT NULL DEFAULT '[]',  -- [{term, negated, severity, confidence}]
  extracted_vitals     JSONB NOT NULL DEFAULT '{}',  -- {bp, hr, rr, temp, spo2, weight, height, bmi}
  extracted_diagnoses  JSONB NOT NULL DEFAULT '[]',  -- [{name, icd10, confidence}]
  extracted_medications JSONB NOT NULL DEFAULT '[]', -- [{drug, dosage, frequency, route, duration}]
  extracted_procedures JSONB NOT NULL DEFAULT '[]',  -- [{name, cpt_code, confidence}]
  icd10_codes          JSONB NOT NULL DEFAULT '[]',  -- top ICD-10 codes suggested
  -- AI quality metadata (supports feedback loop training)
  ai_confidence_score  FLOAT CHECK (ai_confidence_score BETWEEN 0 AND 1),
  ai_model_version     TEXT,
  generation_time_ms   INT,       -- latency tracking for perf monitoring
  -- Doctor review workflow
  doctor_feedback      TEXT,      -- freeform correction note from doctor
  is_approved          BOOLEAN NOT NULL DEFAULT FALSE,
  approved_at          TIMESTAMPTZ,
  -- Versioning
  version              INT NOT NULL DEFAULT 1,
  parent_note_id       UUID REFERENCES soap_notes(note_id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. DIAGNOSES
-- Individual diagnosis records extracted from consultations.
-- Stored separately for longitudinal patient history queries.
-- ============================================================
CREATE TABLE IF NOT EXISTS diagnoses (
  diagnosis_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id   UUID NOT NULL REFERENCES consultations(consultation_id) ON DELETE CASCADE,
  patient_id        UUID NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
  doctor_id         UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
  icd10_code        TEXT,             -- e.g. "J06.9"
  diagnosis_name    TEXT NOT NULL,    -- e.g. "Acute upper respiratory infection"
  diagnosis_type    TEXT NOT NULL DEFAULT 'primary'
                      CHECK (diagnosis_type IN ('primary','secondary','differential','ruled_out')),
  severity          TEXT CHECK (severity IN ('mild','moderate','severe','critical')),
  status            TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','resolved','chronic','recurrent')),
  onset_date        DATE,
  resolved_date     DATE,
  confidence_score  FLOAT,            -- from Med-BERT
  source            TEXT NOT NULL DEFAULT 'ai'
                      CHECK (source IN ('ai','doctor','imported')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. PRESCRIPTIONS + PRESCRIPTION ITEMS
-- Split into header (prescription) and line items (drugs).
-- Supports multi-drug prescriptions cleanly.
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  prescription_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id  UUID NOT NULL REFERENCES consultations(consultation_id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
  doctor_id        UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
  status           TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('draft','active','dispensed','cancelled','expired')),
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until      TIMESTAMPTZ,
  pharmacist_notes TEXT,
  abdm_synced      BOOLEAN NOT NULL DEFAULT FALSE,
  abdm_record_id   TEXT,
  digital_signature TEXT,   -- doctor's signature hash
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescription_items (
  item_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id  UUID NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
  drug_name        TEXT NOT NULL,
  generic_name     TEXT,
  brand_name       TEXT,
  drug_code        TEXT,         -- NDC or Indian FDA code
  dosage           TEXT NOT NULL,   -- e.g. "500mg"
  frequency        TEXT NOT NULL,   -- e.g. "TID (three times a day)"
  route            TEXT NOT NULL DEFAULT 'oral'
                     CHECK (route IN ('oral','iv','im','topical','inhaled','sublingual','rectal','other')),
  duration         TEXT,            -- e.g. "7 days"
  quantity         INT,
  instructions     TEXT,            -- e.g. "Take after meals"
  is_substitutable BOOLEAN NOT NULL DEFAULT TRUE,  -- generic substitution allowed?
  sort_order       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. REPORTS
-- Lab reports, imaging results, uploaded documents.
-- AI extracts key values and flags abnormals.
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  report_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  consultation_id    UUID REFERENCES consultations(consultation_id) ON DELETE SET NULL,
  uploaded_by        UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
  -- Classification
  report_type        TEXT NOT NULL
                       CHECK (report_type IN ('lab','imaging','ecg','pathology','biopsy','prescription','discharge_summary','other')),
  title              TEXT NOT NULL,     -- e.g. "Complete Blood Count - 12 May 2025"
  -- Storage
  file_url           TEXT NOT NULL,
  storage_path       TEXT NOT NULL,
  mime_type          TEXT,              -- e.g. "application/pdf", "image/jpeg"
  file_size_bytes    BIGINT,
  -- AI extraction results
  ai_extracted_values JSONB NOT NULL DEFAULT '{}',  -- {parameter: {value, unit, reference_range}}
  abnormal_flags      JSONB NOT NULL DEFAULT '[]',  -- [{parameter, value, flag: 'high'|'low'|'critical'}]
  ai_summary          TEXT,                         -- one-paragraph AI summary of the report
  ai_model_version    TEXT,
  -- Metadata
  report_date        DATE,
  lab_name           TEXT,
  referring_doctor   TEXT,
  notes              TEXT,
  is_archived        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. DIAGNOSTIC SUGGESTIONS
-- Real-time AI suggestions (tests to order, referrals, alerts)
-- generated during or after the consultation.
-- ============================================================
CREATE TABLE IF NOT EXISTS diagnostic_suggestions (
  suggestion_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id    UUID NOT NULL REFERENCES consultations(consultation_id) ON DELETE CASCADE,
  suggestion_type    TEXT NOT NULL
                       CHECK (suggestion_type IN ('lab_test','imaging','referral','medication_alert','follow_up','warning')),
  title              TEXT NOT NULL,
  description        TEXT,
  supporting_evidence JSONB NOT NULL DEFAULT '[]',  -- [{type, text, source}]
  confidence_score   FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  priority           TEXT NOT NULL DEFAULT 'normal'
                       CHECK (priority IN ('low','normal','high','critical')),
  -- Doctor response tracking
  doctor_acted_on    BOOLEAN NOT NULL DEFAULT FALSE,
  doctor_response    TEXT CHECK (doctor_response IN ('accepted','rejected','deferred', NULL)),
  doctor_notes       TEXT,
  acted_at           TIMESTAMPTZ,
  -- AI metadata
  ai_model_version   TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. AI FEEDBACK
-- Captures doctor corrections to AI output for the 
-- continuous learning / RLHF feedback loop.
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_feedback (
  feedback_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id  UUID NOT NULL REFERENCES consultations(consultation_id) ON DELETE CASCADE,
  note_id          UUID REFERENCES soap_notes(note_id) ON DELETE SET NULL,
  doctor_id        UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
  -- What was corrected
  feedback_type    TEXT NOT NULL
                     CHECK (feedback_type IN ('soap_section','diagnosis','medication','suggestion','transcript','other')),
  soap_section     TEXT CHECK (soap_section IN ('subjective','objective','assessment','plan', NULL)),
  original_value   TEXT,          -- what the AI generated
  corrected_value  TEXT,          -- what the doctor changed it to
  -- Quality signal
  rating           INT CHECK (rating BETWEEN 1 AND 5),  -- 1=very wrong, 5=perfect
  comment          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. AUDIT LOGS
-- Immutable trail for ABDM compliance, HIPAA-equivalent
-- requirements, and forensic review.
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id      UUID NOT NULL DEFAULT gen_random_uuid(),
  actor_id    UUID,           -- doctor_id or system
  actor_role  TEXT,           -- 'doctor', 'patient', 'system', 'admin'
  action      TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE', 'READ', 'EXPORT'
  table_name  TEXT NOT NULL,
  record_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (log_id, created_at)  -- created_at required by partition key
) PARTITION BY RANGE (created_at);  -- partition by month for scale

-- Seed the first partition
CREATE TABLE IF NOT EXISTS audit_logs_2025 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE IF NOT EXISTS audit_logs_2026 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_departments_hospital       ON departments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital           ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_department         ON doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_patients_hospital          ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patients_abha              ON patients(abha_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone             ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor       ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient      ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_hospital     ON consultations(hospital_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status       ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled    ON consultations(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_soap_consultation          ON soap_notes(consultation_id);
CREATE INDEX IF NOT EXISTS idx_soap_patient               ON soap_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_soap_approved              ON soap_notes(is_approved);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient          ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_icd10            ON diagnoses(icd10_code);
CREATE INDEX IF NOT EXISTS idx_diagnoses_consultation     ON diagnoses(consultation_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient      ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_presc  ON prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_reports_patient            ON reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_consultation       ON reports(consultation_id);
CREATE INDEX IF NOT EXISTS idx_reports_type               ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_suggestions_consultation   ON diagnostic_suggestions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_priority       ON diagnostic_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_doctor            ON ai_feedback(doctor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_consultation      ON ai_feedback(consultation_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor                ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_table_record         ON audit_logs(table_name, record_id);

-- Full-text search on transcript and SOAP notes
CREATE INDEX IF NOT EXISTS idx_fts_transcript ON consultations USING GIN (to_tsvector('english', COALESCE(transcript_cleaned, '')));
CREATE INDEX IF NOT EXISTS idx_fts_soap       ON soap_notes    USING GIN (to_tsvector('english', COALESCE(subjective,'') || ' ' || COALESCE(objective,'') || ' ' || COALESCE(assessment,'') || ' ' || COALESCE(plan,'')));

-- JSON path indexes for common Med-BERT lookups
CREATE INDEX IF NOT EXISTS idx_soap_icd10 ON soap_notes USING GIN (icd10_codes);
CREATE INDEX IF NOT EXISTS idx_soap_symptoms ON soap_notes USING GIN (extracted_symptoms);
CREATE INDEX IF NOT EXISTS idx_reports_abnormal ON reports USING GIN (abnormal_flags);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_hospitals_updated_at    BEFORE UPDATE ON hospitals    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_doctors_updated_at      BEFORE UPDATE ON doctors      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patients_updated_at     BEFORE UPDATE ON patients     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_soap_updated_at         BEFORE UPDATE ON soap_notes   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE hospitals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors                ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients               ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports                ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             ENABLE ROW LEVEL SECURITY;

-- Service role (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS.
-- Add application-level policies per your auth setup.

NOTIFY pgrst, 'reload schema';
