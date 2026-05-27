# Testing Guide - Salon Hub UI

This project includes comprehensive mock data and testing utilities to help you test all functionality without needing a backend server.

## Quick Start

### 1. Enable Mock Mode (Default)
The application is configured to use mock data by default. You can start testing immediately!

```bash
npm run dev
```

Then visit: http://localhost:5173/testing

### 2. Test Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@salonhub.com | admin123 | Full admin access with dashboard |
| **Customer** | john@example.com | password123 | Regular customer with preferences |
| **Customer** | jane@example.com | password123 | Customer with different preferences |
| **Employee** | employee@salonhub.com | employee123 | Employee access |
| **Customer** | sarah@example.com | password123 | Another customer for testing |

### 3. Testing Features

#### Customer Login Flow
1. Go to `/login`
2. Use any customer account (e.g., john@example.com / password123)
3. Test check-in functionality
4. View member preferences

#### Admin Login Flow
1. Go to `/login`
2. Use admin account (admin@salonhub.com / admin123)
3. After login, click "Admin Dashboard" button
4. View queue management, statistics, and settings

#### Mock Data Features
- **Realistic API delays** (500-1000ms) to simulate network requests
- **Error handling** - try wrong passwords to test error states
- **Queue management** - mock customer queue with 5 sample customers
- **Role-based UI** - different interfaces for different user roles

## Configuration

### Switch Between Mock and Real API

#### Option 1: Environment File
Edit `.env.local`:
```env
# For testing with mock data
VITE_USE_MOCK_API=true

# For real backend
VITE_USE_MOCK_API=false
VITE_API_BASE=http://localhost:8080/api
```

#### Option 2: Code Configuration
Edit `src/services/mockApi.ts`:
```typescript
export const USE_MOCK_API = false; // Change to false for real API
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_USE_MOCK_API` | Enable/disable mock API | `true` |
| `VITE_API_BASE` | Backend API URL | `http://localhost:8080/api` |
| `VITE_BASE_PATH` | App base path | `/` |

## Mock Data Structure

### Users
- 5 test users with different roles
- Realistic preferences and visit history
- Proper password hashing simulation

### Customer Queue
- 5 mock customers in various states
- Mix of online and in-store customers
- Different services and wait times

### API Responses
- Login authentication with JWT simulation
- Check-in responses with queue position
- Queue management data
- Error responses for testing

## Testing Scenarios

### 1. Role-Based Access
- Login as customer → See check-in interface only
- Login as admin → See check-in + admin dashboard button
- Access `/admin` without login → Redirect to login

### 2. Authentication Flow
- Valid credentials → Successful login with user data
- Invalid credentials → Error message display
- Session persistence → Refresh page maintains login
- Logout → Clear session and redirect

### 3. Check-in Process
- Member check-in → Show preferences and check-in button
- Successful check-in → Display wait time and confirmation
- Error handling → Show error messages

### 4. Admin Dashboard
- Queue management → View and modify customer queue
- Statistics → View salon metrics
- Settings → Configure salon parameters

## Development Tips

### Quick Testing Commands
```bash
# Start with mock data (default)
npm run dev

# View testing guide
# Navigate to http://localhost:5173/testing

# Test admin features
# Login with admin@salonhub.com / admin123
```

### Debugging
- Check browser console for API calls
- Mock API responses are logged
- Network tab shows simulated delays

### Adding New Mock Data
Edit `src/lib/mockData.ts` to add:
- New test users
- Additional queue customers
- Custom API responses

## Switching to Production

When ready to use with real backend:

1. Set `VITE_USE_MOCK_API=false` in `.env.local`
2. Ensure backend is running on configured port
3. Update `VITE_API_BASE` if needed
4. Restart development server

The application will seamlessly switch to real API calls without any code changes.

## Troubleshooting

### Common Issues
- **Testing guide not visible**: Ensure `VITE_USE_MOCK_API=true`
- **API errors**: Check if mock mode is enabled correctly
- **Login fails**: Verify you're using exact test account credentials
- **Admin dashboard not accessible**: Ensure you're logged in as admin user

### Support
For issues or questions about the testing setup, check:
1. Browser console for errors
2. Network tab for API calls
3. Environment variable configuration
4. Mock data structure in `src/lib/mockData.ts`
