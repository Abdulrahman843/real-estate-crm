export default {
    development: {
      server: 'localhost',
      port: 5173,
      buildCommand: 'npm run build',
      outputDir: 'dist'
    },
    staging: {
      server: 'staging.yourapp.com',
      port: 443,
      buildCommand: 'npm run build:staging',
      outputDir: 'dist',
      ssl: true
    },
    production: {
      server: 'yourapp.com',
      port: 443,
      buildCommand: 'npm run build:prod',
      outputDir: 'dist',
      ssl: true,
      cdn: true
    }
  };