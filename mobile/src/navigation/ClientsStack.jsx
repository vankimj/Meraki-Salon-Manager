import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientsScreen      from '../screens/ClientsScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';

const Stack = createNativeStackNavigator();

// Clients tab gets its own stack so we can drill into a client's
// profile with a real back button and screen transition. ClientsList
// is the tab's root; tapping a row navigates to ClientDetail.
export default function ClientsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: '#fff' },
        headerTintColor:  '#2D7A5F',
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
      }}
    >
      <Stack.Screen
        name="ClientsList"
        component={ClientsScreen}
        options={{ title: 'Clients' }}
      />
      <Stack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={({ route }) => ({ title: route.params?.clientName || 'Client' })}
      />
    </Stack.Navigator>
  );
}
