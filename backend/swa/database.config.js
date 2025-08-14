import 'dotenv/config';
import { DataSource } from "typeorm";

export const dataSourceOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE || 'swadb',
  entities: ['src/**/*.entity.js'],
  synchronize: process.env.NODE_ENV === 'development', //dev only
  logging: process.env.NODE_ENV === 'development'
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;