export default {
    transform: {
      '^.+\\.js$': 'babel-jest', 
    },
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  };
  
