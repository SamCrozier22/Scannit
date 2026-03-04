import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator, Image } from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';

export default function App() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  useEffect(() => {
    pingAPI();
  }, []);

  const API_BASE = "https://grazegood.onrender.com";

  async function pingAPI() {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    console.log(data);
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
          }}
        />
      )}
      {loading && <ActivityIndicator />}
      {error && <Text style={{color: 'red'}}>{error}</Text>}

      {product && (
        <View style={{marginTop: 20}}>
          <Text style={{fontSize: 18}}>Product Name: {product.product_name ?? "Unknown"}</Text>
          <Text style={{fontSize: 18}}>Brand: {product.brands ?? "Unknown"}</Text>
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
          {product.ecoscore_grade ? (
            <Text>Environment Grade: {product.ecoscore_grade}</Text>
          ) : null}
          {product.ecoscore_score ? (
            <Text>Environment Score: {product.ecoscore_score}</Text>
          ) : null}
          {product.packaging_text ? (
            <Text>Packaging Text: {product.packaging_text}</Text>
          ) : null}
          {product.image_front_small_url ? (
            <Image
              source={{uri: product.image_front_small_url}}
              style={{width: 200, height: 200}}
            />
          ) : null}
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
  }
});
