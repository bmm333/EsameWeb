// Enable runtime transpilation of ES modules
require('@babel/register')({
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-transform-runtime', { regenerator: true }]
  ],
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
});

// Load reflect-metadata for decorators
require('reflect-metadata');

// Add proper error handling
try {
  // Start the application
  require('./src/main');
  console.log('Application bootstrap started successfully');
} catch (error) {
  console.error('Failed to start application:', error);
  process.exit(1);
}