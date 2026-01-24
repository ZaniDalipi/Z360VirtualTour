// Script to generate PWA icons from SVG
// Run with: node scripts/generate-icons.js
// Note: In production, use a proper icon generator like sharp or svg-to-png

const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const iconsDir = path.join(__dirname, '../public/icons')

// Create a simple placeholder PNG-like file for each size
// In production, use a proper image processing library

const createPlaceholderIcon = (size) => {
  // This creates a simple SVG that can be used as a placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#0D1B2A"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.3125}" fill="none" stroke="#C9A962" stroke-width="${size * 0.047}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.156}" fill="none" stroke="#C9A962" stroke-width="${size * 0.031}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.015}" fill="#C9A962"/>
</svg>`

  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg)
  console.log(`Created icon-${size}x${size}.svg`)
}

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Generate icons for all sizes
sizes.forEach(createPlaceholderIcon)

// Create apple touch icon
createPlaceholderIcon(180)
fs.renameSync(
  path.join(iconsDir, 'icon-180x180.svg'),
  path.join(iconsDir, 'apple-touch-icon.svg')
)

// Create favicons
createPlaceholderIcon(32)
fs.renameSync(
  path.join(iconsDir, 'icon-32x32.svg'),
  path.join(iconsDir, 'favicon-32x32.svg')
)

createPlaceholderIcon(16)
fs.renameSync(
  path.join(iconsDir, 'icon-16x16.svg'),
  path.join(iconsDir, 'favicon-16x16.svg')
)

console.log('\nPlaceholder icons generated!')
console.log('For production, replace these with proper PNG icons using a tool like:')
console.log('- sharp (npm package)')
console.log('- realfavicongenerator.net')
console.log('- pwa-asset-generator (npm package)')
