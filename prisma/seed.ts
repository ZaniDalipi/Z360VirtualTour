import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@z360.com' },
    update: {},
    create: {
      email: 'admin@z360.com',
      password: adminPassword,
      name: 'Z360 Admin',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Create Categories
  const categories = [
    { name: 'Real Estate', slug: 'real-estate', description: 'Property and real estate virtual tours', icon: 'Home', order: 1 },
    { name: 'Business', slug: 'business', description: 'Business and office space tours', icon: 'Building2', order: 2 },
    { name: 'Hospitality', slug: 'hospitality', description: 'Hotels, restaurants, and hospitality tours', icon: 'Hotel', order: 3 },
    { name: 'Automotive', slug: 'automotive', description: 'Car showrooms and automotive tours', icon: 'Car', order: 4 },
    { name: 'Education', slug: 'education', description: 'Schools, universities, and educational facilities', icon: 'GraduationCap', order: 5 },
    { name: 'Healthcare', slug: 'healthcare', description: 'Medical facilities and healthcare centers', icon: 'Heart', order: 6 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  console.log('✅ Categories created:', categories.length)

  // Get category IDs
  const realEstate = await prisma.category.findUnique({ where: { slug: 'real-estate' } })
  const business = await prisma.category.findUnique({ where: { slug: 'business' } })
  const hospitality = await prisma.category.findUnique({ where: { slug: 'hospitality' } })

  if (!realEstate || !business || !hospitality) {
    throw new Error('Failed to create categories')
  }

  // Create Sample Tours
  const tours = [
    {
      title: 'Luxury Apartment in Skopje Center',
      slug: 'luxury-apartment-skopje-center',
      description: 'A stunning 150sqm luxury apartment in the heart of Skopje. Features modern design, panoramic city views, and premium finishes throughout. Perfect for those seeking urban elegance.',
      shortDesc: 'Modern luxury living in downtown Skopje',
      clientName: 'Premium Properties MK',
      location: 'Skopje, Macedonia',
      coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      tourUrl: 'https://kuula.co/share/collection/7qkbC',
      categoryId: realEstate.id,
      featured: true,
      views: 245,
    },
    {
      title: 'Boutique Hotel Lake Ohrid',
      slug: 'boutique-hotel-lake-ohrid',
      description: 'Charming boutique hotel overlooking the beautiful Lake Ohrid. Experience traditional Macedonian hospitality combined with modern amenities and breathtaking views.',
      shortDesc: 'Lakeside luxury with stunning views',
      clientName: 'Hotel Ohrid Palace',
      location: 'Ohrid, Macedonia',
      coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      tourUrl: 'https://kuula.co/share/collection/7qkbC',
      categoryId: hospitality.id,
      featured: true,
      views: 189,
    },
    {
      title: 'Modern Office Space Business Park',
      slug: 'modern-office-business-park',
      description: 'State-of-the-art office space in Skopje Business Park. Open plan layout with meeting rooms, break areas, and all modern amenities for productive work environment.',
      shortDesc: 'Premium workspace for modern businesses',
      clientName: 'Skopje Business Park',
      location: 'Skopje, Macedonia',
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      tourUrl: 'https://kuula.co/share/collection/7qkbC',
      categoryId: business.id,
      featured: true,
      views: 156,
    },
    {
      title: 'Villa with Pool - Bitola',
      slug: 'villa-pool-bitola',
      description: 'Beautiful family villa with private pool in the suburbs of Bitola. Spacious 4-bedroom home with garden, garage, and outdoor entertainment area.',
      shortDesc: 'Family villa with private pool',
      clientName: 'Bitola Real Estate',
      location: 'Bitola, Macedonia',
      coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      tourUrl: 'https://kuula.co/share/collection/7qkbC',
      categoryId: realEstate.id,
      featured: false,
      views: 98,
    },
    {
      title: 'Restaurant & Wine Bar',
      slug: 'restaurant-wine-bar-skopje',
      description: 'Elegant restaurant and wine bar in Skopje Old Bazaar. Authentic Macedonian cuisine with extensive wine selection in a beautifully restored historic building.',
      shortDesc: 'Fine dining in historic setting',
      clientName: 'Vino & Gusto',
      location: 'Skopje, Macedonia',
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      tourUrl: 'https://kuula.co/share/collection/7qkbC',
      categoryId: hospitality.id,
      featured: true,
      views: 134,
    },
    {
      title: 'Coworking Space Downtown',
      slug: 'coworking-space-downtown',
      description: 'Modern coworking space with hot desks, private offices, and meeting rooms. High-speed internet, 24/7 access, and vibrant community of entrepreneurs.',
      shortDesc: 'Flexible workspace for entrepreneurs',
      clientName: 'WorkHub Skopje',
      location: 'Skopje, Macedonia',
      coverImage: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800',
      tourUrl: 'https://kuula.co/share/collection/7qkbC',
      categoryId: business.id,
      featured: false,
      views: 87,
    },
  ]

  for (const tour of tours) {
    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: tour,
      create: tour,
    })
  }
  console.log('✅ Tours created:', tours.length)

  // Create Sample Testimonials
  const testimonials = [
    {
      clientName: 'Marko Petrovski',
      clientTitle: 'CEO, Premium Properties MK',
      content: 'Z360 Virtual Tours transformed how we showcase our properties. Our listings with virtual tours get 3x more inquiries than those without. Highly recommended!',
      rating: 5,
      featured: true,
    },
    {
      clientName: 'Elena Dimova',
      clientTitle: 'Hotel Manager, Hotel Ohrid Palace',
      content: 'The virtual tour of our hotel has been incredible for attracting international guests. Guests can explore our property before booking, which has significantly increased our conversion rate.',
      rating: 5,
      featured: true,
    },
    {
      clientName: 'Stefan Angelovski',
      clientTitle: 'Business Development, Skopje Business Park',
      content: 'Professional service from start to finish. The team was punctual, efficient, and delivered exceptional quality. Our office space tour has been viewed thousands of times.',
      rating: 5,
      featured: true,
    },
  ]

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { clientName: testimonial.clientName },
    })
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial })
    }
  }
  console.log('✅ Testimonials created:', testimonials.length)

  // Create Pricing Plans
  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Perfect for small spaces and single rooms',
      price: 99,
      priceLabel: 'Starting at',
      features: JSON.stringify([
        'Up to 5 panoramic scenes',
        'Basic navigation hotspots',
        'Mobile-friendly tour',
        'Social sharing links',
        '30-day delivery',
        'Email support',
      ]),
      isPopular: false,
      order: 1,
    },
    {
      name: 'Professional',
      description: 'Ideal for homes, offices, and retail spaces',
      price: 249,
      priceLabel: 'Starting at',
      features: JSON.stringify([
        'Up to 15 panoramic scenes',
        'Interactive hotspots & info cards',
        'Custom branding & colors',
        'Lead capture forms',
        '14-day delivery',
        'Priority support',
        'Google Street View publishing',
        'Analytics dashboard',
      ]),
      isPopular: true,
      order: 2,
    },
    {
      name: 'Enterprise',
      description: 'For large properties and ongoing needs',
      price: 0,
      priceLabel: 'Contact us',
      features: JSON.stringify([
        'Unlimited panoramic scenes',
        'Advanced interactive features',
        'Full white-label solution',
        'API access & integrations',
        'Rush delivery available',
        '24/7 premium support',
        'Dedicated account manager',
        'Custom development',
      ]),
      isPopular: false,
      order: 3,
    },
  ]

  for (const plan of pricingPlans) {
    const existing = await prisma.pricingPlan.findFirst({
      where: { name: plan.name },
    })
    if (!existing) {
      await prisma.pricingPlan.create({ data: plan })
    }
  }
  console.log('✅ Pricing plans created:', pricingPlans.length)

  // Create Booking Settings (singleton)
  await prisma.bookingSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessCity: 'Skopje',
      sameCityDiscountPercent: 15,
      sameCityMaxDistanceKm: 40,
      defaultMinLeadDays: 3,
      maxAdvanceBookingDays: 90,
      depositPercent: 30,
    },
  })
  console.log('✅ Booking settings created')

  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('Admin Login:')
  console.log('  Email: admin@z360.com')
  console.log('  Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
