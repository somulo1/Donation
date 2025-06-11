import Database from 'better-sqlite3';
import { dev } from '$app/environment';
import bcrypt from 'bcryptjs';

// Database connection
const db = new Database(dev ? 'donations.db' : 'donations_prod.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
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
    )
  `);

  // Donations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS donations (
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
    )
  `);

  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Site settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      setting_type TEXT DEFAULT 'string',
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create triggers for updating timestamps
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_projects_timestamp 
    AFTER UPDATE ON projects
    BEGIN
      UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  // Insert sample data if tables are empty
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };

  if (projectCount.count === 0) {
    insertSampleData();
  }

  // Always recreate admin user with proper hashed password
  // recreateAdminUser();

  // Initialize default settings if settings table is empty
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };

  if (settingsCount.count === 0) {
    // initializeDefaultSettings();
  }
}

function insertSampleData() {
  const insertProject = db.prepare(`
    INSERT INTO projects (title, description, target_amount, image_url, category)
    VALUES (?, ?, ?, ?, ?)
  `);

  const sampleProjects = [
    {
      title: 'Clean Water Initiative',
      description: 'Providing clean water access to rural communities through well construction and water purification systems. This project aims to serve over 500 families.',
      target_amount: 50000,
      image_url: 'https://images.unsplash.com/photo-1541919329513-35f7af297129?w=800',
      category: 'Health & Environment'
    },
    {
      title: 'Education for All',
      description: 'Building classrooms and providing educational materials for underprivileged children. Supporting 200+ students with books, uniforms, and learning resources.',
      target_amount: 75000,
      image_url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800',
      category: 'Education'
    },
    {
      title: 'Community Food Bank',
      description: 'Establishing a sustainable food distribution center to combat hunger in urban areas. Serving 1000+ families monthly with nutritious meals.',
      target_amount: 30000,
      image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
      category: 'Food Security'
    },
    {
      title: 'Healthcare Mobile Clinic',
      description: 'Mobile healthcare services for remote areas lacking medical facilities. Providing basic healthcare, vaccinations, and health education.',
      target_amount: 100000,
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
      category: 'Healthcare'
    },
    {
      title: 'Youth Skills Training',
      description: 'Vocational training program for unemployed youth, teaching digital skills, entrepreneurship, and technical trades to create employment opportunities.',
      target_amount: 40000,
      image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      category: 'Skills Development'
    }
  ];

  for (const project of sampleProjects) {
    insertProject.run(project.title, project.description, project.target_amount, project.image_url, project.category);
  }

  // Add some sample donations
  const insertDonation = db.prepare(`
    INSERT INTO donations (project_id, amount, donor_name, status, mpesa_transaction_id)
    VALUES (?, ?, ?, 'completed', ?)
  `);

  // Random donations for demonstration
  for (let i = 1; i <= 5; i++) {
    const donations = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < donations; j++) {
      const amount = Math.floor(Math.random() * 5000) + 500;
      insertDonation.run(i, amount, 'Anonymous Donor', `TXN${Date.now()}${i}${j}`);
    }
  }

  // Update project current amounts
  db.exec(`
    UPDATE projects 
    SET current_amount = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM donations 
      WHERE donations.project_id = projects.id 
      AND donations.status = 'completed'
    )
  `);
}

function recreateAdminUser() {
  try {
    // Remove any existing admin users
    db.prepare('DELETE FROM admin_users').run();
    console.log('Existing admin users removed');

    // Create new admin with properly hashed password
    const plainPassword = 'somulo@admin';
    const saltRounds = 12;
    const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);

    const adminUser = {
      username: 'admin',
      password_hash: hashedPassword,
      email: 'admin@donateanon.com'
    };

    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (username, password_hash, email)
      VALUES (?, ?, ?)
    `);

    insertAdmin.run(adminUser.username, adminUser.password_hash, adminUser.email);

    console.log('✅ Admin user created successfully with hashed password');
    console.log('📧 Username: admin');
    console.log('🔑 Password: somulo@admin');
    console.log('🔒 Password is properly hashed in database');

  } catch (error) {
    console.error('❌ Error recreating admin user:', error);
  }
}

function initializeDefaultSettings() {
  const defaultSettings = [
    { key: 'platform_name', value: 'DonateAnon', type: 'string', description: 'Platform name displayed across the site' },
    { key: 'platform_description', value: 'Anonymous donation platform for social projects', type: 'string', description: 'Platform description for meta tags and about sections' },
    { key: 'contact_email', value: 'admin@donateanon.com', type: 'string', description: 'Contact email displayed on the site' },
    { key: 'mpesa_business_code', value: '174379', type: 'string', description: 'Mpesa business shortcode for payments' },
    { key: 'mpesa_environment', value: 'sandbox', type: 'string', description: 'Mpesa environment (sandbox/production)' },
    { key: 'enable_notifications', value: 'true', type: 'boolean', description: 'Enable email notifications for events' },
    { key: 'auto_approve_projects', value: 'false', type: 'boolean', description: 'Automatically approve new project submissions' },
    { key: 'minimum_donation', value: '10', type: 'number', description: 'Minimum donation amount in KES' },
    { key: 'maximum_donation', value: '1000000', type: 'number', description: 'Maximum donation amount in KES' },
    { key: 'featured_projects_limit', value: '3', type: 'number', description: 'Number of featured projects to display on homepage' }
  ];

  const insertSetting = db.prepare(`
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES (?, ?, ?, ?)
  `);

  try {
    for (const setting of defaultSettings) {
      insertSetting.run(setting.key, setting.value, setting.type, setting.description);
    }
    console.log('✅ Default site settings initialized');
  } catch (error) {
    console.error('❌ Error initializing default settings:', error);
  }
}

export { db };
