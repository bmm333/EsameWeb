import 'dotenv/config';

import * as UserEntities from './src/user/entities/index.js';
import * as RfidEntities from './src/rfid/entities/index.js';
import * as ItemEntities from './src/item/entities/index.js';

export const dataSourceOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE || 'swadb',
  entities: [
    ...Object.values(UserEntities),
    ...Object.values(RfidEntities),
    ...Object.values(ItemEntities)
  ],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development'
};