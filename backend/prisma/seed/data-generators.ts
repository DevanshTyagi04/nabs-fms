import * as argon2 from 'argon2';

export const COMMON_PASSWORD = 'Password@123';

let cachedPasswordHash: string | null = null;

export async function getHashedPassword(): Promise<string> {
  if (!cachedPasswordHash) {
    cachedPasswordHash = await argon2.hash(COMMON_PASSWORD, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }
  return cachedPasswordHash;
}

export function getRandomDateInPastDays(daysBack: number): Date {
  const now = new Date('2026-07-25T12:00:00Z');
  const pastMs = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - pastMs);
}

export function getRandomDateBetween(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomDecimal(min: number, max: number, decimals: number = 2): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

// Realistic Indian/Global Personal Names
export const FIRST_NAMES = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Ananya', 'Siddharth', 'Neha', 'Rohan', 'Kavita',
  'Arjun', 'Pooja', 'Suresh', 'Deepika', 'Manish', 'Ritu', 'Karan', 'Sneha', 'Vikas', 'Meera',
  'Rahul', 'Swati', 'Gaurav', 'Nisha', 'Aakash', 'Bhavna', 'Nikhil', 'Divya', 'Tarun', 'Shweta',
  'Varun', 'Aarti', 'Sanjay', 'Tanvi', 'Abhishek', 'Rachna', 'Deepak', 'Alka', 'Manoj', 'Kriti',
  'Ashish', 'Payal', 'Prateek', 'Shilpa', 'Mohit', 'Simran', 'Vineet', 'Rashmi', 'Harish', 'Preeti',
  'Naveen', 'Meenakshi', 'Yash', 'Anjali', 'Kunal', 'Vandana', 'Rakesh', 'Sangeeta', 'Pankaj', 'Sonam',
  'Vivek', 'Nidhi', 'Sachin', 'Richa', 'Dheeraj', 'Komal', 'Vishal', 'Neeraj', 'Geeta', 'Saurabh'
];

export const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Malhotra', 'Reddy', 'Kapoor', 'Desai', 'Mehta', 'Joshi', 'Patel',
  'Singh', 'Kumar', 'Chawla', 'Bhasin', 'Nair', 'Iyer', 'Chatterjee', 'Banerjee', 'Rao', 'Kulkarni',
  'Aggarwal', 'Bansal', 'Saxena', 'Trivedi', 'Bhatt', 'Mishra', 'Pandey', 'Shukla', 'Tiwari', 'Dube',
  'Sinha', 'Choudhury', 'Dutta', 'Sengupta', 'Ghosal', 'Seth', 'Venkatesh', 'Krishnan', 'Menon', 'Pillai'
];

// Realistic Business / Company Names for Customers & Vendors
export const CUSTOMER_COMPANIES = [
  'Malhotra Enterprises', 'Reddy Tech Park Ltd.', 'Horizon Commercial Complex', 'Apex Heights RWA',
  'Greenwood Villa Association', 'Zenith Logistics Hub', 'Silverline Towers Co-op', 'Nexus Workspace Solutions',
  'Oceanic Marine & Shipping', 'Vanguard Business Park', 'Starlight Retail Mall', 'Trident Financial Center',
  'Regal Heritage Suites', 'Empress Business Tower', 'Prestige Residency Society', 'Phoenix Corporate Park'
];

export const VENDOR_BUSINESSES = [
  { name: 'Apex Climate Control & HVAC', categories: ['HVAC', 'Electrical'] },
  { name: 'Metro Power & Electricals', categories: ['Electrical', 'Networking'] },
  { name: 'Precision Plumbing & Drainage Services', categories: ['Plumbing', 'Waterproofing'] },
  { name: 'BuildMaster Civil & Masonry Solutions', categories: ['Civil', 'Waterproofing', 'Painting'] },
  { name: 'AquaShield Waterproofing Experts', categories: ['Waterproofing', 'Civil'] },
  { name: 'Royal Touch Interior & Painting', categories: ['Painting', 'Interior', 'Carpentry'] },
  { name: 'Urban Crafts Carpentry & Furnishings', categories: ['Carpentry', 'Interior'] },
  { name: 'CleanQuest Commercial Cleaning', categories: ['Cleaning'] },
  { name: 'SecureEye CCTV & Surveillance Systems', categories: ['CCTV & Security', 'Electrical', 'Networking'] },
  { name: 'FireGuard Safety Solutions & Services', categories: ['Fire Safety', 'Plumbing'] },
  { name: 'NetLink Enterprise Wiring & Fiber Optic', categories: ['Networking', 'Electrical'] },
  { name: 'ProTech Facility Support Services', categories: ['Electrical', 'Plumbing', 'Cleaning'] },
  { name: 'Evergreen Wall Protection & Painters', categories: ['Painting', 'Waterproofing'] },
  { name: 'Prime Build Construction & Renovation', categories: ['Civil', 'Interior', 'Carpentry'] },
  { name: 'CoolBreeze Air Conditioners & Ducting', categories: ['HVAC'] },
  { name: 'Titan Plumbing & Pipeworks', categories: ['Plumbing'] },
  { name: 'VoltMaster Heavy Electrical Systems', categories: ['Electrical'] },
  { name: 'SafeSpace Fire & Alarm Systems', categories: ['Fire Safety'] },
  { name: 'Ambience Craft Interior Designers', categories: ['Interior'] },
  { name: 'CrystalClear Deep Cleaning & Sanitization', categories: ['Cleaning'] },
  { name: 'ShieldMaster Anti-Leakage & Terrace Coating', categories: ['Waterproofing'] },
  { name: 'SpeedNet Smart Cabling & Security', categories: ['Networking', 'CCTV & Security'] },
  { name: 'Classic Woodworks & Modular Kitchens', categories: ['Carpentry'] },
  { name: 'Elite Coatings & Texture Paint', categories: ['Painting'] },
  { name: 'Vanguard Industrial HVAC Solutions', categories: ['HVAC'] },
  { name: 'SolidRock Flooring & Masonry', categories: ['Civil'] },
  { name: 'Zenith Security Cameras & Access Control', categories: ['CCTV & Security'] },
  { name: 'HydraFlow Water Tank & Pipeline Services', categories: ['Plumbing'] },
  { name: 'SparkTech Electrical Maintenance', categories: ['Electrical'] },
  { name: 'OmniServ Comprehensive Maintenance', categories: ['HVAC', 'Electrical', 'Plumbing', 'Civil'] }
];

// Realistic Address Data
export const REALISTIC_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', postalCodes: ['400001', '400051', '400076', '400098', '400101'] },
  { city: 'Delhi', state: 'Delhi', postalCodes: ['110001', '110020', '110048', '110075', '110092'] },
  { city: 'Bengaluru', state: 'Karnataka', postalCodes: ['560001', '560037', '560066', '560100', '560102'] },
  { city: 'Hyderabad', state: 'Telangana', postalCodes: ['500001', '500032', '500081', '500090', '500095'] },
  { city: 'Pune', state: 'Maharashtra', postalCodes: ['411001', '411014', '411045', '411057', '411028'] },
  { city: 'Gurugram', state: 'Haryana', postalCodes: ['122001', '122002', '122018', '122102', '122050'] },
  { city: 'Noida', state: 'Uttar Pradesh', postalCodes: ['201301', '201303', '201309', '201310', '201313'] },
  { city: 'Chennai', state: 'Tamil Nadu', postalCodes: ['600001', '600018', '600034', '600096', '600113'] }
];

export const STREET_TEMPLATES = [
  'Plot {num}, Block {block}, Sector {sec}, Main Expressway',
  'Flat {num}, {building} Apartments, MG Road',
  'Suite {num}, Tower {block}, IT Park Extension',
  'Building {num}, Outer Ring Road, Phase {sec}',
  'Shop {num}, Commercial Complex, Linking Road',
  'Villa {num}, Palm Meadows, Green Valley Colony',
  'Premises {num}, Industrial Estate, Phase {sec}'
];

export const LANDMARKS = [
  'Near Central Metro Station', 'Opposite Cyber City Gate 3', 'Behind Grand Hyatt Hotel',
  'Next to ICICI Bank Branch', 'Adjacent to City Center Mall', 'Near Rajiv Gandhi Flyover',
  'Behind Apollo Hospital', 'Near Knowledge Park Circle'
];

// Realistic Service Request Content per Category
export const CATEGORY_REQUEST_DESCRIPTIONS: Record<string, { titles: string[], descriptions: string[] }> = {
  'Painting': {
    titles: [
      'Full Interior Re-painting for 3BHK Flat',
      'Exterior Weatherproof Wall Paint Application',
      'Texture Painting and Damp Treatment for Living Room',
      'Waterproofing Coat and Wall Putty Finishing',
      'Office Reception Wall Refresh & Brand Color Coating'
    ],
    descriptions: [
      'Requires scraping old peeling paint, applying double coat primer, acrylic wall putty, and 2 coats of Premium Emulsion paint. Total coverage approx 2400 sq.ft.',
      'Exterior facade paint has deteriorated due to monsoon dampness. Sanding, crack filling with elastomeric sealant, and weather guard exterior emulsion coating requested.',
      'Living room accent wall texture paint design along with anti-fungal treatment on damp affected ceiling area.'
    ]
  },
  'Electrical': {
    titles: [
      'Main Distribution Board Tripping & MCB Replacement',
      'Heavy Load Commercial Wiring & 3-Phase Panel Audit',
      'Ceiling Fan & LED Fixture Installation for Office',
      'Server Room UPS Bypass Switch Installation',
      'Short Circuit Inspection and Wall Outlet Replacement'
    ],
    descriptions: [
      'Frequent tripping of 32A TPN MCB during peak hours. Requesting thorough load balancing audit, wire insulation check, and MCB replacement.',
      'Installation of 15 new LED panel lights, 4 ceiling fans, and dedicated 16A power sockets for workstation computers.',
      'Server room power backup switchboard overheating. Need thermal imaging inspection and replacement of burnt wiring.'
    ]
  },
  'Plumbing': {
    titles: [
      'Concealed Pipe Leakage Repair in Master Bathroom',
      'Main Overhead Tank Outlet Valve & Pipeline Replacement',
      'Drainage Blockage Clearing with Pressure Jetting',
      'Sanitaryware & Mixer Tap Installation for Restrooms',
      'Water Booster Pump Overhaul and Pressure Gauge Setup'
    ],
    descriptions: [
      'Seepage visible on bedroom wall adjoining master bathroom. Moisture meter inspection and concealed CPVC pipe repair required.',
      'Overhead 5000L water tank outlet valve corroded and leaking continuously. Replacement with heavy duty brass ball valve required.',
      'Ground floor drainage main pipe clogged with debris and grease. Hydro-jet cleaning and inspection chamber clearing needed.'
    ]
  },
  'Civil': {
    titles: [
      'Tile Replacement and Grouting in Commercial Kitchen',
      'Concrete Slab Crack Repair & Structural Strengthening',
      'Brick Masonry Wall Construction for Office Partition',
      'Granite Staircase Edge Profile Polishing & Repair',
      'Balcony Floor Leveling and Anti-Skid Tile Fixing'
    ],
    descriptions: [
      'Broken ceramic floor tiles in high-traffic kitchen area causing trip hazard. Removal, fresh mortar bedding, and vitrified tile installation needed.',
      'Hairline structural cracks observed along basement concrete pillar. Epoxy injection grouting and carbon fiber wrapping needed.',
      'Dismantling wooden partition and constructing 9-inch brick wall with double coat cement plastering.'
    ]
  },
  'Waterproofing': {
    titles: [
      'Terrace Liquid Membrane Waterproofing Treatment',
      'Basement Wall Injection Grouting for Water Ingress',
      'Bathroom Slab Water Seepage Diagnosis & Coating',
      'Expansion Joint Sealing & Polyurethane Coating',
      'Roof Garden Drainage Layer Waterproofing'
    ],
    descriptions: [
      'Severe monsoon leakage dripping into top floor ceiling. Surface preparation, PU primer, 2 coats of elastomeric liquid membrane, and UV protection layer required.',
      'Groundwater seeping through basement retaining wall construction joints. Pressure injection of polyurethane foam grout requested.',
      'Water accumulating under bathroom tiles. Tile joint raking, epoxy grout injection, and transparent nano-sealer application.'
    ]
  },
  'Carpentry': {
    titles: [
      'Custom Wooden Storage Cabinets & Modular Shelving',
      'Main Entrance Flush Door Repair & Lock Fitting',
      'Conference Table Wood Polish & Hinge Replacement',
      'WPC Board Partition Wall Installation',
      'Plywood Wardrobe Shutter Alignment and Handles'
    ],
    descriptions: [
      'Fabrication and installation of marine grade plywood cabinets with laminate finish and soft-close telescopic drawer channels.',
      'Main door sagging due to loose hinges and latch misaligned. Hinges re-anchoring, door planing, and high-security mortise lock installation.',
      'Refurbishing conference room wooden table, sanding down scratches, and applying high-gloss polyurethane clear polish.'
    ]
  },
  'Interior': {
    titles: [
      'Gypsum False Ceiling Installation with Cove Lighting',
      'Modular Kitchen Layout Redesign & Countertop Setup',
      'Acoustic Fabric Wall Paneling for Media Room',
      'Custom Wallpaper Application & Border Trimming',
      'Glass Office Partition with Frosted Film Application'
    ],
    descriptions: [
      'Installation of perimeter gypsum board false ceiling with metal framework, LED cove lighting channels, and cutouts for AC diffusers.',
      'Dismantling old kitchen counter, installing quartz countertop, modular drawers, and overhead hydraulic shutters.',
      'Soundproofing conference room using acoustic foam panels wrapped in fire-retardant fabric.'
    ]
  },
  'Cleaning': {
    titles: [
      'Post-Construction Deep Cleaning for 5000 sq.ft Office',
      'High-Rise Glass Exterior Window Washing',
      'Commercial Carpet Shampooing & Stain Extraction',
      'Overhead Water Storage Tank Scrubbing & Disinfection',
      'HVAC Duct Deep Cleaning and Mold Remediation'
    ],
    descriptions: [
      'Complete removal of paint splatters, cement dust, floor buffing with single disc machine, window track cleaning, and sanitization.',
      'Rope access (abseiling) cleaning of 10-story glass facade using eco-friendly deionized water wash system.',
      'Deep steam cleaning and hot water extraction treatment for 120 office chairs and 3000 sq.ft modular carpet tiles.'
    ]
  },
  'HVAC': {
    titles: [
      'VRV/VRF AC Unit Annual Overhaul & Gas Charging',
      'AHU Filter Replacement and Chiller Coil Descaling',
      'Split AC Cooling Issues & Compressor Capacitor Repair',
      'Ductable AC Air Flow Balancing & Thermostat Setup',
      'Server Room Precision AC Maintenance & Sensor Calibration'
    ],
    descriptions: [
      '10 HP VRV outdoor unit showing high pressure error. Nitrogen flushing, leak detection, vacuum evacuation, and R410A refrigerant top-up.',
      'Air Handling Unit airflow decreased by 40%. Chemical foam washing of cooling coils, blower belt replacement, and MERV 13 filter renewal.',
      'Precision AC in data center raising high temperature alarms. Condenser coil cleaning and dual compressor pressure check.'
    ]
  },
  'CCTV & Security': {
    titles: [
      '16-Channel IP CCTV Camera System Installation',
      'Biometric Access Control & Turnstile Gate Setup',
      'Video Door Phone & Intercom Wiring Troubleshooting',
      'NVR Hard Drive Replacement & Remote View Setup',
      'Perimeter Infrared Motion Sensor Barrier Maintenance'
    ],
    descriptions: [
      'Wiring 16 4MP Dome/Bullet IP cameras with Cat6 PoE cables, 16-port PoE switch, 4TB NVR setup, and mobile viewing configuration.',
      'Installing fingerprint + RFID card access control reader at server room door with electromagnetic lock and exit button.',
      'Intercom line noisy across 4 floors. Cable continuity check, terminal junction box re-soldering, and power supply stabilization.'
    ]
  },
  'Fire Safety': {
    titles: [
      'Fire Hydrant Pipe Pressure Test & Pump Maintenance',
      'Addressable Smoke Detector Loop Audit & Servicing',
      'Fire Extinguisher Refilling & Pressure Gauge Check',
      'Automatic Sprinkler Head Inspection and Flow Test',
      'Fire Alarm Control Panel Battery & Siren Servicing'
    ],
    descriptions: [
      'Testing jockey pump and main diesel engine fire pump starting sequence. Flushing hydrant risers and replacing leaky 63mm hose couplings.',
      'Testing 45 smoke detectors across zone 2. Cleaning optic chambers, measuring loop resistance, and resolving false alarm faults.',
      'Refilling 30 ABC Powder 6kg fire extinguishers and 10 CO2 4.5kg extinguishers with hydro-testing certification.'
    ]
  },
  'Networking': {
    titles: [
      'Structured Cat6 Ethernet Cabling for 50 Workstations',
      'Core Router & Managed Switch Configuration',
      'Fiber Optic Splicing & OTDR Cable Test',
      'Server Rack Cable Management & Patch Panel Labeling',
      'Enterprise Wi-Fi 6 Access Point Ceiling Installation'
    ],
    descriptions: [
      'Laying Cat6 UTP cables through PVC conduits, terminating on 24-port patch panels, fluke testing, and workstation RJ45 crimping.',
      'Splicing single-mode 12-core fiber optic backbone between Building A and Building B. OTDR attenuation report generation.',
      'Deployment of 8 ceiling-mounted Wi-Fi 6 Access Points with VLAN isolation for Guest and Corporate networks.'
    ]
  }
};
