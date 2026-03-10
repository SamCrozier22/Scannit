import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, Button } from "react-native";

async function logOut() {
  await AsyncStorage.removeItem("username")
  setUser(null)
}
export default function HomeScreen( { navigation, setUser } ) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>

      <Button
        title="Logout"
        onPress={logOut}
      />
    </View>
  );

}