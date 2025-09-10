require('reflect-metadata');
const { DataSource } = require('typeorm');
const { dataSourceOptions } = require('../database.config.js');

module.exports = new DataSource({
  ...dataSourceOptions,
  synchronize: false,
  migrations: ['src/migrations/*.js'],
});