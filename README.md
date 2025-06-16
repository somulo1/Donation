# DonateAnon - Anonymous Donation Platform

A modern, secure, and user-friendly web application built with SvelteKit that enables anonymous donations to social projects with Mpesa integration.

##  Features

### Public Features
- **Anonymous Donations**: Support social projects without revealing your identity
- **Project Discovery**: Browse and search verified social projects by category
- **Real-time Progress**: Track donation progress and project milestones
- **Secure Payments**: Integrated Mpesa STK Push for secure mobile payments
- **Responsive Design**: Optimized for all devices with dark/light theme support
- **No Registration Required**: Donate instantly without creating an account

### Admin Features
- **Project Management**: Create, edit, and manage social projects
- **Donation Tracking**: Monitor all donations with detailed analytics
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **Real-time Updates**: Live project progress and donation tracking

##  Technology Stack

- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Database**: SQLite3 with better-sqlite3
- **Payment**: Mpesa API integration
- **Icons**: Lucide Svelte
- **Styling**: Custom design system with dark/light themes

##  Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/somulo1/Donation.git
   cd Donations
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Mpesa Configuration
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_BUSINESS_SHORT_CODE=174379
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
   MPESA_BASE_URL=https://sandbox.safaricom.co.ke
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   * Navigate to `http://localhost:5173`

   * navigate to `http://localhost:5173/admin/login` to access admin dshboard and login with the credentials provided bellow:
   <i>
    Username: `admin`  , 
    Password: `somulo@admin`

   </i>

## Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   ├── Header.svelte
│   │   ├── Footer.svelte
│   │   ├── DonationForm.svelte
│   │   └── Toast.svelte
│   ├── database.ts          # SQLite database setup and queries
│   ├── mpesa.ts            # Mpesa API integration
│   ├── stores.ts           # Svelte stores for state management
│   └── types.ts            # TypeScript type definitions
├── routes/
│   ├── api/                # API endpoints
│   │   ├── projects/       # Project CRUD operations
│   │   ├── donations/      # Donation processing
│   │   └── stats/          # Analytics and statistics
│   ├── admin/              # Admin dashboard
│   ├── projects/           # Public project pages
│   ├── about/              # About page
│   ├── +layout.svelte      # Main layout
│   └── +page.svelte        # Homepage
├── app.html                # HTML template
└── app.css                 # Global styles and Tailwind
```

##  Design System

### Color Palette
- **Primary**: Orange tones (#f97316) - Warm and inviting
- **Secondary**: Purple tones (#d946ef) - Creative and trustworthy
- **Accent**: Orange variants for highlights
- **Dark**: Comprehensive dark theme support

### Typography
- **Display Font**: Poppins (headings)
- **Body Font**: Inter (content)

### Components
- Consistent button styles with hover effects
- Card-based layouts with subtle shadows
- Responsive grid systems
- Smooth animations and transitions

## 🔧 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/[id]` - Get project details
- `POST /api/projects` - Create new project (admin)
- `PUT /api/projects/[id]` - Update project (admin)
- `DELETE /api/projects/[id]` - Delete project (admin)

### Donations
- `GET /api/donations` - List donations (anonymized)
- `POST /api/donations` - Create new donation

### Statistics
- `GET /api/stats` - Platform statistics and analytics

## Mpesa Integration

The platform integrates with Safaricom's Mpesa API for secure mobile payments:

1. **STK Push**: Initiates payment request to user's phone
2. **Callback Handling**: Processes payment confirmations
3. **Transaction Tracking**: Links payments to donations
4. **Security**: Encrypted communication with Mpesa servers

### Demo Mode
For development and demonstration, the platform includes a mock Mpesa implementation that simulates successful payments without actual money transfer.

##  Security & Privacy

### Privacy Features
- **Anonymous Donations**: No personal data stored beyond payment processing
- **Optional Identity**: Users can choose to share their name or remain anonymous
- **Data Minimization**: Only essential data is collected and stored
- **Secure Storage**: Sensitive data is properly encrypted

### Security Measures
- **Input Validation**: All user inputs are validated and sanitized
- **SQL Injection Protection**: Prepared statements prevent SQL injection
- **HTTPS Enforcement**: All communications are encrypted
- **Rate Limiting**: API endpoints are protected against abuse

##  Database Schema

### Projects Table
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  image_url TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Donations Table
```sql
CREATE TABLE donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  phone_number TEXT,
  mpesa_transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

##  Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- Mpesa API credentials
- Database configuration
- Security keys

### Recommended Hosting
- **Vercel**: Seamless SvelteKit deployment
- **Netlify**: Static site hosting with serverless functions
- **VPS**: Full control with Node.js hosting

##  Testing

### Manual Testing Checklist
- [ ] Homepage loads with sample projects
- [ ] Project listing and filtering works
- [ ] Individual project pages display correctly
- [ ] Donation form validation works
- [ ] Mock Mpesa payment flow completes
- [ ] Admin dashboard displays statistics
- [ ] Dark/light theme toggle functions
- [ ] Mobile responsiveness verified

### API Testing
```bash
# Test project listing
curl http://localhost:5173/api/projects

# Test statistics
curl http://localhost:5173/api/stats
```

##  License

This project is created for interview purposes and demonstrates full-stack development capabilities with SvelteKit, TypeScript, and modern web technologies.

##  Contributing

This is an interview assignment project. For production use, consider:
- Adding comprehensive testing suite
- Implementing user authentication
- Adding email notifications
- Enhancing admin features
- Adding project approval workflow


