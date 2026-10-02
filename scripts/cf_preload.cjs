const { Agent, setGlobalDispatcher } = require('undici');

// Increase connect and headers timeout to 60s for high-latency / slow connections
setGlobalDispatcher(
  new Agent({
    connect: {
      timeout: 60000,
    },
    headersTimeout: 60000,
    bodyTimeout: 60000,
  })
);
