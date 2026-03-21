import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PremiumScreen() {

  return (
    <View style={styles.MainPage}>
      <Text style={{color: "#215C3D", fontSize: 30, fontWeight: "bold"}}>Premium coming soon 🚀</Text>

      <Text style={{color: "#215C3D", fontSize: 20, fontWeight: "bold"}}>Premium Features</Text>
      <Text style={styles.text}>- No Ads</Text>
      <Text style={styles.text}>- More Scans Per Day</Text>
      <Text style={styles.text}>- Detailed Stats About Your Scans</Text>
      <Text style={styles.text}>- Scan History</Text>
      <Text style={styles.text}>- Reasoning for Eco scores</Text>
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
  text: {
    color: "#215C3D",
  },
});