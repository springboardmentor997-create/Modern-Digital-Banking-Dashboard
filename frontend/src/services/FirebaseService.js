// Firebase Service for Real-time Notifications and Alerts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'your-vapid-key'
      });
      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

// Add alert to Firestore
export const addAlert = async (alertData) => {
  try {
    const docRef = await addDoc(collection(db, 'alerts'), {
      ...alertData,
      timestamp: new Date(),
      read: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding alert:', error);
    throw error;
  }
};

// Listen to alerts in real-time
export const subscribeToAlerts = (userId, callback) => {
  const q = query(
    collection(db, 'alerts'),
    orderBy('timestamp', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const alerts = [];
    snapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    callback(alerts);
  });
};

export { db, messaging };