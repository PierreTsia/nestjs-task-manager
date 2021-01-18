import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
import * as dotenv from 'dotenv';
dotenv.config();

const db = config.get('db');

console.log(process.env);
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: db.type,
  host: process.env.DB_HOSTNAME || db.host,
  port: process.env.DB_PORT || db.port,
  username: process.env.DB_USERNAME || db.username,
  password: process.env.DB_PASSWORD || db.password,
  database: process.env.DB_NAME || db.database,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: process.env.TYPEORM_SYNC || db.synchronize,
};
