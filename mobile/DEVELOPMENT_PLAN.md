# FinAssistant - Incremental Development Plan

## Overview
Building a pixel-perfect React Native (Expo) frontend based on design specifications.
Each step will be completed, tested, and reviewed before moving to the next.

---

## Phase 1: Foundation & Configuration
**Goal**: Set up all configuration, types, and utilities before building UI

### Step 1.1: Environment & Firebase Configuration ✓
- [x] Create .env file structure
- [ ] Set up Firebase configuration
- [ ] Create API client with axios
- [ ] Configure React Query
**Deliverable**: Working API client ready for backend integration

### Step 1.2: TypeScript Types & Constants ✓
- [x] Theme constants (colors, typography, spacing)
- [ ] API types (matching backend schemas)
- [ ] Auth types
- [ ] Transaction types
**Deliverable**: Complete type safety across the app

### Step 1.3: Utility Functions & Helpers
- [ ] Date formatters
- [ ] Currency formatters
- [ ] Category icons/colors mapping
- [ ] Validation helpers
**Deliverable**: Reusable utility functions

---

## Phase 2: Authentication Flow
**Goal**: Complete onboarding and login screens

### Step 2.1: Onboarding Screen
**Design**: `onboarding_step_1/screen.png`
- [ ] Create onboarding layout with illustration
- [ ] "Just say it." heading and subtitle
- [ ] Progress dots indicator (3 steps)
- [ ] Next button
- [ ] Skip functionality
**Deliverable**: Swipeable onboarding flow
**Review Point**: Test navigation and animations

### Step 2.2: Login Screen
**Design**: `login/screen.png`
- [ ] FinAssistant logo and shield icon
- [ ] Email input with icon
- [ ] Password input with show/hide toggle
- [ ] "Forgot password?" link
- [ ] Login button
- [ ] Google Sign-In button
- [ ] "Create an account" link
**Deliverable**: Functional login UI
**Review Point**: Test form validation and UI states

### Step 2.3: Signup Screen
- [ ] Similar layout to login
- [ ] Name input field
- [ ] Email input
- [ ] Password input
- [ ] Confirm password input
- [ ] Sign up button
- [ ] Google Sign-In option
**Deliverable**: Complete signup flow
**Review Point**: Test account creation flow

### Step 2.4: Firebase Authentication Integration
- [ ] Connect login to Firebase
- [ ] Connect signup to Firebase
- [ ] Google OAuth integration
- [ ] Register user in backend after Firebase auth
- [ ] Auth state management
- [ ] Secure token storage
**Deliverable**: Working authentication system
**Review Point**: End-to-end auth testing

---

## Phase 3: Navigation Shell
**Goal**: Set up main app navigation structure

### Step 3.1: Root Layout & Auth Routing
- [ ] Create app/_layout.tsx
- [ ] Set up auth check and routing
- [ ] Splash screen while loading
- [ ] Redirect logic (auth vs main app)
**Deliverable**: Proper auth flow routing
**Review Point**: Test navigation between auth and app

### Step 3.2: Bottom Tab Navigation
**Design**: Visible in all main screens
- [ ] Create (tabs)/_layout.tsx
- [ ] Home tab with icon
- [ ] History tab with icon
- [ ] Insights tab with icon
- [ ] Profile tab with icon
- [ ] Tab bar styling (blue for active)
- [ ] Proper spacing and colors
**Deliverable**: Working bottom navigation
**Review Point**: Test tab switching

### Step 3.3: Voice Button FAB
- [ ] Create floating voice button component
- [ ] Position above tab bar
- [ ] Blue circular button with mic icon
- [ ] Press animation
- [ ] Navigate to voice modal
**Deliverable**: Functional voice button
**Review Point**: Test button visibility and navigation

---

## Phase 4: Dashboard (Home Screen)
**Goal**: Build main dashboard screen
**Design**: `dashboard/screen.png`

### Step 4.1: Header Component
- [ ] Menu icon (hamburger)
- [ ] FinAssistant title
- [ ] Proper spacing and typography
**Deliverable**: Reusable header component
**Review Point**: Visual match with design

### Step 4.2: Budget Card Component
- [ ] White card with shadow
- [ ] "August Budget" label
- [ ] Large amount display ($1,240.50)
- [ ] Income button (up arrow, green text)
- [ ] Spent button (down arrow, red text)
- [ ] Fetch budget data from API
**Deliverable**: Interactive budget card
**Review Point**: Test with real/mock data

### Step 4.3: Recent Transactions List
- [ ] "Recent Transactions" heading with "View All" link
- [ ] Transaction item component:
  - Icon with blue circular background
  - Transaction name
  - Date/time
  - Amount (negative in black)
- [ ] Icons for different categories
- [ ] List rendering (4-5 items)
- [ ] Fetch from API
**Deliverable**: Scrollable transactions list
**Review Point**: Test data fetching and rendering

### Step 4.4: Dashboard Integration
- [ ] Combine all components
- [ ] ScrollView for full page
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Pull to refresh
**Deliverable**: Complete dashboard screen
**Review Point**: Full dashboard testing

---

## Phase 5: Voice Capture Flow
**Goal**: Build voice recording and parsing screens

### Step 5.1: Voice Listening Screen
**Design**: `voice_capture_listening/screen.png`
- [ ] Full screen modal
- [ ] FinAssistant header with X button
- [ ] Large blue circular mic button (center)
- [ ] Concentric circle animation
- [ ] "Listening..." text
- [ ] Real-time transcript display
- [ ] Waveform visualization at bottom
- [ ] Cancel button
- [ ] Start recording with expo-av
- [ ] Stop recording
**Deliverable**: Voice recording interface
**Review Point**: Test audio recording

### Step 5.2: Voice Processing & API Integration
- [ ] Send audio to backend /voice/parse
- [ ] Show loading state while processing
- [ ] Handle API response
- [ ] Error handling
**Deliverable**: Working voice-to-backend pipeline
**Review Point**: Test end-to-end voice capture

### Step 5.3: Voice Confirmation Screen
**Design**: `voice_capture_parsing/screen.png`
- [ ] Success checkmark icon
- [ ] "Parsed Successfully" heading
- [ ] Transcript display with mic icon
- [ ] Amount input (editable)
- [ ] Category dropdown (Food & Drink)
- [ ] Description input
- [ ] Date display
- [ ] "Confirm Transaction" button
- [ ] "Re-record" button
- [ ] Submit transaction to API
**Deliverable**: Complete voice confirmation flow
**Review Point**: Test full voice-to-transaction flow

---

## Phase 6: Transaction History Screen
**Goal**: Build searchable transaction list
**Design**: `transactions_history/screen.png`

### Step 6.1: Search & Filter Header
- [ ] Header with menu icon
- [ ] Search bar with icon
- [ ] Filter icon button
- [ ] Search functionality
**Deliverable**: Working search interface
**Review Point**: Test search

### Step 6.2: Transaction List with Grouping
- [ ] Group by date (TODAY, YESTERDAY, etc.)
- [ ] Section headers
- [ ] Transaction items with icons
- [ ] Category labels
- [ ] Amount display
- [ ] Fetch paginated data from API
**Deliverable**: Grouped transaction list
**Review Point**: Test pagination and grouping

### Step 6.3: Swipe to Delete
- [ ] Swipeable transaction items
- [ ] Red delete button reveal
- [ ] Delete confirmation
- [ ] API delete call
- [ ] Optimistic UI update
**Deliverable**: Swipe-to-delete functionality
**Review Point**: Test delete flow

### Step 6.4: Filter Modal
- [ ] Filter by category
- [ ] Filter by date range
- [ ] Filter by amount range
- [ ] Apply filters to API query
**Deliverable**: Working filters
**Review Point**: Test all filter combinations

---

## Phase 7: Insights Screen
**Goal**: Build analytics and charts
**Design**: `insights/screen.png`

### Step 7.1: Page Header & Summary
- [ ] "Financial Overview" heading
- [ ] Subtitle text
- [ ] Fetch summary data from API
**Deliverable**: Insights header
**Review Point**: Visual match

### Step 7.2: Spending by Category Chart
- [ ] "Spending by Category" heading with menu icon
- [ ] Donut chart using Victory Native
- [ ] Center total amount ($3,450)
- [ ] Color segments (blue, dark blue, light blue, gray)
- [ ] Legend below chart:
  - Housing 45%
  - Food 25%
  - Transport 18%
  - Utilities 12%
- [ ] Fetch category breakdown from API
**Deliverable**: Interactive donut chart
**Review Point**: Test chart rendering and data

### Step 7.3: Weekly Spending Chart
- [ ] "Weekly Spending" heading
- [ ] "Last 7 Days" label
- [ ] Bar chart showing daily spending
- [ ] Days of week labels (M, T, W, T, F, S, S)
- [ ] Fetch weekly data from API
**Deliverable**: Weekly bar chart
**Review Point**: Test chart with different data sets

### Step 7.4: Insights Integration
- [ ] Combine all chart components
- [ ] ScrollView for full page
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error handling
**Deliverable**: Complete insights screen
**Review Point**: Full insights testing

---

## Phase 8: Profile Screen
**Goal**: Build settings and profile management
**Design**: `profile_settings/screen.png`

### Step 8.1: Profile Header
- [ ] Header with menu icon
- [ ] Profile photo with edit button
- [ ] Name display (Alex Mercer)
- [ ] Email display
- [ ] Fetch user data from API
**Deliverable**: Profile header component
**Review Point**: Visual match

### Step 8.2: Preferences Section
- [ ] "PREFERENCES" section header
- [ ] Currency setting with icon and arrow
  - Current value: USD ($)
  - Navigate to currency picker
- [ ] Monthly Budget setting
  - Current value: $4,500.00
  - Navigate to budget editor
**Deliverable**: Settings list
**Review Point**: Test navigation to setting screens

### Step 8.3: System Settings
- [ ] "SYSTEM" section header
- [ ] Push Notifications toggle
  - Icon
  - Description
  - Switch control
- [ ] Save preferences to API
**Deliverable**: Toggle switches and settings
**Review Point**: Test state persistence

### Step 8.4: Logout Functionality
- [ ] Logout button (pink/red background)
- [ ] Logout icon
- [ ] Confirmation dialog
- [ ] Clear auth state
- [ ] Navigate to login
**Deliverable**: Working logout
**Review Point**: Test complete logout flow

---

## Phase 9: Additional Features & Screens

### Step 9.1: Currency Picker Screen
- [ ] List of currencies
- [ ] Search functionality
- [ ] Current selection indicator
- [ ] Update user profile via API
**Deliverable**: Currency selection
**Review Point**: Test currency update

### Step 9.2: Budget Editor Screen
- [ ] Input for budget amount
- [ ] Period selector (monthly, weekly)
- [ ] Save button
- [ ] Update via API
**Deliverable**: Budget editing
**Review Point**: Test budget update

### Step 9.3: Transaction Detail Screen
- [ ] Full transaction details
- [ ] Edit functionality
- [ ] Delete option
- [ ] Update API
**Deliverable**: Transaction CRUD
**Review Point**: Test all operations

---

## Phase 10: Polish & Optimization

### Step 10.1: Loading States
- [ ] Skeleton screens for all views
- [ ] Shimmer effects
- [ ] Loading spinners
**Deliverable**: Professional loading UX
**Review Point**: Visual polish check

### Step 10.2: Empty States
- [ ] No transactions illustration
- [ ] No budget set message
- [ ] No data messages
- [ ] Call-to-action buttons
**Deliverable**: Helpful empty states
**Review Point**: User experience check

### Step 10.3: Error Handling
- [ ] Network error messages
- [ ] API error handling
- [ ] Form validation errors
- [ ] Retry mechanisms
**Deliverable**: Robust error handling
**Review Point**: Error scenario testing

### Step 10.4: Animations & Micro-interactions
- [ ] Screen transitions
- [ ] Button press animations
- [ ] List item animations
- [ ] Pull to refresh
- [ ] Haptic feedback
**Deliverable**: Smooth animations
**Review Point**: Feel and polish check

### Step 10.5: Performance Optimization
- [ ] Image optimization
- [ ] List virtualization
- [ ] React Query caching
- [ ] Minimize re-renders
**Deliverable**: Optimized performance
**Review Point**: Performance testing

---

## Phase 11: Testing & Deployment

### Step 11.1: Integration Testing
- [ ] Test all API endpoints
- [ ] Test auth flows
- [ ] Test data persistence
**Deliverable**: Verified integrations

### Step 11.2: Cross-platform Testing
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Test on web
- [ ] Fix platform-specific issues
**Deliverable**: Cross-platform compatibility

### Step 11.3: Build Configuration
- [ ] Set up EAS Build
- [ ] Configure app icons
- [ ] Configure splash screen
- [ ] Environment variables
**Deliverable**: Production build setup

---

## Current Status
✓ Step 1.1: Foundation started (theme constants created)
⏳ Next: Step 1.1 completion (Firebase & API config)

## Review Points Summary
After completing each major step, we'll:
1. **Visual Review**: Compare with design mockups
2. **Functional Review**: Test all interactions
3. **Code Review**: Ensure clean, maintainable code
4. **API Review**: Verify backend integration
5. **User Experience Review**: Check flow and polish

---

## How We'll Proceed
1. I'll complete a step
2. I'll notify you it's ready for review
3. You review the UI and code
4. You approve or request changes
5. We move to the next step

Ready to start with **Step 1.1: Environment & Firebase Configuration**?
