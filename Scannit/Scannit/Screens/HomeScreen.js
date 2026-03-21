import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, Button } from "react-native";

export default function HomeScreen( { setUser } ) {

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>
    </View>
  );

}