
function calculateEcoScore(product) {

    let score = 0;
    let weightTotal = 0;
    const missing = [];
    const redFlags = [];
    let redFlag = false;


    //boycott check
    const boycottList = [
        "nestle",
        "mondelez international",
        "mondelez",
        "sabra",
        "mars",

        "shell",
        "bp",
        "exxonmobil",
        "chevron",
        "total",
        "totalenergies",

        "monsanto",
        "bayer",
        "cargill"
    ]
    if (product.brands) {
        const brands = product.brands
            .toLowerCase()
            .split(",")
            .map(b => b.trim());

        const matchedBrand = brands.find(brand =>
            boycottList.some(b => brand.includes(b))
        );

        if (matchedBrand) {
            redFlags.push({
                impact: `high`,
                message: `Company is on boycott list: ${matchedBrand}`
            });
            redFlag = true;
            
        }  
    } else {
        missing.push("brands");
    }

    //packaging
    let materialCount = 0;
    let packagingScore = 0;
    const packagingScores = {
        polystyrene: 1,
        multilayer: 1,
        composite: 2,
        plastic: 3,
        ldpe: 4,
        polypropylene: 6,
        pet: 7,
        hdpe: 9,
        glass: 12,
        aluminium: 13,
        steel: 13,
        tin: 13,
        wood: 12,
        plantbased: 11,
        cardboard: 16,
        carton: 16,
        paper: 15,
        kraft: 15,
        biodegradable: 14,
        compostable: 16,
        cork: 15,
        reusable: 20,
        refill: 19
    };
    if (product.packaging_tags) {
        Object.entries(packagingScores).forEach(([material, value]) => {
            const matchedTag = product.packaging_tags?.find(tag => tag.includes(material));

            if (matchedTag) {
                packagingScore += value;
                materialCount++;

                if (value <= 4) {
                    redFlags.push({
                        message: `Unsustainable material used: ${matchedTag}`,
                        impact: "low"
                    });
                }
            }
        });

        const averagePackagingScore = materialCount > 0
            ? packagingScore / materialCount
            : null;
        score += averagePackagingScore;
        weightTotal += 20;
    } else {
        missing.push("packaging_tags");
    }

    //manufacturing countries
    if (product.countries_tags) {
        score += 15;
        weightTotal += 15;
    } else {
        missing.push("countries_tags");
    }

    let manufacturingScore = 0;
    let placesFound = 0;

    const locationScores = {
        "united kingdom": 100,
        "england": 100,
        "scotland": 100,
        "wales": 100,
        "ireland": 90,

        "france": 70,
        "germany": 70,
        "spain": 70,
        "italy": 70,

        "united states": 40,
        "canada": 40,

        "china": 30,
        "japan": 30,
        "india": 30
    };

    if (product.manufacturing_places) {

        const places = product.manufacturing_places
            .toLowerCase()
            .split(",");

        places.forEach(place => {
            const cleanPlace = place.trim();

            if (locationScores[cleanPlace]) {
                manufacturingScore += locationScores[cleanPlace];
                placesFound++;
                if (cleanPlace == "israel") {
                    redFlag = true;
                    redFlags.push({
                        impact: `high`,
                        message: `product has ties to Israel so is currently boycotted`
                    })
                }
                if (locationScores[cleanPlace] <= 40) {
                    redFlags.push({
                        impact: 'medium',
                        message: `Imported from ${cleanPlace}, increasing transport emissions`
                    });
                }
            }
        });
        const averageManufacturingScore =
            placesFound > 0
                ? manufacturingScore / placesFound
                : null;
        score += (averageManufacturingScore / 1.5);
        weightTotal += 66;
    }
    else {
        missing.push("manufacturing_places");
    }


    //ingredients
    const ingredientScores = {
        beef: 10,
        veal: 12,
        lamb: 15,
        mutton: 15,
        goat: 20,
        pork: 30,
        bacon: 30,
        ham: 30,
        chicken: 50,
        turkey: 50,

        milk: 50,
        butter: 30,
        cheese: 25,
        cream: 40,
        yogurt: 50,
        whey: 60,
        casein: 60,

        "palm oil": 0,
        "palm fat": 0,
        "palm kernel oil": 0,
        "palm kernel fat": 0,

        soy: 50,
        soya: 50,
        "soybean oil": 45,
        "soy protein": 50,

        "sunflower oil": 60,
        "rapeseed oil": 60,
        "vegetable oil": 45,

        "glucose syrup": 40,
        fructose: 45,
        "high fructose corn syrup": 30,
        "invert sugar": 45,
        maltodextrin: 40,

        tuna: 40,
        salmon: 45,
        anchovy: 50,
        shrimp: 35,
        prawn: 35,

        almond: 45,

        coffee: 45,
        cocoa: 40,
        chocolate: 40,

        emulsifier: 70,
        stabiliser: 70,
        preservative: 70,
        flavouring: 70,
        colouring: 70,
        "artificial flavour": 65,
        "artificial colour": 65
    };

    let ingredientScore = 0;
    let ingredientsFound = 0;

    if (product.ingredients_text) {

        const ingredients = product.ingredients_text.toLowerCase();

        Object.entries(ingredientScores).forEach(([ingredient, value]) => {

            if (ingredients.includes(ingredient)) {

                ingredientScore += value;
                ingredientsFound++;
                if (ingredient == "palm oil" || ingredient=="palm fat") {
                    redFlag = true;
                    redFlags.push({
                        impact: `high`,
                        message: `Palm Oil detected!!!! DIEEE!!!`
                    })
                }

                if (value <= 20) {
                    redFlags.push({
                        impact: 'high',
                        message: `High-impact ingredient detected: ${ingredient}`
                    });
                }
                else {
                    if (value <= 40) {
                        redFlags.push({
                            impact: 'medium',
                            message: `Contains ${ingredient}, increasing environmental impact`
                            
                        });
                    }
                }
            }
        });

        const averageIngredientScore =
            ingredientsFound > 0
                ? ingredientScore / ingredientsFound
                : null;

        score += (averageIngredientScore / 2);
        weightTotal += 50;

    } else {
        missing.push("ingredients_text");
    }

    let finalScore = weightTotal > 0
        ? Math.round((score / weightTotal) * 100)
        : null;
    if (redFlag) {
        finalScore = 0;
    }

    return {
        ecoScore: finalScore,
        missingVariables: missing,
        ecoReason: redFlags
    };
}

module.exports = calculateEcoScore;