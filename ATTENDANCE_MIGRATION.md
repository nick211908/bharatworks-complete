# Attendance System Migration Guide

## Overview
The attendance system has been redesigned from a job-centric model to a traditional **labour-centric attendance register**.

## What Changed

### Old System (Job-Centric)
- Jobs listed first
- Workers shown inside each job
- No date-wise tracking
- Payment per job

### New System (Labour-Centric)
- Workers listed as rows
- Dates shown as columns
- Mark attendance per worker per day
- Track dues and partial payments
- Traditional attendance register format

## Database Changes

### New Tables Added

1. **attendances** - Daily attendance records
   - worker_id
   - date
   - status (PRESENT/HALF/ABSENT/PENDING)
   - wage
   - amount_paid
   - payment_status (UNPAID/PARTIAL/PAID)

2. **worker_dues** - Outstanding payment tracking
   - worker_id
   - employer_id
   - total_earned
   - total_paid
   - balance_due

## Migration Steps

### Step 1: Run Prisma Migration

```bash
cd bharatworks-backend
npx prisma migrate dev --name add_attendance_tables
```

Or apply the SQL directly:

```bash
cd bharatworks-backend
psql -d bharatworks -f prisma/migrations/20250321_add_attendance_tables/migration.sql
```

### Step 2: Generate Prisma Client

```bash
cd bharatworks-backend
npx prisma generate
```

### Step 3: Restart Backend Server

```bash
cd bharatworks-backend
npm run dev
```

### Step 4: Restart React Native App

```bash
cd BharatEmployer
npx react-native run-android
# or
npx react-native run-ios
```

## New API Endpoints

### GET /api/users/employer/workers-attendance
Get workers with their attendance for a date range.

Query params:
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

### POST /api/users/employer/attendance/mark
Mark attendance for a worker on a specific date.

Body:
```json
{
  "workerId": "uuid",
  "date": "2025-03-21",
  "status": "PRESENT|HALF|ABSENT",
  "wage": 800
}
```

### POST /api/users/employer/workers/:workerId/pay
Make payment to a worker.

Body:
```json
{
  "amount": 400,
  "notes": "Partial payment"
}
```

### GET /api/users/employer/workers/:workerId/attendance-history
Get complete attendance history for a worker.

## UI Changes

### New Components
- `LabourAttendanceRegister.tsx` - Main attendance register screen

### Features
1. **Attendance Table**
   - Workers as rows
   - Dates as columns (last 7 days)
   - Tap on cell to mark attendance
   - Color coding: Green (Present), Yellow (Half), Red (Absent), Grey (Pending)

2. **Payment Tracking**
   - Shows dues for each worker
   - Tap Pay button to make payment
   - Supports partial payments
   - Tracks total earned vs total paid

3. **Visual Indicators**
   - Border on cells indicates payment status
   - Dot indicator for partial payments
   - Day totals shown at bottom

## Testing

1. Open the app and navigate to "Attendance" tab
2. You should see:
   - List of all workers who have worked for you
   - Dates across the top
   - Attendance cells for each worker/date
   - Dues column showing outstanding amounts

3. Test marking attendance:
   - Tap on any cell
   - Select Present/Half/Absent
   - Status should update

4. Test payments:
   - Tap Pay button on a worker with dues
   - Enter amount less than or equal to dues
   - Payment should process and dues should update

## Rollback (if needed)

If you need to rollback:

```bash
cd bharatworks-backend
npx prisma migrate rollback
```

Or manually drop tables:
```sql
DROP TABLE IF EXISTS worker_dues;
DROP TABLE IF EXISTS attendances;
```

Then revert `MarkAttendance.tsx` to the previous version from git.
