# Database Schema Documentation

## Overview

The Anonymous Donations Platform uses SQLite3 as its database engine with better-sqlite3 driver for Node.js. The database is designed to handle projects, donations, admin users, and site settings with proper relationships and constraints.

## Database Configuration

- **Engine**: SQLite3
- **Driver**: better-sqlite3
- **Files**: 
  - Development: `donations.db`
  - Production: `donations_prod.db`
- **Features**: Foreign keys enabled, automatic timestamps, triggers

## Tables

### 1. Projects Table

Stores information about donation projects.

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

**Field Descriptions:**
- `id`: Unique project identifier
- `title`: Project name/title
- `description`: Detailed project description
- `target_amount`: Fundraising goal in KES
- `current_amount`: Amount raised so far (calculated from donations)
- `image_url`: Project image URL
- `category`: Project category (education, health, environment, community)
- `status`: Project status (active, completed, paused)
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp

**Constraints:**
- `title` and `description` cannot be null
- `target_amount` must be positive
- `status` must be one of: active, completed, paused
- `category` should be one of: education, health, environment, community

**Indexes:**
- Primary key on `id`
- Recommended index on `status` for filtering
- Recommended index on `category` for filtering

### 2. Donations Table

Stores individual donation records and payment information.

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

**Field Descriptions:**
- `id`: Unique donation identifier
- `project_id`: Reference to projects table
- `amount`: Donation amount in KES
- `donor_name`: Optional donor name (can be anonymous)
- `donor_email`: Optional donor email
- `phone_number`: M-Pesa phone number
- `mpesa_transaction_id`: M-Pesa transaction/checkout ID
- `status`: Payment status (pending, completed, failed)
- `created_at`: Donation timestamp

**Constraints:**
- `project_id` must reference existing project
- `amount` must be positive
- `mpesa_transaction_id` must be unique
- `status` must be one of: pending, completed, failed
- Foreign key cascade delete when project is deleted

**Indexes:**
- Primary key on `id`
- Foreign key index on `project_id`
- Unique index on `mpesa_transaction_id`
- Recommended index on `status` for filtering

### 3. Admin Users Table

Stores admin user credentials and information.

```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Field Descriptions:**
- `id`: Unique admin user identifier
- `username`: Admin login username
- `password_hash`: bcrypt hashed password
- `email`: Admin email address
- `created_at`: Account creation timestamp

**Constraints:**
- `username` must be unique
- `email` must be unique
- `password_hash` stores bcrypt hash (not plain text)

**Security Notes:**
- Passwords are hashed using bcrypt with 12 salt rounds
- Plain text passwords are never stored
- Default admin: username=admin, password=somulo@admin

### 4. Site Settings Table

Stores configurable platform settings.

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

**Field Descriptions:**
- `id`: Unique setting identifier
- `setting_key`: Setting name/key
- `setting_value`: Setting value (stored as text)
- `setting_type`: Data type (string, boolean, number)
- `description`: Setting description
- `updated_at`: Last modification timestamp

**Setting Types:**
- `string`: Text values
- `boolean`: true/false values
- `number`: Numeric values

**Default Settings:**
```sql
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
('platform_name', 'DonateAnon', 'string'),
('platform_description', 'Anonymous donation platform for social projects', 'string'),
('contact_email', 'admin@donateanon.com', 'string'),
('mpesa_business_code', '174379', 'string'),
('mpesa_environment', 'sandbox', 'string'),
('enable_notifications', 'true', 'boolean'),
('auto_approve_projects', 'false', 'boolean'),
('minimum_donation', '10', 'number'),
('maximum_donation', '1000000', 'number'),
('featured_projects_limit', '3', 'number');
```

### 5. Admin Sessions Table

Stores admin session tokens (created dynamically).

```sql
CREATE TABLE admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);
```

**Field Descriptions:**
- `id`: Unique session identifier
- `admin_id`: Reference to admin_users table
- `session_token`: Unique session token
- `created_at`: Session creation timestamp
- `expires_at`: Session expiry timestamp

**Session Management:**
- Sessions expire after 24 hours
- Expired sessions are automatically cleaned up
- Tokens are generated using random strings

## Triggers

### Update Timestamp Trigger

Automatically updates the `updated_at` field when projects are modified.

```sql
CREATE TRIGGER update_projects_timestamp 
AFTER UPDATE ON projects
BEGIN
  UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

## Relationships

### Entity Relationship Diagram

```
projects (1) ----< (many) donations
    |
    id ← project_id

admin_users (1) ----< (many) admin_sessions
    |
    id ← admin_id
```

### Foreign Key Relationships

1. **donations.project_id → projects.id**
   - One project can have many donations
   - Cascade delete: deleting project removes all donations
   - Ensures referential integrity

2. **admin_sessions.admin_id → admin_users.id**
   - One admin can have multiple active sessions
   - Sessions are cleaned up when expired

## Data Types

### SQLite Data Types Used

- `INTEGER`: Whole numbers, auto-increment IDs
- `REAL`: Floating-point numbers for amounts
- `TEXT`: String data for names, descriptions, URLs
- `DATETIME`: Timestamp data (stored as TEXT in ISO format)

### Application Data Types

- **Amounts**: Stored as REAL, handled as numbers in KES
- **Timestamps**: ISO 8601 format strings
- **Status**: Enumerated strings with CHECK constraints
- **Booleans**: Stored as 'true'/'false' strings in settings

## Indexes and Performance

### Recommended Indexes

```sql
-- Performance indexes for common queries
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_donations_project_id ON donations(project_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(created_at);
```

### Query Optimization

1. **Project Listing**: Index on status and category
2. **Donation Aggregation**: Index on project_id and status
3. **Recent Donations**: Index on created_at
4. **Statistics**: Composite indexes for complex queries

## Sample Data

### Projects Sample Data

```sql
INSERT INTO projects (title, description, target_amount, image_url, category) VALUES
('Clean Water Initiative', 'Providing clean water access to rural communities', 500000, 'https://images.unsplash.com/photo-1541919329513-35f7af297129', 'community'),
('Education for All', 'Building schools and providing educational resources', 750000, 'https://images.unsplash.com/photo-1497486751825-1233686d5d80', 'education'),
('Healthcare Access', 'Mobile clinics for remote areas', 300000, 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56', 'health'),
('Environmental Conservation', 'Tree planting and conservation efforts', 200000, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', 'environment');
```

## Backup and Maintenance

### Backup Strategy

1. **Development**: Regular file backups of `donations.db`
2. **Production**: Automated backups of `donations_prod.db`
3. **Export**: SQLite dump commands for data export

### Maintenance Tasks

1. **Session Cleanup**: Automatic removal of expired sessions
2. **Data Archival**: Archive old completed donations
3. **Index Maintenance**: Rebuild indexes periodically
4. **Integrity Checks**: Regular PRAGMA integrity_check

### Database Commands

```bash
# Backup database
sqlite3 donations.db ".backup backup.db"

# Export schema
sqlite3 donations.db ".schema" > schema.sql

# Export data
sqlite3 donations.db ".dump" > data.sql

# Integrity check
sqlite3 donations.db "PRAGMA integrity_check;"
```

## Security Considerations

### Data Protection

1. **Password Security**: bcrypt hashing with salt rounds
2. **Session Security**: Unique tokens with expiry
3. **Data Anonymization**: Donor information protected in public APIs
4. **Input Validation**: SQL injection prevention through prepared statements

### Privacy Compliance

1. **Donor Anonymity**: Optional donor information
2. **Data Minimization**: Only necessary data collected
3. **Secure Storage**: Sensitive data properly protected
4. **Access Control**: Admin-only access to sensitive data

## Migration Strategy

### Schema Updates

1. **Version Control**: Track schema changes
2. **Migration Scripts**: SQL scripts for updates
3. **Backward Compatibility**: Ensure smooth upgrades
4. **Data Preservation**: Maintain data integrity during migrations

### Future Enhancements

1. **Audit Logs**: Track all data changes
2. **Soft Deletes**: Mark records as deleted instead of removing
3. **Data Archival**: Move old data to archive tables
4. **Performance Monitoring**: Query performance tracking
