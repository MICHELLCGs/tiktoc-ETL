const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'search-service',
  brokers: [process.env.REDPANDA_BROKER],
});

module.exports = kafka;
