# Z360 Virtual Tours

A premium 360° virtual tour platform for businesses, built with Next.js, Prisma, and Tailwind CSS.

## Features

- **Immersive 360° Tours**: Showcase spaces with interactive panorama views
- **Admin Panel**: Manage tours, categories, testimonials, and pricing
- **Public Portfolio**: Display your virtual tours by category
- **Contact Forms**: Receive inquiries from potential clients
- **Modern UI**: Dark navy theme with warm cream and golden amber accents
- **Responsive Design**: Optimized for mobile, tablet, and desktop

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Prisma ORM with SQLite
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: JWT with jose
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Generate Prisma client
npx prisma generate

# 4. Create database and run migrations
npx prisma db push

# 5. Seed the database with sample data
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Admin Panel

Access the admin panel at [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

**Default credentials:**
- Email: `z360virtualtours@gmail.com`
- Password: `Z360Tours@2024!Secure`

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home page
│   ├── tours/              # Tour portfolio
│   ├── about/              # About page
│   ├── pricing/            # Pricing page
│   ├── contact/            # Contact form
│   ├── admin/              # Admin panel pages
│   │   ├── login/          # Admin login
│   │   ├── tours/          # Manage tours
│   │   ├── categories/     # Manage categories
│   │   ├── testimonials/   # Manage testimonials
│   │   └── settings/       # Site settings
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Layout components
│   └── admin/              # Admin-specific components
├── lib/                    # Utility functions
└── types/                  # TypeScript types
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seeding script
public/
└── images/                 # Logo and images
    ├── logo-mobile.png     # Mobile/vertical logo
    └── logo-desktop.png    # Desktop/horizontal logo
```

## Design System

The app follows a comprehensive design specification with:

- **Colors**: Deep Navy (#0D1B2A) background with Warm Cream (#E8DCC4) and Golden Amber (#C9A962) accents
- **Typography**: Inter font family with a complete type scale
- **Spacing**: 8px base unit system
- **Components**: Buttons, cards, inputs, and more

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL`: Database connection string (SQLite file path)
- `JWT_SECRET`: Secret key for JWT authentication
- `ADMIN_EMAIL`: Default admin email
- `ADMIN_PASSWORD`: Default admin password

## License

MIT
