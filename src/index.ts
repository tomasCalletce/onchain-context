import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getTokenPrice } from "./lib/get-token-prices.js";
import { getHistoricalTVL } from "./lib/get-tvl.js";
import {
  getMerchantMoeSummary,
  getTreeHouseProtocolSummary,
} from "./lib/get-protocol.js";
import { getStablecoinData } from "./lib/get-stablecoin.js";
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
  "get-ltv",
  "Get the total value locked of mantle network",
  {},
  async () => {
    const tvlData = await getHistoricalTVL();
    const latestTvl = tvlData[tvlData.length - 1].tvl;

    const oneDayAgoIndex = tvlData.length - 2;
    const oneWeekAgoIndex = tvlData.length - 8;

    const oneDayAgoTvl = tvlData[oneDayAgoIndex]?.tvl || latestTvl;
    const oneWeekAgoTvl = tvlData[oneWeekAgoIndex]?.tvl || latestTvl;

    const dailyChange = ((latestTvl - oneDayAgoTvl) / oneDayAgoTvl) * 100;
    const weeklyChange = ((latestTvl - oneWeekAgoTvl) / oneWeekAgoTvl) * 100;

    return {
      content: [
        {
          type: "text",
          text:
            `Current Mantle TVL: $${latestTvl.toLocaleString()}\n` +
            `24h Change: ${dailyChange.toFixed(2)}%\n` +
            `7d Change: ${weeklyChange.toFixed(2)}%`,
        },
      ],
    };
  }
);

server.tool(
  "get-protocol-merchant-moe-summary",
  "Get key metrics for the Merchant Moe protocol on Mantle",
  {},
  async () => {
    const summary = await getMerchantMoeSummary();

    const report = [
      `${summary.health.category} ${summary.name}`,
      `TVL: ${summary.tvl}`,
      `Health Score: ${summary.health.score}/100`,
      `Social Presence: ${summary.socialPresence.platformCount} platforms`,
      `Market Presence: ${summary.socialPresence.hasTwitter ? "Twitter" : ""} ${
        summary.socialPresence.hasGithub ? "Github" : ""
      } ${summary.isMultiChain ? "Multi-Chain" : "Single-Chain"}`,
    ].join("\n");

    return {
      content: [{ type: "text", text: report }],
    };
  }
);

server.tool(
  "get-protocol-treehouse-protocol-summary",
  "Get key metrics for a Tree House on Mantle",
  {},
  async () => {
    const summary = await getTreeHouseProtocolSummary();

    const report = [
      `${summary.health.category} ${summary.name}`,
      `TVL: ${summary.tvl}`,
      `Health Score: ${summary.health.score}/100`,
      `Social Presence: ${summary.socialPresence.platformCount} platforms`,
      `Market Presence: ${summary.socialPresence.hasTwitter ? "Twitter" : ""} ${
        summary.socialPresence.hasGithub ? "Github" : ""
      } ${summary.isMultiChain ? "Multi-Chain" : "Single-Chain"}`,
    ].join("\n");

    return {
      content: [{ type: "text", text: report }],
    };
  }
);

server.tool(
  "get-USDT-tvl",
  "Get the total value locked of USDT on Mantle",
  {},
  async () => {
    const data = await getStablecoinData(1);
    const latestTvl = data[data.length - 1].totalBridgedToUSD.peggedUSD;
    return {
      content: [
        { type: "text", text: `USDT TVL: $${latestTvl.toLocaleString()}` },
      ],
    };
  }
);

server.tool(
  "get-USDC-tvl",
  "Get the total value locked of USDC on Mantle",
  {},
  async () => {
    const data = await getStablecoinData(2);
    const latestTvl = data[data.length - 1].totalBridgedToUSD.peggedUSD;
    return {
      content: [
        { type: "text", text: `USDC TVL: $${latestTvl.toLocaleString()}` },
      ],
    };
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
