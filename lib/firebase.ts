import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, Auth, UserCredential } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

if (typeof window !== 'undefined' && isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
    googleProvider.setCustomParameters({ prompt: 'select_account' })
  } catch (error) {
    console.warn('Firebase initialization error:', error)
  }
}

export { app, auth, googleProvider }

export async function loginWithRealGoogle(): Promise<{
  name: string
  email: string
  photoURL?: string
  uid: string
} | null> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase credentials not detected. Please add your Firebase configuration in .env.local.')
  }

  const result: UserCredential = await signInWithPopup(auth, googleProvider)
  const user = result.user

  return {
    name: user.displayName || 'Google User',
    email: user.email || '',
    photoURL: user.photoURL || undefined,
    uid: user.uid,
  }
}

export async function logoutRealGoogle(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth)
  }
}
