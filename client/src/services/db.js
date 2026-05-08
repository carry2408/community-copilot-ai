import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Save analysis results for a user
export const saveUserResults = async (userId, data) => {
  if (!db) {
    console.warn("Firestore not initialized");
    return;
  }
  
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      lastAnalysis: data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving results to Firestore:", error);
    return false;
  }
};

// Get past analysis results for a user
export const getUserResults = async (userId) => {
  if (!db) return null;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data().lastAnalysis;
    }
    return null;
  } catch (error) {
    console.error("Error fetching results from Firestore:", error);
    return null;
  }
};
