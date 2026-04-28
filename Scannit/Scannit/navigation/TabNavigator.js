import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";

import HomeScreen from "../Screens/HomeScreen";
import ScanScreen from "../Screens/ScanScreen";
import SavedScreen from "../Screens/SavedScreen";
import PremiumScreen from "../Screens/PremiumScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator({ setUser }) {
  return (
    <Tab.Navigator
      screenOptions={({route, navigation}) => ({
        tabBarActiveTintColor: "#108A2C",
        tabBarInactiveTintColor: "#A0AF84",
        tabBarStyle: {
          height: 80,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: "#215C3D"
        },
        headerStyle: {
          backgroundColor: "#215C3D",
          height: 120,
        },
        headerTitleStyle: {
          color: "#A0AF84",
          fontSize: 30,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center"
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 500,
        },
        headerShown: true,

        headerRight: () => (
          <TouchableOpacity 
          onPress={() => navigation.navigate("Profile")}
          style={{marginRight: 15}}
          >
            <FontAwesome name="user" size={24} color="#A0AF84" />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Scan") {
            iconName = "barcode";
          } else if (route.name === "Saved") {
            iconName = "bookmark";
          } else if (route.name === "Premium") {
            iconName = "star";
          }
          return <FontAwesome name={iconName} size={size} color={color} />
        }
      })}
    >
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen 
      name="Premium" 
      component={PremiumScreen}
      options={{
        tabBarIcon:({focused}) => (
          <FontAwesome name="star" size={24} color={focused ? "#c1ba03ff" : "#dfd811ff"} />
        ),
        tabBarLabel: ({ focused, color }) => (
          <Text style={{ color: focused ? "#dfd811ff" : "#c1ba03ff", fontSize: 11, fontWeight: 500}}>
            Premium
          </Text>
        ),
      }}
      />
      <Tab.Screen name="Saved" component={SavedScreen} />
    </Tab.Navigator>
  );
}