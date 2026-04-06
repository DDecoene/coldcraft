import Anthropic from '@anthropic-ai/sdk';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default anthropicClient;
