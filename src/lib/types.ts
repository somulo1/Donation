export interface Project {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  image_url?: string;
  category: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: number;
  project_id: number;
  amount: number;
  donor_name?: string;
  donor_email?: string;
  phone_number?: string;
  mpesa_transaction_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface DonationRequest {
  project_id: number;
  amount: number;
  donor_name?: string;
  donor_email?: string;
  phone_number: string;
}

export interface MpesaResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_donations: number;
  total_amount_raised: number;
  recent_donations: Donation[];
}

export interface ProjectWithDonations extends Project {
  donations: Donation[];
  donation_count: number;
}
