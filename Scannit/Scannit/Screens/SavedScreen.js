import React from "react";
import { View, Text, ActivityIndicator, Image, Flatlist } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export default function SavedScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://grazegood.onrender.com";

  useEffect(() => {
    loadProducts();
  })
  async function loadProducts() {
    try {
      const username = await AsyncStorage.getItem("username");
      const res = await fetch(`${API_BASE}/saved/${username}`);
      const data = await res.json();
      setProducts(data);
    } catch(e) {
      console.log("Error loading saved Products", e)
    } finally {
      setLoading(false);
    }
  }
  if(loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Flatlist
        data={products}
        keyExtractor={(item) => item.barcode}
        renderItem={({ item }) => (
          <View style={{marginBottom: 20}}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {item.name ?? "Unknown Product"}
            </Text>
            <Text>{item.brand}</Text>
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 200, height: 200 }}
              />
            )}
            <Text>Eco Score: {item.ecoScore ?? "N/A"}</Text>
          </View>
        )}
      />
    </View>
  );
}