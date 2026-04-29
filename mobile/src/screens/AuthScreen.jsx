import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, ALLOWED_EMAILS } from '../lib/firebase';
import { fetchUsers } from '../lib/firestore';

// Configure before use — replace with your web client ID from Google Cloud Console
GoogleSignin.configure({
  webClientId: '721171829996-REPLACE_WITH_WEB_CLIENT_ID.apps.googleusercontent.com',
});

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const email = result.user.email;

      // Bootstrap admin always allowed; others need a role record
      if (!ALLOWED_EMAILS.includes(email)) {
        const users = await fetchUsers();
        const record = users.find(u => u.email === email);
        if (!record || ['pending', 'denied'].includes(record.role)) {
          await auth.signOut();
          Alert.alert('Access Denied', 'Your account has not been granted access. Contact the salon admin.');
        }
      }
    } catch (err) {
      if (err.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Sign-in failed', err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>Meraki</Text>
        <Text style={styles.sub}>NAIL STUDIO</Text>
        <Text style={styles.tagline}>Salon Manager</Text>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.googleBtnText}>Sign in with Google</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1923',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontSize: 52,
    fontWeight: '400',
    color: '#fff',
    letterSpacing: 2,
  },
  sub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D9E8A',
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 3,
    marginBottom: 40,
    textTransform: 'uppercase',
  },
  googleBtn: {
    width: '100%',
    backgroundColor: '#3D95CE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  googleBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
