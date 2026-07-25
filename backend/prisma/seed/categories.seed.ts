import { PrismaClient, ServiceCategory } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient): Promise<ServiceCategory[]> {
  console.log('📌 Seeding Master Service Categories (12 categories)...');

  const categoriesData = [
    {
      name: 'Painting',
      description: 'Interior, exterior, texture, waterproofing paint, and wall putty application.',
      icon: 'palette',
      iconUrl: '/assets/icons/painting.png',
      color: '#FF5733',
      displayOrder: 1,
      estimatedDuration: 480,
      isActive: true,
    },
    {
      name: 'Electrical',
      description: 'Distribution boards, switchgears, commercial wiring, 3-phase audits, and LED setups.',
      icon: 'zap',
      iconUrl: '/assets/icons/electrical.png',
      color: '#F1C40F',
      displayOrder: 2,
      estimatedDuration: 120,
      isActive: true,
    },
    {
      name: 'Plumbing',
      description: 'Concealed pipe leaks, hydro-jetting drainage, booster pumps, and valve overhauls.',
      icon: 'droplet',
      iconUrl: '/assets/icons/plumbing.png',
      color: '#3498DB',
      displayOrder: 3,
      estimatedDuration: 180,
      isActive: true,
    },
    {
      name: 'Civil',
      description: 'Tile masonry, concrete crack repairs, epoxy grouting, structural plastering, and flooring.',
      icon: 'hammer',
      iconUrl: '/assets/icons/civil.png',
      color: '#7F8C8D',
      displayOrder: 4,
      estimatedDuration: 600,
      isActive: true,
    },
    {
      name: 'Waterproofing',
      description: 'Terrace PU liquid membrane, injection grouting, basement sealings, and damp treatment.',
      icon: 'shield',
      iconUrl: '/assets/icons/waterproofing.png',
      color: '#1ABC9C',
      displayOrder: 5,
      estimatedDuration: 360,
      isActive: true,
    },
    {
      name: 'Carpentry',
      description: 'Custom cabinetry, doors, security locks, wood polishing, and office partitions.',
      icon: 'tool',
      iconUrl: '/assets/icons/carpentry.png',
      color: '#E67E22',
      displayOrder: 6,
      estimatedDuration: 240,
      isActive: true,
    },
    {
      name: 'Interior',
      description: 'Gypsum false ceilings, acoustic wall paneling, modular kitchens, and custom wallpaper.',
      icon: 'layout',
      iconUrl: '/assets/icons/interior.png',
      color: '#9B59B6',
      displayOrder: 7,
      estimatedDuration: 720,
      isActive: true,
    },
    {
      name: 'Cleaning',
      description: 'Post-construction cleaning, high-rise glass facade washing, carpet steam extraction.',
      icon: 'sparkles',
      iconUrl: '/assets/icons/cleaning.png',
      color: '#2ECC71',
      displayOrder: 8,
      estimatedDuration: 240,
      isActive: true,
    },
    {
      name: 'HVAC',
      description: 'VRV/VRF air conditioning, AHU coil descaling, precision chiller maintenance, and ducting.',
      icon: 'wind',
      iconUrl: '/assets/icons/hvac.png',
      color: '#00BCD4',
      displayOrder: 9,
      estimatedDuration: 360,
      isActive: true,
    },
    {
      name: 'CCTV & Security',
      description: 'IP CCTV surveillance systems, NVR setup, biometric access control, and turnstiles.',
      icon: 'camera',
      iconUrl: '/assets/icons/cctv.png',
      color: '#3F51B5',
      displayOrder: 10,
      estimatedDuration: 240,
      isActive: true,
    },
    {
      name: 'Fire Safety',
      description: 'Fire hydrant pump testing, addressable smoke detector audits, and sprinkler maintenance.',
      icon: 'flame',
      iconUrl: '/assets/icons/fire-safety.png',
      color: '#E91E63',
      displayOrder: 11,
      estimatedDuration: 300,
      isActive: true,
    },
    {
      name: 'Networking',
      description: 'Structured Cat6 UTP cabling, fiber optic OTDR splicing, managed switches, and enterprise Wi-Fi.',
      icon: 'network',
      iconUrl: '/assets/icons/networking.png',
      color: '#673AB7',
      displayOrder: 12,
      estimatedDuration: 300,
      isActive: true,
    },
  ];

  const seededCategories: ServiceCategory[] = [];
  for (const catData of categoriesData) {
    const category = await prisma.serviceCategory.create({
      data: catData,
    });
    seededCategories.push(category);
  }

  console.log(`✅ ${seededCategories.length} Master Service Categories seeded.`);
  return seededCategories;
}
