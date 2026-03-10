import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";

export default function RegisterScreen( { navigation } ) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://grazegood.onrender.com";
  async function handleRegister() {
    if(!username || !password || !firstName || !lastName || !email) {
      Alert.alert("Missing required fields");
      return;
    }
    setLoading(true);

    try {
      console.log("Sending register request");
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          firstName,
          lastName,
          email
        })
      })

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Registration successful", [
          { text: "Continue", onPress: () => navigation.navigate("Login") }
        ]);
      } else {
        Alert.alert("Error", data?.error ?? "Registration failed");
      }
    } catch (e) {
      console.log("Registration Error:", e);
      Alert.alert("Error: ", "Network error");
    } finally {
      setLoading(false);
    }
  }
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Register</Text>

      <TextInput
      placeholder="Enter Username"
      value={username}
      onChangeText={setUsername}
      autoCapitalize="none"
      />

      <TextInput
      placeholder="Enter First Name"
      value={firstName}
      onChangeText={setFirstName}
      />

      <TextInput
      placeholder="Enter Last Name"
      value={lastName}
      onChangeText={setLastName}
      />

      <TextInput
      placeholder="Enter Email"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      />

      <TextInput
      placeholder="Enter Password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry={true}
      />

      <Button
      title={loading ? "Registering..." : "Register"}
      onPress={handleRegister}
      disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {

  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
  input: {

  }
})