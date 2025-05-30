export default defineNitroConfig({
  srcDir: 'server',
  experimental: {
    wasm: true
  },
  runtimeConfig: {
    customOpenaiApiKey: process.env.CUSTOM_OPENAI_API_KEY || '',
    customOpenaiApiUrl: process.env.CUSTOM_OPENAI_API_URL || 'https://api.openai.com/v1',
    customOpenaiModelName: process.env.CUSTOM_OPENAI_MODEL_NAME || 'gpt-3.5-turbo',
  },
  nitro: {
    preset: 'node-server'
  },
  devServer: {
    port: 3001
  }
});
