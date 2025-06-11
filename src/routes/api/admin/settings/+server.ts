import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import type { RequestHandler } from './$types';

// GET - Fetch all settings
export const GET: RequestHandler = async () => {
  try {
    const settings = db.prepare(`
      SELECT setting_key, setting_value, setting_type, description 
      FROM site_settings 
      ORDER BY setting_key
    `).all() as any[];

    // Convert to object format for easier frontend consumption
    const settingsObject: Record<string, any> = {};
    
    for (const setting of settings) {
      let value = setting.setting_value;
      
      // Convert values based on type
      switch (setting.setting_type) {
        case 'boolean':
          value = value === 'true';
          break;
        case 'number':
          value = parseFloat(value);
          break;
        case 'string':
        default:
          // Keep as string
          break;
      }
      
      settingsObject[setting.setting_key] = value;
    }

    return json({
      success: true,
      settings: settingsObject
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return json({ 
      success: false, 
      error: 'Failed to fetch settings' 
    }, { status: 500 });
  }
};

// PUT - Update settings
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const { settings } = await request.json();

    if (!settings || typeof settings !== 'object') {
      return json({ 
        success: false, 
        error: 'Invalid settings data' 
      }, { status: 400 });
    }

    // Prepare update statement
    const updateSetting = db.prepare(`
      UPDATE site_settings 
      SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE setting_key = ?
    `);

    // Begin transaction for atomic updates
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        // Convert value to string for storage
        let stringValue: string;
        
        if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else if (typeof value === 'number') {
          stringValue = value.toString();
        } else {
          stringValue = String(value);
        }

        updateSetting.run(stringValue, key);
      }
    });

    transaction();

    return json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return json({ 
      success: false, 
      error: 'Failed to update settings' 
    }, { status: 500 });
  }
};

// POST - Reset settings to defaults
export const POST: RequestHandler = async () => {
  try {
    // Delete all existing settings
    db.prepare('DELETE FROM site_settings').run();

    // Reinitialize default settings
    const defaultSettings = [
      { key: 'platform_name', value: 'DonateAnon', type: 'string' },
      { key: 'platform_description', value: 'Anonymous donation platform for social projects', type: 'string' },
      { key: 'contact_email', value: 'admin@donateanon.com', type: 'string' },
      { key: 'mpesa_business_code', value: '174379', type: 'string' },
      { key: 'mpesa_environment', value: 'sandbox', type: 'string' },
      { key: 'enable_notifications', value: 'true', type: 'boolean' },
      { key: 'auto_approve_projects', value: 'false', type: 'boolean' },
      { key: 'minimum_donation', value: '10', type: 'number' },
      { key: 'maximum_donation', value: '1000000', type: 'number' },
      { key: 'featured_projects_limit', value: '3', type: 'number' }
    ];

    const insertSetting = db.prepare(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type)
      VALUES (?, ?, ?)
    `);

    for (const setting of defaultSettings) {
      insertSetting.run(setting.key, setting.value, setting.type);
    }

    return json({
      success: true,
      message: 'Settings reset to defaults successfully'
    });

  } catch (error) {
    console.error('Error resetting settings:', error);
    return json({ 
      success: false, 
      error: 'Failed to reset settings' 
    }, { status: 500 });
  }
};
