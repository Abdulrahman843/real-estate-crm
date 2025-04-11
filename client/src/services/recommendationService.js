import * as tf from '@tensorflow/tfjs';

export class PropertyRecommendationService {
  async getRecommendations(userPreferences, properties) {
    // Simpler recommendation system without full TensorFlow model
    return properties
      .map(property => ({
        ...property,
        score: this.calculateMatchScore(property, userPreferences)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  calculateMatchScore(property, preferences) {
    const scores = {
      price: this.getPriceScore(property.price, preferences.maxPrice),
      location: this.getLocationScore(property.location, preferences.preferredLocation),
      type: this.getTypeScore(property.type, preferences.preferredType),
      features: this.getFeaturesScore(property.features, preferences.desiredFeatures)
    };

    return Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;
  }

  getPriceScore(price, maxPrice) {
    return price <= maxPrice ? 1 : 1 - ((price - maxPrice) / maxPrice);
  }

  getLocationScore(location, preferredLocation) {
    return location === preferredLocation ? 1 : 0.5;
  }

  getTypeScore(type, preferredType) {
    return type === preferredType ? 1 : 0.3;
  }

  getFeaturesScore(features, desiredFeatures) {
    if (!features || !desiredFeatures) return 0;
    const matchingFeatures = features.filter(f => desiredFeatures.includes(f));
    return matchingFeatures.length / desiredFeatures.length;
  }
}