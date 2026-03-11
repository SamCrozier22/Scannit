
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
                materialsFound++;
            }
        });

        const averagePackagingScore = materialsFound > 0
            ? packagingScore / materialsFound
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

    if (product.manufacturing_places) {
        score += 15;
        weightTotal += 15;
    } else {
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