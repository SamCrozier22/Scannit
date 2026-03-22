
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
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
  const [cameraOpen, setCameraOpen] = useState(false);

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
          nutriments: product.nutriments ?? null,
          nutrition_grades: product.nutrition_grades ?? null,
          eco: {
            ecoScore,
            ecoReason,
          },
        })
      })

      const data = await res.json();

      if(res.ok) {
        setSaveMessage("Product saved");
        setTimeout(() => {
          setSaveMessage(null);
        }, 2000)
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
  setEcoScore(null);
  setEcoReason(null);

  try {
    const res = await fetch(`${API_BASE}/product/${encodeURIComponent(productCode)}`);
    const data = await res.json();

    if (res.ok) {
      setProduct(data);
      setEcoScore(data.eco?.ecoScore ?? null);
      setEcoReason(data.eco?.ecoReason ?? null);
      setCameraOpen(false);
    } else {
      setProduct(null);
      setEcoScore(null);
      setEcoReason(null);
      setError(data?.error ?? "Not found");
    }
  } catch (e) {
    console.log(e);
    setProduct(null);
    setEcoScore(null);
    setEcoReason(null);
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
    <View style={styles.MainContainer}>
      <StatusBar style="auto" />
      {cameraOpen ? (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.Camera}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
            }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />
        </View>
      ) : product ? (
        <View style={styles.scanAgainContainer}>
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => {
              setCameraOpen(true);
              setScanned(false);
              setProduct(null);
              setError(null);
              setSaveMessage(null);
              setEcoScore(null);
              setEcoReason(null);
            }}
          >
            <Text style={styles.ButtonText}>Scan Another Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View>
            <Text style={styles.Title}>GrazeGood</Text>
            <Text style={styles.SubTitle}>
              Scan a product to check how good it is for you and the environment!
            </Text>
          </View>

          <View style={styles.SubContainer}>
            <Text style={styles.infoText}>
              Hit the save button to save your products and review them later in the Saved tab
            </Text>
            <Text style={styles.infoText}>
              The higher the eco score, the better for you and the environment!
            </Text>
            <Text style={styles.infoText}>
              To start scanning, click the button below
            </Text>
          </View>

          <View style={styles.openScannerContainer}>
            <TouchableOpacity
              style={styles.openScannerButton}
              onPress={() => {
                setCameraOpen(true);
                setScanned(false);
                setProduct(null);
                setError(null);
                setSaveMessage(null);
                setEcoScore(null);
                setEcoReason(null);
              }}
            >
              <Text style={styles.ButtonText}>Open Scanner</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
  
    {cameraOpen && (
      <TouchableOpacity
        style={styles.closeButtonScanner}
        onPress={() => {
          setCameraOpen(false);
          setScanned(false);
          setProduct(null);
          setError(null);
          setSaveMessage(null);
          setEcoScore(null);
          setEcoReason(null);
        }}
      >
        <Text style={styles.ButtonText}>Close Scanner</Text>
      </TouchableOpacity>
    )}

      {loading && <ActivityIndicator />}
      {error && <Text style={{color: 'red'}}>{error}</Text>}

      {product && (
        <View style={styles.ProductInfo}>
          <Text style={styles.TitleText}>Product Name: {product.product_name ?? "Unknown"}</Text>
          <Text style={styles.TitleText}>Brand: {product.brands ?? "Unknown"}</Text>
          {product.nutriments?.["energy-kcal_100g"] ? (
            <Text style={styles.text}>Calories (kcal): {product.nutriments?.["energy-kcal_100g"]}</Text>
          ) : null}
          {product.nutriments?.["proteins_100g"] ? (
            <Text style={styles.text}>Proteins (g): {product.nutriments?.["proteins_100g"]}</Text>
          ) : null}
          {product.nutriments?.["fat_100g"] ? (
            <Text style={styles.text}>Fats (g): {product.nutriments?.["fat_100g"]}</Text>
          ) : null}
          {product.nutriments?.["carbohydrates_100g"] ? (
            <Text style={styles.text}>Carbohydrates (g): {product.nutriments?.["carbohydrates_100g"]}</Text>
          ) : null}
          {product.nutriments?.["energy-kcal_100g"] ? (
            <Text style={styles.text}>Energy (kcal): {product.nutriments?.["energy-kcal_100g"]}</Text>
          ) : null}
          {product.nutriments?.["sugars_100g"] ? (
            <Text style={styles.text}>Sugars (g): {product.nutriments?.["sugars_100g"]}</Text>
          ) : null}
          {product.nutriments?.["salt_100g"] ? (
            <Text style={styles.text}>Salt (g): {product.nutriments?.["salt_100g"]}</Text>
          ) : null}
          {product.nutriments?.["cholesterol_100g"] ? (
            <Text style={styles.text}>Cholesterol (mg): {product.nutriments?.["cholesterol_100g"]}</Text>
          ) : null}
          {product.nutriments?.["fiber_100g"] ? (
            <Text style={styles.text}>Fiber (g): {product.nutriments?.["fiber_100g"]}</Text>
          ) : null}
          {product.nutriments?.["saturated-fat_100g"] ? (
            <Text style={styles.text}>Saturated Fat (g): {product.nutriments?.["saturated-fat_100g"]}</Text>
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
                <Text style={{color: 'red', fontSize: 20, marginBottom: 10, fontWeight: 'bold'}}>High eco score</Text>
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
            <Text style={{marginTop: 10, color: '#A0AF84'}}>{saveMessage}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: '#C3B59F',
    padding: 20,
  },
  ProductInfo: {
    marginTop: 20,
    backgroundColor: '#215C3D',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',

    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 5
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5
  },
  text: {
    color: '#A0AF84',
    fontSize: 20,
    margin: 5,
    textAlign: 'center',
  },
  infoText: {
    color: '#215C3D',
    fontSize: 20,
    margin: 5,
    textAlign: 'center',
  },
  TitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#A0AF84'
  },
  openScannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openScannerButton: {
    backgroundColor: '#108A2C',
    marginTop: "auto",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  scanAgainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAgainButton: {
    backgroundColor: '#108A2C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  ButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButtonScanner: {
    backgroundColor: "#108A2C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    width: "50%",
    alignSelf: "center",
  },
  cameraWrapper: {
    flex: 1,
    width: "100%",
    height: "75%",
    borderRadius: 10,
    overflow: "hidden",
  },
  Title: {
    color: "#215C3D",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: 'center',
    marginBottom: 20
  },
  SubTitle: {
    color: "#215C3D",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },
  Camera: {
    height: "100%",
    width: "100%",
    borderRadius: 10,
  },
  SubContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C3B59F",
  }
});
