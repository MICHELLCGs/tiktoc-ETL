require('dotenv').config();
const kafka = require('./config/redpandaClient');
const SearchController = require('./controllers/searchController');

// Configuración de Redpanda
const consumer = kafka.consumer({ groupId: 'search-group' });
const producer = kafka.producer();

(async () => {
  try {
    // Conexión con Redpanda
    await consumer.connect();
    await producer.connect();

    console.log('Redpanda connected.');

    // Suscribirse al tópico de búsqueda
    await consumer.subscribe({ topic: process.env.SEARCH_TOPIC, fromBeginning: true });
    console.log(`Listening for jobs on topic: ${process.env.SEARCH_TOPIC}`);

    // Procesar mensajes de Redpanda
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const job = JSON.parse(message.value.toString());
        const { type, query, language = 'es-PE', page = 1 } = job;

        console.log(`Processing job: ${JSON.stringify(job)}`);

        try {
          // Procesar búsqueda a través del controlador
          const results = await SearchController.fetchAndStore({ type, query, language, page });

          // Notificar éxito
          await producer.send({
            topic: process.env.RESULTS_TOPIC,
            messages: [
              {
                key: `result-${type}-${query}`,
                value: JSON.stringify({
                  status: 'success',
                  query,
                  type,
                  resultsCount: results.uniqueData.length,
                }),
              },
            ],
          });

          console.log(`Job completed: ${query}`);
        } catch (error) {
          console.error(`Error processing job (${query}):`, error.message);

          // Notificar error
          await producer.send({
            topic: process.env.RESULTS_TOPIC,
            messages: [
              {
                key: `result-${type}-${query}`,
                value: JSON.stringify({
                  status: 'error',
                  query,
                  type,
                  error: error.message,
                }),
              },
            ],
          });
        }
      },
    });
  } catch (error) {
    console.error('Error initializing application:', error.message);
    process.exit(1);
  }
})();
