# Auth Pages

Login and signup pages with Firebase Authentication support.

## Usage

```bash
stacksolo add auth-pages
```

## What's Included

- `apps/auth/src/pages/Login.vue` - Login page with email/password and Google
- `apps/auth/src/pages/Signup.vue` - Signup page
- `apps/auth/src/lib/firebase.ts` - Firebase SDK configuration
- `apps/auth/src/stores/auth.ts` - Pinia auth store

## Features

- Email/password authentication
- Google sign-in
- Remember me functionality
- Error handling with user-friendly messages
- Loading states

## Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication and add providers (Email, Google)
3. Create `.env.local` with your config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## Customization

### Add More Providers

Edit `stores/auth.ts` to add more OAuth providers:

```typescript
import { GithubAuthProvider, TwitterAuthProvider } from 'firebase/auth';

async function signInWithGithub() {
  const provider = new GithubAuthProvider();
  await signInWithPopup(auth, provider);
}
```

### Redirect After Login

Update the login page to redirect:

```typescript
const router = useRouter();
// After successful login:
router.push('/dashboard');
```
