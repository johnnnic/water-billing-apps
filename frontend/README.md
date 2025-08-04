# Water Billing Management System - Frontend

Modern React-based frontend application for the Water Billing Management System. Built with TypeScript, Vite, and shadcn/ui for a responsive and user-friendly interface.

## Overview

This React application provides a comprehensive user interface for water billing management with role-based dashboards, real-time data updates, and intuitive navigation.

### Key Features

- **Role-based Interface**: Customized UI for Admin, Operator, and Kasir
- **Real-time Dashboard**: Live statistics and activity monitoring
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Excel Integration**: Import/export functionality with data validation
- **Modern UI Components**: shadcn/ui component library
- **Type Safety**: Full TypeScript implementation
- **Fast Development**: Vite for lightning-fast builds

## Technology Stack

- **React**: 18.x with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **State Management**: React Context + Custom Hooks
- **HTTP Client**: Axios for API communication
- **Routing**: React Router v6
- **Forms**: React Hook Form with validation
- **Data Processing**: XLSX for Excel operations
- **Icons**: Lucide React icons

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   └── ProtectedRoute.tsx
├── pages/               # Page components
│   ├── admin/           # Admin-specific pages
│   │   ├── CustomersPage.tsx
│   │   ├── BillsPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── kasir/           # Cashier-specific pages
│   │   ├── CheckBillPage.tsx
│   │   └── PaymentPage.tsx
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   └── NotFound.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── hooks/               # Custom hooks
│   └── use-toast.ts
├── lib/                 # Utility functions
│   ├── api.ts           # API configuration
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
```

## Core Components

### Authentication System

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
```

#### ProtectedRoute
Role-based route protection with automatic redirects:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
}
```

### Dashboard Components

#### Admin Dashboard
- Complete system statistics
- Customer management overview
- Payment analytics
- System activities

#### Operator Dashboard
- Customer data management
- Meter reading interface
- Import/export tools

#### Kasir Dashboard
- Bill checking interface
- Payment processing
- Transaction history

### Customer Management

#### CustomersPage Features
- **CRUD Operations**: Complete customer lifecycle management
- **Excel Import**: Bulk customer import with validation
- **Template Download**: Standardized Excel template
- **Real-time Search**: Instant customer filtering
- **Status Management**: Active/inactive customer control

#### Excel Import Process
```typescript
interface ImportData {
  nomor_langganan: string;
  nama: string;
  alamat: string;
  telepon: string;
  status: 'aktif' | 'nonaktif';
  tarif_per_m3: number;
  meteran_terakhir: number;
}
```

### Payment System

#### CheckBillPage
- Customer lookup by number
- Bill status verification
- Payment navigation

#### PaymentPage
- Payment amount input
- Multiple payment methods
- Receipt generation
- Transaction confirmation

## API Integration

### Axios Configuration
```typescript
// lib/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Response Handling
```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}
```

## State Management

### Context-based State
- **AuthContext**: User authentication and session management
- **Local State**: Component-specific state with hooks
- **localStorage**: Persistent data storage

### Custom Hooks
```typescript
// Example: useAuth hook
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Styling System

### Tailwind CSS Configuration
- Custom color palette for water billing theme
- Responsive breakpoints
- Component utilities
- Dark mode support (configurable)

### Design System
```css
/* Custom colors */
:root {
  --gold: #D4AF37;
  --brown-light: #8B7355;
  --brown-medium: #6B5B47;
  --brown-dark: #4A3F35;
}
```

### Component Styling
- Consistent spacing and typography
- Hover and focus states
- Loading and error states
- Mobile-responsive design

## Features Implementation

### Real-time Dashboard
```typescript
const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>();
  const [activities, setActivities] = useState<Activity[]>();
  
  useEffect(() => {
    const fetchData = async () => {
      const statsRes = await api.get('/admin/dashboard/stats');
      const activitiesRes = await api.get('/admin/dashboard/activities');
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    };
    
    fetchData();
  }, []);
};
```

### Excel Import System
```typescript
const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    validateAndProcessData(jsonData);
  };
  reader.readAsArrayBuffer(file);
};
```

### Form Validation
```typescript
const customerSchema = z.object({
  nomor_langganan: z.string().min(1, "Nomor langganan wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  status: z.enum(['aktif', 'nonaktif']),
  tarif_per_m3: z.number().min(0, "Tarif harus positif"),
});
```

## Installation & Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create .env file
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

### Available Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
```typescript
// Example responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Responsive cards */}
</div>
```

## Performance Optimizations

### Code Splitting
- Route-based code splitting
- Lazy loading of components
- Dynamic imports for heavy features

### Bundle Optimization
- Tree shaking
- Asset optimization
- Vendor chunk splitting

### Runtime Performance
- Memoization of expensive calculations
- Debounced search inputs
- Virtual scrolling for large lists

## Error Handling

### Global Error Boundaries
```typescript
const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  // Error handling logic
};
```

### API Error Handling
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Testing

### Component Testing
```bash
npm run test
```

### E2E Testing
Integration with testing frameworks for comprehensive testing.

## Deployment

### Build Process
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Water Billing System
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- Mobile browsers

## Contributing

1. Follow React best practices
2. Use TypeScript for type safety
3. Write accessible components
4. Test components thoroughly
5. Document complex logic

## Development Guidelines

### Code Style
- Use TypeScript for all components
- Follow React hooks best practices
- Implement error boundaries
- Use semantic HTML elements

### Component Structure
```typescript
interface ComponentProps {
  // Define props
}

export const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component logic
  return (
    // JSX
  );
};
```

This frontend application provides a modern, responsive, and user-friendly interface for the Water Billing Management System with comprehensive features for all user roles.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/549d2cc1-9e83-44d1-b388-0318b06d0fd7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
