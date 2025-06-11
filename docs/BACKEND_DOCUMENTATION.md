# Backend Documentation - Anonymous Donations Platform

## Overview

This document provides comprehensive documentation for the backend architecture of the Anonymous Donations Platform built with SvelteKit. The backend handles donation processing, project management, admin authentication, and M-Pesa payment integration.

## Architecture

### Technology Stack
- **Framework**: SvelteKit (Full-stack framework)
- **Database**: SQLite3 with better-sqlite3 driver
- **Authentication**: bcrypt for password hashing, session-based auth
- **Payment Gateway**: M-Pesa STK Push API
- **Runtime**: Node.js

### Database Schema

#### Tables Structure

**1. Projects Table**
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  image_url TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**2. Donations Table**
```sql
CREATE TABLE donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  phone_number TEXT,
  mpesa_transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);
```

**3. Admin Users Table**
```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**4. Site Settings Table**
```sql
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**5. Admin Sessions Table** (Created dynamically)
```sql
CREATE TABLE admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);
```

### Database Configuration

**File**: `src/lib/database.ts`

- **Connection**: Uses better-sqlite3 for synchronous operations
- **Environment**: `donations.db` (development) / `donations_prod.db` (production)
- **Foreign Keys**: Enabled for referential integrity
- **Triggers**: Auto-update timestamps on record modifications

## API Endpoints

### Public Endpoints

#### Projects API

**GET /api/projects**
- **Purpose**: Retrieve all projects with pagination and filtering
- **Query Parameters**:
  - `category`: Filter by project category
  - `status`: Filter by project status
  - `limit`: Limit number of results
- **Response**: Array of project objects with calculated current amounts

**GET /api/projects/[id]**
- **Purpose**: Get specific project details
- **Parameters**: `id` - Project ID
- **Response**: Project object with donation statistics

**POST /api/projects** (Admin only)
- **Purpose**: Create new project
- **Body**: `{ title, description, target_amount, image_url, category }`
- **Validation**: Required fields, positive target amount

#### Donations API

**GET /api/donations**
- **Purpose**: Retrieve donations (anonymized for public)
- **Query Parameters**:
  - `project_id`: Filter by project
  - `limit`: Limit results
- **Privacy**: Anonymizes donor information, hides sensitive data

**POST /api/donations**
- **Purpose**: Create new donation and initiate M-Pesa payment
- **Body**: `{ project_id, amount, donor_name, donor_email, phone_number }`
- **Validation**: 
  - Required fields validation
  - Amount limits (1 - 1,000,000 KES)
  - Phone number format validation
  - Project existence and status check
- **Process**:
  1. Create donation record with 'pending' status
  2. Initiate M-Pesa STK Push
  3. Update donation with M-Pesa transaction ID
  4. Auto-complete after 3 seconds (demo mode)

**GET /api/donations/status**
- **Purpose**: Check donation payment status
- **Query Parameters**: `donation_id`, `checkout_request_id`
- **Response**: Donation status and details

**POST /api/donations/status** (Testing endpoint)
- **Purpose**: Manually update donation status for testing
- **Body**: `{ donation_id, status, transaction_id }`

#### Statistics API

**GET /api/stats**
- **Purpose**: Platform analytics and statistics
- **Response**:
  - Total and active projects count
  - Total donations and amount raised
  - Recent donations (anonymized)
  - Donations by category
  - Monthly trends (last 6 months)

### Admin Endpoints

#### Authentication

**POST /api/admin/login**
- **Purpose**: Admin user authentication
- **Body**: `{ username, password }`
- **Security**: bcrypt password verification
- **Session**: Creates session token with 24-hour expiry
- **Response**: User details and session token

#### Settings Management

**GET /api/admin/settings**
- **Purpose**: Retrieve all site settings
- **Response**: Settings object with type conversion

**PUT /api/admin/settings**
- **Purpose**: Update site settings
- **Body**: `{ settings: { key: value } }`
- **Transaction**: Atomic updates for consistency

**POST /api/admin/settings**
- **Purpose**: Reset settings to defaults
- **Process**: Deletes all settings and recreates defaults

### Payment Integration

#### M-Pesa Callback

**POST /api/mpesa/callback**
- **Purpose**: Handle M-Pesa payment callbacks
- **Process**:
  1. Parse callback data
  2. Find corresponding donation
  3. Update donation status based on result
  4. Update project current amount
  5. Log transaction details
- **Security**: Always returns success to acknowledge receipt

**PUT /api/mpesa/callback**
- **Purpose**: Handle M-Pesa timeout callbacks
- **Process**: Mark donations as failed due to timeout

### Utility Endpoints

**POST /api/init**
- **Purpose**: Initialize database schema and sample data
- **Usage**: Called on application startup

## Core Libraries

### Database Layer (`src/lib/database.ts`)

**Key Functions**:
- `initializeDatabase()`: Creates tables, triggers, and sample data
- `insertSampleData()`: Populates initial project data
- `recreateAdminUser()`: Creates admin user with hashed password

**Features**:
- Foreign key constraints enabled
- Automatic timestamp updates via triggers
- Sample data insertion for development
- Secure password hashing with bcrypt

### M-Pesa Integration (`src/lib/mpesa.ts`)

**Configuration**:
```javascript
const MPESA_CONFIG = {
  consumer_key: process.env.MPESA_CONSUMER_KEY,
  consumer_secret: process.env.MPESA_CONSUMER_SECRET,
  business_short_code: process.env.MPESA_BUSINESS_SHORT_CODE,
  passkey: process.env.MPESA_PASSKEY,
  callback_url: process.env.MPESA_CALLBACK_URL,
  base_url: process.env.MPESA_BASE_URL
};
```

**Key Functions**:
- `getAccessToken()`: OAuth token generation
- `initiateSTKPush()`: Initiate payment request
- `querySTKPushStatus()`: Check payment status
- `mockSTKPush()`: Demo mode payment simulation
- `validatePhoneNumber()`: Phone format validation

**Phone Number Formats Supported**:
- `254XXXXXXXXX` (International format)
- `07XXXXXXXX` (Local format)
- `01XXXXXXXX` (Local format)

## Authentication & Security

### Admin Authentication

**Implementation**: Session-based authentication with bcrypt
**Storage**: Session tokens stored in database with expiry
**Security Features**:
- Password hashing with bcrypt (12 salt rounds)
- Session expiry (24 hours)
- Automatic cleanup of expired sessions

### Data Privacy

**Donor Information**:
- Email addresses never exposed in public APIs
- Phone numbers anonymized in public responses
- Donor names default to "Anonymous" if not provided

**Transaction Security**:
- M-Pesa transaction IDs stored securely
- Payment status validation through callbacks
- Failed transaction logging

## Error Handling

### Validation Errors
- Input validation with descriptive error messages
- HTTP status codes (400 for validation, 404 for not found, 500 for server errors)
- Consistent error response format

### Payment Errors
- M-Pesa API error handling and logging
- Automatic donation status updates on failure
- Timeout handling for incomplete payments

### Database Errors
- Transaction rollback on failures
- Foreign key constraint enforcement
- Graceful error responses

## Environment Configuration

### Required Environment Variables
```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
```

### Database Files
- Development: `donations.db`
- Production: `donations_prod.db`

## Performance Considerations

### Database Optimization
- Indexed foreign keys for join performance
- Prepared statements for query efficiency
- Transaction batching for bulk operations

### Caching Strategy
- Static project data suitable for caching
- Real-time donation updates require fresh data
- Session data cached in memory and database

## Monitoring & Logging

### Transaction Logging
- All M-Pesa transactions logged with details
- Payment success/failure tracking
- Callback processing logs

### Error Logging
- Database operation errors
- API integration failures
- Authentication attempts

## Development vs Production

### Demo Mode Features
- Mock M-Pesa integration for development
- Auto-completion of payments after 3 seconds
- Sample data generation

### Production Considerations
- Real M-Pesa API integration
- Proper SSL/TLS for callbacks
- Database backup strategies
- Session security hardening

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

### Donation Response
```json
{
  "donation_id": 123,
  "mpesa_response": { ... },
  "message": "Payment initiated successfully"
}
```

This backend architecture provides a robust foundation for the anonymous donations platform with secure payment processing, comprehensive admin features, and scalable data management.
