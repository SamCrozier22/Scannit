
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator, Image } from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScanScreen() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ecoScore, setEcoScore] = useState(null);
  const [ecoReason, setEcoReason] = useState(null);

  const [lastBarcode, setLastBarcode] = useState(null);
  const [savedBy, setSavedBy] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

useEffect(() => {
  pingAPI();

  (async () => {
    const username = await AsyncStorage.getItem("username");
    setSavedBy(username);
  })();
}, []);

  const API_BASE = "https://grazegood.onrender.com";

  async function pingAPI() {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    console.log(data);
  }

  async function DeviceId() {
    const existing = await AsyncStorage.getItem("deviceId");
    if(existing) return existing;

    const newId = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem("deviceId", newId);
    return newId;
  }

  async function saveProduct() {
    if(!product || !lastBarcode || !savedBy) {
      setSaveMessage("Missing required fields");
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    
    try {
      const res = await fetch(`${API_BASE}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          savedBy,
          barcode: lastBarcode,
          productName: product.product_name ?? null,
          brands: product.brands ?? null,
          imageUrl: product.image_front_small_url ?? null,
          eco: {
            ecoScore,
            ecoReason,
          },
        })
      })

      const data = await res.json();

      if(res.ok) {
        setSaveMessage("Product saved");
        console.log("Saved: ", data);
      } else {
        setSaveMessage(data?.error ?? "Failed to save product");
      }
    } catch (e) {
      console.log("Save Error:", e);
      setSaveMessage(e?.message ?? "Network error");
    } finally {
      setSaving(false);
    }
  }

async function fetchProduct(productCode) {
  setLoading(true);
  setError(null);
  setProduct(null);

  try {
    const res = await fetch(`${API_BASE}/product/${encodeURIComponent(productCode)}`);
    const data = await res.json();

    if (res.ok) {
      setProduct(data);
      setEcoScore(data.eco?.ecoScore ?? null);
      setEcoReason(data.eco?.ecoReason ?? null);
    } else {
      setError(data?.error ?? "Not found");
    }
  } catch (e) {
    console.log(e);
    setError("Network error");
  } finally {
    setLoading(false);
  }
}
  
  const handleScan = ({data}) => {
    if(scanned) return;
    setScanned(true);
    setLastBarcode(data);
    setSaveMessage(null);
    fetchProduct(data);
  };

  if(!permission) return <Text>Requesting for camera permission</Text>
  if(!permission.granted) return <Text>No access to camera</Text>

  return (
    <View style={{flex: 1, padding: 20}}>
      <StatusBar style="auto" />
      <View style={{flex: 1, borderRadius: 10, overflow: 'hidden'}}>
        <CameraView
          style={{flex: 1}}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"]
          }}
          onBarcodeScanned={scanned ? undefined : handleScan}
        />
      </View>

      {scanned && (
        <Button
          title="Scan again"
          onPress={() => {
            setScanned(false)
            setProduct(null)
            setError(null)
            setSaveMessage(null)
            setEcoScore(null)
            setEcoReason(null)
          }}
        />
      )}
      {loading && <ActivityIndicator />}
      {error && <Text style={{color: 'red'}}>{error}</Text>}

      {product && (
        <View style={styles.ProductInfo}>
          <Text style={styles.TitleText}>Product Name: {product.product_name ?? "Unknown"}</Text>
          <Text style={styles.TitleText}>Brand: {product.brands ?? "Unknown"}</Text>
          {product.nutriments?.["energy-kcal_100g"] ? (
            <Text>Calories (kcal): {product.nutriments?.["energy-kcal_100g"]}</Text>
          ) : null}
          {product.nutriments?.["proteins_100g"] ? (
            <Text>Proteins (g): {product.nutriments?.["proteins_100g"]}</Text>
          ) : null}
          {product.nutriments?.["fat_100g"] ? (
            <Text>Fats (g): {product.nutriments?.["fat_100g"]}</Text>
          ) : null}
          {product.nutriments?.["carbohydrates_100g"] ? (
            <Text>Carbohydrates (g): {product.nutriments?.["carbohydrates_100g"]}</Text>
          ) : null}
          {product.nutriments?.["energy-kcal_100g"] ? (
            <Text>Energy (kcal): {product.nutriments?.["energy-kcal_100g"]}</Text>
          ) : null}
          {product.nutriments?.["sugars_100g"] ? (
            <Text>Sugars (g): {product.nutriments?.["sugars_100g"]}</Text>
          ) : null}
          {product.nutriments?.["salt_100g"] ? (
            <Text>Salt (g): {product.nutriments?.["salt_100g"]}</Text>
          ) : null}
          {product.nutriments?.["cholesterol_100g"] ? (
            <Text>Cholesterol (mg): {product.nutriments?.["cholesterol_100g"]}</Text>
          ) : null}
          {product.nutriments?.["fiber_100g"] ? (
            <Text>Fiber (g): {product.nutriments?.["fiber_100g"]}</Text>
          ) : null}
          {product.nutriments?.["saturated-fat_100g"] ? (
            <Text>Saturated Fat (g): {product.nutriments?.["saturated-fat_100g"]}</Text>
          ) : null}
          {product.nutriments?.["saturated-fat_100g"] && (
            product.nutriments?.["saturated-fat_100g"] > 5 && (
            <Text style={{color: 'red'}}>High saturated fat content</Text>
          )
          )}
          {product.nutriments?.["saturated-fat_100g"] && (
            product.nutriments?.["saturated-fat_100g"] > 10 && (
            <Text style={{color: 'red'}}>High saturated fat content</Text>
          )
          )}
          {ecoScore !== null && (
            <>
              <Text style={styles.TitleText}>Eco Score: {ecoScore}</Text>
              {ecoScore > 50 && (
                <Text style={{color: 'red'}}>High eco score</Text>
              )}
            </>
          )}

          {product.image_front_small_url ? (
            <Image
              source={{uri: product.image_front_small_url}}
              style={{width: 200, height: 200}}
            />
          ) : null}
          <Button
          title={saving ? "Saving..." : "Save Product"}
          onPress={saveProduct}
          disabled={saving || saveMessage === "Product already saved"}
          />
          {saveMessage && (
            <Text style={{marginTop: 10}}>{saveMessage}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
  ProductInfo: {
    marginTop: 20,
    backgroundColor: '#bcf9abff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  TitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
