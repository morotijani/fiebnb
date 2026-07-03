import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../../App';

// Guest Screens
import ExploreScreen from '../screens/Guest/ExploreScreen';
import TripsScreen from '../screens/Guest/TripsScreen';
import ProfileScreen from '../screens/Guest/ProfileScreen';

// Host Screens
import MyListingsScreen from '../screens/Host/MyListingsScreen';
import CalendarScreen from '../screens/Host/CalendarScreen';
import PayoutsScreen from '../screens/Host/PayoutsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { isHomeownerMode } = useContext(AppContext);

  if (isHomeownerMode) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'My Listings') iconName = 'list';
            else if (route.name === 'Calendar') iconName = 'calendar';
            else if (route.name === 'Payouts') iconName = 'cash';
            else if (route.name === 'Profile') iconName = 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2b5cff',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="My Listings" component={MyListingsScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Payouts" component={PayoutsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Explore') iconName = 'search';
          else if (route.name === 'Trips') iconName = 'airplane';
          else if (route.name === 'Profile') iconName = 'person-circle';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff5a5f',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true }} />
    </Tab.Navigator>
  );
}
