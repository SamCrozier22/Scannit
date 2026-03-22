import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
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
    <View style={styles.container}>

    <View style={styles.InputContainer}>
      <Text style={styles.title}>Enter Your Details</Text>
      <TextInput
      style={styles.input}
      placeholder="Enter Username"
      value={username}
      onChangeText={setUsername}
      autoCapitalize="none"
      />

      <TextInput
      style={styles.input}
      placeholder="Enter First Name"
      value={firstName}
      onChangeText={setFirstName}
      />

      <TextInput
      style={styles.input}
      placeholder="Enter Last Name"
      value={lastName}
      onChangeText={setLastName}
      />

      <TextInput
      style={styles.input}
      placeholder="Enter Email"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      />

      <TextInput
      style={styles.input}
      placeholder="Enter Password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry={true}
      />

      <TouchableOpacity
      style={styles.registerBtn}
      onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      </View>
      <Text 
      style={{ color: "#2D4739", fontSize: 18, fontWeight: "bold", marginTop: 20 }}
      >
        Already Have an Account?
      </Text>
      <TouchableOpacity
      style={styles.registerBtn}
      onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C3B59F",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#A0AF84",
  },
  input: {
    width: 200,
    height: 40,
    margin: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#d3c5b0ff",
  },
  InputContainer: {
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#2D4739",
    width: "80%",

    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 5
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,

    justifyContent: "center",
    alignItems: "center",
  },
  registerBtn: {
    backgroundColor: '#108A2C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 15
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  }
})