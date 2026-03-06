# AAI Attendance App Credentials

The database has been seeded with the following sample users. You can use these to test the application logic:

## 1. Regular Employee (Testing Attendance/Leaves)
- **Employee ID:** `AA100002`
- **Email:** `priya.sharma@aai.aero`
- **Password:** `User@123`
- **Role:** Employee

## 2. Workplace Admin (Managing Specific Office)
- **Employee ID:** `AA100001`
- **Email:** `admin@aai.aero`
- **Password:** `Admin@123`
- **Role:** Admin

## 3. Super Admin (Full Control)
- **Employee ID:** `SA100001`
- **Email:** `super.admin@aai.aero`
- **Password:** `Super@123`
- **Role:** Super Admin

---
**Note:** Always ensure the Next.js backend is running correctly at `http://localhost:3000` for these credentials to work. If you reset the database, use the `/api/seed` route to restore this data.
