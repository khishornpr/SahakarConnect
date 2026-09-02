// SahakarConnect Mock Supabase Client & 4-6 Weeks Historical Database
// Problem Statement SIH26089 - Cooperative Digital Service Marketplace

import { DELHI_NCR_AREAS } from './geoService.js'

// Helper to generate past ISO timestamps
const daysAgo = (days, hour = 11, minute = 30) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const mockData = {
  password_reset_codes: [],
  cooperatives: [
    {
      id: 'coop1',
      name: 'Delhi Shramik Sahakari Federation Ltd.',
      registration_no: 'DEL/LAB-COOP/2021/894',
      district: 'South Delhi',
      state: 'Delhi',
      fee_percentage: 5.0,
      contact_phone: '+91 11 2689 4432',
      contact_email: 'contact@delhicoop.in',
      created_at: daysAgo(120),
    },
    {
      id: 'coop2',
      name: 'Indraprastha Karigar Cooperative Society',
      registration_no: 'DEL/LAB-COOP/2023/112',
      district: 'West Delhi',
      state: 'Delhi',
      fee_percentage: 5.0,
      contact_phone: '+91 11 2541 9081',
      contact_email: 'help@indraprasthacoop.org',
      created_at: daysAgo(90),
    },
  ],

  profiles: [
    {
      id: 'w1',
      email: 'ramesh.worker@sahakar.in',
      full_name: 'Ramesh Kumar',
      role: 'worker',
      phone: '+91 98112 34567',
      avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
      created_at: daysAgo(60),
    },
    {
      id: 'w2',
      email: 'sunita.worker@sahakar.in',
      full_name: 'Sunita Devi',
      role: 'worker',
      phone: '+91 98223 45678',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      created_at: daysAgo(50),
    },
    {
      id: 'w3',
      email: 'mohammad.worker@sahakar.in',
      full_name: 'Mohammad Irfan',
      role: 'worker',
      phone: '+91 98334 56789',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      created_at: daysAgo(45),
    },
    {
      id: 'w4',
      email: 'anil.worker@sahakar.in',
      full_name: 'Anil Verma',
      role: 'worker',
      phone: '+91 98445 67890',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      created_at: daysAgo(5),
    },
    {
      id: 'w5',
      email: 'pooja.worker@sahakar.in',
      full_name: 'Pooja Sharma',
      role: 'worker',
      phone: '+91 98556 78901',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      created_at: daysAgo(40),
    },
    {
      id: 'w6',
      email: 'rajesh.worker@sahakar.in',
      full_name: 'Rajesh Painter',
      role: 'worker',
      phone: '+91 98667 89012',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      created_at: daysAgo(35),
    },
    {
      id: 'h1',
      email: 'priya.customer@sahakar.in',
      full_name: 'Priya Sharma',
      role: 'household',
      phone: '+91 99110 11223',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: daysAgo(40),
    },
    {
      id: 'h2',
      email: 'vikram.customer@sahakar.in',
      full_name: 'Vikram Mehta',
      role: 'household',
      phone: '+91 99220 22334',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      created_at: daysAgo(30),
    },
    {
      id: 'admin1',
      email: 'admin@delhicoop.in',
      full_name: 'Shri K. L. Meena (Admin)',
      role: 'cooperative',
      phone: '+91 11 2689 4400',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      created_at: daysAgo(120),
    },
  ],

  workers: [
    {
      id: 'wk1',
      user_id: 'w1',
      cooperative_id: 'coop1',
      primary_trade: 'Electrician',
      skills: ['Wiring', 'Switchboard Repair', 'Inverter Installation', 'MCB Tripping'],
      experience_years: 7,
      hourly_rate: 350.0,
      is_verified: true,
      gov_id_type: 'Aadhaar',
      gov_id_masked: 'XXXX-XXXX-8921',
      kyc_document_url: 'aadhaar_ramesh_verified.pdf',
      area: 'South Extension, New Delhi',
      latitude: 28.5728,
      longitude: 77.2217,
      rating: 4.9,
      total_ratings: 18,
      completed_jobs_count: 22,
      is_available: true,
      created_at: daysAgo(60),
    },
    {
      id: 'wk2',
      user_id: 'w2',
      cooperative_id: 'coop1',
      primary_trade: 'Domestic Helper',
      skills: ['Elder Care', 'Cooking', 'Housekeeping', 'Patient Assistance'],
      experience_years: 9,
      hourly_rate: 300.0,
      is_verified: true,
      gov_id_type: 'Aadhaar',
      gov_id_masked: 'XXXX-XXXX-4512',
      kyc_document_url: 'aadhaar_sunita_verified.pdf',
      area: 'Lajpat Nagar, New Delhi',
      latitude: 28.5677,
      longitude: 77.2433,
      rating: 4.95,
      total_ratings: 24,
      completed_jobs_count: 29,
      is_available: true,
      created_at: daysAgo(50),
    },
    {
      id: 'wk3',
      user_id: 'w3',
      cooperative_id: 'coop1',
      primary_trade: 'Plumber',
      skills: ['Pipe Leakage', 'Tap Fitting', 'Geyser Installation', 'Motor Pump Repair'],
      experience_years: 6,
      hourly_rate: 350.0,
      is_verified: true,
      gov_id_type: 'Aadhaar',
      gov_id_masked: 'XXXX-XXXX-6789',
      kyc_document_url: 'aadhaar_irfan_verified.pdf',
      area: 'Saket, New Delhi',
      latitude: 28.5244,
      longitude: 77.2177,
      rating: 4.85,
      total_ratings: 15,
      completed_jobs_count: 19,
      is_available: true,
      created_at: daysAgo(45),
    },
    {
      id: 'wk4',
      user_id: 'w4',
      cooperative_id: 'coop2',
      primary_trade: 'Carpenter',
      skills: ['Furniture Assembly', 'Door Lock Repair', 'Cabinet Making', 'Wood Polish'],
      experience_years: 4,
      hourly_rate: 400.0,
      is_verified: false, // Verification Queue Demo Target
      gov_id_type: 'Voter ID',
      gov_id_masked: 'DL/04/129/XXXX',
      kyc_document_url: 'voter_id_anil_pending.pdf',
      area: 'Janakpuri, New Delhi',
      latitude: 28.6219,
      longitude: 77.0878,
      rating: 4.7,
      total_ratings: 2,
      completed_jobs_count: 3,
      is_available: true,
      created_at: daysAgo(5),
    },
    {
      id: 'wk5',
      user_id: 'w5',
      cooperative_id: 'coop1',
      primary_trade: 'Cleaner',
      skills: ['Deep Kitchen Cleaning', 'Bathroom Sanitation', 'Sofa Shampooing', 'Floor Scrubbing'],
      experience_years: 5,
      hourly_rate: 280.0,
      is_verified: true,
      gov_id_type: 'Aadhaar',
      gov_id_masked: 'XXXX-XXXX-9901',
      kyc_document_url: 'aadhaar_pooja_verified.pdf',
      area: 'Connaught Place, New Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      rating: 4.9,
      total_ratings: 12,
      completed_jobs_count: 14,
      is_available: true,
      created_at: daysAgo(40),
    },
    {
      id: 'wk6',
      user_id: 'w6',
      cooperative_id: 'coop2',
      primary_trade: 'Painter',
      skills: ['Wall Waterproofing', 'Emulsion Painting', 'Texture Paint', 'Wood Staining'],
      experience_years: 8,
      hourly_rate: 380.0,
      is_verified: true,
      gov_id_type: 'Aadhaar',
      gov_id_masked: 'XXXX-XXXX-3344',
      kyc_document_url: 'aadhaar_rajesh_verified.pdf',
      area: 'Dwarka Sector 10, New Delhi',
      latitude: 28.5921,
      longitude: 77.0460,
      rating: 4.8,
      total_ratings: 14,
      completed_jobs_count: 16,
      is_available: true,
      created_at: daysAgo(35),
    },
  ],

  households: [
    {
      id: 'hh1',
      user_id: 'h1',
      address: 'B-42, South Extension Part 2',
      area: 'South Extension, New Delhi',
      latitude: 28.5728,
      longitude: 77.2217,
      landmark: 'Near AIIMS Metro',
      rating: 5.0,
      created_at: daysAgo(40),
    },
    {
      id: 'hh2',
      user_id: 'h2',
      address: 'Flat 403, Palm Grove Apartments, Sector 10',
      area: 'Dwarka Sector 10, New Delhi',
      latitude: 28.5921,
      longitude: 77.0460,
      landmark: 'Opposite Sector 10 Metro',
      rating: 4.9,
      created_at: daysAgo(30),
    },
  ],

  // 4-6 Weeks Historical Jobs Dataset
  jobs: [
    // Current Active Jobs
    {
      id: 'job-active-1',
      household_id: 'h1',
      assigned_worker_id: 'w1',
      trade_category: 'Electrician',
      title: 'Main MCB Tripping & Inverter Line Check',
      description: 'The kitchen power outlet sparked and tripped the main circuit breaker. Need diagnosis and inverter reconnect.',
      area: 'South Extension, New Delhi',
      address: 'B-42, South Extension Part 2, New Delhi',
      latitude: 28.5728,
      longitude: 77.2217,
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time_slot: '02:00 PM - 04:00 PM',
      estimated_hours: 2.0,
      estimated_amount: 700.0,
      final_amount: 700.0,
      status: 'in_progress',
      otp_code: '5821',
      completion_notes: null,
      completed_at: null,
      created_at: daysAgo(0, 10, 15),
    },
    {
      id: 'job-req-2',
      household_id: 'h2',
      assigned_worker_id: null,
      trade_category: 'Plumber',
      title: 'Bathroom Overhead Tank Water Leakage',
      description: 'Continuous dripping from overhead PVC inlet pipe. Valve replacement needed.',
      area: 'Dwarka Sector 10, New Delhi',
      address: 'Flat 403, Palm Grove Apts, Sector 10',
      latitude: 28.5921,
      longitude: 77.0460,
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time_slot: '04:30 PM - 06:00 PM',
      estimated_hours: 1.5,
      estimated_amount: 550.0,
      final_amount: 550.0,
      status: 'requested',
      otp_code: '3190',
      completion_notes: null,
      completed_at: null,
      created_at: daysAgo(0, 11, 45),
    },

    // Past 4-6 Weeks Completed History
    {
      id: 'job-hist-1',
      household_id: 'h1',
      assigned_worker_id: 'w1',
      trade_category: 'Electrician',
      title: 'Ceiling Fan & Heavy Appliance Wiring',
      description: 'Installation of 2 heavy-duty ceiling fans and modular switches in master bedroom.',
      area: 'South Extension, New Delhi',
      address: 'B-42, South Extension Part 2',
      latitude: 28.5728,
      longitude: 77.2217,
      scheduled_date: daysAgo(3).split('T')[0],
      scheduled_time_slot: '11:00 AM - 01:00 PM',
      estimated_hours: 2.0,
      estimated_amount: 800.0,
      final_amount: 800.0,
      status: 'completed',
      otp_code: '4829',
      completion_notes: 'Wiring tested successfully. Voltage stabilized.',
      completed_at: daysAgo(3, 13, 0),
      created_at: daysAgo(4, 9, 30),
    },
    {
      id: 'job-hist-2',
      household_id: 'h2',
      assigned_worker_id: 'w3',
      trade_category: 'Plumber',
      title: 'Kitchen Sink Mixer Tap Replacement',
      description: 'Old brass tap rusted, replacement with Jaquar quarter-turn cock.',
      area: 'Dwarka Sector 10, New Delhi',
      address: 'Flat 403, Palm Grove Apts',
      latitude: 28.5921,
      longitude: 77.0460,
      scheduled_date: daysAgo(6).split('T')[0],
      scheduled_time_slot: '10:00 AM - 12:00 PM',
      estimated_hours: 1.5,
      estimated_amount: 600.0,
      final_amount: 600.0,
      status: 'completed',
      otp_code: '7741',
      completion_notes: 'Replaced washers and tap. No leakage detected.',
      completed_at: daysAgo(6, 11, 45),
      created_at: daysAgo(7, 14, 0),
    },
    {
      id: 'job-hist-3',
      household_id: 'h1',
      assigned_worker_id: 'w5',
      trade_category: 'Cleaner',
      title: 'Deep Kitchen & Chimney Degreasing',
      description: 'Comprehensive chemical scrubbing and chimney filter cleanup.',
      area: 'South Extension, New Delhi',
      address: 'B-42, South Extension Part 2',
      latitude: 28.5728,
      longitude: 77.2217,
      scheduled_date: daysAgo(10).split('T')[0],
      scheduled_time_slot: '09:00 AM - 01:00 PM',
      estimated_hours: 4.0,
      estimated_amount: 1200.0,
      final_amount: 1200.0,
      status: 'completed',
      otp_code: '1904',
      completion_notes: 'Kitchen cleaned thoroughly with eco-friendly solutions.',
      completed_at: daysAgo(10, 13, 15),
      created_at: daysAgo(11, 16, 20),
    },
    {
      id: 'job-hist-4',
      household_id: 'h2',
      assigned_worker_id: 'w6',
      trade_category: 'Painter',
      title: 'Balcony Weatherproof Touch-up',
      description: 'Scraping flaking paint and applying 2 coats of Asian Paints Apex.',
      area: 'Dwarka Sector 10, New Delhi',
      address: 'Flat 403, Palm Grove Apts',
      latitude: 28.5921,
      longitude: 77.0460,
      scheduled_date: daysAgo(14).split('T')[0],
      scheduled_time_slot: '10:00 AM - 04:00 PM',
      estimated_hours: 5.0,
      estimated_amount: 1800.0,
      final_amount: 1800.0,
      status: 'completed',
      otp_code: '9012',
      completion_notes: 'Two coats applied with waterproofing primer.',
      completed_at: daysAgo(14, 16, 0),
      created_at: daysAgo(15, 10, 0),
    },
    {
      id: 'job-hist-5',
      household_id: 'h1',
      assigned_worker_id: 'w2',
      trade_category: 'Domestic Helper',
      title: 'Post-Surgery Patient Assistance (3 Days)',
      description: 'Assisting elderly parent with mobility and dietary routine.',
      area: 'South Extension, New Delhi',
      address: 'B-42, South Extension Part 2',
      latitude: 28.5728,
      longitude: 77.2217,
      scheduled_date: daysAgo(18).split('T')[0],
      scheduled_time_slot: '08:00 AM - 04:00 PM',
      estimated_hours: 8.0,
      estimated_amount: 2400.0,
      final_amount: 2400.0,
      status: 'completed',
      otp_code: '6328',
      completion_notes: 'Patient care completed dutifully.',
      completed_at: daysAgo(18, 16, 30),
      created_at: daysAgo(19, 12, 0),
    },
    {
      id: 'job-hist-6',
      household_id: 'h2',
      assigned_worker_id: 'w1',
      trade_category: 'Electrician',
      title: 'LED Concealed Lighting & Chandelier Setup',
      description: 'Installed 8 COB lights in false ceiling and mounted decorative chandelier.',
      area: 'Dwarka Sector 10, New Delhi',
      address: 'Flat 403, Palm Grove Apts',
      latitude: 28.5921,
      longitude: 77.0460,
      scheduled_date: daysAgo(22).split('T')[0],
      scheduled_time_slot: '01:00 PM - 05:00 PM',
      estimated_hours: 4.0,
      estimated_amount: 1400.0,
      final_amount: 1400.0,
      status: 'completed',
      otp_code: '8219',
      completion_notes: 'Chandelier securely anchored into ceiling slab.',
      completed_at: daysAgo(22, 17, 10),
      created_at: daysAgo(23, 11, 0),
    },
    {
      id: 'job-hist-7',
      household_id: 'h1',
      assigned_worker_id: 'w3',
      trade_category: 'Plumber',
      title: 'RO Water Purifier Inlet & Waste Line Routing',
      description: 'Drilled countertop hole and installed diverter valve for RO purifier.',
      area: 'South Extension, New Delhi',
      address: 'B-42, South Extension Part 2',
      latitude: 28.5728,
      longitude: 77.2217,
      scheduled_date: daysAgo(26).split('T')[0],
      scheduled_time_slot: '03:00 PM - 05:00 PM',
      estimated_hours: 2.0,
      estimated_amount: 750.0,
      final_amount: 750.0,
      status: 'completed',
      otp_code: '4502',
      completion_notes: 'RO water flow and TDS checked with household.',
      completed_at: daysAgo(26, 17, 0),
      created_at: daysAgo(27, 9, 0),
    },
    {
      id: 'job-hist-8',
      household_id: 'h2',
      assigned_worker_id: 'w5',
      trade_category: 'Cleaner',
      title: 'Full 3BHK Post-Renovation Dust Cleanup',
      description: 'Cement stain removal and mechanized floor buffing.',
      area: 'Dwarka Sector 10, New Delhi',
      address: 'Flat 403, Palm Grove Apts',
      latitude: 28.5921,
      longitude: 77.0460,
      scheduled_date: daysAgo(30).split('T')[0],
      scheduled_time_slot: '09:00 AM - 05:00 PM',
      estimated_hours: 8.0,
      estimated_amount: 2800.0,
      final_amount: 2800.0,
      status: 'completed',
      otp_code: '3310',
      completion_notes: 'Full flat dust extraction and glass polishing finished.',
      completed_at: daysAgo(30, 17, 30),
      created_at: daysAgo(31, 15, 0),
    },
    {
      id: 'job-hist-9',
      household_id: 'h1',
      assigned_worker_id: 'w1',
      trade_category: 'Electrician',
      title: 'Geyser Power Plug & 25A Isolator Setup',
      description: 'Heavy duty wiring for bathroom 25L water heater.',
      area: 'South Extension, New Delhi',
      address: 'B-42, South Extension Part 2',
      latitude: 28.5728,
      longitude: 77.2217,
      scheduled_date: daysAgo(34).split('T')[0],
      scheduled_time_slot: '11:00 AM - 01:00 PM',
      estimated_hours: 2.0,
      estimated_amount: 650.0,
      final_amount: 650.0,
      status: 'completed',
      otp_code: '9081',
      completion_notes: 'Tested load with clamp meter.',
      completed_at: daysAgo(34, 13, 0),
      created_at: daysAgo(35, 10, 0),
    },

    // Flagged Anomalous Job (for Anomaly Detection Panel Demonstration)
    {
      id: 'job-anomaly',
      household_id: 'h1',
      assigned_worker_id: 'w1',
      trade_category: 'Electrician',
      title: 'Emergency Commercial Generator Transfer Switch (Audit Flagged)',
      description: 'High-voltage transfer switch service with unexplained high commission deduction.',
      area: 'Connaught Place, New Delhi',
      address: 'Regal Building, CP',
      latitude: 28.6315,
      longitude: 77.2167,
      scheduled_date: daysAgo(20).split('T')[0],
      scheduled_time_slot: '06:00 PM - 09:00 PM',
      estimated_hours: 3.0,
      estimated_amount: 6500.0,
      final_amount: 6500.0,
      status: 'completed',
      otp_code: '9919',
      completion_notes: 'Work completed. High commission deduction flagged for manual co-op review.',
      completed_at: daysAgo(20, 21, 0),
      created_at: daysAgo(21, 17, 0),
    },
  ],

  // 4-6 Weeks Historical Wage Ledger Records
  wage_ledger: [
    {
      id: 'wl-hist-1',
      job_id: 'job-hist-1',
      worker_id: 'w1',
      cooperative_id: 'coop1',
      gross_amount: 800.0,
      cooperative_fee_pct: 5.0,
      cooperative_fee_amount: 40.0,
      welfare_fund_amount: 10.0,
      net_payout: 750.0,
      payment_mode: 'UPI',
      payment_status: 'completed',
      is_anomalous: false,
      anomaly_reason: null,
      created_at: daysAgo(3, 13, 5),
    },
    {
      id: 'wl-hist-2',
      job_id: 'job-hist-2',
      worker_id: 'w3',
      cooperative_id: 'coop1',
      gross_amount: 600.0,
      cooperative_fee_pct: 5.0,
      cooperative_fee_amount: 30.0,
      welfare_fund_amount: 10.0,
      net_payout: 560.0,
      payment_mode: 'UPI',
      payment_status: 'completed',
      is_anomalous: false,
      anomaly_reason: null,
      created_at: daysAgo(6, 11, 50),
    },
    {
      id: 'wl-hist-3',
      job_id: 'job-hist-3',
      worker_id: 'w5',
      cooperative_id: 'coop1',
      gross_amount: 1200.0,
      cooperative_fee_pct: 5.0,
      cooperative_fee_amount: 60.0,
      welfare_fund_amount: 10.0,
      net_payout: 1130.0,
      payment_mode: 'UPI',
      payment_status: 'completed',
      is_anomalous: false,
      anomaly_reason: null,
      created_at: daysAgo(10, 13, 20),
    },
    {
      id: 'wl-hist-4',
      job_id: 'job-hist-4',
      worker_id: 'w6',
      cooperative_id: 'coop2',
      gross_amount: 1800.0,
      cooperative_fee_pct: 5.0,
      cooperative_fee_amount: 90.0,
      welfare_fund_amount: 10.0,
      net_payout: 1700.0,
      payment_mode: 'UPI',
      payment_status: 'completed',
      is_anomalous: false,
      anomaly_reason: null,
      created_at: daysAgo(14, 16, 5),
    },
    {
      id: 'wl-hist-5',
      job_id: 'job-hist-5',
      worker_id: 'w2',
      cooperative_id: 'coop1',
      gross_amount: 2400.0,
      cooperative_fee_pct: 5.0,
      cooperative_fee_amount: 120.0,
      welfare_fund_amount: 10.0,
      net_payout: 2270.0,
      payment_mode: 'UPI',
      payment_status: 'completed',
      is_anomalous: false,
      anomaly_reason: null,
      created_at: daysAgo(18, 16, 35),
    },
    {
      id: 'wl-hist-6',
      job_id: 'job-hist-6',
      worker_id: 'w1',
      cooperative_id: 'coop1',
      gross_amount: 1400.0,
      cooperative_fee_pct: 5.0,
      cooperative_fee_amount: 70.0,
      welfare_fund_amount: 10.0,
      net_payout: 1320.0,
      payment_mode: 'UPI',
      payment_status: 'completed',
      is_anomalous: false,
      anomaly_reason: null,
      created_at: daysAgo(22, 17, 15),
    },
    {
      id: 'wl-hist-7',
      job_id: 'job-hist-7',
      worker_id: 'w3',
      cooperative_id: 'coop1',
      gross_amount: 750.0,
      cooperative_fee_pct: 5.0,
      cooperative_fee_amount: 37.5,
      welfare_fund_amount: 10.0,
      net_payout: 702.5,
      payment_mode: 'UPI',
      payment_status: 'completed',
      is_anomalous: false,
      anomaly_reason: null,
      created_at: daysAgo(26, 17, 5),
    },
    {
      id: 'wl-hist-8',
      job_id: 'job-hist-8',
      worker_id: 'w5',
      cooperative_id: 'coop1',
      gross_amount: 2800.0,
      cooperative_fee_pct: 5.0,
      cooperative_fee_amount: 140.0,
      welfare_fund_amount: 10.0,
      net_payout: 2650.0,
      payment_mode: 'UPI',
      payment_status: 'completed',
      is_anomalous: false,
      anomaly_reason: null,
      created_at: daysAgo(30, 17, 35),
    },
    {
      id: 'wl-hist-9',
      job_id: 'job-hist-9',
      worker_id: 'w1',
      cooperative_id: 'coop1',
      gross_amount: 650.0,
      cooperative_fee_pct: 5.0,
      cooperative_fee_amount: 32.5,
      welfare_fund_amount: 10.0,
      net_payout: 607.5,
      payment_mode: 'UPI',
      payment_status: 'completed',
      is_anomalous: false,
      anomaly_reason: null,
      created_at: daysAgo(34, 13, 5),
    },

    // Clearly Flagged Anomalous Wage Ledger Entry
    {
      id: 'wl-anomaly',
      job_id: 'job-anomaly',
      worker_id: 'w1',
      cooperative_id: 'coop1',
      gross_amount: 6500.0,
      cooperative_fee_pct: 35.0, // Abnormal 35% deduction instead of 5%
      cooperative_fee_amount: 2275.0,
      welfare_fund_amount: 10.0,
      net_payout: 4215.0,
      payment_mode: 'UPI',
      payment_status: 'flagged',
      is_anomalous: true,
      anomaly_reason: 'Abnormal cooperative commission deduction (35.0% vs statutory 5.0% ceiling) and price spike detected.',
      created_at: daysAgo(20, 21, 5),
    },
  ],

  // Two-Way Ratings Dataset
  ratings: [
    {
      id: 'rat-1',
      job_id: 'job-hist-1',
      rater_user_id: 'h1',
      rated_user_id: 'w1',
      rater_role: 'household',
      score: 5,
      tags: ['Punctual', 'Expert Work', 'Clean Uniform'],
      review_text: 'Ramesh arrived on time and fixed our intricate MCB tripping issue in 45 minutes. Very professional!',
      created_at: daysAgo(3, 13, 30),
    },
    {
      id: 'rat-2',
      job_id: 'job-hist-1',
      rater_user_id: 'w1',
      rated_user_id: 'h1',
      rater_role: 'worker',
      score: 5,
      tags: ['Courteous', 'Prompt Payment', 'Safe Environment'],
      review_text: 'Household provided clear access to electrical meters and offered water. Great experience.',
      created_at: daysAgo(3, 13, 35),
    },
    {
      id: 'rat-3',
      job_id: 'job-hist-2',
      rater_user_id: 'h2',
      rated_user_id: 'w3',
      rater_role: 'household',
      score: 5,
      tags: ['Expert Plumber', 'Fair Pricing', 'Fast'],
      review_text: 'Mohammad Irfan was courteous, brought correct Jaquar fittings and gave a transparent bill.',
      created_at: daysAgo(6, 12, 10),
    },
  ],

  welfare_schemes: [
    {
      id: 'sch-1',
      cooperative_id: 'coop1',
      name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
      type: 'insurance',
      coverage_amount: 200000.0,
      monthly_premium: 20.0,
      govt_subsidy_pct: 100.0,
      description: 'Accidental death and disability insurance cover for all registered cooperative workers.',
      is_active: true,
      created_at: daysAgo(100),
    },
    {
      id: 'sch-2',
      cooperative_id: 'coop1',
      name: 'Sahakar Shramik Family Health Cover',
      type: 'health',
      coverage_amount: 500000.0,
      monthly_premium: 150.0,
      govt_subsidy_pct: 60.0,
      description: 'Comprehensive cashless hospitalization across 1200+ empaneled Delhi-NCR hospitals.',
      is_active: true,
      created_at: daysAgo(90),
    },
    {
      id: 'sch-3',
      cooperative_id: 'coop1',
      name: 'Cooperative Emergency Welfare Aid',
      type: 'emergency_aid',
      coverage_amount: 25000.0,
      monthly_premium: 0.0,
      govt_subsidy_pct: 100.0,
      description: 'Zero-interest micro-bridge advance disbursed directly from federation surplus corpus within 2 hours.',
      is_active: true,
      created_at: daysAgo(80),
    },
  ],
}

// In-memory DB fallback for Node.js / test environments without window.localStorage
let inMemoryDb = null

// LocalStorage Persistence Key
const STORAGE_KEY = 'sahakar_connect_db_v1'

function getDb() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // Fallback
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData))
    return mockData
  }

  if (!inMemoryDb) {
    inMemoryDb = JSON.parse(JSON.stringify(mockData))
  }
  return inMemoryDb
}

function saveDb(data) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } else {
    inMemoryDb = data
  }
}

function applyFilters(data, filters) {
  let result = [...data]
  filters.forEach((f) => {
    if (f.type === 'eq') result = result.filter((item) => item[f.column] === f.value)
    if (f.type === 'in') result = result.filter((item) => f.value.includes(item[f.column]))
    if (f.type === 'gte') result = result.filter((item) => item[f.column] >= f.value)
    if (f.type === 'lte') result = result.filter((item) => item[f.column] <= f.value)
  })
  return result
}

function createQueryBuilder(table) {
  let filters = []
  let selectColumns = '*'
  let orderCol = null
  let orderAsc = true
  let limitCount = null
  let singleResult = false

  const builder = {
    select(cols) {
      selectColumns = cols || '*'
      return builder
    },
    eq(col, val) {
      filters.push({ type: 'eq', column: col, value: val })
      return builder
    },
    in(col, val) {
      filters.push({ type: 'in', column: col, value: val })
      return builder
    },
    or() {
      return builder
    },
    gte(col, val) {
      filters.push({ type: 'gte', column: col, value: val })
      return builder
    },
    lte(col, val) {
      filters.push({ type: 'lte', column: col, value: val })
      return builder
    },
    order(col, opts) {
      orderCol = col
      orderAsc = opts?.ascending ?? true
      return builder
    },
    limit(n) {
      limitCount = n
      return builder
    },
    single() {
      singleResult = true
      return builder
    },
    maybeSingle() {
      singleResult = true
      return builder
    },
    then(resolve, reject) {
      const promise = new Promise((res) => {
        const db = getDb()
        let rawData = db[table] ? [...db[table]] : []
        let data = applyFilters(rawData, filters)

        if (orderCol) {
          data.sort((a, b) => {
            if (a[orderCol] === b[orderCol]) return 0
            if (orderAsc) return a[orderCol] > b[orderCol] ? 1 : -1
            return a[orderCol] < b[orderCol] ? 1 : -1
          })
        }
        if (limitCount) data = data.slice(0, limitCount)

        // Relational Expansion Simulation
        if (table === 'jobs') {
          data = data.map((job) => ({
            ...job,
            household: db.profiles.find((p) => p.id === job.household_id) || null,
            worker: db.profiles.find((p) => p.id === job.assigned_worker_id) || null,
            worker_details: db.workers.find((w) => w.user_id === job.assigned_worker_id) || null,
          }))
        } else if (table === 'workers') {
          data = data.map((worker) => ({
            ...worker,
            profiles: db.profiles.find((p) => p.id === worker.user_id) || null,
            cooperatives: db.cooperatives.find((c) => c.id === worker.cooperative_id) || null,
          }))
        } else if (table === 'wage_ledger') {
          data = data.map((wl) => ({
            ...wl,
            worker: db.profiles.find((p) => p.id === wl.worker_id) || null,
            job: db.jobs.find((j) => j.id === wl.job_id) || null,
            cooperative: db.cooperatives.find((c) => c.id === wl.cooperative_id) || null,
          }))
        } else if (table === 'ratings') {
          data = data.map((r) => ({
            ...r,
            rater: db.profiles.find((p) => p.id === r.rater_user_id) || null,
            rated: db.profiles.find((p) => p.id === r.rated_user_id) || null,
          }))
        }

        if (singleResult) res({ data: data[0] || null, error: null })
        else res({ data, error: null })
      })
      return resolve ? promise.then(resolve, reject) : promise
    },
  }
  return builder
}

export const supabase = {
  from(table) {
    return {
      select(cols) {
        return createQueryBuilder(table).select(cols)
      },
      insert(row) {
        const db = getDb()
        const newRow = {
          id: crypto.randomUUID(),
          ...row,
          created_at: new Date().toISOString(),
        }
        if (!db[table]) db[table] = []
        db[table].unshift(newRow)
        saveDb(db)
        return Promise.resolve({ data: newRow, error: null })
      },
      update(updates) {
        return {
          eq(col, val) {
            const db = getDb()
            if (db[table]) {
              const item = db[table].find((i) => i[col] === val)
              if (item) {
                Object.assign(item, updates)
                saveDb(db)
                return Promise.resolve({ data: item, error: null })
              }
            }
            return Promise.resolve({ data: null, error: null })
          },
        }
      },
      delete() {
        return {
          eq(col, val) {
            const db = getDb()
            if (db[table]) {
              db[table] = db[table].filter((i) => i[col] !== val)
              saveDb(db)
            }
            return Promise.resolve({ error: null })
          },
        }
      },
    }
  },

  auth: {
    getSession() {
      const stored = localStorage.getItem('sahakar_auth_user')
      if (stored) {
        try {
          const user = JSON.parse(stored)
          return Promise.resolve({ data: { session: { user } } })
        } catch {
          // Fallthrough
        }
      }
      return Promise.resolve({ data: { session: null } })
    },
    onAuthStateChange(callback) {
      return { data: { subscription: { unsubscribe() {} } } }
    },
    signUp({ email, password, role = 'worker', fullName = '', options = {} }) {
      const db = getDb()
      const newUserId = 'user_' + crypto.randomUUID().slice(0, 8)
      const user = {
        id: newUserId,
        email,
        email_confirmed_at: null,
        user_metadata: { role, full_name: fullName },
      }
      const newProfile = {
        id: newUserId,
        email,
        full_name: fullName,
        role,
        phone: '+91 98000 00000',
        email_confirmed: false,
        email_confirmed_at: null,
        created_at: new Date().toISOString(),
      }
      db.profiles.push(newProfile)

      if (role === 'worker') {
        db.workers.push({
          id: 'wk_' + newUserId,
          user_id: newUserId,
          cooperative_id: 'coop1',
          primary_trade: options.data?.trade || 'Electrician',
          skills: ['General Repair'],
          experience_years: 1,
          hourly_rate: 350.0,
          is_verified: false,
          gov_id_type: 'Aadhaar',
          gov_id_masked: 'XXXX-XXXX-0000',
          area: options.data?.area || 'South Extension, New Delhi',
          latitude: 28.5728,
          longitude: 77.2217,
          rating: 5.0,
          total_ratings: 0,
          completed_jobs_count: 0,
          is_available: true,
          created_at: new Date().toISOString(),
        })
      } else if (role === 'household') {
        db.households.push({
          id: 'hh_' + newUserId,
          user_id: newUserId,
          address: options.data?.address || 'New Residence, New Delhi',
          area: options.data?.area || 'South Extension, New Delhi',
          latitude: 28.5728,
          longitude: 77.2217,
          landmark: '',
          rating: 5.0,
          created_at: new Date().toISOString(),
        })
      }

      saveDb(db)
      // When email confirmation is enabled, session is null until verified
      return Promise.resolve({ data: { user, session: null }, error: null })
    },
    signInWithPassword({ email }) {
      const db = getDb()
      let profile = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase())
      if (!profile) {
        // Fallback default to Ramesh (Worker)
        profile = db.profiles[0]
      }

      // Check if email confirmation is required
      if (profile.email_confirmed === false) {
        return Promise.resolve({
          data: null,
          error: {
            message: 'Email not confirmed. Please verify your email before logging in.',
            status: 400,
          },
        })
      }

      const user = { id: profile.id, email: profile.email, email_confirmed_at: profile.email_confirmed_at || new Date().toISOString() }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sahakar_auth_user', JSON.stringify(user))
      }
      return Promise.resolve({ data: { user, session: { user } }, error: null })
    },
    resend({ type = 'signup', email } = {}) {
      console.log(`[Supabase Auth Resend] Resending ${type} email confirmation to: ${email}`)
      return Promise.resolve({ data: { message: 'Confirmation email resent successfully.' }, error: null })
    },
    verifyOtp({ token_hash, type = 'signup', email } = {}) {
      const db = getDb()
      let profile = db.profiles.find((p) => (email && p.email.toLowerCase() === email.toLowerCase()) || p.email_confirmed === false)
      if (!profile) {
        profile = db.profiles[0]
      }

      profile.email_confirmed = true
      profile.email_confirmed_at = new Date().toISOString()
      saveDb(db)

      const user = { id: profile.id, email: profile.email, email_confirmed_at: profile.email_confirmed_at }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sahakar_auth_user', JSON.stringify(user))
      }
      return Promise.resolve({ data: { user, session: { user } }, error: null })
    },
    signOut() {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('sahakar_auth_user')
      }
      return Promise.resolve({})
    },
    updateUser({ password }) {
      return Promise.resolve({ data: { user: { password } }, error: null })
    },
    admin: {
      updateUserById(userId, { password, user_metadata } = {}) {
        const db = getDb()
        const profile = db.profiles.find((p) => p.id === userId || p.email === userId)
        if (profile) {
          profile.password_updated_at = new Date().toISOString()
          saveDb(db)
        }
        return Promise.resolve({ data: { user: { id: userId, ...profile } }, error: null })
      },
    },
  },
  functions: {
    async invoke(functionName, { body = {} } = {}) {
      try {
        const { requestPasswordReset, verifyResetPin, resetPasswordWithToken } = await import('./authResetService.js')
        const { email, pin, resetToken, newPassword } = body || {}

        if (functionName === 'forgot-password') {
          const res = await requestPasswordReset(email)
          return {
            data: {
              message: "If this email is registered, a code has been sent.",
              pinCode: res.demoPin || res.pinCode,
              simulated: res.simulated,
            },
            error: null,
          }
        }

        if (functionName === 'verify-pin') {
          const res = await verifyResetPin(email, pin)
          if (!res.success) {
            return {
              data: { verified: false, error: res.error || 'Invalid or expired PIN code.', canResend: true },
              error: { message: res.error || 'Invalid or expired PIN code.' },
            }
          }
          const token = res.verificationToken || res.resetToken || res.token
          return {
            data: {
              verified: true,
              resetToken: token,
              verificationToken: token,
              email,
            },
            error: null,
          }
        }

        if (functionName === 'reset-password') {
          const tokenToUse = resetToken || body.verificationToken
          const res = await resetPasswordWithToken(tokenToUse, newPassword, newPassword)
          if (!res.success) {
            return {
              data: { success: false, error: res.error || 'Failed to update password.' },
              error: { message: res.error || 'Failed to update password.' },
            }
          }
          return {
            data: {
              success: true,
              message: "Password updated successfully.",
            },
            error: null,
          }
        }

        return { data: null, error: { message: `Edge function '${functionName}' not implemented in mock.` } }
      } catch (err) {
        return { data: null, error: { message: err.message || 'Function execution error' } }
      }
    },
  },
}

