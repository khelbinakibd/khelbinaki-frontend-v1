# Turf Booking System - Frontend

A modern, responsive React application for booking turf facilities with real-time availability, user authentication, and interactive UI.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Authentication Flow](#authentication-flow)
- [Key Features Guide](#key-features-guide)
- [Build and Deployment](#build-and-deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **User Authentication**: Register, login, email verification, password reset
- **Turf Browsing**: Search and filter turfs by location, price, amenities
- **Real-time Availability**: Check and book available time slots
- **Booking Management**: View, manage, and cancel bookings
- **Payment Integration**: Online and manual payment options
- **Admin Dashboard**: Comprehensive admin panel for managing turfs, bookings, and users
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Mode Ready**: Theme support with DaisyUI
- **Form Validation**: Robust form validation with React Hook Form and Zod
- **State Management**: Efficient state management with Zustand
- **API Error Handling**: Automatic retry logic and user-friendly error messages
- **Progressive Web App**: PWA support for offline capabilities

## 🛠 Tech Stack

- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router 7.8.2
- **State Management**: Zustand 5.0.8
- **Data Fetching**: TanStack React Query 5.85.6
- **HTTP Client**: Axios 1.11.0
- **Styling**: Tailwind CSS 4.1.12 + DaisyUI 5.0.51
- **Form Handling**: React Hook Form 7.62.0
- **Validation**: Zod 4.1.7
- **Animations**: Framer Motion 12.23.12
- **UI Components**: Custom components with Radix UI primitives
- **Date Handling**: date-fns 4.1.0
- **Icons**: Lucide React + React Icons
- **Notifications**: Sonner 2.0.7
- **Language**: TypeScript 5.8.3

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v10.12.4 or higher) - `npm install -g pnpm`
- **Backend API** running (see backend README)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd production/frontend
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Copy the example environment file and configure it:

```bash
cp .env.example .env.development
```

4. **Configure environment variables** (see below)

## 🔐 Environment Variables

Create a `.env.development` file in the frontend root directory with the following variables:

### Development Environment

```env
# API Configuration
VITE_API_URL=http://localhost:9000/api/v1

# App Configuration
VITE_APP_NAME=Khelbi Naki
VITE_APP_URL=http://localhost:5173

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### Production Environment

Create a `.env.production` file for production:

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com/api/v1

# App Configuration
VITE_APP_NAME=Khelbi Naki
VITE_APP_URL=https://yourdomain.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### Environment Variable Details

#### VITE_API_URL (Required)
The base URL of your backend API.

**Development**: 
```env
VITE_API_URL=http://localhost:9000/api/v1
```

**Production**: 
```env
VITE_API_URL=https://your-backend-domain.com/api/v1
```

**Important Notes**:
- Must include `/api/v1` at the end
- No trailing slash
- Must be accessible from the browser (CORS configured on backend)

#### VITE_APP_NAME (Optional)
The name of your application displayed in the browser.

```env
VITE_APP_NAME=Khelbi Naki
```

#### VITE_APP_URL (Optional)
The base URL of your frontend application.

```env
VITE_APP_URL=http://localhost:5173
```

### Verifying Environment Variables

After setting up, verify your configuration:

```bash
# Development
pnpm run dev

# Check console for API URL
# Should see: "API URL: http://localhost:9000/api/v1"
```

## 🏃 Running the Application

### Development Mode

```bash
pnpm run dev
```

The application will start at `http://localhost:5173` with hot module replacement (HMR).

### Production Build

```bash
# Type check and lint
pnpm run type-check
pnpm run lint

# Build for production
pnpm run build

# Preview production build locally
pnpm run preview
```

### Available Scripts

```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production (includes type-check and lint)
pnpm run build:prod   # Production build with full validation
pnpm run preview      # Preview production build locally
pnpm run lint         # Check code style
pnpm run lint:fix     # Fix code style issues
pnpm run type-check   # Check TypeScript types
pnpm run clean        # Clean build artifacts
```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── .well-known/
│   │   └── security.txt        # Security policy
│   ├── khelbiNakiLogo.png      # App logo
│   ├── manifest.json           # PWA manifest
│   └── robots.txt              # SEO robots file
├── src/
│   ├── api/                    # API layer
│   │   ├── auth.ts             # Auth API calls
│   │   ├── axiosInstance.ts    # Axios configuration
│   │   └── client.ts           # API client
│   ├── AuthPage/               # Authentication pages
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgetPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   └── VerifyEmail.tsx
│   ├── Components/             # Reusable components
│   │   ├── Footer.tsx
│   │   ├── Loader.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ...
│   ├── Config/                 # Configuration files
│   │   └── constants.ts        # App constants
│   ├── Hooks/                  # Custom React hooks
│   │   ├── api/                # API hooks
│   │   └── ...
│   ├── lib/                    # Library code
│   │   ├── api.ts              # API utilities
│   │   ├── apiClient.ts        # Enhanced API client
│   │   └── ...
│   ├── Pages/                  # Page components
│   │   ├── Home.tsx
│   │   ├── TurfList.tsx
│   │   ├── TurfDetails.tsx
│   │   ├── BookingPage.tsx
│   │   ├── Profile.tsx
│   │   └── Admin/              # Admin pages
│   ├── Store/                  # Zustand stores
│   │   ├── auth.ts             # Auth state
│   │   ├── booking.ts          # Booking state
│   │   └── ...
│   ├── types/                  # TypeScript types
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   └── ...
│   ├── utils/                  # Utility functions
│   │   ├── logger.ts           # Logging utility
│   │   └── ...
│   ├── App.tsx                 # App root component
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles
├── .env.example                # Example environment file
├── .env.production.example     # Production env example
├── components.json             # shadcn/ui config
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML entry point
├── package.json
├── pnpm-workspace.yaml
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
└── README.md
```

## 🔌 API Integration

### API Client Configuration

The application uses Axios with advanced features:

#### Base Configuration

```typescript
// src/api/axiosInstance.ts
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // Enable cookies for auth
  timeout: 30000,         // 30 second timeout
});
```

#### Key Features

1. **Automatic Token Management**
   - Access token stored in memory (Zustand)
   - Refresh token stored in HTTP-only cookie
   - Automatic token refresh on 401 errors

2. **Retry Logic**
   - Automatic retry on network errors
   - Exponential backoff strategy
   - Configurable retry attempts (default: 3)

3. **Error Handling**
   - User-friendly error messages
   - Network error detection
   - Timeout handling
   - Server error retry

4. **Request/Response Logging**
   - Development mode logging
   - Error tracking
   - Performance monitoring

### Making API Calls

#### Using React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

function TurfList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['turfs'],
    queryFn: async () => {
      const response = await api.get('/turfs');
      return response.data;
    },
  });

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* Render turfs */}</div>;
}
```

#### Using Custom Hooks

```typescript
import { useTurfs } from '@/Hooks/api/useTurfs';

function TurfList() {
  const { turfs, isLoading, error } = useTurfs();
  
  // Component logic
}
```

#### Direct API Calls

```typescript
import { api } from '@/lib/apiClient';

async function createBooking(bookingData) {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Booking failed:', error);
    throw error;
  }
}
```

### API Endpoints

All endpoints are relative to `VITE_API_URL`. See backend README for complete API documentation.

**Common Endpoints**:
- `GET /turfs` - Get all turfs
- `GET /turfs/:id` - Get single turf
- `GET /turfs/:id/availability` - Check availability
- `POST /bookings` - Create booking
- `GET /bookings/my-bookings` - Get user bookings
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /admin/dashboard` - Admin dashboard stats

## 🔐 Authentication Flow

### Registration Flow

1. User fills registration form
2. Frontend validates input with Zod
3. POST request to `/auth/register`
4. Backend sends OTP to email
5. User redirected to OTP verification page
6. User enters OTP
7. POST request to `/auth/verify-otp`
8. Access token received and stored
9. Refresh token stored in HTTP-only cookie
10. User redirected to dashboard

### Login Flow

1. User enters credentials
2. POST request to `/auth/login`
3. Access token stored in Zustand store
4. Refresh token stored in HTTP-only cookie
5. User redirected to dashboard

### Token Refresh Flow

1. API request fails with 401 status
2. Interceptor catches the error
3. POST request to `/auth/refresh-token`
4. New access token received
5. Original request retried with new token
6. If refresh fails, user logged out

### Protected Routes

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/Store/auth';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return children;
}
```

## 🎯 Key Features Guide

### 1. Turf Browsing and Search

**Location**: `src/Pages/TurfList.tsx`

- Filter by city, price range, amenities
- Search by name or description
- Pagination support
- Responsive grid layout

### 2. Booking System

**Location**: `src/Pages/BookingPage.tsx`

Features:
- Date selection with calendar
- Time slot selection
- Real-time availability checking
- Price calculation
- Payment method selection

### 3. User Dashboard

**Location**: `src/Pages/Profile.tsx`

Features:
- View profile information
- Edit profile details
- View booking history
- Cancel bookings
- Download booking receipts

### 4. Admin Panel

**Location**: `src/Pages/Admin/`

Features:
- Dashboard with analytics
- Manage turfs (CRUD operations)
- Manage bookings
- Manage users
- View reports
- Upload images

### 5. Form Validation

All forms use React Hook Form + Zod for validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Form logic
}
```

### 6. State Management

#### Auth State (Zustand)

```typescript
import { useAuthStore } from '@/Store/auth';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  // Use auth state
}
```

#### Server State (React Query)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

function Component() {
  const { data } = useQuery({ queryKey: ['key'], queryFn });
  const mutation = useMutation({ mutationFn });
  
  // Use server state
}
```

## 🏗 Build and Deployment

### Production Build

```bash
# Full production build with validation
pnpm run build:prod
```

This will:
1. Run TypeScript type checking
2. Run ESLint
3. Build optimized production bundle
4. Output to `dist/` directory

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Main JavaScript bundle
│   ├── index-[hash].css     # Main CSS bundle
│   └── ...                  # Other chunked assets
├── index.html               # Entry HTML file
└── ...
```

### Deployment Options

#### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**vercel.json** (if needed):
```json
{
  "buildCommand": "pnpm run build:prod",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

#### 2. Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**netlify.toml**:
```toml
[build]
  command = "pnpm run build:prod"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. Static Hosting (AWS S3, GitHub Pages, etc.)

1. Build the application:
```bash
pnpm run build:prod
```

2. Upload the `dist/` folder to your hosting provider

3. Configure redirects for SPA routing

### Environment Variables in Production

**Important**: Set environment variables in your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Custom Server**: Use `.env.production` file

Required variables:
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=Khelbi Naki
VITE_APP_URL=https://yourdomain.com
```

## 🐛 Troubleshooting

### API Connection Issues

**Problem**: Cannot connect to backend API

**Solutions**:
1. Verify backend is running
2. Check `VITE_API_URL` in `.env` file
3. Verify CORS is configured on backend
4. Check browser console for errors
5. Verify network tab in DevTools

**Test API Connection**:
```bash
# Test if API is reachable
curl http://localhost:9000/api/v1/health
```

### Authentication Issues

**Problem**: User cannot login or gets logged out frequently

**Solutions**:
1. Clear browser cookies and localStorage
2. Verify backend JWT configuration
3. Check cookie settings (secure, sameSite)
4. Verify `withCredentials: true` in API client
5. Check token expiration times

**Debug Auth State**:
```typescript
// Add to component
console.log('Auth State:', useAuthStore.getState());
```

### Build Errors

**Problem**: Build fails with TypeScript or ESLint errors

**Solutions**:
```bash
# Check for type errors
pnpm run type-check

# Check for linting errors
pnpm run lint

# Fix auto-fixable issues
pnpm run lint:fix

# Clean and reinstall
pnpm run clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### CORS Errors

**Problem**: CORS policy blocking requests

**Solutions**:
1. Verify backend CORS configuration includes frontend URL
2. Check `CLIENT_URL` in backend `.env`
3. Verify `withCredentials: true` in Axios config
4. Use proxy in development if needed

**Vite Proxy Configuration** (if needed):
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
    },
  },
});
```

### Performance Issues

**Problem**: Application is slow or unresponsive

**Solutions**:
1. Check network tab for slow API calls
2. Implement pagination for large lists
3. Use React.memo for expensive components
4. Optimize images (use WebP, lazy loading)
5. Check React Query cache configuration

**Performance Monitoring**:
```typescript
// Enable React Query DevTools in development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

### State Management Issues

**Problem**: State not updating or persisting

**Solutions**:
1. Check Zustand store configuration
2. Verify React Query cache invalidation
3. Check for state mutation (should be immutable)
4. Use DevTools to inspect state

**Debug Zustand State**:
```typescript
import { useAuthStore } from '@/Store/auth';

// Subscribe to all state changes
useAuthStore.subscribe(console.log);
```

### Hot Module Replacement (HMR) Issues

**Problem**: Changes not reflecting in development

**Solutions**:
```bash
# Restart dev server
pnpm run dev

# Clear Vite cache
rm -rf node_modules/.vite
pnpm run dev

# Hard reload in browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Dependency Issues

**Problem**: Package conflicts or version mismatches

**Solutions**:
```bash
# Update all dependencies
pnpm update

# Check for outdated packages
pnpm outdated

# Force reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install --force
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [DaisyUI Components](https://daisyui.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

## 🎨 UI/UX Guidelines

### Design System

- **Colors**: Defined in Tailwind config and DaisyUI theme
- **Typography**: System fonts with fallbacks
- **Spacing**: Consistent spacing scale (4px base)
- **Components**: Reusable component library

### Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

## 📄 License

ISC

## 👥 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Happy Coding! 🚀**