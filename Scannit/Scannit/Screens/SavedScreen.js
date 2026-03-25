import React, { useState, useCallback } from "react";
import { View, Text, ActivityIndicator, Image, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Pressable } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

export default function SavedScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = "https://grazegood.onrender.com";

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );
  async function deleteProduct(barcode) {
    try {
      const username = await AsyncStorage.getItem("username");

      const res = await fetch({
        method: "DELETE",
      })

      const data = await res.json();

      if(res.ok) {
        setProducts((prev) > prev.filter((item) => item.barcode !== barcode))
      } else {
        console.log("Error deleting product", data?.error);
      }
    } catch(e) {
      console.log("Error deleting product", e);
    }
  }
  function renderRightActions(barcode) {
    return (
      <Pressable 
      onPress={() => deleteProduct(barcode)}
      style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    )
  }
  async function loadProducts( isRefreshing = false) {
    if(isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const username = await AsyncStorage.getItem("username");
      const res = await fetch(`${API_BASE}/saved/${username}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data);
      } else {
        console.log("Saved products error:", data?.error);
        setProducts([]);
      }

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
      <View style={styles.MainContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View style={styles.MainContainer}>
      <FlatList
        style={styles.flatlist}
        data={products}
        keyExtractor={(item) => item.barcode}
        refreshing={refreshing}
        contentContainerStyle={{ flexGrow: 1 }}
        onRefresh={() => loadProducts(true)}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.barcode)}>
            <View style={styles.savedProductContainer}>
              <View style={styles.savedProduct}>
                {item.imageUrl && (
                  <View>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: 150, height: 150, borderRadius: 10 }}
                    />
                  </View>
                )}
                <View style={styles.savedProductInfo}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#A0AF84" }}>
                    {item.product_name ?? "Unknown Product"}
                  </Text>
                  <Text style={{color: "#A0AF84", fontSize: 15, fontWeight: "bold", marginTop: 10}}>{item.brands}</Text>
                  <View style={styles.divider}></View>
                  <Text style={{color: "#A0AF84", fontSize: 18}}>Eco Score: {item.ecoScore ?? "N/A"}</Text>
                </View>
              </View>
            </View>
          </Swipeable>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.falseText}>No saved products</Text>
            <Text>Pull down to refresh</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1, 
    justifyContent: "center", 
    backgroundColor: "#C3B59F"
  },
  divider: {
    height: 1,
    backgroundColor: '#A0AF84',
    width: "100%",
    marginVertical: 10,
  },
  falseText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
    textAlign: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C3B59F",
    margin: 0,
  },
  flatlist: {
    flex: 1,
    backgroundColor: "#C3B59F",
    margin: 0,
  },
  savedProductContainer: {
    backgroundColor: "#215C3D",
    padding: 10,
    margin: 10,
    borderRadius: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 5
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  savedProduct: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  savedProductInfo: {
    display: "flex",
    marginLeft: 10,
    justifyContent: "space-between",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fa4437",
    padding: 10,
    borderRadius: 10,
    width: "100%"
  },
  deleteText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 18,
  }
})