import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigator from "./TabNavigator";
import LoginScreen from "../Screens/LoginScreen";
import RegisterScreen from "../Screens/RegisterScreen";
import ProfileScreen from "../Screens/ProfileScreen";
import ProductScreen from "../Screens/ProductScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const savedUser = await AsyncStorage.getItem("username");
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (e) {
        console.log("Error loading user:", e);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: true,
      headerStyle: {
          backgroundColor: "#215C3D",
          height: 120,
      },
      headerTitleStyle: {
          color: "#A0AF84",
          fontSize: 30,
      },
      headerBackVisible: false,
      }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs"
          options={{headerShown: false}}
          >
            {(props) => <TabNavigator {...props} setUser={setUser} />}
          </Stack.Screen>

          <Stack.Screen name="Profile">
            {(props) => <ProfileScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="Product" component={ProductScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}