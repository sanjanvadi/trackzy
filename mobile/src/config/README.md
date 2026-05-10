# Configuration Setup

## Files Created

### 1. Firebase Configuration (`firebase.ts`)
- Initializes Firebase app with environment variables
- Sets up Firebase Auth (automatically uses AsyncStorage on React Native, IndexedDB on web)
- Validates all required configuration values
- **Usage**: `import { auth } from '@/src/config/firebase'`

**Note**: We use Firebase JS SDK (not @react-native-firebase) which works seamlessly with Expo. Persistence is handled automatically across platforms.

### 2. API Client (`api.ts`)
- Axios instance configured with base URL from env
- **Request Interceptor**: Automatically adds Firebase ID token to Authorization header
- **Response Interceptor**: Global error handling for all API errors
- Exports `apiClient` for making API calls
- Exports `endpoints` object with all backend routes

**Usage Example**:
```typescript
import apiClient, { endpoints } from '@/src/config/api';

// Get user profile
const response = await apiClient.get(endpoints.users.me);

// Create expense
const expense = await apiClient.post(
  endpoints.expenses.create(ledgerId),
  { amount: 50, category: 'food' }
);
```

### 3. React Query Client (`queryClient.ts`)
- Configured QueryClient with optimized settings:
  - 5 min stale time
  - 10 min cache time
  - Auto retry with exponential backoff
  - Auto refetch on focus/reconnect
- Exports `queryKeys` factory for consistent cache keys

**Usage Example**:
```typescript
import { queryClient, queryKeys } from '@/src/config/queryClient';

// Invalidate user cache
queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
```

### 4. Environment Variables (`.env`)
**Required Variables**:
- `EXPO_PUBLIC_API_URL` - Backend API base URL
- `EXPO_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `EXPO_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` - Google OAuth client ID (optional)

## Testing the Configuration

### 1. Test Firebase Connection
```typescript
import { auth } from '@/src/config/firebase';

// Should not throw error if config is valid
console.log('Firebase Auth initialized:', auth.app.name);
```

### 2. Test API Client
```typescript
import apiClient from '@/src/config/api';

// Test health endpoint
const response = await apiClient.get('/health');
console.log('Backend health:', response.data);
```

### 3. Test React Query
```typescript
import { queryClient } from '@/src/config/queryClient';

// Should be initialized
console.log('Query client ready:', queryClient.isFetching());
```

## Security Notes

⚠️ **Important**:
- `.env` file is excluded from git (see `.gitignore`)
- Never commit `.env` to version control
- Use `.env.example` as template for others
- Environment variables are prefixed with `EXPO_PUBLIC_` to be accessible in Expo

## Next Steps

After this configuration is complete, you can:
1. Set up TypeScript types (Step 1.2)
2. Create service layer for API calls
3. Build authentication flow
4. Create React Query hooks for data fetching
