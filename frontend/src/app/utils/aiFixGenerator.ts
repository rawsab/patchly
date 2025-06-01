interface AIFixResponse {
  fixes: string;
  workarounds: string;
}

export async function generateAIFix(cveUrl: string): Promise<AIFixResponse> {
  try {
    // Call our API endpoint with just the CVE URL
    const response = await fetch('/api/generate-fix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cveUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI fix');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating AI fix:', error);
    return {
      fixes: 'Unable to generate fix suggestions at this time.',
      workarounds: 'Please check the CVE details for manual workarounds.',
    };
  }
}
