interface AIFixResponse {
  fixes: string;
  workarounds: string;
}

export async function generateAIFix(cveUrl: string): Promise<AIFixResponse> {
  try {
    const apiKey = localStorage.getItem('api_key');
    if (!apiKey) {
      throw new Error('API key not found. Please add your OpenAI API key.');
    }

    // Call our API endpoint with the CVE URL and API key
    const response = await fetch('/api/generate-fix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cveUrl, apiKey }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      }
      throw new Error(errorData.message || 'Failed to generate AI fix');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating AI fix:', error);
    return {
      fixes:
        error instanceof Error ? error.message : 'Unable to generate fix suggestions at this time.',
      workarounds: 'Please check the CVE details for manual workarounds.',
    };
  }
}
