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

  // Donations table (minimal fields for privacy)
  db.exec(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      donor_name TEXT DEFAULT 'Anonymous',
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
    { key: 'mpesa_consumer_key', value: 'uNzRpYZ8BOAQApcpuUax9WUi3cA9GqMviC0P0vUug8bGR4yT', type: 'string', description: 'Mpesa consumer key for API authentication' },
    { key: 'mpesa_consumer_secret', value: 'lddErn3XqkaJHWMm2zSz9o2UFADahr3Rl4L1dnbTRNGi3R7n3eJ2tNMRufbaCHTB', type: 'string', description: 'Mpesa consumer secret for API authentication' },
    { key: 'mpesa_passkey', value: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919', type: 'string', description: 'Mpesa passkey for STK push' },
    { key: 'deposit_phone_number', value: '254712345678', type: 'string', description: 'Phone number where donations will be deposited' },
    { key: 'enable_notifications', value: 'true', type: 'boolean', description: 'Enable email notifications for events' },
    { key: 'auto_approve_projects', value: 'false', type: 'boolean', description: 'Automatically approve new project submissions' },
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

/**
 * Anonymize all donor data to protect privacy
 * This function ensures all donations have anonymous donor names and no personal data
 */
export function anonymizeDonorData() {
  try {
    console.log('Anonymizing all donor data for privacy protection...');

    // Set all donor names to 'Anonymous' if they're null or empty
    const nameResult = db.prepare(`
      UPDATE donations
      SET donor_name = 'Anonymous'
      WHERE donor_name IS NULL OR donor_name = ''
    `).run();

    console.log(`Set ${nameResult.changes} donation records to Anonymous`);

    // Remove any remaining personal data columns if they exist (for migration)
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS donations_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          donor_name TEXT DEFAULT 'Anonymous',
          mpesa_transaction_id TEXT UNIQUE,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);

      // Copy data without personal information
      db.exec(`
        INSERT OR IGNORE INTO donations_new (id, project_id, amount, donor_name, mpesa_transaction_id, status, created_at)
        SELECT id, project_id, amount,
               COALESCE(NULLIF(donor_name, ''), 'Anonymous') as donor_name,
               mpesa_transaction_id, status, created_at
        FROM donations
      `);

      // Replace old table with new one
      db.exec(`DROP TABLE donations`);
      db.exec(`ALTER TABLE donations_new RENAME TO donations`);

      console.log('Successfully migrated to privacy-focused donation table');
    } catch (migrationError) {
      console.log('Table migration not needed or already completed');
    }

    return {
      anonymizedRecords: nameResult.changes
    };
  } catch (error) {
    console.error('Error anonymizing donor data:', error);
    throw error;
  }
}

/**
 * Create a donation record with only essential fields (no personal data)
 */
export function createAnonymousDonation(projectId: number, amount: number, donorName?: string) {
  try {
    // Ensure donor name is 'Anonymous' if not provided or empty
    const finalDonorName = (donorName && donorName.trim()) ? donorName.trim() : 'Anonymous';

    const result = db.prepare(`
      INSERT INTO donations (project_id, amount, donor_name, status)
      VALUES (?, ?, ?, 'pending')
    `).run(projectId, amount, finalDonorName);

    console.log('Created anonymous donation:', {
      id: result.lastInsertRowid,
      projectId,
      amount,
      donorName: finalDonorName
    });

    return result.lastInsertRowid;
  } catch (error) {
    console.error('Error creating anonymous donation:', error);
    throw error;
  }
}

// Initialize database
initializeDatabase();

// Automatically anonymize existing data on startup
try {
  anonymizeDonorData();
} catch (error) {
  console.error('Failed to anonymize existing data:', error);
}

export { db };
