# Angular Ticketing System - Setup Instructions

## 🎯 Architecture Overview

This Angular application has been scaffolded with the following structure:

### 📁 Folder Structure
```
src/app/
├── guards/
│   └── auth.guard.ts          # Authentication guards
├── services/
│   ├── auth.service.ts        # Authentication service
│   └── user.service.ts        # User management service
├── login/
│   ├── login.component.ts     # Login page component
│   ├── login.component.html   # Login template
│   └── login.component.sass   # Login styles
├── home/
│   ├── home.component.ts      # Home dashboard component
│   ├── home.component.html    # Home template
│   ├── home.component.sass    # Home styles
│   └── home.routes.ts         # Home module routes
├── app.routes.ts              # Main routing configuration
├── app.config.ts              # App configuration with providers
├── app.ts                     # Root component
└── app.html                   # Root template
```

## 🚀 Installation Steps

### 1. Install Angular Material
Due to PowerShell execution policy restrictions, please run this command manually:

```bash
npm install @angular/material @angular/cdk @angular/animations
```

Or if you encounter peer dependency issues:
```bash
npm install @angular/material @angular/cdk @angular/animations --legacy-peer-deps
```

### 2. Install Dependencies (if not already done)
```bash
npm install
```

### 3. Run the Application
```bash
npm start
```

The app will be available at `http://localhost:4200`

## 📋 Features Implemented

### ✅ Authentication System
- **AuthService** (`src/app/services/auth.service.ts`)
  - `login(credentials)` - Mock JWT authentication
  - `logout()` - Clear session and redirect
  - `isAuthenticated()` - Check auth status
  - Token storage in localStorage

- **UserService** (`src/app/services/user.service.ts`)
  - `getCurrentUser()` - Get current user info
  - `getUserById(id)` - Fetch user by ID
  - `updateProfile(data)` - Update user profile

### ✅ Route Guards
- **authGuard** - Protects authenticated routes (home)
- **guestGuard** - Prevents authenticated users from accessing login

### ✅ Routing Configuration
- `/` → Redirects to `/home`
- `/login` → Login page (guest only)
- `/home` → Dashboard (lazy-loaded, protected)
- `/**` → Redirects to `/home`

### ✅ Components

#### Login Component
- Material form fields for username/password
- Form validation (min 3 chars for username, 4 for password)
- Loading spinner during authentication
- Snackbar notifications for success/error
- Redirects to home on successful login

#### Home Component
- Material toolbar with navigation
- Welcome message with user info
- Logout functionality
- Dashboard cards with quick actions
- Responsive design

### ✅ Angular Material Setup
- Theme configured in `src/styles.sass`
- Indigo/Pink color palette
- Material components used:
  - Toolbar
  - Cards
  - Form Fields
  - Buttons
  - Icons
  - Progress Spinner
  - Snackbar

## 🎨 Styling
- SASS for styling
- Material Design theme with Indigo primary and Pink accent colors
- Responsive layouts
- Custom gradient backgrounds for login page

## 🔐 Mock Authentication

The app uses **mock authentication** for demonstration:

**Test Credentials:**
- Username: Any username (min 3 characters)
- Password: Any password (min 4 characters)

The mock auth creates a fake JWT token and stores it in localStorage.

## 📝 Next Steps

### To Replace Mock Auth with Real API:
1. Update `AuthService.login()` to call your backend API
2. Replace mock token generation with real JWT handling
3. Add HTTP interceptor for token injection
4. Update `UserService` methods to call real endpoints

### Suggested Improvements:
- Add HTTP client and interceptors
- Implement token refresh mechanism
- Add error handling middleware
- Create loading service for global loading state
- Add form validation messages
- Implement password visibility toggle
- Add "Remember Me" functionality
- Create 404 page component

## 🛠️ Technologies Used
- **Angular 20** (latest)
- **Angular Material** (UI components)
- **Standalone Components** (modern Angular approach)
- **RxJS** (reactive programming)
- **SASS** (styling)
- **TypeScript** (type safety)

## 📦 Project Structure Notes
- Uses **standalone components** (no NgModules needed)
- **Lazy loading** for home module
- **Functional guards** (modern Angular approach)
- **Signal-based** reactive patterns where applicable

## 🐛 Troubleshooting

### Material Not Found Errors
If you see errors about `@angular/material` modules not found, ensure you've run:
```bash
npm install @angular/material @angular/cdk @angular/animations
```

### Build Errors
Try clearing the cache:
```bash
npm run build -- --configuration development
```

### Port Already in Use
Change the port in `package.json` or run:
```bash
ng serve --port 4201
```

## ✨ Ready to Go!

Your Angular ticketing system is now scaffolded with:
- ✅ Material Design UI
- ✅ Authentication flow
- ✅ Protected routes
- ✅ Lazy loading
- ✅ Standalone components
- ✅ Service architecture

Happy coding! 🚀
