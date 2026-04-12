
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default function ScanScreen( { navigation } ) {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ecoScore, setEcoScore] = useState(null);
  const [ecoReason, setEcoReason] = useState(null);

  const [scansLeft, setScansLeft] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [adsLeft, setAdsLeft] = useState(5);

  const [lastBarcode, setLastBarcode] = useState(null);
  const [savedBy, setSavedBy] = useState(null);
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
    if(!username) return;

    try{
      const res = await fetch(`${API_BASE}/user/${username}/scans`);
      const data = await res.json();

      if(res.ok) {
        setScansLeft(data.scanCredits);
        setIsPremium(data.isPremium);
        setAdsLeft(5 - data.adsWatchedToday);
      } else {
        console.log("Error loading Scans: ", data?.error);
      }
    } catch (e) {
      console.error('Error getting scans: ', e);
    }
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
  if (!product || !lastBarcode || !savedBy) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Missing required fields",
      visibilityTime: 2000,
    });
    return;
  }

  setSaving(true);

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
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Product saved",
        visibilityTime: 2000,
      });
      console.log("Saved:", data);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: data?.error ?? "Unknown error",
        visibilityTime: 2000,
      });
      console.log("Save Error:", data?.error);
    }
  } catch (e) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: e?.message ?? "Network error",
      visibilityTime: 2000,
    });
    console.log("Save Error:", e);
  } finally {
    setSaving(false);
  }
}
function GetEcoIndicator(score) {
  if(score <=30) {
    return "🔴"
  }
  if(score <=70 && score > 30) {
    return "🟡"
  }
  if(score > 70) {
    return "🟢"
  }
  if(score == null) {
    return "⚪️"
  }
}
async function rewardScans() {
  try {
    const rewardRes = await fetch(`${API_BASE}/user/${savedBy}/rewardScans`,{
      method: "POST",
    })
    const rewardData = await rewardRes.json();

    if(rewardRes.ok) {
      setScansLeft(rewardData.scanCredits)
      setIsPremium(rewardData.isPremium)
      setAdsLeft(5 - rewardData.adsWatchedToday)
      
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "5 scans rewarded",
        visibilityTime: 2000,
      })
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: rewardData?.error ?? "Could Not Reward Scans",
        visibilityTime: 2000,
      })
    }
  } catch (e) {
    console.log("Reward scan Error:", e);
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
      const scanRes = await fetch(`${API_BASE}/user/${savedBy}/useScan`,{
        method: "POST",
      })
      const scanData = await scanRes.json();

      if(scanRes.ok) {
        setScansLeft(scanData.scanCredits);
        setIsPremium(scanData.isPremium);
        setAdsLeft(5 - scanData.adsWatchedToday);
      } else {
        console.log("Error loading Scans: ", scanData?.error);
      }
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

    fetchProduct(data);
  };

  if(!permission) return <Text>Requesting for camera permission</Text>
  if(!permission.granted) return <Text>No access to camera</Text>

  return (
    <View style={styles.MainContainer}>
      <StatusBar style="auto" />
      {cameraOpen ? (
        <>
        {!isPremium && (
          <View style={styles.scanCountContainer}>
            <Text style={styles.adsLeft}>{adsLeft ?? "..."} ads left</Text>
            <TouchableOpacity
              style={styles.watchAdsBtn}
              onPress = { () => {
                rewardScans()
              }}
            >
              <FontAwesome5 name="ad" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.ScanCounter}>Scans Left: {scansLeft ?? "..."}</Text>
            </View>
        )}
        <>
          <View style={styles.cameraWrapper}>
            <CameraView
              style={styles.Camera}
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
              }}
              onBarcodeScanned={scanned ? undefined : handleScan}
            />
          </View>
          </>
          </>
      ) : product ? (
        <View style={styles.scanAgainContainer}>
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => {
              setCameraOpen(true);
              setScanned(false);
              setProduct(null);
              setError(null);

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
            <Text style={styles.text}>
              Hit the save button to save your products and review them later in the Saved tab
            </Text>
            <Text style={styles.text}>
              The higher the eco score, the better for you and the environment!
            </Text>
            <Text style={styles.text}>
              To start scanning, click the button below
            </Text>
            <Text style={styles.text}>
              Please Note, you get 5 scans per day and need to watch ads to get more
            </Text>
            <Text style={[styles.text, styles.lastText]}>
              Buy premium to get unlimited scans <TouchableOpacity onPress={() => navigation.navigate("Premium")}><Text style={styles.premiumNav}>here</Text></TouchableOpacity>
            </Text>
          </View>

          <View style={styles.openScannerContainer}>
            <TouchableOpacity
              style={styles.openScannerButton}
              onPress={() => {
                if(!isPremium && scansLeft !== null && scansLeft <= 0) {
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'You have reached your scan limit, watch an ad to get more!',
                    visibilityTime: 2000
                  })
                  return
                }
                setCameraOpen(true);
                setScanned(false);
                setProduct(null);
                setError(null);
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
      <>
        <TouchableOpacity
          style={styles.closeButtonScanner}
          onPress={() => {
            setCameraOpen(false);
            setScanned(false);
            setProduct(null);
            setError(null);
            setEcoScore(null);
            setEcoReason(null);
          }}
        >
          <Text style={styles.ButtonText}>Close Scanner</Text>
        </TouchableOpacity>
      </>
    )}

      {loading && <ActivityIndicator />}
      {error && <Text style={{color: 'red'}}>{error}</Text>}
      {product ? (
        <View style={styles.ProductInfo}>
          <Text style={styles.TitleText}>
            Product Name: {product.product_name ?? "Unknown"}
          </Text>

          <Text style={styles.TitleText}>
            Brand: {product.brands ?? "Unknown"}
          </Text>

          {product.nutriments?.["energy-kcal_100g"] != null && (
            <Text style={styles.infoText}>
              Calories (kcal): {product.nutriments["energy-kcal_100g"]}
            </Text>
          )}

          {product.nutriments?.["proteins_100g"] != null && (
            <Text style={styles.infoText}>
              Proteins (g): {product.nutriments["proteins_100g"]}
            </Text>
          )}

          {product.nutriments?.["fat_100g"] != null && (
            <Text style={styles.infoText}>
              Fats (g): {product.nutriments["fat_100g"]}
            </Text>
          )}

          {product.nutriments?.["carbohydrates_100g"] != null && (
            <Text style={styles.infoText}>
              Carbohydrates (g): {product.nutriments["carbohydrates_100g"]}
            </Text>
          )}

          {product.nutriments?.["sugars_100g"] != null && (
            <Text style={styles.infoText}>
              Sugars (g): {product.nutriments["sugars_100g"]}
            </Text>
          )}

          {product.nutriments?.["salt_100g"] != null && (
            <Text style={styles.infoText}>
              Salt (g): {product.nutriments["salt_100g"]}
            </Text>
          )}

          {product.nutriments?.["cholesterol_100g"] != null && (
            <Text style={styles.infoText}>
              Cholesterol (mg): {product.nutriments["cholesterol_100g"]}
            </Text>
          )}

          {product.nutriments?.["fiber_100g"] != null && (
            <Text style={styles.infoText}>
              Fiber (g): {product.nutriments["fiber_100g"]}
            </Text>
          )}

          {product.nutriments?.["saturated-fat_100g"] != null && (
            <Text style={styles.infoText}>
              Saturated Fat (g): {product.nutriments["saturated-fat_100g"]}
            </Text>
          )}

          {product.nutriments?.["saturated-fat_100g"] > 5 && (
            <Text style={{ color: "red" }}>High saturated fat content</Text>
          )}

          {product.nutriments?.["saturated-fat_100g"] > 10 && (
            <Text style={{ color: "red" }}>Very high saturated fat content</Text>
          )}

          {ecoScore !== null && (
            <>
            <View style={styles.divider}></View>
              <Text style={[styles.TitleText, {marginBottom: 10}]}>Eco Score: {ecoScore} {GetEcoIndicator(ecoScore)}</Text>
            </>
          )}

          {product.image_front_small_url ? (
            <Image
              source={{ uri: product.image_front_small_url }}
              style={{ width: 200, height: 200 }}
            />
          ) : null}
          <TouchableOpacity
            onPress={saveProduct}
            style={styles.Button}
            disabled={saving}
          >
            <Text style={styles.ButtonText}>Save Product</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  divider: {
    height: 1,
    backgroundColor: '#A0AF84',
    width: "100%",
    marginVertical: 10,
  },
  text: {
    color: '#215C3D',
    fontSize: 20,
    margin: 5,
    textAlign: 'center',
  },
  lastText: {
    marginTop: 50,
  },
  infoText: {
    color: '#a0af84',
    fontSize: 16,
    textAlign: 'center',
    margin: 0
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: "auto",
  },
  Button: {
    backgroundColor: '#108A2C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  scanAgainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAgainButton: {
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
    marginTop: 50
  },
  ScanCounter: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#215C3D",
    borderRadius: 10,
    width: "50%",
    margin: "auto",
    padding: 5,
  },
  scanCountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  watchAdsBtn: {
    padding: 5,
    backgroundColor: "#108A2C",
    borderRadius: 10,
    marginTop: 10,
    marginVertical: 10,
    position: "absolute",
    right: 0,
    bottom: 0
  },
  premiumNav: {
    fontSize: 20,
    fontWeight: "bold",
    color: "blue",
  }
});
