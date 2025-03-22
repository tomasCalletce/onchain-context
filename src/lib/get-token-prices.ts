interface TokenPrice {
  decimals: number;
  price: number;
  symbol: string;
  timestamp: number;
  confidence?: number;
}

interface TokenPriceResponse {
  coins: {
    [key: string]: TokenPrice;
  };
}

/**
 * Fetches token price for a given contract address on Mantle network
 * @param contractAddress The token contract address to fetch price for
 * @returns Promise with the token price data
 */
export async function getTokenPrice(
  contractAddress: string
): Promise<TokenPrice> {
  try {
    // Using mantle as the chain identifier
    const baseUrl = "https://coins.llama.fi";
    const endpoint = "/prices/current";
    const chainPrefix = "mantle";

    // Construct the full token identifier
    const tokenIdentifier = `${chainPrefix}:${contractAddress}`;

    const response = await fetch(`${baseUrl}${endpoint}/${tokenIdentifier}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as TokenPriceResponse;

    return data.coins[tokenIdentifier];
  } catch (error) {
    console.error("Error fetching token price:", error);
    throw error;
  }
}
