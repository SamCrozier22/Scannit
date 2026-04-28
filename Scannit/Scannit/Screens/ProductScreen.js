import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
export default function ProductScreen({ route }) {
  const { barcode } = route.params;
  const [product, setProduct] = useState(null);
  const [ecoReason, setEcoReason] = useState(null);

  const API_BASE = "https://grazegood.onrender.com";
  function getLevel(value, type) {
    if (value == null) return null;
    let high;
    let medium;
    if (type === "sugar") {
      high = 10;
      medium = 5;
    } else if (type === "salt") {
      high = 1.5;
      medium = 0.3;
    } else if (type === "fat") {
      high = 17.5;
      medium = 3;
    }
    if (high == null || medium == null) return null;

    if (value > high) {
      return (
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>High</Text>
          <FontAwesome name="exclamation-triangle" size={16} color="#FF3B30" />
        </View>
      );
    }
    if (value > medium) {
      return (
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Medium</Text>
          <FontAwesome name="exclamation-triangle" size={16} color="yellow" />
        </View>
      );
    }
    return (
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Low</Text>
        <FontAwesome name="check-square-o" size={16} color="limegreen" />
      </View>
    );
  }
    const badIngredients = {
        high: ["beef", "veal", "lamb", "mutton", "goat", "palm oil", "palm fat", "palm kernel oil", "palm kernel fat"],
        medium: ["pork", "bacon", "ham", "butter", "cheese", "cream", "high fructose corn syrup", "tuna", "shrimp", "prawn", "cocoa", "chocolate"],
        low: ["glucose syrup", "invert sugar", "maltodextrin", "vegetable oil"]
    };

    function getIngredientImpact(ingredient) {
        const text = ingredient.toLowerCase();

        if(badIngredients.high.some(word => text.includes(word))) {
            return "high";
        }
        if(badIngredients.medium.some(word => text.includes(word))) {
            return "medium";
        }
        if(badIngredients.low.some(word => text.includes(word))) {
            return "low";
        }
        return "none";
    }
  function NutritionRow({ label, value, unit = "g", levelType, sub = false }) {
    if (value == null) return null;
    return (
      <View style={sub ? styles.subRow : styles.nutritionRow}>
        <Text style={sub ? styles.subLabel : styles.nutritionLabel}>
          {label}
        </Text>
        <View style={styles.rowRight}>
          <Text style={styles.nutritionValue}>
            {typeof value === "number" ? value.toFixed(unit === "kcal" ? 0 : 1) : value}
            {unit ? ` ${unit}` : ""}
          </Text>
          {levelType && getLevel(value, levelType)}
        </View>
      </View>
    );
  }
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`${API_BASE}/product/${barcode}`);
        const data = await res.json();
        if (res.ok) {
            setProduct(data);
            setEcoReason(data.eco?.ecoReason ?? null);
        } else {
          console.log("Product loading error:", data?.error);
          setProduct(null);

        }
      } catch (e) {
        console.log("Error loading product", e);
        setProduct(null);

      }
    }
    loadProduct();
  }, [barcode]);
  if (!product) {
    return (
      <View style={styles.MainContainer}>
        <Text style={styles.Title}>Product not found</Text>
      </View>
    );
  }
    const hasIngredients = 
    product.ingredients?.length > 0 || 
    product.ingredients_text?.trim()?.length > 0;
  const nutriments = product.nutriments ?? {};
  return (
    <ScrollView
      style={styles.Page}
      contentContainerStyle={styles.MainContainer}
    >
      {product.image_front_small_url ? (
        <Image
          source={{ uri: product.image_front_small_url }}
          style={styles.Image}
        />
      ) : (
        <Image
          source={require("../assets/product-placeholder.jpg")}
          style={styles.Image}
        />
      )}
      <Text style={styles.Title}>{product.product_name ?? "Unknown product"}</Text>
      <Text style={styles.Brand}>{product.brands ?? "Unknown brand"}</Text>
      <View style={styles.ecoContainer}>
        <Text style={[
            styles.ecoScore,
            product.eco?.ecoScore <= 30 && styles.ecoScoreLow,
            product.eco?.ecoScore <= 70 && product.eco?.ecoScore > 30 && styles.ecoScoreMedium,
            product.eco?.ecoScore > 70 && styles.ecoScoreHigh
            ]}>{product.eco?.ecoScore ?? "-"}</Text>
        <Text style={styles.ecoScoreLabel}>EcoScore</Text> 
        {ecoReason?.map((flag, index) => (
            <Text key={index} style={[
                styles.ecoReason,
                flag.impact === "low" && styles.ecoLow,
                flag.impact === "medium" && styles.ecoMedium,
                flag.impact === "high" && styles.ecoHigh
                ]}>
                {flag.message}
            </Text>
        ))}
      </View>
      <View style={styles.divider} />
      <Text style={styles.SectionTitle}>Nutrition Information</Text>
      <Text style={styles.SectionSubtitle}>per 100g</Text>
      <View style={styles.nutritionContainer}>
        <NutritionRow
          label="Calories"
          value={nutriments["energy-kcal_100g"]}
          unit="kcal"
        />
        <View style={styles.rowDivider} />
        <NutritionRow
          label="Fat"
          value={nutriments["fat_100g"]}
          unit="g"
          levelType="fat"
        />
        <NutritionRow
          label="Saturated fat"
          value={nutriments["saturated-fat_100g"]}
          unit="g"
          sub
        />
        <View style={styles.rowDivider} />
        <NutritionRow
          label="Carbohydrates"
          value={nutriments["carbohydrates_100g"]}
          unit="g"
        />
        <NutritionRow
          label="Sugar"
          value={nutriments["sugars_100g"]}
          unit="g"
          levelType="sugar"
          sub
        />
        <View style={styles.rowDivider} />
        <NutritionRow
          label="Protein"
          value={nutriments["proteins_100g"]}
          unit="g"
        />
        <View style={styles.rowDivider} />
        <NutritionRow
          label="Salt"
          value={nutriments["salt_100g"]}
          unit="g"
          levelType="salt"
        />
        <View style={styles.rowDivider} />
        <NutritionRow
          label="Fiber"
          value={nutriments["fiber_100g"]}
          unit="g"
        />
      </View>
      <View style={styles.divider} />
      {hasIngredients && (
        <>
        <Text style={styles.SectionTitle}>Ingredients</Text>
        <View style={styles.ingredientsContainer}>
            {product.ingredients?.length > 0
            ? product.ingredients.map((ingredient, index) => {
                const impact = getIngredientImpact(ingredient.text ?? "");
                return (
                    <View
                    key={index}
                    style={[
                        styles.ingredientRow,
                        impact === "low" && styles.ingredientLow,
                        impact === "medium" && styles.ingredientMedium,
                        impact === "high" && styles.ingredientHigh,
                    ]}
                    >
                    <FontAwesome
                        name={impact !== "none" ? "exclamation-triangle" : "caret-right"}
                        size={16}
                        color={
                        impact === "high"
                            ? "#FF3B30"
                            : impact === "medium"
                            ? "yellow"
                            : impact === "low"
                            ? "green"
                            : "#A0AF84"
                        }
                    />

                    <Text
                        style={[
                        styles.ingredientText,
                        impact === "low" && styles.ingredientTextLow,
                        impact === "medium" && styles.ingredientTextMedium,
                        impact === "high" && styles.ingredientTextHigh,
                        ]}
                    >
                        {ingredient.text}
                    </Text>
                    </View>
                );
            })
            : product.ingredients_text?.split(",").map((ing, index) => {
                const clean = ing.trim();
                const impact = getIngredientImpact(clean);

                return (
                <View
                key={index}
                style={[
                    styles.ingredientRow,
                    impact === "low" && styles.ingredientLow,
                    impact === "medium" && styles.ingredientMedium,
                    impact === "high" && styles.ingredientHigh,
                ]}
                >
                <FontAwesome
                    name={impact !== "none" ? "exclamation-triangle" : "caret-right"}
                    size={16}
                    color={
                    impact === "high"
                        ? "#FF3B30"
                        : impact === "medium"
                        ? "yellow"
                        : impact === "low"
                        ? "green"
                        : "#A0AF84"
                    }
                />

                <Text
                    style={[
                    styles.ingredientText,
                    impact === "low" && styles.ingredientTextLow,
                    impact === "medium" && styles.ingredientTextMedium,
                    impact === "high" && styles.ingredientTextHigh,
                    ]}
                >
                    {clean}
                </Text>
                </View>
                )
            })}
        </View>
        </>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
    Page: {
        flex: 1,
        backgroundColor: "#C3B59F",
    },
    MainContainer: {
        alignItems: "center",
        padding: 20,
        paddingBottom: 50,
    },
    Image: {
        width: 200,
        height: 200,
        marginBottom: 20,
        borderRadius: 15,
    },
    Title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#215C3D",
        textAlign: "center",
        marginBottom: 6,
    },
    Brand: {
        color: "#215C3D",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
    },
    divider: {
        height: 1,
        backgroundColor: "#215C3D",
        width: "100%",
        marginVertical: 20,
    },
    SectionTitle: {
        color: "#215C3D",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
    },
    SectionSubtitle: {
        color: "#215C3D",
        fontSize: 16,
        marginBottom: 15,
    },
    nutritionContainer: {
        width: "92%",
        backgroundColor: "#215C3D",
        borderRadius: 18,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: {
        width: 5,
        height: 5,
        },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 5,
    },
    nutritionRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 9,
    },
    subRow: {
        width: "90%",
        alignSelf: "flex-end",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 5,
    },
    nutritionLabel: {
        color: "#A0AF84",
        fontSize: 17,
        fontWeight: "bold",
        flex: 1,
    },
    subLabel: {
        color: "#A0AF84",
        fontSize: 15,
    },
    rowRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minWidth: 90,
        justifyContent: "flex-end",
    },
    nutritionValue: {
        color: "#A0AF84",
        fontSize: 16,
        fontWeight: "bold",
    },
    levelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    levelText: {
        color: "#A0AF84",
        fontSize: 14,
        fontWeight: "bold",
    },
    rowDivider: {
        height: 1,
        backgroundColor: "#727e5aff",
        marginVertical: 5,
    },
    ecoContainer: {
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#215C3D",
        borderRadius: 10,
        padding: 10,
        width: "92%",
        shadowColor: "#000",
        shadowOffset: {
            width: 5,
            height: 5
        },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    ecoScore: {
        color: "#A0AF84",
        fontSize: 26,
        fontWeight: "bold",
    },
    ecoScoreLabel: {
        color: "#A0AF84",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    ecoReason: {
        color: "#A0AF84",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    ecoLow: {
        color: "green"
    },
    ecoMedium: {
        color: "yellow"
    },
    ecoHigh: {
        color: "#FF3B30"
    },
    ecoScoreLow: {
        color: "#FF3B30"
    },
    ecoScoreMedium: {
        color: "yellow"
    },
    ecoScoreHigh: {
        color: "green"
    },
    ingredientsContainer: {
        width: "92%",
        backgroundColor: "#215C3D",
        borderRadius: 18,
        padding: 18,
        marginTop: 20,

        shadowColor: "#000",
        shadowOffset: {
        width: 5,
        height: 5,
        },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 5,
    },
    ingredient: {
        color: "#A0AF84",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 5
    },
    ingredientText: {
        color: "#A0AF84",
        fontSize: 16
    },
    ingredientRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
        },
    ingredientText: {
        color: "#A0AF84",
        fontSize: 16,
        flex: 1,
    },
    ingredientTextLow: {
        color: "green",
        fontWeight: "bold",
    },
    ingredientTextMedium: {
        color: "yellow",
        fontWeight: "bold",
    },
    ingredientTextHigh: {
        color: "#FF3B30",
        fontWeight: "bold",
    },
});