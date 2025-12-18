import { network } from "hardhat";

const { viem, networkName } = await network.connect();
const client = await viem.getPublicClient();

console.log(`Deploying Counter to ${networkName}...`);

const voting = await viem.deployContract("Voting");

console.log("Voting address:", voting.address);
/*await client.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
const receipt = await client.getTransactionReceipt({ hash: voting.deployTransactionHash });
const gasUsed = receipt.gasUsed;
const gasPrice = await client.getGasPrice();
const deploymentCostWei = gasUsed * gasPrice;
*/
console.log("Deployment successful!");