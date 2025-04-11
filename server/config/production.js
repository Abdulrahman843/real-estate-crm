const productionConfig = {
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientURL: process.env.CLIENT_URL || 'https://your-netlify-app.netlify.app'
};

export default productionConfig;
