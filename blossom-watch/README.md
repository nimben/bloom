# 🌸 Blossom Watch

A fully responsive, dynamic 3D web application that showcases the beauty of nature's blooming seasons around the world. Built with React, Three.js, Framer Motion, Tailwind CSS, and React-Leaflet.

## ✨ Features

### 🏠 Hero Section
- **3D Animated Scene**: Interactive 3D blossom flowers using React Three Fiber
- **Dynamic Title**: "Blossom Watch" with gradient text effects
- **Soft Pastel Background**: Beautiful gradient backgrounds
- **Scroll Indicator**: Animated arrow to guide users to the next section
- **3D Flower Cursor**: Custom cursor that follows mouse movement with 3D flowers

### 🗺️ Interactive World Map
- **React-Leaflet Integration**: Responsive world map with OpenStreetMap tiles
- **Click Interactions**: Tap or click locations to trigger animated bloom effects
- **Bloom Effects**: 3D flower animations that appear on screen when interacting
- **Location Details**: Popup panels showing region info, bloom intensity, and NDVI index
- **Sample Data**: Pre-populated with beautiful blooming locations worldwide

### 📅 Seasonal Timeline
- **Horizontal Scrolling**: Smooth scrollable timeline with Framer Motion animations
- **Season Cards**: Beautiful cards for Spring, Summer, Autumn, and Winter
- **Seasonal Features**: Each season displays relevant blooming flowers and information
- **Parallax Effects**: Floating decorative elements with scroll-based animations
- **Statistics**: Season overview with bloom counts and information

### 💬 Interactive Features
- **Floating Chat**: Fixed chat icon opens an interactive flower guide
- **Subscribe Modal**: Email subscription form with beautiful animations
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices

## 🛠️ Technologies Used

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Three.js / React Three Fiber** - 3D graphics and animations
- **React Three Drei** - Useful helpers for React Three Fiber
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS** - Utility-first CSS framework
- **React-Leaflet** - Interactive maps
- **Leaflet** - Mobile-friendly interactive maps

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blossom-watch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎨 Design Features

### Color Palette
- **Blossom Pink**: `#FFB6C1` - Primary floral color
- **Floral Rose**: `#FF69B4` - Accent color
- **Blossom Purple**: `#DDA0DD` - Secondary accent
- **Blossom Green**: `#98FB98` - Natural green tones
- **Blossom Blue**: `#87CEEB` - Sky blue accents

### Typography
- **Font**: Inter (Google Fonts)
- **Responsive**: Scales beautifully across all device sizes

### Animations
- **Framer Motion**: Smooth page transitions and scroll animations
- **3D Effects**: Interactive 3D flowers and cursor
- **Hover Effects**: Subtle animations on interactive elements
- **Parallax**: Scroll-based floating elements

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px - 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+

All components adapt seamlessly to different screen sizes with:
- Responsive typography scaling
- Flexible grid layouts
- Touch-friendly interactions
- Optimized 3D performance

## 🌍 Map Features

### Interactive Elements
- **Click to Explore**: Click anywhere on the map to discover blooming locations
- **Bloom Effects**: Animated flower effects appear on interaction
- **Location Data**: Detailed information about each blooming location
- **Sample Locations**: Pre-populated with beautiful destinations worldwide

### Sample Locations
- Tokyo, Japan - Cherry blossoms
- San Francisco, USA - Wildflowers
- London, UK - Bluebell woods
- Sydney, Australia - Native wildflowers
- Paris, France - Magnolias and cherry trees

## 🎯 Performance Optimizations

- **Lazy Loading**: Components load as needed
- **Optimized 3D**: Efficient Three.js rendering
- **Smooth Animations**: 60fps animations with Framer Motion
- **Responsive Images**: Optimized for different screen sizes
- **Code Splitting**: Efficient bundle splitting with Vite

## 🔧 Customization

### Adding New Locations
Edit `src/components/WorldMapSection.jsx` and add new locations to the `bloomLocations` array:

```javascript
{
  id: 6,
  position: [latitude, longitude],
  name: "Location Name",
  intensity: "High/Medium/Low",
  ndvi: 0.85,
  season: "Spring/Summer/Autumn/Winter",
  description: "Description of the location"
}
```

### Customizing Colors
Update the color palette in `tailwind.config.js`:

```javascript
colors: {
  blossom: {
    pink: '#YourColor',
    // ... other colors
  }
}
```

### Adding New Seasons
Modify the `seasons` array in `src/components/TimelineSection.jsx` to add custom seasonal information.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- **Three.js Community** - For amazing 3D graphics tools
- **Framer Motion** - For smooth animations
- **React-Leaflet** - For interactive maps
- **Tailwind CSS** - For beautiful styling utilities

---

Made with ❤️ and 🌸 for nature lovers everywhere!