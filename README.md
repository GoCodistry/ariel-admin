# Ariel Admin Dashboard

Professional admin dashboard for managing the Ariel AI agent platform.

## Features

- **Dashboard Overview**: Revenue metrics, client growth, and platform stats
- **Client Management**: View, create, edit, and deactivate client accounts
- **Agent Management**: View agent configurations, edit SOUL.md, and monitor status
- **Usage Dashboard**: Track message usage per client and agent with billing period views
- **Partner Management**: Manage referral partners, commissions, and payouts
- **Revenue Analytics**: MRR tracking, active clients, churn analysis

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Backend API**: FastAPI (running at https://helloariel.ai)

## Development

### Prerequisites

- Node.js 18+ and npm
- Access to Ariel backend API

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL and admin credentials
```

3. Start development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5174`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Deployment

### Option 1: Deploy to Lightsail (with backend)

1. **Build the application:**
```bash
npm run build
```

2. **Upload to server:**
```bash
scp -i ~/Downloads/ariel-production.pem -r dist ubuntu@3.223.102.157:/var/www/ariel-admin
```

3. **Configure Nginx:**
Add this location block to `/etc/nginx/sites-available/default`:
```nginx
location /admin {
    alias /var/www/ariel-admin/dist;
    try_files $uri $uri/ /admin/index.html;
}
```

4. **Restart Nginx:**
```bash
sudo systemctl restart nginx
```

Access at: `https://helloariel.ai/admin`

### Option 2: Deploy to Vercel/Netlify

1. Push code to GitHub repository

2. Connect repository to Vercel or Netlify

3. Configure environment variables in deployment platform:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_ADMIN_USERNAME`: Admin username
   - `VITE_ADMIN_PASSWORD`: Admin password

4. Deploy

## Authentication

The dashboard uses HTTP Basic Auth to authenticate with the backend API. Default credentials:
- Username: `admin`
- Password: `ariel2024`

**IMPORTANT**: Change these credentials in production by updating the backend's environment variables:
```bash
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
```

## API Endpoints

The dashboard connects to these backend endpoints:

- `GET /api/admin/clients` - List all clients
- `GET /api/admin/clients/:id` - Get client details
- `GET /api/admin/agents` - List all agents
- `GET /api/admin/agents/:id` - Get agent details
- `PUT /api/admin/agents/:id/soul` - Update agent SOUL configuration
- `GET /api/admin/partners` - List all partners
- `GET /api/admin/analytics/revenue` - Get revenue statistics

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── Layout.tsx    # Main layout with sidebar
├── pages/
│   ├── Dashboard.tsx       # Overview dashboard
│   ├── Clients.tsx         # Clients list
│   ├── ClientDetail.tsx    # Client detail view
│   ├── Agents.tsx          # Agents list
│   ├── AgentDetail.tsx     # Agent detail with SOUL editor
│   ├── Usage.tsx           # Usage analytics
│   ├── Partners.tsx        # Partners list
│   └── PartnerDetail.tsx   # Partner detail with commissions
├── lib/
│   ├── api.ts        # API client and type definitions
│   └── utils.ts      # Utility functions
├── App.tsx           # Main app with routing
├── main.tsx          # React entry point
└── index.css         # Global styles + Tailwind

## Customization

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Layout.tsx`

### Styling

The dashboard uses Tailwind CSS with CSS variables for theming. Customize colors in `src/index.css`:

```css
:root {
  --primary: 262 83% 58%;  /* Purple gradient */
  /* ... other variables */
}
```

### API Integration

API client is in `src/lib/api.ts`. To add new endpoints:

1. Define TypeScript interfaces
2. Add API function to appropriate namespace
3. Use in components with React Query:

```typescript
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: apiFunction,
})
```

## Security Notes

- Change default admin credentials before production use
- Use HTTPS in production (configure SSL on Lightsail)
- Consider adding session management instead of basic auth
- Implement proper RBAC if multiple admin users needed

## Support

For issues or questions:
- Backend API: See `/Users/harrymora/Apps/ariel/api/admin/app.py`
- Database models: See `/Users/harrymora/Apps/ariel/api/models.py`
- Frontend components: Browse `src/components/`
