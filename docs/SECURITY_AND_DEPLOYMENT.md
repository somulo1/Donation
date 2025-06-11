# Security and Deployment Guide

## Security Overview

The Anonymous Donations Platform implements multiple security layers to protect user data, financial transactions, and administrative access.

## Authentication Security

### Admin Authentication

**Implementation**: Session-based authentication with bcrypt password hashing

**Security Features:**
- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Management**: Unique tokens with 24-hour expiry
- **Automatic Cleanup**: Expired sessions removed automatically
- **Secure Storage**: Session tokens stored in database

**Current Implementation:**
```javascript
// Password hashing
const saltRounds = 12;
const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);

// Session token generation
const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

// Session expiry (24 hours)
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);
```

**Security Improvements Needed:**
1. **JWT Implementation**: Replace simple tokens with JWT
2. **CSRF Protection**: Add CSRF tokens for admin forms
3. **Rate Limiting**: Implement login attempt limiting
4. **Two-Factor Authentication**: Add 2FA for admin accounts

### Session Security

**Current State:**
- Sessions stored in database with expiry
- Automatic cleanup of expired sessions
- Client-side storage in localStorage

**Recommendations:**
- Use httpOnly cookies instead of localStorage
- Implement secure cookie flags (Secure, SameSite)
- Add session invalidation on logout
- Implement concurrent session limits

## Data Protection

### Donor Privacy

**Anonymization Strategy:**
```javascript
// Public API response anonymization
const anonymizedDonations = donations.map(donation => ({
  ...donation,
  donor_name: donation.donor_name || 'Anonymous',
  donor_email: null, // Never expose email
  phone_number: null, // Never expose phone
  mpesa_transaction_id: donation.status === 'completed' ? 'COMPLETED' : donation.status.toUpperCase()
}));
```

**Privacy Features:**
- Email addresses never exposed in public APIs
- Phone numbers anonymized in responses
- Optional donor names (defaults to "Anonymous")
- M-Pesa transaction IDs masked in public responses

### Database Security

**Current Implementation:**
- Foreign key constraints enabled
- Prepared statements prevent SQL injection
- Input validation on all endpoints
- Transaction rollback on errors

**Security Measures:**
```javascript
// Prepared statements example
const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
const project = stmt.get(projectId);

// Input validation
if (!project_id || !amount || !phone_number) {
  return json({ error: 'Missing required fields' }, { status: 400 });
}
```

## Payment Security

### M-Pesa Integration Security

**Authentication:**
- OAuth 2.0 for M-Pesa API access
- Consumer key and secret stored in environment variables
- Access tokens with automatic refresh

**Transaction Security:**
- Unique transaction IDs for each payment
- Callback URL validation
- Payment status verification
- Timeout handling for incomplete payments

**Security Configuration:**
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

### Payment Validation

**Amount Validation:**
- Minimum: 1 KES
- Maximum: 1,000,000 KES
- Numeric validation and sanitization

**Phone Number Validation:**
```javascript
export function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\s+/g, '');
  const kenyanFormats = [
    /^254[17]\d{8}$/, // 254712345678
    /^0[17]\d{8}$/,   // 0712345678
    /^[17]\d{8}$/     // 712345678
  ];
  return kenyanFormats.some(format => format.test(cleanPhone));
}
```

## Input Validation

### API Validation

**Request Validation:**
- Required field validation
- Data type validation
- Range validation for amounts
- Format validation for phone numbers
- SQL injection prevention

**Example Validation:**
```javascript
// Donation validation
if (!project_id || !amount || !phone_number) {
  return json({ error: 'Missing required fields' }, { status: 400 });
}

if (amount <= 0 || amount > 1000000) {
  return json({ error: 'Amount must be between 1 and 1,000,000 KES' }, { status: 400 });
}

if (!validatePhoneNumber(phone_number)) {
  return json({ error: 'Invalid phone number format' }, { status: 400 });
}
```

### XSS Prevention

**Current Measures:**
- Input sanitization on server side
- Content-Type headers properly set
- No direct HTML rendering of user input

**Recommendations:**
- Implement Content Security Policy (CSP)
- Add input sanitization library
- Validate and escape all user inputs

## Environment Security

### Environment Variables

**Required Variables:**
```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_BASE_URL=https://sandbox.safaricom.co.ke

# Database (optional)
DATABASE_URL=path/to/database.db

# Security (recommended)
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
```

**Security Best Practices:**
- Never commit .env files to version control
- Use different credentials for development/production
- Rotate secrets regularly
- Use secure random generation for secrets

## Deployment Security

### HTTPS Configuration

**Requirements:**
- SSL/TLS certificate for production
- HTTPS redirect for all traffic
- Secure cookie flags
- HSTS headers

**Nginx Configuration Example:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Database Security

**File Permissions:**
```bash
# Set secure permissions for database files
chmod 600 donations_prod.db
chown app:app donations_prod.db
```

**Backup Security:**
- Encrypted database backups
- Secure backup storage
- Regular backup testing
- Access control for backup files

### Server Security

**System Hardening:**
- Regular security updates
- Firewall configuration
- SSH key authentication
- Disable unnecessary services
- Log monitoring and alerting

**Process Management:**
```bash
# Run application as non-root user
useradd -r -s /bin/false donations-app
sudo -u donations-app npm start
```

## Monitoring and Logging

### Security Logging

**Current Logging:**
- M-Pesa transaction logs
- Payment success/failure tracking
- Database operation errors
- Authentication attempts

**Enhanced Logging Recommendations:**
```javascript
// Security event logging
const securityLog = {
  timestamp: new Date().toISOString(),
  event: 'login_attempt',
  username: username,
  ip: request.ip,
  success: false,
  reason: 'invalid_password'
};
```

### Monitoring Alerts

**Recommended Alerts:**
- Failed login attempts (rate limiting trigger)
- Database connection failures
- Payment processing errors
- Unusual donation patterns
- Server resource usage

## Compliance and Privacy

### Data Protection

**GDPR Considerations:**
- Right to be forgotten (donation anonymization)
- Data minimization (optional donor information)
- Consent management (clear privacy policy)
- Data portability (export functionality)

**Implementation:**
- Anonymous donations by default
- Optional personal information
- Clear data retention policies
- Secure data deletion procedures

### Financial Compliance

**M-Pesa Compliance:**
- PCI DSS considerations for payment data
- Transaction logging and audit trails
- Fraud detection and prevention
- Regulatory reporting capabilities

## Security Checklist

### Pre-Deployment Security Audit

- [ ] Password hashing implemented (bcrypt)
- [ ] Session management secure
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS prevention measures
- [ ] HTTPS configuration
- [ ] Environment variables secured
- [ ] Database permissions set
- [ ] Backup encryption enabled
- [ ] Monitoring and logging configured

### Production Security Hardening

- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Configure Content Security Policy
- [ ] Set up Web Application Firewall
- [ ] Enable security headers
- [ ] Implement JWT authentication
- [ ] Add two-factor authentication
- [ ] Set up intrusion detection
- [ ] Configure log aggregation
- [ ] Implement automated security scanning

### Ongoing Security Maintenance

- [ ] Regular security updates
- [ ] Dependency vulnerability scanning
- [ ] Penetration testing
- [ ] Security audit reviews
- [ ] Incident response procedures
- [ ] Backup and recovery testing
- [ ] Access control reviews
- [ ] Security training for team

## Incident Response

### Security Incident Procedures

1. **Detection**: Monitor logs and alerts
2. **Assessment**: Evaluate severity and impact
3. **Containment**: Isolate affected systems
4. **Investigation**: Analyze attack vectors
5. **Recovery**: Restore normal operations
6. **Documentation**: Record lessons learned

### Emergency Contacts

- System Administrator
- Database Administrator
- M-Pesa Technical Support
- Legal/Compliance Team
- External Security Consultant

## Security Updates

### Regular Maintenance

- **Weekly**: Dependency updates
- **Monthly**: Security patch reviews
- **Quarterly**: Security audit
- **Annually**: Penetration testing

### Version Control Security

- Signed commits for critical changes
- Branch protection rules
- Code review requirements
- Automated security scanning in CI/CD

This security framework provides a foundation for protecting the donations platform while maintaining usability and compliance with financial regulations.
