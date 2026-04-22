import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";


export default function PremiumScreen( { setUser }) {
const [isPremium, setIsPremium] = useState(false);

const API_BASE = "https://grazegood.onrender.com";

useEffect(() => {
  const fetchPremiumStatus = async () => {
    try {
      const username = await AsyncStorage.getItem("username");
      const res = await fetch(`${API_BASE}/user/${username}/premium`);
      const data = await res.json();
      if(res.ok) {
        setIsPremium(data.isPremium);
      }
    } catch (error) {
      console.log("Error fetching premium status:", error);
    }
  }
}, []);
  return (
    <View style={styles.MainPage}>
      <Text style={styles.text}>Premium</Text>
      {isPremium ? (
        <Text style={styles.text}>You are a premium user</Text>

      ) : (
        <>
          <Text style={styles.text}>You are not a premium user</Text>
          <Text style={styles.text}>Upgrade to premium to unlock all features</Text>
          <ul>
            <li>Unlimited Scans!</li>
            <li>Ad Free!</li>
            <li>Scan History</li>
            <li>Nutriment information</li>
          </ul>
          <TouchableOpacity
            onPress={() => setIsPremium(true)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Upgrade to premium</Text>
          </TouchableOpacity>
        </>
      )}
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