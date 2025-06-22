import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  deleteUser,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

// Create Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

/**
 * Handle Google Login (Only for existing users)
 * @param {Function} navigate - React Router navigate function
 * @returns {Promise<Object>} User data or error
 */
export const handleGoogleLogin = async (navigate) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // User doesn't exist - this is a new account
      // Delete the Firebase auth account and redirect to register
      await deleteUser(user);
      await signOut(auth);
      
      // Redirect to register page
      navigate('/register');
      
      throw new Error('Account not found. Please register first.');
    }

    // Update last login timestamp
    await setDoc(userDocRef, {
      lastLogin: serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        ...userDoc.data()
      }
    };

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error types
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Login cancelled by user');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked by browser. Please allow popups and try again.');
    } else if (error.message === 'Account not found. Please register first.') {
      throw error;
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

/**
 * Handle Google Registration (Only for new users)
 * @returns {Promise<Object>} User data or error
 */
export const handleGoogleRegister = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log("result", result);
    console.log('Google user:', user);

    // Check if user already exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // User already exists - they should use login instead
      await signOut(auth);
      throw new Error('Account already exists. Please use the login page.');
    }

    // Create new user document in Firestore
    const userData = {
      googleId: user.uid,
      name: user.displayName || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      email: user.email || '',
    };

    await setDoc(userDocRef, userData);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        ...userData
      }
    };

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error types
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Registration cancelled by user');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked by browser. Please allow popups and try again.');
    } else if (error.message === 'Account already exists. Please use the login page.') {
      throw error;
    } else {
      throw new Error('Registration failed. Please try again.');
    }
  }
};

/**
 * Sign out user
 * @returns {Promise<void>}
 */
export const handleSignOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Sign out failed. Please try again.');
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>} Current user or null
 */
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Get user data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User data or null
 */
export const getUserData = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return {
        uid,
        ...userDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Failed to fetch user data');
  }
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Update user's last login timestamp
 * @param {string} uid - User ID
 * @returns {Promise<void>}
 */
export const updateLastLogin = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      lastLogin: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw error as this is not critical
  }
};