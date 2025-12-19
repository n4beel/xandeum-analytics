# Deployment Guide - Xandeum pNode Analytics

## Quick Start

The platform is ready for immediate deployment. Follow these steps to get it live.

## Prerequisites

Before deploying, you need to obtain actual Xandeum pNode endpoint addresses. The current configuration uses placeholder seed nodes that need to be replaced.

### Getting Xandeum pNode Endpoints

1. **Join Xandeum Discord**: https://discord.gg/uqRSmmM5m
2. **Ask for seed node addresses** in the developer channel
3. **Update the configuration** (see below)

## Configuration

### Update Seed Nodes

Edit `lib/prpc-client.ts` and replace the placeholder addresses:

```typescript
// Replace these with actual Xandeum pNode addresses
const SEED_NODES = [
  'http://<actual-pnode-ip-1>:6000/rpc',
  'http://<actual-pnode-ip-2>:6000/rpc',
  'http://<actual-pnode-ip-3>:6000/rpc',
];
```

## Deployment Options

### Option 1: Railway (Recommended)

Railway provides the easiest deployment with automatic Docker builds.

#### Steps:

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize Project**
```bash
cd /home/n4beel/Desktop/Projects/xandeum-analytics
railway init
```

4. **Deploy**
```bash
railway up
```

5. **Get Your URL**
Railway will provide a public URL like `https://xandeum-analytics-production.up.railway.app`

#### Environment Variables (Optional)
If you want to configure seed nodes via environment variables:
- Go to Railway dashboard
- Add variable: `NEXT_PUBLIC_SEED_NODES=http://node1:6000/rpc,http://node2:6000/rpc`

### Option 2: Vercel

Vercel is optimized for Next.js applications.

#### Steps:

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd /home/n4beel/Desktop/Projects/xandeum-analytics
vercel
```

3. **Follow Prompts**
- Link to your Vercel account
- Configure project settings
- Deploy!

#### Or Use GitHub Integration:
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Deploy automatically

### Option 3: Docker on VM

For maximum control, deploy using Docker on any VM.

#### Steps:

1. **Build Docker Image**
```bash
cd /home/n4beel/Desktop/Projects/xandeum-analytics
docker build -t xandeum-analytics .
```

2. **Run Container**
```bash
docker run -d -p 3000:3000 --name xandeum-analytics xandeum-analytics
```

3. **Access Application**
Navigate to `http://<your-vm-ip>:3000`

#### Using Docker Compose (Optional):

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

### Option 4: Traditional VM Deployment

Deploy without Docker on Ubuntu/Debian.

#### Steps:

1. **Install Node.js 20**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone and Setup**
```bash
git clone <your-repo-url>
cd xandeum-analytics
npm install
npm run build
```

3. **Run with PM2**
```bash
sudo npm install -g pm2
pm2 start npm --name "xandeum-analytics" -- start
pm2 save
pm2 startup
```

4. **Setup Nginx (Optional)**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Checklist

After deploying, verify the following:

- [ ] Dashboard loads at your public URL
- [ ] Network overview cards display data
- [ ] pNode table shows nodes from the network
- [ ] Version chart renders correctly
- [ ] Search and filtering work
- [ ] Sorting functions properly
- [ ] Auto-refresh updates data every 30 seconds
- [ ] Responsive design works on mobile
- [ ] No console errors

## Testing with Live Data

Once deployed with real Xandeum endpoints:

1. **Open the dashboard** in your browser
2. **Check Network Overview** - Should show actual node counts
3. **Verify pNode Table** - Should list real nodes with addresses
4. **Test Search** - Filter by node address or version
5. **Test Sorting** - Click column headers
6. **Check Version Chart** - Should show actual version distribution
7. **Monitor Auto-refresh** - Data should update every 30 seconds

## Troubleshooting

### Issue: "Error Loading Data"

**Cause**: Cannot connect to pNode endpoints

**Solutions**:
1. Verify seed node addresses are correct
2. Check if pNode RPC port (6000) is accessible
3. Ensure no firewall blocking the connection
4. Try different seed nodes

### Issue: Build Fails

**Cause**: Missing dependencies or TypeScript errors

**Solutions**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Docker Build Fails

**Cause**: Docker configuration or network issues

**Solutions**:
1. Check Dockerfile syntax
2. Ensure Docker daemon is running
3. Try building with `--no-cache`:
```bash
docker build --no-cache -t xandeum-analytics .
```

## Performance Optimization

For production deployments:

1. **Enable Caching** - Add Redis for API response caching
2. **CDN Integration** - Use Cloudflare or similar for static assets
3. **Database** - Store historical data for trend analysis
4. **Rate Limiting** - Prevent API abuse
5. **Monitoring** - Add Sentry or similar for error tracking

## Submission Checklist

Before submitting to the bounty:

- [ ] Code pushed to GitHub repository
- [ ] Live deployment URL accessible
- [ ] README.md is comprehensive
- [ ] All features working correctly
- [ ] Screenshots/demo video prepared
- [ ] Documentation complete

## Support

For issues or questions:
- **Xandeum Discord**: https://discord.gg/uqRSmmM5m
- **Xandeum Docs**: https://xandeum.network/docs

---

**Ready to deploy and win the bounty!** 🚀
