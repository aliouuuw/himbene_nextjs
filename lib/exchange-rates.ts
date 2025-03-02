const EXCHANGE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const API_BASE_URL = "https://v6.exchangerate-api.com/v6";

export async function fetchExchangeRates(baseCurrency: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${EXCHANGE_API_KEY}/latest/${baseCurrency}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, rates: data.conversion_rates };
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return { success: false, error: "Failed to fetch exchange rates" };
  }
} 