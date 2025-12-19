# Xandeum pNode Analytics Platform

A modern, real-time analytics dashboard for monitoring Xandeum pNodes across the network. Built with Next.js 15, TypeScript, and Tailwind CSS.

![Xandeum Analytics](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### Core Functionality
- **Real-time pNode Monitoring**: Fetches and displays all pNodes from the Xandeum gossip network
- **Network Statistics**: Live overview of total nodes, active nodes, network health, and version distribution
- **Interactive Table**: Search, sort, and paginate through all pNodes with ease
- **Version Analytics**: Visual pie chart showing distribution of pNode versions across the network
- **Auto-refresh**: Automatically updates data every 30 seconds

### Advanced Features
- **Status Indicators**: Real-time online/offline status based on last seen timestamp
- **Search & Filter**: Quickly find nodes by address or version
- **Sortable Columns**: Sort by address, version, or last seen time
- **Pagination**: Efficient handling of large datasets with 20 nodes per page
- **Error Handling**: Robust retry logic with multiple seed node fallbacks

### Design & UX
- **Premium Dark Mode**: Stunning glassmorphism effects with gradient accents
- **Smooth Animations**: Fade-in and slide-in animations for enhanced user experience
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Custom Scrollbars**: Styled scrollbars matching the dark theme
- **Loading States**: Beautiful loading indicators and skeleton screens

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **HTTP Client**: Axios with retry logic
- **Date Formatting**: date-fns

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd xandeum-analytics
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment (optional)**
Create a `.env.local` file if you want to customize seed nodes:
```env
NEXT_PUBLIC_SEED_NODES=http://seed1.xandeum.network:6000/rpc,http://seed2.xandeum.network:6000/rpc
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment

### Deploy to Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize project**
```bash
railway init
```

4. **Deploy**
```bash
railway up
```

Your app will be live at the provided Railway URL!

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

Or via CLI:
```bash
npm install -g vercel
vercel
```

### Deploy to VM (Ubuntu/Debian)

1. **Install Node.js and npm**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone and setup**
```bash
git clone <your-repo-url>
cd xandeum-analytics
npm install
npm run build
```

3. **Run with PM2**
```bash
npm install -g pm2
pm2 start npm --name "xandeum-analytics" -- start
pm2 save
pm2 startup
```

## 📡 API Documentation

### pRPC Integration

The platform integrates with Xandeum pNode RPC (pRPC) endpoints:

#### Get All pNodes
```typescript
// Endpoint: POST http://<pnode-ip>:6000/rpc
{
  "jsonrpc": "2.0",
  "method": "get-pods",
  "id": 1
}
```

**Response:**
```typescript
{
  "pods": [
    {
      "address": "192.168.1.100:9001",
      "version": "1.0.0",
      "last_seen": "2 minutes ago",
      "last_seen_timestamp": 1703001234
    }
  ],
  "total_count": 150
}
```

#### Get Node Statistics
```typescript
{
  "jsonrpc": "2.0",
  "method": "get-stats",
  "id": 1,
  "params": ["192.168.1.100:9001"]
}
```

## 🏗️ Project Structure

```
xandeum-analytics/
├── app/
│   ├── api/
│   │   ├── pods/route.ts          # API route for fetching all pNodes
│   │   └── stats/[address]/route.ts # API route for node stats
│   ├── globals.css                 # Custom design system
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main dashboard page
├── components/
│   ├── NetworkOverview.tsx         # Network statistics cards
│   ├── PNodeTable.tsx              # Interactive pNode table
│   └── VersionChart.tsx            # Version distribution chart
├── lib/
│   ├── prpc-client.ts              # pRPC client with retry logic
│   └── types.ts                    # TypeScript interfaces
└── public/                         # Static assets
```

## 🎨 Design System

The platform uses a custom dark mode design system with:
- **Color Palette**: Deep blues, purples, and pinks with gradient accents
- **Glassmorphism**: Backdrop blur effects for modern card designs
- **Animations**: Smooth fade-in and slide-in transitions
- **Typography**: Geist Sans and Geist Mono fonts
- **Status Colors**: Green (online), Red (offline), Amber (warning)

## 🔧 Configuration

### Seed Nodes
Update seed nodes in `lib/prpc-client.ts`:
```typescript
const SEED_NODES = [
  'http://seed1.xandeum.network:6000/rpc',
  'http://seed2.xandeum.network:6000/rpc',
];
```

### Auto-refresh Interval
Modify in `app/page.tsx`:
```typescript
const interval = setInterval(fetchPods, 30000); // 30 seconds
```

## 📊 Features Breakdown

### Network Overview
- **Total pNodes**: Count of all nodes in the network
- **Active Nodes**: Nodes seen within the last 5 minutes
- **Network Health**: Percentage of active nodes
- **Unique Versions**: Number of different pNode versions

### pNode Table
- **Search**: Filter by address or version
- **Sort**: Click column headers to sort
- **Status**: Visual indicators for online/offline status
- **Pagination**: Navigate through large datasets
- **Last Seen**: Human-readable timestamps

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🏆 Bounty Submission

This platform was built for the Xandeum pNode Analytics Bounty. It meets all requirements:
- ✅ Retrieves pNode list using `get-pods` pRPC call
- ✅ Displays pNode information clearly
- ✅ Web-based and accessible
- ✅ Additional features for enhanced user experience

## 🔗 Links

- [Xandeum Network](https://xandeum.network)
- [Xandeum Documentation](https://xandeum.network/docs)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)

---

**Built with ❤️ for the Xandeum Community**
# xandeum-analytics
