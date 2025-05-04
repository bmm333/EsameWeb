// jest.config.mjs
export default {
    transform: {
      '^.+\\.js$': 'babel-jest',  // Usa babel-jest per trasformare i file .js
    },
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  };
  