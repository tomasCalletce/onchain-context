import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getTokenPrice } from "./lib/get-token-prices.js";

const server = new McpServer({
  name: "mantle-onchain-context",
  version: "1.0.0",
});

server.tool(
  "get-token-price",
  "Get the price of a token in mantle network",
  { contract_address: z.string() },
  async ({ contract_address }) => {
    const price = await getTokenPrice(contract_address);
    return {
      content: [
        { type: "text", text: `Price of ${price.symbol}: ${price.price}` },
      ],
    };
  }
);

server.tool(
  "mantle-ltv",
  "Get the total value locked of mantle network",
  async () => {
    const ltv = await getTokenLTV(contract_address);
    return { content: [{ type: "text", text: String(ltv) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
