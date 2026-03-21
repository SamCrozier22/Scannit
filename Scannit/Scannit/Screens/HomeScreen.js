import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen( { setUser } ) {

  return (
    <View style={styles.MainPage}>
      <Text>Home Screen</Text>
    </View>
  );

}
const styles = StyleSheet.create({
  MainPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C3B59F",
  }
});