# Keystone GeoResponse

A modern web platform that visually displays a searchable database of First Responders across India (Police, Fire, Ambulance, etc.) plotted on an interactive map.

## Features

### User View
- **Interactive Map**: Full-featured map of India with zoom, pan, and location controls
- **Advanced Filters**: Filter by Title, Category, City, and State
- **Info Cards**: Click any pin to see detailed information with Call, Website, and Directions buttons
- **My Location**: Jump to your current location with one click
- **Responsive Design**: Fully responsive layout that works on all devices

### Admin Dashboard
- **CRUD Operations**: Add, Edit, and Delete first responder entries
- **Form Validation**: Complete form with all required fields
- **Data Management**: View all entries in a clean table format

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive styling
- **React Leaflet** - Interactive map component
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd KYC-keystone
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
KYC-keystone/
├── app/
│   ├── admin/          # Admin dashboard page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main map page
├── components/
│   ├── Filters.tsx     # Filter component
│   ├── InfoCard.tsx    # Info card for selected pin
│   ├── MapController.tsx  # Map control utilities
│   └── MapView.tsx     # Main map view component
├── data/
│   └── dummyData.ts    # Dummy data for development
├── lib/
│   └── mapIcons.tsx    # Custom map icons
├── types/
│   └── index.ts        # TypeScript type definitions
└── package.json
```

## Data Structure

Each First Responder entry contains:
- `id`: Unique identifier
- `title`: Name of the facility
- `category`: Type (Police, Fire, Ambulance, Hospital, Emergency)
- `city`: City name
- `state`: State name
- `address`: Full address
- `locationLat`: Latitude coordinate
- `locationLng`: Longitude coordinate
- `phoneNumber`: Contact phone number
- `websiteUrl`: Optional website URL
- `googleLocationUrl`: Google Maps link

## Features in Detail

### Map Features
- Interactive map with OpenStreetMap tiles
- Custom icons for different categories
- Click markers to view details
- Smooth animations when navigating
- Bounded to India's geographical limits

### Filtering
- Real-time search by title
- Filter by category (Police, Fire, Ambulance, Hospital, Emergency)
- Filter by city
- Filter by state
- Combined filters for precise results

### Info Card
- Category badge with color coding
- Full address display
- Quick action buttons:
  - **Call**: Direct phone call
  - **Website**: Open website in new tab
  - **Directions**: Open Google Maps

### Admin Dashboard
- Add new entries with full form
- Edit existing entries
- Delete entries with confirmation
- View all entries in table format
- Form validation for required fields

## Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Future Enhancements

- Backend API integration
- Database connection (Supabase/PostgreSQL)
- User authentication
- Real-time updates
- Export/Import functionality
- Advanced analytics

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## License

This project is created for Keystone GeoResponse platform.

