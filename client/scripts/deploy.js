import { execSync } from 'child_process';
import deployConfig from '../deploy.config.js';

const deploy = async (environment) => {
  const config = deployConfig[environment];
  
  try {
    console.log(`Starting ${environment} deployment...`);
    
    // Run build
    console.log('Building application...');
    execSync(config.buildCommand, { stdio: 'inherit' });
    
    // Deploy based on environment
    if (environment === 'production') {
      console.log('Deploying to production...');
      execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
    } else if (environment === 'staging') {
      console.log('Deploying to staging...');
      execSync('netlify deploy --dir=dist', { stdio: 'inherit' });
    }
    
    console.log(`${environment} deployment completed successfully!`);
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
};

// Get environment from command line
const environment = process.argv[2];
if (!['development', 'staging', 'production'].includes(environment)) {
  console.error('Please specify a valid environment (development/staging/production)');
  process.exit(1);
}

deploy(environment);