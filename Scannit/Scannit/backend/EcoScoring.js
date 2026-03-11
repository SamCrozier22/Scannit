
function calculateEcoScore(product) {

    let score = 0;
    let weightTotal = 0;
    const missing = [];


    let materialCount = 0;
    let packagingScore = 0;
    const packagingScores = {
        plastic: 2,
        cardboard: 14,
        glass: 12,
        aluminium: 13
    };
    if (product.packaging_tags) {
        Object.entries(packagingScores).forEach(([material, score]) => {
            if (product.packaging_tags?.some(tag => tag.includes(material))) {
                packagingScore += score;
                materialCount++;
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



    const finalScore = weightTotal > 0
        ? Math.round((score / weightTotal) * 100)
        : null;

    return {
        ecoScore: finalScore,
        missingVariables: missing
    };
}

module.exports = calculateEcoScore;