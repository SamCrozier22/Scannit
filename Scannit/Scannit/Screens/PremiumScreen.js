import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import Toast from "react-native-toast-message";

export default function PremiumScreen( { setUser }) {
const [isPremium, setIsPremium] = useState(false);
const [premiumStart, setPremiumStart] = useState(null);
const [premiumEnd, setPremiumEnd] = useState(null);
const [autoRenewal, setAutoRenewal] = useState(true);
const [loading, setLoading] = useState(true);

const API_BASE = "https://grazegood.onrender.com";

useEffect(() => {
  fetchPremiumStatus();
}, []);
  async function fetchPremiumStatus() {
    try {
      const username = await AsyncStorage.getItem("username");
      if(!username) return;
      const res = await fetch(`${API_BASE}/user/${username}/premium`);
      const data = await res.json();
      if(res.ok) {
        setIsPremium(data.isPremium);
        setPremiumStart(data.premiumStart);
        setPremiumEnd(data.premiumEnd);
        setAutoRenewal(data.autoRenewal);
      } else {
        console.log("Error fetching premium status:", data?.error);
      }
    } catch (error) {
      console.log("Error fetching premium status:", error);
    } finally {
      setLoading(false);
    }
  }
  async function buyPremium() {
    try {
      const username = await AsyncStorage.getItem("username");
      if(!username) return;

      const res = await fetch(`${API_BASE}/user/${username}/buyPremium`, {
        method: "POST"
      })
      const data = await res.json();
      if(res.ok) {
        setIsPremium(data.isPremium);
        setPremiumStart(data.premiumStart);
        setPremiumEnd(data.premiumEnd);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: data?.message ?? "Premium updated successfully",
          visibilityTime: 2000
        })
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: data?.error ?? "Could not purchase premium",
          visibilityTime: 2000
        })
      }
    } catch (e) {
      console.log("Error buying premium", e);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not purchase premium",
        visibilityTime: 2000
      })
    }
  }
  async function toggleRenewal() {
    try {
      const username = await AsyncStorage.getItem("username");
      if(!username) return;

      const res = await fetch(`${API_BASE}/user/${username}/togglePremiumRenewal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({autoRenewal: value})
     })
     const data = await res.json();

     if(res.ok) {
       setAutoRenewal(data.autoRenewal);
       Toast.show({
         type: "success",
         text1: "Success",
         text2: value ? "Renewal enabled successfully" : "Renewal disabled successfully",
         visibilityTime: 2000
       })
     } else {
      console.log("Error toggling renewal: ", data?.error);
     }
    } catch (e) {
      console.log("Toggle renewal Error: ", e);
    }
  }
  return (
    <View style={styles.MainPage}>
      <Text style={styles.title}>Premium</Text>

      {loading ? (
       <Text style={styles.text}>Loading...</Text> 
      ): isPremium ? (
        <>
        <View style={styles.switchRow}>
          <Text style={[styles.text, styles.premiumUserText]}>You are a Premium user</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Auto Renewal: {autoRenewal ? "ON" : "OFF"}</Text>
            <Switch value={autoRenewal} onValueChange={toggleRenewal} />
          </View>
        </View>
          <Text style={styles.text}>
            Premium Started: {premiumStart ? new Date(premiumStart).toLocaleDateString() : "N/A"}
          </Text>
          <Text style={styles.text}>
            Premium Ends: {premiumEnd ? new Date(premiumEnd).toLocaleDateString() : "N/A"}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.text}>You are not a Premium user</Text>
          <Text style={styles.text}>Upgrade to premium to unlock all features</Text>
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefit}>Unlimited scans!</Text>
            <Text style={styles.benefit}>No Ads!</Text>
            <Text style={styles.benefit}>Scan History</Text>
            <Text style={styles.benefit}>Nutriment Information</Text>
          </View>
          <Text style={styles.text}>All of that for just £3.99 per month</Text>
          <TouchableOpacity style={styles.button} onPress={buyPremium}>
            <Text style={styles.buttonText}>Buy Premium</Text>
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
    padding: 20,
  },
  title: {
    color: "#215C3D",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    color: "#215C3D",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  benefitsContainer: {
    marginVertical: 20,
    alignItems: "flex-start"
  },
  benefit: {
    color: "#215C3D",
    fontSize: 18,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#108A2C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    position: "absolute",
    right: 0,
  },
});