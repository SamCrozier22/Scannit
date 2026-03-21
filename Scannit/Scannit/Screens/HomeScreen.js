import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen( { setUser } ) {

  return (
    <View style={styles.MainPage}>
      <Text style={styles.Title}>GrazeGood</Text>
      
    </View>
  );

}
const styles = StyleSheet.create({
  MainPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C3B59F",
  },
  Title: {
    color: "#215C3D",
    fontSize: 30,
    fontWeight: "bold",
  }
});