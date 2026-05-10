import { registerRootComponent } from 'expo';
import App from './App';

// Required entry point for Expo SDK 54+ — registers the App component
// as the React Native "main" application name. Older SDKs auto-derived
// this from package.json "main", which broke in SDK 54.
registerRootComponent(App);
