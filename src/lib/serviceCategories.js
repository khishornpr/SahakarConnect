/**
 * SahakarConnect Single Source of Truth for Cooperative Service Categories and Trades
 * SIH26089 - Standardized Non-Exploitative Cooperative Tariff System
 */

export const SERVICE_CATEGORIES = [
  // ==========================================
  // 1. REPAIR & MAINTENANCE TRADES
  // ==========================================
  {
    trade: 'Electrician',
    group: 'Repair & maintenance trades',
    rate: 350,
    rateFormatted: '₹350/hr',
    minHours: 1.5,
    minHoursLabel: 'Min 1.5 hrs',
    icon: '⚡',
    descKey: 'Wiring & Power',
    skills: ['Wiring', 'Switchboard Repair', 'Inverter Installation', 'MCB Tripping'],
  },
  {
    trade: 'Plumber',
    group: 'Repair & maintenance trades',
    rate: 350,
    rateFormatted: '₹350/hr',
    minHours: 1.5,
    minHoursLabel: 'Min 1.5 hrs',
    icon: '🚰',
    descKey: 'Tanks & Leaks',
    skills: ['Pipe Leakage', 'Tap Fitting', 'Geyser Installation', 'Motor Pump Repair'],
  },
  {
    trade: 'Carpenter',
    group: 'Repair & maintenance trades',
    rate: 400,
    rateFormatted: '₹400/hr',
    minHours: 2.0,
    minHoursLabel: 'Min 2 hrs',
    icon: '🪚',
    descKey: 'Furniture Repair',
    skills: ['Door Locks', 'Cabinet Making', 'Hinge Alignment', 'Wooden Polishing'],
  },
  {
    trade: 'Painter',
    group: 'Repair & maintenance trades',
    rate: 380,
    rateFormatted: '₹380/hr',
    minHours: 3.0,
    minHoursLabel: 'Min 3 hrs',
    icon: '🎨',
    descKey: 'Wall Coating',
    skills: ['Interior Emulsion', 'Waterproofing Putty', 'Texture Design', 'Wood Enamel'],
  },
  {
    trade: 'Appliance Technician',
    group: 'Repair & maintenance trades',
    rate: 400,
    rateFormatted: '₹400/hr',
    minHours: 1.5,
    minHoursLabel: 'Min 1.5 hrs',
    icon: '🔧',
    descKey: 'Appliance Repair',
    skills: ['Washing Machine PCB', 'Refrigerator Compressor', 'Microwave Magnetron', 'Chimney Motor'],
  },
  {
    trade: 'AC Technician / HVAC Repair',
    group: 'Repair & maintenance trades',
    rate: 400,
    rateFormatted: '₹400/hr',
    minHours: 2.0,
    minHoursLabel: 'Min 2 hrs',
    icon: '❄️',
    descKey: 'HVAC & Gas Refill',
    skills: ['Split AC Installation', 'Compressor Overhaul', 'Gas Leakage Refill', 'Ductless Servicing'],
  },
  {
    trade: 'Mason / Tile & Flooring Work',
    group: 'Repair & maintenance trades',
    rate: 380,
    rateFormatted: '₹380/hr',
    minHours: 3.0,
    minHoursLabel: 'Min 3 hrs',
    icon: '🧱',
    descKey: 'Tiles & Plastering',
    skills: ['Vitrified Tile Laying', 'Grouting & Leveling', 'Wall Plastering', 'Cement Patching'],
  },
  {
    trade: 'Welder / Grill & Gate Fabrication',
    group: 'Repair & maintenance trades',
    rate: 420,
    rateFormatted: '₹420/hr',
    minHours: 3.0,
    minHoursLabel: 'Min 3 hrs',
    icon: '🧑‍🏭',
    descKey: 'Gate & Railings',
    skills: ['ARC Welding', 'Grill Alignment', 'Shutter Hinge Welding', 'MS Pipe Fabrication'],
  },
  {
    trade: 'Locksmith',
    group: 'Repair & maintenance trades',
    rate: 350,
    rateFormatted: '₹350/hr',
    minHours: 1.0,
    minHoursLabel: 'Min 1 hr',
    icon: '🔑',
    descKey: 'Locks & Key Duplication',
    skills: ['Emergency Lockout', 'Deadbolt Installation', 'Key Duplication', 'Digital Lock Setup'],
  },
  {
    trade: 'Pest Control Technician',
    group: 'Repair & maintenance trades',
    rate: 350,
    rateFormatted: '₹350/hr',
    minHours: 1.5,
    minHoursLabel: 'Min 1.5 hrs',
    icon: '🪲',
    descKey: 'Eco-Friendly Fumigation',
    skills: ['Termite Chemical Barrier', 'Cockroach Gel Treatment', 'Bedbug Eradication', 'Rodent Baiting'],
  },
  {
    trade: 'RO / Water Purifier Technician',
    group: 'Repair & maintenance trades',
    rate: 380,
    rateFormatted: '₹380/hr',
    minHours: 1.5,
    minHoursLabel: 'Min 1.5 hrs',
    icon: '💧',
    descKey: 'Membrane & Filter Change',
    skills: ['Membrane Flushing', 'Sediment Filter Replacement', 'Booster Pump Service', 'TDS Balancing'],
  },
  {
    trade: 'Solar Panel Installer/Maintenance',
    group: 'Repair & maintenance trades',
    rate: 450,
    rateFormatted: '₹450/hr',
    minHours: 3.0,
    minHoursLabel: 'Min 3 hrs',
    icon: '☀️',
    descKey: 'Rooftop PV & Inverter',
    skills: ['PV Cell Mounting', 'Microinverter Wiring', 'Solar Battery Hookup', 'Panel Array Cleaning'],
  },

  // ==========================================
  // 2. CLEANING & HOUSEKEEPING
  // ==========================================
  {
    trade: 'Cleaner',
    group: 'Cleaning & housekeeping',
    rate: 280,
    rateFormatted: '₹280/hr',
    minHours: 2.5,
    minHoursLabel: 'Min 2.5 hrs',
    icon: '✨',
    descKey: 'Deep Sanitization',
    skills: ['Floor Buffing', 'Bathroom Sanitization', 'Balcony Wash', 'Dusting & Vacuuming'],
  },
  {
    trade: 'Deep Cleaning Specialist (kitchen/chimney)',
    group: 'Cleaning & housekeeping',
    rate: 350,
    rateFormatted: '₹350/hr',
    minHours: 3.0,
    minHoursLabel: 'Min 3 hrs',
    icon: '🧽',
    descKey: 'Kitchen Degreasing',
    skills: ['Chimney Degreasing', 'Tile Grout Steam Wash', 'Oven De-scaling', 'Exhaust Fan Scraping'],
  },
  {
    trade: 'Sofa & Carpet Shampooing',
    group: 'Cleaning & housekeeping',
    rate: 320,
    rateFormatted: '₹320/hr',
    minHours: 2.0,
    minHoursLabel: 'Min 2 hrs',
    icon: '🛋️',
    descKey: 'Fabric Steam & Foam',
    skills: ['Injection-Extraction Washing', 'Stain Pre-treatment', 'Fabric Neutralizing', 'Odor Sanitization'],
  },
  {
    trade: 'Water Tank Cleaning',
    group: 'Cleaning & housekeeping',
    rate: 350,
    rateFormatted: '₹350/hr',
    minHours: 2.0,
    minHoursLabel: 'Min 2 hrs',
    icon: '🛢️',
    descKey: 'Overhead Tank Wash',
    skills: ['High Pressure Jetting', 'Sludge Desiltation', 'UV Disinfection', 'Bleaching Powder Neutralization'],
  },
  {
    trade: 'Vehicle Washing (two-wheeler/car)',
    group: 'Cleaning & housekeeping',
    rate: 280,
    rateFormatted: '₹280/hr',
    minHours: 1.0,
    minHoursLabel: 'Min 1 hr',
    icon: '🚗',
    descKey: 'Foam & Exterior Wax',
    skills: ['Snow Foam Cannon', 'Interior Vacuuming', 'Dashboard Polish', 'Tire Dressing & Rim Care'],
  },

  // ==========================================
  // 3. DOMESTIC WORKS
  // ==========================================
  {
    trade: 'Domestic Helper',
    group: 'Domestic works',
    rate: 300,
    rateFormatted: '₹300/hr',
    minHours: 2.0,
    minHoursLabel: 'Min 2 hrs',
    icon: '🧹',
    descKey: 'Daily Housekeeping',
    skills: ['Daily Housekeeping', 'Kitchen Assistance', 'Wardrobe Organization', 'Surface Mopping'],
  },
  {
    trade: 'Cook / Household Chef',
    group: 'Domestic works',
    rate: 300,
    rateFormatted: '₹300/hr',
    minHours: 3.0,
    minHoursLabel: 'Min 3 hrs',
    icon: '👨‍🍳',
    descKey: 'Fresh Home Cooking',
    skills: ['Regional Cuisine Prep', 'Dietary Customized Meals', 'Hygienic Prep & Clean', 'Daily Meal Prep'],
  },
  {
    trade: 'Dishwashing & Kitchen Utility',
    group: 'Domestic works',
    rate: 250,
    rateFormatted: '₹250/hr',
    minHours: 1.5,
    minHoursLabel: 'Min 1.5 hrs',
    icon: '🍽️',
    descKey: 'Utensils & Sink Sanitization',
    skills: ['Utensil Cleaning', 'Sink Sanitization', 'Kitchen Counter Wash', 'Kitchen Dish Drying'],
  },
  {
    trade: 'Laundry & Ironing Service',
    group: 'Domestic works',
    rate: 250,
    rateFormatted: '₹250/hr',
    minHours: 2.0,
    minHoursLabel: 'Min 2 hrs',
    icon: '👔',
    descKey: 'Steam Press & Care',
    skills: ['Steam Pressing', 'Delicate Fabric Care', 'Collars & Crease Precision', 'Garment Folding'],
  },
  {
    trade: 'House Organization & Wardrobe Setup',
    group: 'Domestic works',
    rate: 280,
    rateFormatted: '₹280/hr',
    minHours: 2.0,
    minHoursLabel: 'Min 2 hrs',
    icon: '🗄️',
    descKey: 'Closet & Pantry Setup',
    skills: ['Closet Decluttering', 'Kitchen Pantry Organization', 'Seasonal Clothes Packing', 'Toy & Storage Sorting'],
  },

  // ==========================================
  // 4. CARE & HOUSEHOLD SUPPORT
  // ==========================================
  {
    trade: 'Caregiver',
    group: 'Care & household support',
    rate: 320,
    rateFormatted: '₹320/hr',
    minHours: 4.0,
    minHoursLabel: 'Min 4 hrs',
    icon: '🩺',
    descKey: 'Nursing & Patient Care',
    skills: ['Bedside Assistance', 'Vitals Monitoring', 'Mobility Support', 'Medication Reminders'],
  },
  {
    trade: 'Elderly Care Attendant',
    group: 'Care & household support',
    rate: 320,
    rateFormatted: '₹320/hr',
    minHours: 4.0,
    minHoursLabel: 'Min 4 hrs',
    icon: '🫀',
    descKey: 'Senior Citizen Support',
    skills: ['Geriatric Assistance', 'Companion Walking', 'Physiotherapy Support', 'Emergency First Aid'],
    note: 'Specialized senior care; distinct from generic Caregiver category.',
  },
  {
    trade: 'Child Care / Babysitter',
    group: 'Care & household support',
    rate: 300,
    rateFormatted: '₹300/hr',
    minHours: 3.0,
    minHoursLabel: 'Min 3 hrs',
    icon: '👶',
    descKey: 'Child Supervision',
    skills: ['Infant Feeding & Hygiene', 'Engaging Play Activities', 'School Routine Assist', 'Child First Aid'],
  },

  // ==========================================
  // 5. OUTDOOR & OCCASIONAL
  // ==========================================
  {
    trade: 'Gardener / Landscaping',
    group: 'Outdoor & occasional',
    rate: 300,
    rateFormatted: '₹300/hr',
    minHours: 2.0,
    minHoursLabel: 'Min 2 hrs',
    icon: '🌿',
    descKey: 'Lawn & Pruning',
    skills: ['Hedge Trimming', 'Lawn Mowing', 'Soil Fertilization', 'Potting & Pruning'],
  },
  {
    trade: 'Movers & Packers',
    group: 'Outdoor & occasional',
    rate: 400,
    rateFormatted: '₹400/hr',
    minHours: 3.0,
    minHoursLabel: 'Min 3 hrs',
    icon: '📦',
    descKey: 'Shifting & Packing',
    skills: ['Bubble Wrap Packaging', 'Heavy Furniture Lifting', 'Loading / Unloading', 'Fragile Item Crating'],
  },
  {
    trade: 'Event Setup Help (tent/decoration)',
    group: 'Outdoor & occasional',
    rate: 350,
    rateFormatted: '₹350/hr',
    minHours: 3.0,
    minHoursLabel: 'Min 3 hrs',
    icon: '🎪',
    descKey: 'Decor & Logistics',
    skills: ['Canopy & Tent Assembly', 'Lighting Arrangement', 'Seating & Table Layout', 'Party Backdrop Setup'],
  },
]

/**
 * Array of trade string names for dropdowns & selectors
 */
export const TRADES_LIST = SERVICE_CATEGORIES.map((c) => c.trade)

/**
 * Shape optimized for booking tariffs
 */
export const TRADES_TARIFF = SERVICE_CATEGORIES.map((c) => ({
  trade: c.trade,
  group: c.group,
  rate: c.rate,
  icon: c.icon,
  minHours: c.minHours,
  minHoursLabel: c.minHoursLabel,
  descKey: c.descKey,
}))

/**
 * Alias for dashboard cards
 */
export const POPULAR_SERVICES = SERVICE_CATEGORIES.map((c) => ({
  trade: c.trade,
  group: c.group,
  icon: c.icon,
  descKey: c.descKey,
  rate: c.rateFormatted,
  minHours: c.minHours,
}))

/**
 * Category groups for structured display & quick filtering
 */
export const TRADE_GROUPS = [
  'Repair & maintenance trades',
  'Cleaning & housekeeping',
  'Domestic works',
  'Care & household support',
  'Outdoor & occasional',
]

/**
 * Helper to safely lookup category details
 */
export function getCategoryByTrade(tradeName) {
  return (
    SERVICE_CATEGORIES.find((c) => c.trade.toLowerCase() === (tradeName || '').toLowerCase()) ||
    SERVICE_CATEGORIES[0]
  )
}

/**
 * Helper to get hourly rate for a trade
 */
export function getTradeRate(tradeName) {
  const cat = getCategoryByTrade(tradeName)
  return cat ? cat.rate : 350
}

/**
 * Helper to get minimum hours for a trade
 */
export function getTradeMinHours(tradeName) {
  const cat = getCategoryByTrade(tradeName)
  return cat ? cat.minHours : 1.5
}
