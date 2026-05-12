import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen       from '../screens/ChatScreen';
import ChatThreadScreen from '../screens/ChatThreadScreen';
import HeaderTitle      from '../components/HeaderTitle';

const Stack = createNativeStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:     { backgroundColor: '#fff' },
        headerTintColor: '#2D7A5F',
      }}
    >
      <Stack.Screen
        name="ChatList"
        component={ChatScreen}
        options={{ headerTitle: () => <HeaderTitle title="Messages" /> }}
      />
      <Stack.Screen
        name="ChatThread"
        component={ChatThreadScreen}
        options={({ route }) => ({ headerTitle: () => <HeaderTitle title={route.params?.clientName || 'Client'} /> })}
      />
    </Stack.Navigator>
  );
}
