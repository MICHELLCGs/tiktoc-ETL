const { Pool, Client } = require('pg');


const poolConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'postgres',
  max: 20,                                                // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,                               // Tiempo antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000,                          // Tiempo máximo para establecer una conexión
};

/**
 * Verifica la existencia de la base de datos; si no, la crea.
 */
async function createDatabaseIfNotExists() {
  const client = new Client({
    host: poolConfig.host,
    port: poolConfig.port,
    user: poolConfig.user,
    password: poolConfig.password,
    database: 'postgres', // Conectarse a la base de datos por defecto
  });

  try {
    await client.connect();
    const dbName = poolConfig.database;

    // Verificar si la base de datos ya existe
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Base de datos '${dbName}' creada exitosamente.`);
    } else {
      console.log(`La base de datos '${dbName}' ya existe.`);
    }
  } catch (error) {
    console.error('Error creando la base de datos:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Inicializa el pool de conexiones y asegura que la base de datos exista.
 */
async function initializePool() {
  await createDatabaseIfNotExists();
  const pool = new Pool(poolConfig);

  // Manejar errores inesperados en el pool
  pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
    process.exit(-1);
  });

  return pool;
}

// Exportar una promesa que resuelve al pool de conexiones
const poolPromise = initializePool()
  .then((pool) => {
    console.log('Conexión al pool de PostgreSQL inicializada.');
    return pool;
  })
  .catch((error) => {
    console.error('Error al inicializar el pool de PostgreSQL:', error);
    process.exit(-1);
  });

module.exports = poolPromise;
