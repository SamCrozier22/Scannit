import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator, Image } from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';

export default function App() {
  const [Permission, setPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!Permission) setPermission();
  }, [Permission]);

  async function fetchProduct(productCode) {
    setLoading(true);
    setError(null);
    setProduct(null);

    const url = 
    `https://world.openfoodfacts.net/api/v2/product/${encodeURIComponent(productCode)}` + 
    `?fields=product_name,brands,image_front_small_url,nutriments&lang=en`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if(data?.status === 1 && data?.product) {
        setProduct(data.product);
      } else {
        setError('Product not found');
      }
    } catch (e) {
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

  if(!Permission) return <Text>Requesting for camera permission</Text>
  if(!Permission.granted) return <Text>No access to camera</Text>

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
          onPress={() => setScanned(false)}
        />
      )}
      {loading && <ActivityIndicator />}
      {error && <Text style={{color: 'red'}}>{error}</Text>}

      {product && (
        <View style={{marginTop: 20}}>
          <Text style={{fontSize: 18}}>Product Name: {product.product_name ?? "Unknown"}</Text>
          <Text style={{fontSize: 18}}>Brand: {product.brands ?? "Unknown"}</Text>
          <Text style={{fontSize: 18}}>Nutriments: {product.nutriments ?? "Unknown"}</Text>

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
