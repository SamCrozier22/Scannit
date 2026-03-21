import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";

import HomeScreen from "../Screens/HomeScreen";
import ScanScreen from "../Screens/ScanScreen";
import SavedScreen from "../Screens/SavedScreen";
import ProfileScreen from "../Screens/ProfileScreen";


const Tab = createBottomTabNavigator();

export default function TabNavigator({ setUser }) {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarActiveTintColor: "#e91e63",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Scan") {
            iconName = "barcode";
          } else if (route.name === "Saved") {
            iconName = "bookmark";
          } else if (route.name === "Profile") {
            iconName = "user";
          }
          return <FontAwesome name={iconName} size={size} color={color} />
        }
      })}
    >
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}