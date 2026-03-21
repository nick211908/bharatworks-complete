-- Migration to add attendance tracking with date-wise records
-- This supports traditional attendance register format

-- Create attendance table if it doesn't exist
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'HALF', 'ABSENT', 'PENDING')),
    checkin_time TIMESTAMP,
    checkout_time TIMESTAMP,
    wage DECIMAL(10, 2),
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(worker_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendances_worker_date ON attendances(worker_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_employer_date ON attendances(employer_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_job ON attendances(job_id);

-- Create worker_dues table to track outstanding payments
CREATE TABLE IF NOT EXISTS worker_dues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    total_earned DECIMAL(12, 2) DEFAULT 0,
    total_paid DECIMAL(12, 2) DEFAULT 0,
    balance_due DECIMAL(12, 2) DEFAULT 0,
    last_payment_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(worker_id, employer_id)
);

-- Create index for worker dues
CREATE INDEX IF NOT EXISTS idx_worker_dues_worker ON worker_dues(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_dues_employer ON worker_dues(employer_id);
