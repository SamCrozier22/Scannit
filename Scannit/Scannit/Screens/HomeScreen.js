import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";
import React from "react";
import { View, Text, Button, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";

export default function HomeScreen( { setUser } ) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://grazegood.onrender.com";

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  async function loadProducts() {
    try {
      const username = await AsyncStorage.getItem("username");
      const res = await fetch(`${API_BASE}/saved/${username}`);
      const data = await res.json();

      if(res.ok) {
        setProducts(data);
      } else {
        console.log("Saved products error:", data?.error);
        setProducts([]);
      }
    } catch(e) {
      console.log("Error loading saved Products", e)
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.MainPage}>
      <Text style={styles.Title}>GrazeGood</Text>
      <Text style={{color: "#215C3D", fontSize: 20, fontWeight: "bold", textAlign: "left", marginBottom: 10}}>Saved Products ({products.length})</Text>
    <View style={styles.RecentContainer}>
      {products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={styles.NoProducts}>
          <Text style={styles.falseText}>No saved Products</Text>
          <Text style={styles.falseText}>Scan a product to save it</Text>
        </View>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.barcode}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: products.length <= 2 ? "center" : "flex-start",
          }}
          renderItem={({ item }) => (
            <View style={styles.ProductContainer}>
            <View style={styles.Product}>
              {item.imageUrl && (
                <Image
                  style={{ width: 100, height: 100 }}
                  source={{ uri: item.imageUrl }}
                />
              )}
              <Text style={{ color: "#A0AF84", fontSize: 15, textAlign: "center", fontWeight: "bold"}}>{item.product_name}</Text>

              <Text style={{ color: "#A0AF84", fontSize: 15, textAlign: "center"}}>Eco Score: {item.ecoScore}</Text>
          </View>

          </View>
          )}
          
        />
      )}
    </View>
    </View>
  );

}
const styles = StyleSheet.create({
  MainPage: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#C3B59F",
  },
  Title: {
    color: "#215C3D",
    fontSize: 30,
    fontWeight: "bold",
    padding: 20
  },
  RecentContainer: {
    borderRadius: 10,
    padding: 0,
    backgroundColor: "#215C3D",
    width: "100%",
    height: 250,

    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 5
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  falseText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#A0AF84",
    textAlign: "center",
    justifyContent: "center",
  },
  Product: {
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
    maxWidth: 100,
    maxHeight: 120,
    marginVertical: "auto",
  },
  ProductContainer: {
    padding: 10,
    backgroundColor: "#2D4739",
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 20,
    
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 5
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  NoProducts: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, 
  },
});