import Anthropic from '@anthropic-ai/sdk';

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export default getAnthropicClient;
