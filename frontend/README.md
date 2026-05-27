# CivicLens

A comprehensive platform for tracking and amplifying civic impact through data-driven insights, community engagement, and transparent impact reporting.

## Overview

CivicLens empowers organizations, donors, and communities to measure, share, and celebrate social impact. Our platform provides tools for impact tracking, stakeholder engagement, ESG reporting, and community-driven accountability.

## Features

- 🗺️ **Mission Map** - Visualize impact across geographical regions
- 📊 **ESG Reports** - Generate comprehensive Environmental, Social, and Governance reports
- 💰 **Donor Dashboard** - Track donations and their measurable impact
- 🏆 **Leaderboard** - Celebrate top contributors and initiatives
- 🔍 **API Explorer** - Accessible API endpoints for third-party integrations
- 📈 **Impact Metrics** - Real-time impact tracking and analytics
- 🤝 **Community Hive** - Connect with other impact-focused organizations
- ✓ **Proof of Impact** - Verifiable impact documentation and reporting

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: shadcn/ui (Radix UI)
- **Backend**: Supabase
- **Data Visualization**: Recharts
- **Maps**: Leaflet with React Leaflet
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint

## Getting Started

### Prerequisites

- Node.js 16+ 
- Bun package manager (recommended) or npm/yarn
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/komal-rathore-100105/CivicLens.git
   cd CivicLens
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure environment**
   Create a `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Available Scripts

- `bun dev` / `npm run dev` - Start development server
- `bun build` / `npm run build` - Build for production
- `bun build:dev` / `npm run build:dev` - Build in development mode
- `bun lint` / `npm run lint` - Run ESLint
- `bun preview` / `npm run preview` - Preview production build
- `bun test` / `npm run test` - Run tests
- `bun test:watch` / `npm run test:watch` - Run tests in watch mode

## Project Structure

```
civic-impact-bloom/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── AppLayout.tsx
│   │   └── MissionMap.tsx
│   ├── pages/           # Page components
│   │   ├── APIExplorer.tsx
│   │   ├── CommunityHive.tsx
│   │   ├── DonorDashboard.tsx
│   │   ├── ESGReport.tsx
│   │   ├── Leaderboard.tsx
│   │   └── ProofOfImpact.tsx
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External service integrations
│   │   └── supabase/
│   ├── lib/             # Utility functions
│   └── test/            # Test files
├── supabase/            # Supabase configuration
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
├── public/              # Static assets
└── index.html           # Entry HTML file
```

## Configuration

### Vite Configuration
- [vite.config.ts](vite.config.ts) - Vite build configuration
- [vitest.config.ts](vitest.config.ts) - Test configuration

### Styling
- [tailwind.config.ts](tailwind.config.ts) - Tailwind CSS configuration
- [postcss.config.js](postcss.config.js) - PostCSS configuration

### TypeScript
- [tsconfig.json](tsconfig.json) - Base TypeScript configuration
- [tsconfig.app.json](tsconfig.app.json) - App-specific TypeScript settings
- [tsconfig.node.json](tsconfig.node.json) - Node.js TypeScript settings

## Building for Production

```bash
bun build
# or
npm run build
```

The optimized production build will be created in the `dist` directory.

## Testing

Run the test suite:

```bash
bun test
# or
npm run test
```

Watch mode for development:

```bash
bun test:watch
```

## Code Quality

Run ESLint to check code quality:

```bash
bun lint
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, questions, or feedback, please open an issue on the [GitHub repository](https://github.com/komal-rathore-100105/CivicLens).

## Acknowledgments

Built with modern web technologies to make civic impact transparent, measurable, and accessible to all.
