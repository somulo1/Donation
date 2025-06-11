# API Reference - Anonymous Donations Platform

## Base URL
- Development: `http://localhost:5173`
- Production: `https://yourdomain.com`

## Authentication

### Admin Login
**POST** `/api/admin/login`

Authenticate admin user and receive session token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "somulo@admin"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@donateanon.com"
  },
  "sessionToken": "abc123xyz789"
}
```

**Response (Error):**
```json
{
  "error": "Invalid username or password"
}
```

## Projects API

### List Projects
**GET** `/api/projects`

Retrieve all projects with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category (education, health, environment, community)
- `status` (optional): Filter by status (active, completed, paused)
- `limit` (optional): Limit number of results

**Response:**
```json
[
  {
    "id": 1,
    "title": "Clean Water Initiative",
    "description": "Providing clean water access to rural communities",
    "target_amount": 500000,
    "current_amount": 125000,
    "image_url": "https://example.com/image.jpg",
    "category": "community",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "donation_count": 25,
    "progress_percentage": 25
  }
]
```

### Get Project Details
**GET** `/api/projects/{id}`

Retrieve specific project with donation statistics.

**Path Parameters:**
- `id`: Project ID (integer)

**Response:**
```json
{
  "id": 1,
  "title": "Clean Water Initiative",
  "description": "Providing clean water access to rural communities",
  "target_amount": 500000,
  "current_amount": 125000,
  "image_url": "https://example.com/image.jpg",
  "category": "community",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "donation_count": 25
}
```

### Create Project (Admin Only)
**POST** `/api/projects`

Create a new project.

**Request Body:**
```json
{
  "title": "New Project Title",
  "description": "Detailed project description",
  "target_amount": 100000,
  "image_url": "https://example.com/image.jpg",
  "category": "education"
}
```

**Response:**
```json
{
  "id": 5,
  "message": "Project created successfully"
}
```

## Donations API

### List Donations
**GET** `/api/donations`

Retrieve donations with anonymized donor information.

**Query Parameters:**
- `project_id` (optional): Filter by project ID
- `limit` (optional): Limit number of results

**Response:**
```json
[
  {
    "id": 1,
    "project_id": 1,
    "amount": 5000,
    "donor_name": "Anonymous",
    "donor_email": null,
    "phone_number": null,
    "mpesa_transaction_id": "COMPLETED",
    "status": "completed",
    "created_at": "2024-01-15T14:30:00Z",
    "project_title": "Clean Water Initiative"
  }
]
```

### Create Donation
**POST** `/api/donations`

Create a new donation and initiate M-Pesa payment.

**Request Body:**
```json
{
  "project_id": 1,
  "amount": 1000,
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "phone_number": "254712345678"
}
```

**Validation Rules:**
- `project_id`: Required, must exist and be active
- `amount`: Required, between 1 and 1,000,000 KES
- `phone_number`: Required, valid Kenyan format
- `donor_name`: Optional
- `donor_email`: Optional

**Response (Success):**
```json
{
  "donation_id": 123,
  "mpesa_response": {
    "MerchantRequestID": "mock_merchant_1642248000000",
    "CheckoutRequestID": "mock_checkout_1642248000000",
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing",
    "CustomerMessage": "Success. Request accepted for processing"
  },
  "message": "Payment initiated successfully. Please complete the payment on your phone."
}
```

**Response (Error):**
```json
{
  "error": "Invalid phone number format. Use format: 254XXXXXXXXX or 07XXXXXXXX"
}
```

### Check Donation Status
**GET** `/api/donations/status`

Check the status of a donation payment.

**Query Parameters:**
- `donation_id`: Required, donation ID
- `checkout_request_id`: Optional, M-Pesa checkout request ID

**Response:**
```json
{
  "success": true,
  "donation": {
    "id": 123,
    "amount": 1000,
    "status": "completed",
    "created_at": "2024-01-15T14:30:00Z",
    "project_title": "Clean Water Initiative",
    "project_id": 1
  },
  "payment_details": {
    "mpesa_transaction_id": "QHX123ABC",
    "status": "completed"
  }
}
```

### Update Donation Status (Testing)
**POST** `/api/donations/status`

Manually update donation status for testing purposes.

**Request Body:**
```json
{
  "donation_id": 123,
  "status": "completed",
  "transaction_id": "QHX123ABC"
}
```

**Valid Status Values:**
- `pending`: Payment initiated but not completed
- `processing`: Payment being processed
- `completed`: Payment successful
- `failed`: Payment failed or cancelled

## Statistics API

### Get Platform Statistics
**GET** `/api/stats`

Retrieve comprehensive platform analytics.

**Response:**
```json
{
  "total_projects": 10,
  "active_projects": 8,
  "total_donations": 150,
  "total_amount_raised": 750000,
  "recent_donations": [
    {
      "amount": 5000,
      "donor_name": "Anonymous",
      "created_at": "2024-01-15T14:30:00Z",
      "project_title": "Clean Water Initiative"
    }
  ],
  "donations_by_category": [
    {
      "category": "education",
      "donation_count": 45,
      "total_amount": 225000
    }
  ],
  "monthly_trends": [
    {
      "month": "2024-01",
      "donation_count": 25,
      "total_amount": 125000
    }
  ]
}
```

## Admin Settings API

### Get Settings
**GET** `/api/admin/settings`

Retrieve all site settings.

**Response:**
```json
{
  "success": true,
  "settings": {
    "platform_name": "DonateAnon",
    "platform_description": "Anonymous donation platform for social projects",
    "contact_email": "admin@donateanon.com",
    "mpesa_business_code": "174379",
    "mpesa_environment": "sandbox",
    "enable_notifications": true,
    "auto_approve_projects": false,
    "minimum_donation": 10,
    "maximum_donation": 1000000,
    "featured_projects_limit": 3
  }
}
```

### Update Settings
**PUT** `/api/admin/settings`

Update site settings.

**Request Body:**
```json
{
  "settings": {
    "platform_name": "New Platform Name",
    "minimum_donation": 50,
    "enable_notifications": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

### Reset Settings
**POST** `/api/admin/settings`

Reset all settings to default values.

**Response:**
```json
{
  "success": true,
  "message": "Settings reset to defaults successfully"
}
```

## M-Pesa Integration

### Callback Endpoint
**POST** `/api/mpesa/callback`

Handles M-Pesa payment callbacks (internal use).

**Request Body (M-Pesa Format):**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_191220191020363925",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 1000
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "QHX123ABC"
          }
        ]
      }
    }
  }
}
```

### Timeout Callback
**PUT** `/api/mpesa/callback`

Handles M-Pesa timeout callbacks (internal use).

## Utility Endpoints

### Initialize Database
**POST** `/api/init`

Initialize database schema and sample data.

**Response:**
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

## Error Codes

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

### Common Error Responses

**Validation Error:**
```json
{
  "error": "Missing required fields: project_id, amount, phone_number"
}
```

**Not Found Error:**
```json
{
  "error": "Project not found or not active"
}
```

**Server Error:**
```json
{
  "error": "Failed to process donation"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing:
- API rate limiting per IP
- M-Pesa callback validation
- Admin session timeout

## Phone Number Formats

Supported formats for M-Pesa payments:
- `254712345678` (International format)
- `0712345678` (Local format with leading zero)
- `712345678` (Local format without leading zero)

Invalid formats will return validation errors.

## Testing

### Demo Mode
In development, the platform uses mock M-Pesa integration:
- Payments auto-complete after 3 seconds
- No real money transactions
- All M-Pesa responses are simulated

### Admin Credentials
- Username: `admin`
- Password: `somulo@admin`

### Sample Data
The database initializes with sample projects in various categories for testing purposes.
