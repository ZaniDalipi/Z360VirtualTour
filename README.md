# Z360 Virtual Tours

A premium 360° virtual tour platform for real estate, built with Next.js, React, and Tailwind CSS.

## Features

- **Immersive 360° Tours**: Experience properties from every angle with interactive panorama views
- **Interactive Hotspots**: Navigate between rooms and view property details
- **Property Listings**: Browse, search, and filter available properties
- **Modern UI**: Dark theme with warm cream and golden amber accents
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **AR Ready**: Foundation for augmented reality features

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:4000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Home page
│   ├── search/          # Property search
│   ├── property/[id]/   # Property details
│   ├── tour/[id]/       # 360° virtual tour
│   ├── map/             # Map view
│   ├── saved/           # Saved properties
│   └── profile/         # User profile
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   ├── property/        # Property-related components
│   └── tour/            # 360° tour components
├── data/                # Sample property data
├── lib/                 # Utility functions
└── types/               # TypeScript types
```

## Design System

The app follows a comprehensive design specification with:

- **Colors**: Deep Navy (#0D1B2A) background with Warm Cream (#E8DCC4) and Golden Amber (#C9A962) accents
- **Typography**: Inter font family with a complete type scale
- **Spacing**: 8px base unit system
- **Components**: Buttons, cards, inputs, chips, badges, and more

See `DESIGN_SPECIFICATION.md` for the complete design system documentation.

## Key Pages

1. **Home**: Featured properties, quick actions, and property grid
2. **Search**: Filter and browse properties with grid/list views
3. **Property Detail**: Full property info, amenities, agent contact
4. **360° Tour**: Interactive panorama viewer with room navigation
5. **Map View**: Geographic property exploration
6. **Saved**: Favorite properties organized by collections
7. **Profile**: User settings and preferences

## License

MIT
