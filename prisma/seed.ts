import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create or update admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'z360virtualtours@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Z360Tours@2024!Secure'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  // Delete existing admin users and create fresh
  await prisma.admin.deleteMany({})

  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Z360 Admin',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create categories
  const categories = [
    { name: 'Real Estate', slug: 'real-estate', description: 'Residential and commercial property tours', icon: 'Home', order: 1 },
    { name: 'Business', slug: 'business', description: 'Retail stores, offices, and commercial spaces', icon: 'Building2', order: 2 },
    { name: 'Hospitality', slug: 'hospitality', description: 'Hotels, restaurants, and venues', icon: 'Hotel', order: 3 },
    { name: 'Automotive', slug: 'automotive', description: 'Car dealerships and showrooms', icon: 'Car', order: 4 },
    { name: 'Education', slug: 'education', description: 'Schools, universities, and training centers', icon: 'GraduationCap', order: 5 },
    { name: 'Healthcare', slug: 'healthcare', description: 'Clinics, hospitals, and medical facilities', icon: 'Heart', order: 6 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  console.log('✅ Categories created')

  // Get category IDs
  const realEstateCategory = await prisma.category.findUnique({ where: { slug: 'real-estate' } })
  const businessCategory = await prisma.category.findUnique({ where: { slug: 'business' } })
  const hospitalityCategory = await prisma.category.findUnique({ where: { slug: 'hospitality' } })

  // Create sample tours
  const tours = [
    {
      title: 'Luxury Downtown Penthouse',
      slug: 'luxury-downtown-penthouse',
      description: 'Experience this stunning 3-bedroom penthouse with panoramic city views. Features include floor-to-ceiling windows, chef\'s kitchen with premium appliances, spa-like master bathroom, and private rooftop terrace.',
      shortDesc: 'Stunning penthouse with panoramic city views',
      clientName: 'Premier Realty Group',
      location: 'New York, NY',
      coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      categoryId: realEstateCategory!.id,
      featured: true,
      tourUrl: 'https://kuula.co/share/collection/example1',
    },
    {
      title: 'Modern Office Space',
      slug: 'modern-office-space',
      description: 'A contemporary 5,000 sqft office space perfect for growing businesses. Open floor plan with dedicated meeting rooms, break area, and stunning natural light throughout.',
      shortDesc: 'Contemporary office with open floor plan',
      clientName: 'TechHub Coworking',
      location: 'San Francisco, CA',
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      categoryId: businessCategory!.id,
      featured: true,
      tourUrl: 'https://kuula.co/share/collection/example2',
    },
    {
      title: 'Boutique Hotel & Spa',
      slug: 'boutique-hotel-spa',
      description: 'Explore our intimate 20-room boutique hotel featuring a full-service spa, rooftop pool, farm-to-table restaurant, and beautifully appointed guest rooms.',
      shortDesc: 'Intimate boutique hotel with full spa',
      clientName: 'The Grand Retreat',
      location: 'Miami, FL',
      coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      categoryId: hospitalityCategory!.id,
      featured: true,
      tourUrl: 'https://kuula.co/share/collection/example3',
    },
    {
      title: 'Waterfront Villa Estate',
      slug: 'waterfront-villa-estate',
      description: 'Magnificent 6-bedroom waterfront estate with private dock, infinity pool, home theater, wine cellar, and 180-degree ocean views.',
      shortDesc: 'Magnificent waterfront estate with private dock',
      clientName: 'Coastal Luxury Realty',
      location: 'Malibu, CA',
      coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      categoryId: realEstateCategory!.id,
      featured: false,
    },
    {
      title: 'Artisan Coffee Roastery',
      slug: 'artisan-coffee-roastery',
      description: 'Step inside our craft coffee roastery and café. See where we roast our single-origin beans, our espresso bar, and cozy seating areas.',
      shortDesc: 'Craft coffee roastery and café experience',
      clientName: 'Bean & Brew Co.',
      location: 'Portland, OR',
      coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
      categoryId: businessCategory!.id,
      featured: false,
    },
    {
      title: 'Fine Dining Restaurant',
      slug: 'fine-dining-restaurant',
      description: 'Experience our Michelin-starred restaurant virtually. Tour our elegant dining room, private event space, open kitchen, and sommelier\'s wine cellar.',
      shortDesc: 'Michelin-starred dining experience',
      clientName: 'La Maison Élégante',
      location: 'Chicago, IL',
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      categoryId: hospitalityCategory!.id,
      featured: false,
    },
  ]

  for (const tour of tours) {
    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: tour,
      create: tour,
    })
  }
  console.log('✅ Sample tours created')

  // Create testimonials
  const testimonials = [
    {
      clientName: 'Sarah Mitchell',
      clientTitle: 'Real Estate Agent, Premier Realty',
      content: 'Z360 Virtual Tours transformed how I showcase properties. My listings now get 3x more engagement, and buyers come to viewings already knowing the space. Absolutely invaluable!',
      rating: 5,
      featured: true,
    },
    {
      clientName: 'Michael Chen',
      clientTitle: 'Owner, TechHub Coworking',
      content: 'The virtual tour of our coworking space has been a game-changer for attracting remote workers and startups. Professional quality and quick turnaround.',
      rating: 5,
      featured: true,
    },
    {
      clientName: 'Jennifer Rodriguez',
      clientTitle: 'Marketing Director, The Grand Retreat',
      content: 'Our hotel bookings increased by 40% after adding the virtual tour. Guests love being able to explore rooms and amenities before booking.',
      rating: 5,
      featured: true,
    },
    {
      clientName: 'David Park',
      clientTitle: 'Restaurant Owner',
      content: 'The attention to detail in our restaurant tour is incredible. It captures the ambiance perfectly and has helped us book more private events.',
      rating: 5,
      featured: false,
    },
  ]

  // Clear existing testimonials first
  await prisma.testimonial.deleteMany({})

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    })
  }
  console.log('✅ Testimonials created')

  // Create pricing plans
  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Perfect for small spaces and single rooms',
      price: 199,
      priceLabel: 'Starting at',
      features: JSON.stringify([
        'Up to 5 panoramic shots',
        'Basic hotspot navigation',
        'Mobile-friendly viewer',
        'Social media sharing',
        '1 revision included',
        '48-hour delivery',
      ]),
      order: 1,
    },
    {
      name: 'Professional',
      description: 'Ideal for homes, apartments, and small businesses',
      price: 399,
      priceLabel: 'Starting at',
      features: JSON.stringify([
        'Up to 15 panoramic shots',
        'Advanced hotspot navigation',
        'Floor plan integration',
        'Custom branding',
        'Lead capture forms',
        '3 revisions included',
        '24-hour delivery',
        'Google Street View upload',
      ]),
      isPopular: true,
      order: 2,
    },
    {
      name: 'Enterprise',
      description: 'For large properties, hotels, and commercial spaces',
      price: 799,
      priceLabel: 'Starting at',
      features: JSON.stringify([
        'Unlimited panoramic shots',
        'Dollhouse 3D view',
        'Measurement tools',
        'Video integration',
        'Virtual staging options',
        'Priority support',
        'Same-day delivery available',
        'API access',
        'Multiple property discount',
      ]),
      order: 3,
    },
  ]

  // Clear existing pricing plans first
  await prisma.pricingPlan.deleteMany({})

  for (const plan of pricingPlans) {
    await prisma.pricingPlan.create({
      data: plan,
    })
  }
  console.log('✅ Pricing plans created')

  // Create site settings
  const settings = [
    { key: 'site_name', value: 'Z360 Virtual Tours' },
    { key: 'site_tagline', value: 'Immersive 360° Experiences for Your Business' },
    { key: 'contact_email', value: 'hello@z360tours.com' },
    { key: 'contact_phone', value: '+1 (555) 360-TOUR' },
    { key: 'contact_address', value: '123 Virtual Street, Digital City, DC 10001' },
    { key: 'about_title', value: 'Bringing Spaces to Life' },
    { key: 'about_content', value: 'Z360 Virtual Tours is a professional 360° virtual tour service helping businesses showcase their spaces in stunning, immersive detail. From real estate to hospitality, we create engaging virtual experiences that captivate your audience and drive results.' },
    { key: 'social_facebook', value: 'https://facebook.com/z360tours' },
    { key: 'social_instagram', value: 'https://instagram.com/z360tours' },
    { key: 'social_linkedin', value: 'https://linkedin.com/company/z360tours' },
    { key: 'social_twitter', value: 'https://twitter.com/z360tours' },
  ]

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log('✅ Site settings created')

  // Create booking settings
  await prisma.bookingSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      defaultMinLeadDays: 3,
      maxAdvanceBookingDays: 90,
      businessCity: 'Skopje',
      includeReturnTrip: true,
      freeDistanceKm: 15,
      workOnWeekends: false,
      workOnSunday: false,
      quoteValidDays: 14,
      requireDeposit: true,
      depositPercent: 30,
      minBundleParticipants: 3,
      bundleDiscountPercent: 10,
    },
  })
  console.log('✅ Booking settings created')

  // Create urgency tiers
  const urgencyTiers = [
    {
      name: 'standard',
      displayName: 'Standard Delivery',
      description: '7-14 day turnaround',
      minLeadDays: 7,
      maxLeadDays: 14,
      surchargePercent: 0,
      order: 1,
    },
    {
      name: 'express',
      displayName: 'Express Delivery',
      description: '3-6 day turnaround',
      minLeadDays: 3,
      maxLeadDays: 6,
      surchargePercent: 25,
      order: 2,
    },
    {
      name: 'rush',
      displayName: 'Rush/Urgent',
      description: '1-2 day turnaround',
      minLeadDays: 1,
      maxLeadDays: 2,
      surchargePercent: 50,
      order: 3,
    },
  ]

  await prisma.urgencyTier.deleteMany({})
  for (const tier of urgencyTiers) {
    await prisma.urgencyTier.create({ data: tier })
  }
  console.log('✅ Urgency tiers created')

  // Create travel zones - Affordable per-km pricing
  // €0.15/km one-way × 2 (return) = €0.30/km total round trip
  // Examples: 100km = €30, 200km (Tirana) = €60
  const travelZones = [
    {
      name: 'Local',
      description: 'Within Skopje city area - included free',
      minDistanceKm: 0,
      maxDistanceKm: 15,
      isIncluded: true,
      order: 1,
    },
    {
      name: 'Near Skopje',
      description: '15-50km - nearby towns',
      minDistanceKm: 15,
      maxDistanceKm: 50,
      flatFee: 0,
      perKmRate: 0.15, // 50km = €7.50 one-way, €15 round trip
      order: 2,
    },
    {
      name: 'Regional',
      description: '50-100km - Tetovo, Kumanovo, Veles, Gostivar',
      minDistanceKm: 50,
      maxDistanceKm: 100,
      flatFee: 0,
      perKmRate: 0.15, // 100km = €15 one-way, €30 round trip
      order: 3,
    },
    {
      name: 'Extended',
      description: '100-200km - Shtip, Prilep, Bitola, Ohrid, Strumica',
      minDistanceKm: 100,
      maxDistanceKm: 200,
      flatFee: 0,
      perKmRate: 0.15, // 200km = €30 one-way, €60 round trip
      order: 4,
    },
    {
      name: 'Remote',
      description: 'Over 200km - Tirana, Sofia, Thessaloniki, international',
      minDistanceKm: 200,
      maxDistanceKm: null,
      flatFee: 0,
      perKmRate: 0.12, // Discount for very long trips: 300km = €36 one-way, €72 round trip
      order: 5,
    },
  ]

  await prisma.travelZone.deleteMany({})
  for (const zone of travelZones) {
    await prisma.travelZone.create({ data: zone })
  }
  console.log('✅ Travel zones created')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
