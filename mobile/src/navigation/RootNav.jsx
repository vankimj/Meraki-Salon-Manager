import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen     from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ClientsScreen  from '../screens/ClientsScreen';

const Stack = createNativeStackNavigator();

const BRAND_GREEN = '#2D7A5F';

export default function RootNav() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle:     { backgroundColor: '#fff' },
          headerTintColor: BRAND_GREEN,
          headerTitleStyle:{ fontWeight: '700', fontSize: 16 },
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Meraki Salon' }}
        />
        <Stack.Screen
          name="Schedule"
          component={ScheduleScreen}
          options={{ title: 'Schedule' }}
        />
        <Stack.Screen
          name="Clients"
          component={ClientsScreen}
          options={{ title: 'Clients' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
