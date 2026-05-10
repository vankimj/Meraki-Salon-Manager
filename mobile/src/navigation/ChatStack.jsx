import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen       from '../screens/ChatScreen';
import ChatThreadScreen from '../screens/ChatThreadScreen';

const Stack = createNativeStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: '#fff' },
        headerTintColor:  '#2D7A5F',
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
      }}
    >
      <Stack.Screen
        name="ChatList"
        component={ChatScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="ChatThread"
        component={ChatThreadScreen}
        options={({ route }) => ({ title: route.params?.clientName || 'Client' })}
      />
    </Stack.Navigator>
  );
}
