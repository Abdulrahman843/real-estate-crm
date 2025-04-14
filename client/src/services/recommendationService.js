// eslint-disable-next-line no-unused-vars
import * as tf from '@tensorflow/tfjs';
export class PropertyRecommendationService {
  /**
   * Returns top recommended properties based on user preferences.
   * @param {Object} userPreferences - User's preference object
   * @param {Array} properties - List of property objects
   * @returns {Array} Sorted and scored properties
   */
  async getRecommendations(userPreferences, properties = []) {
    return properties
      .map((property) => ({
        ...property,
        score: this.calculateMatchScore(property, userPreferences)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5
  }

  /**
   * Calculate composite match score using weighted averages.
   */
  calculateMatchScore(property, preferences) {
    const weights = {
      price: 0.3,
      location: 0.25,
      type: 0.2,
      features: 0.25
    };

    const scores = {
      price: this.getPriceScore(property.price, preferences.maxPrice),
      location: this.getLocationScore(property.location, preferences.preferredLocation),
      type: this.getTypeScore(property.type, preferences.preferredType),
      features: this.getFeaturesScore(property.features, preferences.desiredFeatures)
    };

    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      totalScore += (scores[key] || 0) * weight;
    }

    return Number(totalScore.toFixed(3));
  }

  getPriceScore(price, maxPrice) {
    if (!price || !maxPrice) return 0;
    const score = price <= maxPrice ? 1 : 1 - ((price - maxPrice) / maxPrice);
    return Math.max(0, Math.min(1, score));
  }

  getLocationScore(location, preferredLocation) {
    if (!location || !preferredLocation) return 0.5;
    return location.toLowerCase() === preferredLocation.toLowerCase() ? 1 : 0.5;
  }

  getTypeScore(type, preferredType) {
    if (!type || !preferredType) return 0.3;
    return type.toLowerCase() === preferredType.toLowerCase() ? 1 : 0.3;
  }

  getFeaturesScore(features, desiredFeatures) {
    if (!features?.length || !desiredFeatures?.length) return 0;
    const matches = features.filter(f => desiredFeatures.includes(f));
    return matches.length / desiredFeatures.length;
  }
}
