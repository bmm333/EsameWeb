import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database.config.js';

export const AppDataSource = new DataSource({
  ...dataSourceOptions,
  synchronize: false,
  migrations: ['src/migrations/*.js'],
});