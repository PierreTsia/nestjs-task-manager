import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (env: {
  [key: string]: string;
}): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: 'localhost',
  port: +env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
});
