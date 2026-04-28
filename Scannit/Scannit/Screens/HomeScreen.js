import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback, useEffect } from "react";
import React from "react";
import { View, Text, Button, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from "react-native";

export default function HomeScreen( { setUser, navigation } ) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productOfTheWeek, setProductOfTheWeek] = useState([]);

  const API_BASE = "https://grazegood.onrender.com";

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

async function loadProductOfTheWeek() {
  try {
    const res = await fetch(`${API_BASE}/products-of-the-week`);
    const text = await res.text();

    console.log("POTW status:", res.status);
    console.log("POTW raw response:", text);

    const data = JSON.parse(text);

    if (res.ok) {
      setProductOfTheWeek(data);
    } else {
      console.log("Product of the week error:", data?.error);
      setProductOfTheWeek([]);
    }
  } catch (e) {
    console.log("Error loading product of the week", e);
  }
}
useEffect(() => {
  loadProductOfTheWeek()
}, [])
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
    <ScrollView
      style={{ flex: 1, backgroundColor: "#C3B59F" }}
      contentContainerStyle={{
      flexGrow: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: "#C3B59F",
      paddingBottom: 40,
    }}
    >
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
            <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Product", { barcode: item.barcode })}
            >
              <View style={styles.ProductContainer}>
                <View style={styles.Product}>
                  {item.imageUrl ? (
                    <Image
                      style={styles.ProductImage}
                      source={{ uri: item.imageUrl }}
                    />
                  ) : (
                    <Image
                      style={styles.ProductImage}
                      source={require("../assets/product-placeholder.jpg")}
                    />
                  )} 
                  <Text
                  style={styles.ProductName}
                  numberOfLines={4}
                  ellipsizeMode="tail"
                  >
                    {item.product_name}
                  </Text>
                  <View style={{flex: 1}}/>
                  <Text style={styles.EcoScore}>Eco Score: {item.ecoScore}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
      <Text style={{color: "#215C3D",marginTop: 20, fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10}}>GrazeGood Picks of the Week</Text>

    <View style={styles.weeklyContainer}>
        <FlatList
          data={productOfTheWeek}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: productOfTheWeek.length <= 2 ? "center" : "flex-start",
          }}
          renderItem={({ item }) => (
            <View style={styles.ProductContainer}>
              <View style={styles.Product}>
                {item.imageUrl ? (
                  <Image
                    style={styles.ProductImage}
                    source={{ uri: item.imageUrl }}
                  />
                ) : (
                  <Image
                    style={styles.ProductImage}
                    source={require("../assets/product-placeholder.jpg")}
                  />
                )} 
                <Text
                style={styles.ProductName}
                numberOfLines={4}
                ellipsizeMode="tail"
                >
                  {item.product_name}
                </Text>
                <View style={{flex: 1}}/>
                <Text style={styles.EcoScore}>Eco Score: {item.ecoScore}</Text>
                <Text style={styles.EcoScore}>Eco Grade: {item.ecoScoreGrade}</Text>
              </View>
            </View>
          )}
        />
    </View>
    </ScrollView>
  );

}
const styles = StyleSheet.create({
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
    height: 300,

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
    gap: 5
  },
  ProductName: { 
    color: "#A0AF84", 
    fontSize: 14, 
    textAlign: "center", 
    fontWeight: "bold",
    width: 100,
    minHeight: 50
  },
  ProductImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  EcoScore: { 
    color: "#A0AF84", 
    fontSize: 14, 
    textAlign: "center",
    marginBottom: 10
  },
  ProductContainer: {
    padding: 10,
    backgroundColor: "#2D4739",
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 20,
    width: 150,
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
  NoProducts: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, 
  },
  Button: {
    backgroundColor: '#108A2C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  ButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weeklyContainer: {
    marginHorizontal: 20,
    width: "100%",
    height: 300,
    backgroundColor: "#215C3D",
    borderRadius: 10
  }
});