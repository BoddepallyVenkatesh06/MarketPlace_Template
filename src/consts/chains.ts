import { defineChain } from "thirdweb";
import { ethereum, bsc, avalancheFuji, sepolia, polygonAmoy } from "thirdweb/chains";

/**
 * Export predefined chains from thirdweb
 */
export { ethereum, bsc, avalancheFuji, sepolia, polygonAmoy };

/**
 * Define any custom chain using `defineChain`
 */
// Generate a random chain ID (between 1000 and 9999)
const yourChainId = Math.floor(1000 + Math.random() * 9000);

// Define the custom chain using the random chain ID
export const yourCustomChain = defineChain(yourChainId);