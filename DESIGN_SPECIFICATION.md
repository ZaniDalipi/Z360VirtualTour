# Z360VirtualTours - Complete Design Specification

## App Overview

**Z360VirtualTours** is a premium 360° virtual tour platform for real estate, enabling immersive property exploration with AR capabilities, interactive hotspots, and seamless user experience.

---

## 1. Brand Identity

### App Name
**Z360VirtualTours**

### Tagline
*"Explore Properties Like Never Before"*

### Brand Personality
- Modern & Futuristic
- Professional & Trustworthy
- Immersive & Interactive
- Premium & Sophisticated

---

## 2. Color System

### Official Brand Colors (From Logo)

```
┌─────────────────────────────────────────────────────────────┐
│  Z360 VIRTUAL TOURS - BRAND COLOR PALETTE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ████████  Deep Navy        #0D1B2A  (Primary Background)   │
│  ████████  Warm Cream       #E8DCC4  (Logo, Headlines)      │
│  ████████  Golden Amber     #C9A962  (Accents, Wireframe)   │
│  ████████  Soft Gold        #D4B896  (Secondary Text)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Primary Palette (Dark Theme)

```
Background Colors:
├── Deep Navy:         #0D1B2A (Primary Background - from logo)
├── Navy Dark:         #0A1520 (Card Background)
├── Navy Medium:       #142536 (Elevated Surfaces)
└── Navy Light:        #1C3247 (Input Fields/Borders)

Brand Colors:
├── Warm Cream:        #E8DCC4 (Primary - Logo, Headlines, CTAs)
├── Golden Amber:      #C9A962 (Accent - Highlights, Wireframes)
├── Soft Gold:         #D4B896 (Secondary - Borders, Icons)
└── Gradient Primary:  linear-gradient(135deg, #E8DCC4 0%, #C9A962 100%)

Text Colors:
├── Warm Cream:        #E8DCC4 (Headlines, Primary Text)
├── Soft Cream:        #D4C9B5 (Body Text)
├── Muted Cream:       #9A9082 (Secondary Text, Labels)
└── Dim Cream:         #6B6358 (Placeholder Text, Disabled)

Semantic Colors:
├── Success Green:     #4CAF7A (Verified, Available)
├── Warning Amber:     #C9A962 (Featured, Pending - brand gold)
├── Error Red:         #D45B5B (Errors, Sold)
└── Info Blue:         #5B8FD4 (Information)

360° Tour UI Colors:
├── Hotspot Glow:      rgba(201, 169, 98, 0.6) (Golden glow)
├── AR Overlay:        rgba(232, 220, 196, 0.2) (Cream overlay)
└── Navigation Ring:   rgba(232, 220, 196, 0.15)
└── Wireframe Grid:    rgba(201, 169, 98, 0.4) (Golden mesh)
```

### Logo Specifications
```
Logo Mark:
├── Primary "Z":       Bold serif, Warm Cream #E8DCC4
├── 360° Icon:         Camera/pin shape with circular arrows
├── Icon Fill:         Warm Cream #E8DCC4
└── 360 Text:          Inside circular arrow element

Tagline:
├── Text:              "360 VIRTUAL TOURS"
├── Color:             Warm Cream #E8DCC4
├── Typography:        All caps, wide tracking

Background Elements:
├── Buildings:         Line art, Golden Amber #C9A962 outline
├── Wireframe Grid:    3D mesh terrain, Golden Amber gradient
└── Grid Opacity:      40-60% for depth effect
```

### Glassmorphism Effects
```css
/* Primary Glass Card */
background: rgba(13, 27, 42, 0.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(232, 220, 196, 0.1);

/* Elevated Glass */
background: rgba(20, 37, 54, 0.85);
backdrop-filter: blur(30px);
border: 1px solid rgba(201, 169, 98, 0.15);

/* Golden Accent Glass */
background: rgba(201, 169, 98, 0.1);
backdrop-filter: blur(20px);
border: 1px solid rgba(201, 169, 98, 0.3);
```

---

## 3. Typography

### Font Family
```
Primary:      'SF Pro Display' / 'Inter' (Clean, Modern)
Secondary:    'SF Pro Text' / 'Inter' (Body Text)
Monospace:    'SF Mono' / 'JetBrains Mono' (Data, Stats)
```

### Type Scale
```
Display XL:   48px / 56px line-height / -0.02em tracking (Hero Titles)
Display:      40px / 48px line-height / -0.02em tracking (Section Titles)
H1:           32px / 40px line-height / -0.01em tracking (Page Titles)
H2:           24px / 32px line-height / -0.01em tracking (Card Titles)
H3:           20px / 28px line-height / 0em tracking (Subtitles)
H4:           18px / 24px line-height / 0em tracking (Labels)
Body Large:   16px / 24px line-height / 0em tracking (Primary Body)
Body:         14px / 20px line-height / 0.01em tracking (Secondary Body)
Caption:      12px / 16px line-height / 0.02em tracking (Meta Info)
Overline:     10px / 14px line-height / 0.1em tracking (Tags, Badges)
```

### Font Weights
```
Light:        300 (Large Display Text)
Regular:      400 (Body Text)
Medium:       500 (Buttons, Labels)
Semibold:     600 (Headings, Emphasis)
Bold:         700 (Hero Text, CTAs)
```

---

## 4. Spacing & Layout

### Spacing Scale (8px Base)
```
4xs:    2px
3xs:    4px
2xs:    8px
xs:     12px
sm:     16px
md:     24px
lg:     32px
xl:     48px
2xl:    64px
3xl:    96px
4xl:    128px
```

### Grid System
```
Mobile:     4 columns, 16px gutter, 16px margin
Tablet:     8 columns, 24px gutter, 32px margin
Desktop:    12 columns, 24px gutter, 64px margin
```

### Border Radius
```
xs:     4px  (Tags, Chips)
sm:     8px  (Buttons, Inputs)
md:     12px (Small Cards)
lg:     16px (Cards, Modals)
xl:     24px (Large Cards, Sheets)
2xl:    32px (Feature Cards)
full:   9999px (Pills, Avatars)
```

---

## 5. Screen Designs

### 5.1 Splash Screen
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│        [Z360 Logo Animation]    │
│                                 │
│        ◉ ◉ ◉ (Loading dots)     │
│                                 │
│                                 │
│   "Explore Properties Like      │
│         Never Before"           │
│                                 │
└─────────────────────────────────┘

- Animated logo with 360° rotation effect
- Particle background animation
- Gradient glow pulse
- Duration: 2-3 seconds
```

### 5.2 Onboarding (3 Screens)
```
Screen 1: "Immersive 360° Tours"
┌─────────────────────────────────┐
│                                 │
│   [3D House with 360 sphere]    │
│                                 │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                 │
│    Immersive 360° Tours         │
│                                 │
│   Experience properties from    │
│   every angle with our HD       │
│   virtual walkthroughs          │
│                                 │
│         ● ○ ○                   │
│                                 │
│   [    Next    ] →              │
│                                 │
└─────────────────────────────────┘

Screen 2: "AR Visualization"
- AR furniture placement demo
- Interactive room scanning visual

Screen 3: "Smart Property Search"
- AI-powered search visualization
- Filter cards floating animation
```

### 5.3 Home Screen
```
┌─────────────────────────────────┐
│ ☰                    🔔  👤     │
│                                 │
│  Welcome back, Alex             │
│  Find your dream property       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔍 Search location, price...│ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Filter Chips Row]          │ │
│ │ 🏠 Houses  🏢 Apts  🏡 Villa │ │
│ └─────────────────────────────┘ │
│                                 │
│ Featured Tours 360°      See All│
│ ┌─────────┐ ┌─────────┐        │
│ │ ◉ LIVE  │ │ 🔥 HOT  │        │
│ │ [Image] │ │ [Image] │        │
│ │ $450K   │ │ $320K   │        │
│ │ 3BR 2BA │ │ 2BR 1BA │        │
│ └─────────┘ └─────────┘        │
│                                 │
│ Nearby Properties        See All│
│ ┌───────────────────────────┐   │
│ │ [Map with property pins]  │   │
│ │     📍    📍              │   │
│ │        📍     📍          │   │
│ └───────────────────────────┘   │
│                                 │
│ Recently Viewed          See All│
│ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │     │ │     │ │     │        │
│ └─────┘ └─────┘ └─────┘        │
│                                 │
├─────────────────────────────────┤
│  🏠     🔍     📍     ❤️    👤  │
│ Home  Search  Map   Saved Profile│
└─────────────────────────────────┘
```

### 5.4 Property Listing Screen
```
┌─────────────────────────────────┐
│ ←  Properties     ⚙️ Filters    │
│                                 │
│ 248 properties found            │
│                                 │
│ [Sort: Recommended ▼] [Grid|List]│
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Property Image]        ❤️  │ │
│ │ ┌──────────────────────┐    │ │
│ │ │ 🔴 360° Tour         │    │ │
│ │ └──────────────────────┘    │ │
│ │                             │ │
│ │ Modern Downtown Loft        │ │
│ │ 📍 123 Main St, NYC         │ │
│ │                             │ │
│ │ $425,000                    │ │
│ │                             │ │
│ │ 🛏 3  🚿 2  📐 1,850 sqft   │ │
│ │                             │ │
│ │ [AR View] [Schedule Tour]   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Next Property Card]        │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│  🏠     🔍     📍     ❤️    👤  │
└─────────────────────────────────┘
```

### 5.5 Property Detail Screen
```
┌─────────────────────────────────┐
│ ←                    ❤️  ⬆️     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │    [Hero Property Image]    │ │
│ │                             │ │
│ │   ┌─────────────────────┐   │ │
│ │   │ ▶ Start 360° Tour   │   │ │
│ │   └─────────────────────┘   │ │
│ │                             │ │
│ │   ● ○ ○ ○ (image dots)      │ │
│ └─────────────────────────────┘ │
│                                 │
│ $425,000                        │
│ Modern Downtown Luxury Loft     │
│ 📍 123 Main Street, New York    │
│                                 │
│ ┌───────┬───────┬───────┬─────┐ │
│ │ 🛏 3  │ 🚿 2  │ 📐     │ 🚗  │ │
│ │ Beds  │ Baths │ 1,850  │ 2   │ │
│ │       │       │ sqft   │ Car │ │
│ └───────┴───────┴───────┴─────┘ │
│                                 │
│ Tour Options                    │
│ ┌───────────┐ ┌───────────┐    │
│ │ 🔄 360°   │ │ 📱 AR     │    │
│ │ Virtual   │ │ View      │    │
│ │ Tour      │ │           │    │
│ └───────────┘ └───────────┘    │
│                                 │
│ Description                     │
│ Stunning modern loft featuring  │
│ floor-to-ceiling windows...     │
│ [Read more]                     │
│                                 │
│ Amenities                       │
│ [🏊 Pool] [🏋️ Gym] [🔒 Security]│
│ [🌐 WiFi] [❄️ AC] [🅿️ Parking] │
│                                 │
│ Location                        │
│ ┌─────────────────────────────┐ │
│ │ [Interactive Map]           │ │
│ │        📍                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Agent                           │
│ ┌─────────────────────────────┐ │
│ │ 👤 Sarah Johnson            │ │
│ │ ⭐ 4.9 • 120 reviews        │ │
│ │ [💬 Chat] [📞 Call]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │    [Schedule a Visit]       │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### 5.6 360° Virtual Tour Screen (CORE FEATURE)
```
┌─────────────────────────────────┐
│ ← Exit Tour           ⚙️  ⛶     │
│                                 │
│┌───────────────────────────────┐│
││                               ││
││                               ││
││      [360° Panorama View]     ││
││                               ││
││    ◉ Kitchen                  ││
││         Hotspot               ││
││                   ◉ Bathroom  ││
││                               ││
││              ◉ Bedroom        ││
││                               ││
││                               ││
│└───────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ← 🔄 Gyroscope Mode  → 👆    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Room: Living Room               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Thumbnail Navigation]      │ │
│ │ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │ │
│ │ │LIV│ │KIT│ │BED│ │BAT│    │ │
│ │ │ ● │ │   │ │   │ │   │    │ │
│ │ └───┘ └───┘ └───┘ └───┘    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Floor Plan] [Info] [Share] │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘

Hotspot Popup (When tapped):
┌─────────────────────────────────┐
│   ╭─────────────────────────╮   │
│   │ 🍳 Modern Kitchen       │   │
│   │                         │   │
│   │ • Granite countertops   │   │
│   │ • Stainless appliances  │   │
│   │ • Island with seating   │   │
│   │                         │   │
│   │ [Go to Room] [Details]  │   │
│   ╰─────────────────────────╯   │
└─────────────────────────────────┘
```

### 5.7 AR View Screen
```
┌─────────────────────────────────┐
│ ← AR Mode              💡  📷   │
│                                 │
│┌───────────────────────────────┐│
││                               ││
││   [Camera View with AR        ││
││    Furniture Overlay]         ││
││                               ││
││        ┌─────────┐            ││
││        │ 🛋️ Sofa │            ││
││        └─────────┘            ││
││                               ││
││   [Floor plane detection]     ││
││   ·  ·  ·  ·  ·  ·  ·        ││
││                               ││
│└───────────────────────────────┘│
│                                 │
│ Add Furniture                   │
│ ┌─────────────────────────────┐ │
│ │ 🛋️   🪑   🛏️   📺   🪴     │ │
│ │Sofa Chair Bed  TV  Plant    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📐 Measure Room             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📸 Capture AR Screenshot    │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### 5.8 Search & Filter Screen
```
┌─────────────────────────────────┐
│ ← Filters            [Reset]    │
│                                 │
│ Property Type                   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│ │ 🏠  │ │ 🏢  │ │ 🏡  │ │ 🏘️  ││
│ │House│ │Apt  │ │Villa│ │Town ││
│ │  ●  │ │     │ │     │ │     ││
│ └─────┘ └─────┘ └─────┘ └─────┘│
│                                 │
│ Price Range                     │
│ $50K ───────●────────── $2M     │
│        $200K - $800K            │
│                                 │
│ Bedrooms                        │
│ [Any] [1] [2] [3●] [4] [5+]    │
│                                 │
│ Bathrooms                       │
│ [Any] [1] [2●] [3] [4+]        │
│                                 │
│ Square Footage                  │
│ 500 ────────●───────── 5000     │
│         1000 - 3000 sqft        │
│                                 │
│ Features                        │
│ ┌────────────┐ ┌────────────┐  │
│ │ ☑ 360° Tour│ │ ☐ Pool     │  │
│ └────────────┘ └────────────┘  │
│ ┌────────────┐ ┌────────────┐  │
│ │ ☑ AR View  │ │ ☐ Gym      │  │
│ └────────────┘ └────────────┘  │
│ ┌────────────┐ ┌────────────┐  │
│ │ ☐ Parking  │ │ ☐ Garden   │  │
│ └────────────┘ └────────────┘  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │   Show 248 Properties       │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### 5.9 Map View Screen
```
┌─────────────────────────────────┐
│ ← Map View            🔍  ⚙️    │
│                                 │
│┌───────────────────────────────┐│
││                               ││
││        [Interactive Map]      ││
││                               ││
││    📍$320K        📍$450K     ││
││                               ││
││         📍$280K               ││
││                   📍$520K     ││
││    📍$380K                    ││
││                               ││
││              📍$290K          ││
││                               ││
│└───────────────────────────────┘│
│                                 │
│ ⟨ Property Preview Card ⟩       │
│ ┌─────────────────────────────┐ │
│ │ [Img] Modern Loft  $450K    │ │
│ │       3 🛏  2 🚿  360°      │ │
│ │       [View Details]        │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│  🏠     🔍     📍     ❤️    👤  │
└─────────────────────────────────┘
```

### 5.10 Saved/Favorites Screen
```
┌─────────────────────────────────┐
│ Saved Properties               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Collections ▼               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌───────────┐ ┌───────────┐    │
│ │ 💜 All    │ │ 🏠 Houses │    │
│ │   12      │ │    5      │    │
│ └───────────┘ └───────────┘    │
│ ┌───────────┐ ┌───────────┐    │
│ │ 🏢 Apts   │ │ ⭐ Top    │    │
│ │    7      │ │    3      │    │
│ └───────────┘ └───────────┘    │
│                                 │
│ Recently Saved                  │
│ ┌─────────────────────────────┐ │
│ │ [Property Card with 360°    │ │
│ │  badge and heart filled]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Property Card]             │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│  🏠     🔍     📍     ❤️    👤  │
└─────────────────────────────────┘
```

### 5.11 User Profile Screen
```
┌─────────────────────────────────┐
│ Profile                    ⚙️   │
│                                 │
│         ┌─────────┐             │
│         │  👤     │             │
│         │ Avatar  │             │
│         └─────────┘             │
│         Alex Johnson            │
│         alex@email.com          │
│                                 │
│ ┌─────────┬─────────┬─────────┐ │
│ │   12    │   48    │   5     │ │
│ │ Saved   │ Toured  │ Visited │ │
│ └─────────┴─────────┴─────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📋 My Tour History      →   │ │
│ ├─────────────────────────────┤ │
│ │ 📅 Scheduled Visits     →   │ │
│ ├─────────────────────────────┤ │
│ │ 🔔 Notifications        →   │ │
│ ├─────────────────────────────┤ │
│ │ 🎨 Appearance           →   │ │
│ ├─────────────────────────────┤ │
│ │ 🔒 Privacy & Security   →   │ │
│ ├─────────────────────────────┤ │
│ │ ❓ Help & Support       →   │ │
│ ├─────────────────────────────┤ │
│ │ 📄 Terms & Privacy      →   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      [Sign Out]             │ │
│ └─────────────────────────────┘ │
│                                 │
│         v2.0.0                  │
│                                 │
├─────────────────────────────────┤
│  🏠     🔍     📍     ❤️    👤  │
└─────────────────────────────────┘
```

### 5.12 Schedule Tour Screen
```
┌─────────────────────────────────┐
│ ← Schedule Visit                │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Property Mini Card]        │ │
│ │ Modern Loft • $450,000      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Select Tour Type                │
│ ┌───────────────────────────┐   │
│ │ 🔄 Virtual Tour (Online)  │   │
│ │    Live video walkthrough │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ 🏠 In-Person Visit    ●   │   │
│ │    Visit the property     │   │
│ └───────────────────────────┘   │
│                                 │
│ Select Date                     │
│ ┌─────────────────────────────┐ │
│ │    < December 2024 >        │ │
│ │ Su Mo Tu We Th Fr Sa        │ │
│ │  1  2  3  4  5  6  7        │ │
│ │  8  9 10 11 12 13 14        │ │
│ │ 15 16[17]18 19 20 21        │ │
│ │ 22 23 24 25 26 27 28        │ │
│ │ 29 30 31                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Available Times                 │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │10:00 │ │11:30●│ │14:00 │     │
│ │  AM  │ │  AM  │ │  PM  │     │
│ └──────┘ └──────┘ └──────┘     │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │15:30 │ │17:00 │ │18:30 │     │
│ │  PM  │ │  PM  │ │  PM  │     │
│ └──────┘ └──────┘ └──────┘     │
│                                 │
│ Add Note (Optional)             │
│ ┌─────────────────────────────┐ │
│ │ I'm interested in...        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │   [Confirm Booking]         │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

---

## 6. UI Components

### 6.1 Buttons

#### Primary Button
```
┌─────────────────────────────────┐
│         Start 360° Tour         │
└─────────────────────────────────┘
- Background: Warm Cream #E8DCC4 (solid) or Gradient (#E8DCC4 → #C9A962)
- Text: Deep Navy #0D1B2A, Semibold, 16px
- Height: 56px
- Border Radius: 12px
- Shadow: 0 8px 32px rgba(201, 169, 98, 0.3)
- Hover: Scale 1.02, golden glow effect
- Active: Scale 0.98, darker cream #D4C9B5
```

#### Secondary Button (Outline)
```
┌─────────────────────────────────┐
│           AR View               │
└─────────────────────────────────┘
- Background: transparent
- Border: 1.5px solid rgba(232, 220, 196, 0.4)
- Text: Warm Cream #E8DCC4, Medium, 16px
- Height: 56px
- Border Radius: 12px
- Hover: Border #C9A962, background rgba(201, 169, 98, 0.1)
```

#### Icon Button
```
┌─────┐
│  ❤️  │
└─────┘
- Size: 48px × 48px
- Background: rgba(232, 220, 196, 0.08)
- Border: 1px solid rgba(232, 220, 196, 0.15)
- Icon Color: Warm Cream #E8DCC4
- Border Radius: 12px
- Active: Golden Amber #C9A962
```

### 6.2 Cards

#### Property Card
```
┌─────────────────────────────────┐
│ [Property Image]            ❤️  │
│ ┌────────────────┐              │
│ │ 🔴 360° Tour   │              │
│ └────────────────┘              │
├─────────────────────────────────┤
│ Modern Downtown Loft            │
│ 📍 123 Main St, NYC             │
│                                 │
│ $425,000                        │
│                                 │
│ 🛏 3  •  🚿 2  •  📐 1,850 sqft │
└─────────────────────────────────┘

- Background: Navy Dark #0A1520
- Border: 1px solid rgba(201, 169, 98, 0.1)
- Border Radius: 16px
- Image Radius: 16px 16px 0 0
- Padding: 16px
- Shadow: 0 4px 24px rgba(0, 0, 0, 0.5)
- Title: Warm Cream #E8DCC4
- Price: Golden Amber #C9A962
- Meta: Soft Cream #D4C9B5
```

#### Feature Card (Tour Options)
```
┌─────────────────┐
│      🔄        │
│                 │
│  360° Virtual   │
│     Tour        │
│                 │
│  View property  │
│  in 360°        │
└─────────────────┘

- Background: rgba(20, 37, 54, 0.6)
- Border: 1px solid rgba(201, 169, 98, 0.25)
- Border Radius: 16px
- Icon: Golden Amber #C9A962
- Title: Warm Cream #E8DCC4
- Description: Soft Cream #D4C9B5
- Hover: Border glow with golden amber
```

### 6.3 Input Fields
```
┌─────────────────────────────────┐
│ 🔍  Search location, price...   │
└─────────────────────────────────┘

- Background: Navy Medium #142536
- Border: 1px solid rgba(232, 220, 196, 0.15)
- Focus Border: Golden Amber #C9A962
- Height: 52px
- Border Radius: 12px
- Text: Warm Cream #E8DCC4
- Placeholder: Dim Cream #6B6358
- Icon: Soft Gold #D4B896
```

### 6.4 Chips/Tags
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 🏠 Houses│  │ 🏢 Apts  │  │ 🏡 Villas│
└──────────┘  └──────────┘  └──────────┘

- Active: Background Warm Cream #E8DCC4, Text Deep Navy #0D1B2A
- Inactive: Background Navy Medium #142536, Text Soft Cream #D4C9B5
- Inactive Border: 1px solid rgba(232, 220, 196, 0.2)
- Height: 36px
- Border Radius: 18px (pill)
- Padding: 0 16px
```

### 6.5 360° Tour Hotspots
```
       ╭─────╮
       │  ◉  │  ← Pulsing golden glow animation
       ╰─────╯

- Size: 32px
- Background: rgba(201, 169, 98, 0.25)
- Border: 2px solid Golden Amber #C9A962
- Glow: 0 0 20px rgba(201, 169, 98, 0.6)
- Animation: Pulse scale 1.0 → 1.2
- On Hover: Expand to show label
- Label Background: Navy Dark #0A1520
- Label Text: Warm Cream #E8DCC4
```

### 6.6 Navigation Bar
```
├─────────────────────────────────┤
│  🏠     🔍     📍     ❤️    👤  │
│ Home  Search  Map   Saved Profile│
└─────────────────────────────────┘

- Background: Navy Dark #0A1520
- Height: 84px (including safe area)
- Active Icon: Warm Cream #E8DCC4
- Active Label: Warm Cream #E8DCC4
- Inactive Icon: Muted Cream #9A9082
- Border Top: 1px solid rgba(201, 169, 98, 0.15)
```

### 6.7 Bottom Sheet
```
┌─────────────────────────────────┐
│            ───────              │ ← Drag indicator
│                                 │
│  [Content]                      │
│                                 │
│                                 │
└─────────────────────────────────┘

- Background: Navy Medium #142536
- Border Radius: 24px 24px 0 0
- Border Top: 1px solid rgba(201, 169, 98, 0.2)
- Drag Indicator: 40px × 4px, Soft Gold #D4B896
- Backdrop: Deep Navy 70% opacity
```

---

## 7. Animations & Micro-interactions

### 7.1 Page Transitions
```
- Type: Shared Element Transition
- Duration: 300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Property cards expand into detail view
- Images scale and reposition smoothly
```

### 7.2 360° Tour Interactions
```
- Pan: Smooth inertia-based scrolling
- Zoom: Pinch gesture with elastic boundaries
- Hotspot Tap: Scale up 1.2x, show info card
- Room Transition: Cross-fade with subtle zoom
- Gyroscope: Real-time orientation mapping
```

### 7.3 Button Interactions
```
- Hover: Transform scale(1.02), shadow increase
- Active: Transform scale(0.98)
- Loading: Gradient animation shimmer
- Success: Checkmark icon morph + confetti
```

### 7.4 Card Interactions
```
- Scroll: Parallax depth effect
- Tap: Ripple effect from touch point
- Long Press: Context menu spring animation
- Swipe: Rubber band effect at boundaries
```

### 7.5 Skeleton Loading
```
┌─────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
├─────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░               │
│ ░░░░░░░░░░░░                   │
│ ░░░░░░░░░░░░░░░░░░░            │
└─────────────────────────────────┘

- Shimmer animation: left to right gradient
- Base Color: Navy Medium #142536
- Shimmer Color: Navy Light #1C3247 with golden tint
- Gradient: #142536 → rgba(201, 169, 98, 0.1) → #142536
- Duration: 1.5s infinite
```

---

## 8. Iconography

### Icon Style
- **Type**: Outlined, 2px stroke weight
- **Size**: 24px (standard), 20px (small), 28px (large)
- **Corner Radius**: 2px on sharp corners
- **Style**: Consistent with SF Symbols / Material Icons

### Core Icons
```
Navigation:
🏠 Home         - House outline
🔍 Search       - Magnifying glass
📍 Map          - Location pin
❤️ Saved        - Heart outline/filled
👤 Profile      - User circle

Property:
🛏 Bedrooms     - Bed outline
🚿 Bathrooms    - Shower/Bath
📐 Area         - Square/Ruler
🚗 Parking      - Car outline

Features:
🔄 360° Tour    - Circular arrows
📱 AR View      - Phone with AR corners
🏊 Pool         - Wave/Pool
🏋️ Gym          - Dumbbell
🔒 Security     - Shield/Lock
🌐 WiFi         - Wifi signal
❄️ AC           - Snowflake
🅿️ Parking      - P in square

Actions:
← Back          - Chevron left
→ Forward       - Chevron right
⚙️ Settings     - Gear
🔔 Notifications- Bell
⬆️ Share        - Arrow up from box
⛶ Fullscreen   - Expand arrows
```

---

## 9. 360° Tour Technical Specifications

### Image Requirements
```
Resolution:     8192 × 4096px (8K) recommended
                4096 × 2048px (4K) minimum
Format:         JPEG (quality 85-95%)
                WebP for web (30% smaller)
Projection:     Equirectangular
File Size:      < 5MB per panorama (optimized)
HDR:            Optional, tone-mapped preview
```

### Hotspot System
```
Data Structure:
{
  id: "hotspot_001",
  type: "navigation" | "info" | "media",
  position: { pitch: -10, yaw: 45 },
  target: "room_kitchen",
  label: "Kitchen",
  icon: "kitchen",
  description: "Modern kitchen with...",
  media: ["image.jpg", "video.mp4"]
}
```

### Navigation Types
```
1. Click/Tap Navigation
   - Hotspot click to move between rooms
   - Double-tap to zoom

2. Swipe/Drag Navigation
   - 360° horizontal pan
   - Limited vertical tilt (±85°)

3. Gyroscope Mode
   - Device orientation mapping
   - Smooth interpolation
   - Calibration reset option

4. Thumbnail Navigation
   - Room thumbnail strip
   - Instant room switching
   - Progress indicator
```

### Performance Targets
```
Initial Load:       < 3 seconds
Room Transition:    < 500ms
Frame Rate:         60 FPS
Memory Usage:       < 200MB
Offline Support:    Progressive caching
```

---

## 10. AR Features Specification

### AR Capabilities
```
1. Furniture Placement
   - 3D model library
   - Scale adjustment
   - Rotation controls
   - Shadow rendering

2. Room Measurement
   - Point-to-point distance
   - Area calculation
   - Height measurement
   - Export measurements

3. Virtual Staging
   - Pre-designed room sets
   - Style categories
   - Before/after comparison

4. Live Filters
   - Wall color preview
   - Flooring preview
   - Lighting simulation
```

### Technical Requirements
```
Platform:       ARKit (iOS) / ARCore (Android)
Min Device:     iPhone 6s+ / Android with ARCore
Tracking:       6DOF (Six Degrees of Freedom)
Plane Detection: Horizontal & Vertical
Light Estimation: Enabled
Occlusion:      LiDAR devices (optional)
```

---

## 11. Accessibility (a11y)

### Standards
- WCAG 2.1 AA compliance
- iOS/Android native accessibility APIs

### Requirements
```
Color Contrast:     4.5:1 minimum (text)
                    3:1 minimum (large text, icons)

Touch Targets:      44 × 44pt minimum

Screen Readers:     Full VoiceOver/TalkBack support
                    Meaningful alt text for images
                    Logical focus order

Motion:             Respect "Reduce Motion" setting
                    Provide static alternatives

Text Scaling:       Support Dynamic Type (iOS)
                    Up to 200% scaling
```

---

## 12. Responsive Breakpoints

```
Mobile S:       320px   (iPhone SE)
Mobile M:       375px   (iPhone 12/13/14)
Mobile L:       428px   (iPhone 14 Pro Max)
Tablet:         768px   (iPad Mini)
Tablet L:       1024px  (iPad Pro 11")
Desktop:        1280px+ (Web version)
```

---

## 13. Design File Structure

```
Z360VirtualTours/
├── Design/
│   ├── Figma/
│   │   ├── Z360_Design_System.fig
│   │   ├── Z360_Mobile_Screens.fig
│   │   └── Z360_Prototypes.fig
│   ├── Assets/
│   │   ├── Icons/
│   │   │   ├── SVG/
│   │   │   └── PNG/
│   │   ├── Images/
│   │   │   ├── Onboarding/
│   │   │   ├── Placeholders/
│   │   │   └── Marketing/
│   │   └── Animations/
│   │       ├── Lottie/
│   │       └── Rive/
│   └── Exports/
│       ├── iOS/
│       │   ├── @1x/
│       │   ├── @2x/
│       │   └── @3x/
│       └── Android/
│           ├── mdpi/
│           ├── hdpi/
│           ├── xhdpi/
│           ├── xxhdpi/
│           └── xxxhdpi/
├── Documentation/
│   ├── DESIGN_SPECIFICATION.md
│   ├── COMPONENT_LIBRARY.md
│   └── STYLE_GUIDE.md
└── Prototypes/
    ├── Flows/
    └── Demos/
```

---

## 14. Implementation Tech Stack (Recommended)

### Mobile App
```
Framework:      React Native / Flutter
360° Viewer:    react-360 / panorama-viewer
AR Engine:      ViroReact / ARCore/ARKit
Maps:           Mapbox / Google Maps
State:          Redux / Riverpod
Navigation:     React Navigation / GoRouter
```

### Backend
```
API:            Node.js / Python FastAPI
Database:       PostgreSQL + Redis
Storage:        AWS S3 / Cloudflare R2
CDN:            CloudFront / Cloudflare
Auth:           Firebase Auth / Auth0
```

### 360° Processing
```
Stitching:      PTGui / Hugin
Optimization:   Sharp.js / ImageMagick
Streaming:      Adaptive tile loading
```

---

## 15. Design Checklist

### Pre-Development
- [ ] Design system finalized in Figma
- [ ] All screens designed at 375px width
- [ ] Component library documented
- [ ] Icon set complete (all states)
- [ ] Color palette tested for accessibility
- [ ] Typography scale responsive tested
- [ ] Animation prototypes approved
- [ ] 360° viewer UX flow validated

### Handoff Ready
- [ ] All assets exported (1x, 2x, 3x)
- [ ] Spacing/sizing specs annotated
- [ ] Interactive prototype linked
- [ ] Edge cases designed (empty states, errors)
- [ ] Loading states designed
- [ ] Dark mode variations complete
- [ ] Accessibility audit passed

---

## 16. Key User Flows

### Flow 1: Property Discovery → 360° Tour
```
Home → Search/Filter → Property List → Property Detail → Start 360° Tour → Navigate Rooms → View Hotspots → Exit/Schedule Visit
```

### Flow 2: AR Furniture Preview
```
Property Detail → AR View → Detect Floor → Browse Furniture → Place Item → Adjust Position → Capture Screenshot → Save/Share
```

### Flow 3: Schedule Visit
```
Property Detail → Schedule Tour → Select Type → Pick Date → Pick Time → Add Note → Confirm → Confirmation Screen
```

---

*This design specification serves as the complete blueprint for building Z360VirtualTours. Follow these guidelines to create a cohesive, premium, and immersive real estate virtual tour experience.*

---

**Version:** 1.1.0
**Last Updated:** December 2024
**Author:** Z360VirtualTours Design Team

---

## Appendix: Quick Color Reference

```
┌─────────────────────────────────────────────────────────────┐
│  Z360 VIRTUAL TOURS - QUICK COLOR REFERENCE                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BACKGROUNDS                                                │
│  ─────────────────────────────────────────────────          │
│  #0D1B2A  Deep Navy      Primary background                 │
│  #0A1520  Navy Dark      Cards, navigation                  │
│  #142536  Navy Medium    Elevated surfaces, inputs          │
│  #1C3247  Navy Light     Borders, dividers                  │
│                                                             │
│  BRAND                                                      │
│  ─────────────────────────────────────────────────          │
│  #E8DCC4  Warm Cream     Logo, headlines, primary CTAs      │
│  #C9A962  Golden Amber   Accents, hotspots, highlights      │
│  #D4B896  Soft Gold      Secondary icons, borders           │
│                                                             │
│  TEXT                                                       │
│  ─────────────────────────────────────────────────          │
│  #E8DCC4  Warm Cream     Headlines, primary text            │
│  #D4C9B5  Soft Cream     Body text                          │
│  #9A9082  Muted Cream    Secondary text, labels             │
│  #6B6358  Dim Cream      Placeholders, disabled             │
│                                                             │
│  SEMANTIC                                                   │
│  ─────────────────────────────────────────────────          │
│  #4CAF7A  Success Green  Available, verified                │
│  #C9A962  Warning Amber  Featured, pending (brand gold)     │
│  #D45B5B  Error Red      Errors, sold                       │
│  #5B8FD4  Info Blue      Information                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
