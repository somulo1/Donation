# Backend Documentation - Anonymous Donations Platform

This directory contains comprehensive documentation for the backend architecture and implementation of the Anonymous Donations Platform.

## Documentation Structure

### 📚 Core Documentation

1. **[Backend Documentation](./BACKEND_DOCUMENTATION.md)**
   - Complete backend architecture overview
   - Technology stack and design decisions
   - Database schema and relationships
   - Core libraries and utilities
   - Authentication and security implementation
   - Performance considerations

2. **[API Reference](./API_REFERENCE.md)**
   - Complete API endpoint documentation
   - Request/response formats
   - Authentication requirements
   - Error codes and handling
   - Testing endpoints and demo mode
   - Phone number formats and validation

3. **[Database Schema](./DATABASE_SCHEMA.md)**
   - Detailed table structures
   - Relationships and constraints
   - Indexes and performance optimization
   - Sample data and initialization
   - Backup and maintenance procedures
   - Security considerations

4. **[Security and Deployment](./SECURITY_AND_DEPLOYMENT.md)**
   - Security implementation details
   - Authentication and authorization
   - Data protection and privacy
   - Payment security (M-Pesa integration)
   - Deployment best practices
   - Monitoring and incident response

## Quick Reference

### Key Backend Components

- **Framework**: SvelteKit (Full-stack)
- **Database**: SQLite3 with better-sqlite3
- **Authentication**: bcrypt + session-based
- **Payments**: M-Pesa STK Push API
- **Security**: Input validation, prepared statements, data anonymization

### Main API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/projects` | GET | List all projects |
| `/api/projects/{id}` | GET | Get project details |
| `/api/donations` | POST | Create donation & initiate payment |
| `/api/donations/status` | GET | Check payment status |
| `/api/stats` | GET | Platform statistics |
| `/api/admin/login` | POST | Admin authentication |
| `/api/admin/settings` | GET/PUT | Site settings management |

### Database Tables

- **projects**: Project information and fundraising goals
- **donations**: Individual donations and payment status
- **admin_users**: Admin authentication credentials
- **site_settings**: Configurable platform settings
- **admin_sessions**: Session management for admin users

### Security Features

- **Password Security**: bcrypt hashing with 12 salt rounds
- **Data Privacy**: Donor information anonymization
- **Payment Security**: M-Pesa OAuth integration
- **Input Validation**: Comprehensive validation on all endpoints
- **SQL Injection Prevention**: Prepared statements throughout

## Getting Started

### For Developers

1. Read the [Backend Documentation](./BACKEND_DOCUMENTATION.md) for architecture overview
2. Review [API Reference](./API_REFERENCE.md) for endpoint details
3. Study [Database Schema](./DATABASE_SCHEMA.md) for data structure
4. Check [Security Guide](./SECURITY_AND_DEPLOYMENT.md) for security requirements

### For System Administrators

1. Review [Security and Deployment](./SECURITY_AND_DEPLOYMENT.md) guide
2. Set up environment variables as documented
3. Configure HTTPS and security headers
4. Implement monitoring and backup procedures

### For API Consumers

1. Start with [API Reference](./API_REFERENCE.md)
2. Test with provided sample data
3. Understand authentication requirements
4. Review error handling and status codes

## Environment Setup

### Required Environment Variables

```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
```

### Default Admin Login Credentials

- **Username**: `admin`
- **Password**: `somulo@admin`

## Development vs Production

### Demo Mode (Development)
- Mock M-Pesa integration
- Auto-completion of payments after 3 seconds
- Sample data generation
- Local SQLite database

### Production Mode
- Real M-Pesa API integration
- Proper SSL/TLS configuration
- Production database with backups
- Enhanced security measures

## Support and Maintenance

### Regular Tasks
- Database backups
- Security updates
- Session cleanup
- Log monitoring
- Performance optimization

### Troubleshooting
- Check application logs
- Verify M-Pesa configuration
- Validate database integrity
- Review security alerts

## Contributing

When contributing to the backend:

1. Follow security best practices
2. Update documentation for any changes
3. Test all API endpoints
4. Validate database migrations
5. Review security implications

## Version History

- **v1.0**: Initial implementation with core features
- **v1.1**: Enhanced security and documentation
- **v1.2**: Improved error handling and validation

## Contact

For technical questions or security concerns, please contact the development team or refer to the specific documentation sections above.

---

**Note**: This documentation is maintained alongside the codebase. Please keep it updated when making changes to the backend implementation.
