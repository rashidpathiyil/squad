export default defineEventHandler((event) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'contact-enrichment-service',
    version: '1.0.0'
  };
}); 
