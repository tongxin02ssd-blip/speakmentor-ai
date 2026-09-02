const CHAT_COMPLETIONS_PATH = 'chat/completions';

const getDeepSeekApiUrl = () => {
  const rawUrl = process.env.DEEPSEEK_BASE_URL?.trim();

  if (!rawUrl) {
    return '';
  }

  const normalizedUrl = rawUrl.replace(/\/+$/, '');
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    throw new Error('DEEPSEEK_BASE_URL must be a valid URL');
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    throw new Error('DEEPSEEK_BASE_URL must use HTTP or HTTPS');
  }

  return /\/chat\/completions$/i.test(normalizedUrl)
    ? normalizedUrl
    : `${normalizedUrl}/${CHAT_COMPLETIONS_PATH}`;
};

export const getDeepSeekConfig = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const model = process.env.DEEPSEEK_MODEL?.trim();
  const url = getDeepSeekApiUrl();

  if (!apiKey || !model || !url) {
    throw new Error('DeepSeek API is not configured');
  }

  return { apiKey, model, url };
};

export const assertDeepSeekConfigured = () => {
  getDeepSeekConfig();
};

export const readDeepSeekError = async (response: Response) => {
  const text = await response.text().catch(() => '');
  const compactText = text.replace(/\s+/g, ' ').slice(0, 300);
  return compactText
    ? `DeepSeek returned ${response.status}: ${compactText}`
    : `DeepSeek returned ${response.status}`;
};
