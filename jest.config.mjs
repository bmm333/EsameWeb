export default {
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
    "^.+\\.mjs$": "babel-jest", 
  },
  testEnvironment: "jsdom",
  globals: {
    'babel-jest': {
      configFile: './babel.config.js',
    },
  },
  moduleFileExtensions: ['js', 'mjs', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/backend/"
  ],
};
/*F jest giving up for today*/