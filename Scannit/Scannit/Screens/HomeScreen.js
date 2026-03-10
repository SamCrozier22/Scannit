import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, Button } from "react-native";

export default function HomeScreen( { setUser } ) {
  async function logOut() {
  await AsyncStorage.removeItem("username")
  setUser(null)
}

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