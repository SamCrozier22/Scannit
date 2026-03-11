import React, {useCallback} from "react";
import { View, Text, ActivityIndicator, Image, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

export default function SavedScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = "https://grazegood.onrender.com";

  useFocusEffect(() => {
    useCallback(() => {
      loadProducts();      
    })
  }, [])
  async function loadProducts( isRefreshing = false) {
    if(isRefreshing) {
      setRefreshing(false);
    } else {
      setLoading(true);
    }
    try {
      const username = await AsyncStorage.getItem("username");
      const res = await fetch(`${API_BASE}/saved/${username}`);
      const data = await res.json();
      setProducts(data);
    } catch(e) {
      console.log("Error loading saved Products", e)
    } finally {
      if(isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
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
      <FlatList
        data={products}
        keyExtractor={(item) => item.barcode}
        refreshing={refreshing}
        onRefresh={() => loadProducts(true)}
        renderItem={({ item }) => (
          <View style={{marginBottom: 20}}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {item.product_name ?? "Unknown Product"}
            </Text>
            <Text>{item.brands}</Text>
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 200, height: 200 }}
              />
            )}
            <Text>Eco Score: {item.ecoScore ?? "N/A"}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.falseText}>No saved products</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  falseText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
    textAlign: "center",
    justifyContent: "center",
  },
})