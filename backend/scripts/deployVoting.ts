import { network } from "hardhat";
import { formatEther } from "viem";
const { viem, networkName } = await network.connect();
const client = await viem.getPublicClient();

console.log(`Deploying Voting to ${networkName}...`);

const voting = await viem.deployContract("Voting");

console.log("Voting address:", voting.address);
const owner = await voting.read.owner();
console.log("Owner in contract:", owner);


console.log("\nDeployment successful!");