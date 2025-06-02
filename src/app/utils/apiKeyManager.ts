const API_KEY_STORAGE_KEY = 'api_key';

export const saveApiKey = (apiKey: string) => {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
};

export const getApiKey = () => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

export const removeApiKey = () => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error removing API key:', error);
    return false;
  }
};

export const hasApiKey = () => {
  return !!getApiKey();
};
