import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { getAddress } from "viem";

const { viem, networkHelpers } = await network.connect();

// Fonction pour déployer le contrat Voting
async function setUpSmartContract() {
  const publicClient = await viem.getPublicClient();
  const [owner, ...accounts] = await viem.getWalletClients();
  
  const voting = await viem.deployContract("Voting", [], {
    value: 10_000_000_000_000_000n, // 0.01 ETH pour financer le contrat
    client: { wallet: owner },
  });
  
  const signersRegistered = accounts.slice(0, -1);
  const signerNotRegistered = accounts[accounts.length - 1];

  return { voting, signersRegistered, signerNotRegistered, owner, publicClient };
}

async function setUpAddALotOfVoters() {
  const { voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpSmartContract();

  for (const signer of signersRegistered) {
    await voting.write.addVoter([signer.account.address], { account: owner.account });
  }

  return { voting, signersRegistered, signerNotRegistered, owner, publicClient };
}

async function setUpAddThreeProposals() {
  const { voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpAddALotOfVoters();
  await voting.write.startProposalsRegistering({ account: owner.account });
  
  await voting.write.addProposal(["Proposal 1"], { account: signersRegistered[0].account });
  await voting.write.addProposal(["Proposal 2"], { account: signersRegistered[1].account });
  await voting.write.addProposal(["Proposal 3"], { account: signersRegistered[2].account });

  return { voting, signersRegistered, signerNotRegistered, owner, publicClient };
}

describe("Voting", () => {
  let voting: any;
  let signersRegistered: any;
  let signerNotRegistered: any;
  let owner: any;
  let publicClient: any;

  describe("Deployment/Storage", () => {
    beforeEach(async () => {
      ({ voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpSmartContract());
    });

    it("Should have the right owner", async () => {
      const ownerAddress = await voting.read.owner();
      assert.equal(ownerAddress.toLowerCase(), owner.account.address.toLowerCase());
    });

    it("Should get 0.01ETH", async () => {
      const balance = await publicClient.getBalance({ address: voting.address });
      assert.equal(balance, 10_000_000_000_000_000n);
    });

    it("Should deploy with workflowStatus = RegisteringVoters", async () => {
      const status = await voting.read.workflowStatus();
      assert.equal(status, 0);
    });

    it("Should have an empty winningProposalId", async () => {
      const winningId = await voting.read.winningProposalID();
      assert.equal(winningId, 0n);
    });
  });

  describe.only("addVoter", () => {
    beforeEach(async () => {
      ({ voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpSmartContract());
    });

    it('Should emit "VoterRegistered" event when a voter is registered', async () => {

      viem.assertions.emitWithArgs(voting.write.addVoter([signersRegistered[1].account.address]),voting, "VoterRegistered",[signersRegistered[1].account.address]);

    });

    it("Should refuse to add a registered voter", async () => {
      await voting.write.addVoter([signersRegistered[0].account.address], { account: owner.account });

      await assert.rejects(
        async () => await voting.write.addVoter([signersRegistered[0].account.address], { account: owner.account }),
        /Already registered/
      );
    });

    it("Should revert if the caller is not the owner", async () => {
      await assert.rejects(
        async () => await voting.write.addVoter([signersRegistered[1].account.address], { 
          account: signersRegistered[0].account 
        }),
        /OwnableUnauthorizedAccount/
      );
    });

    it('Should not revert with "Voters registration is not open yet"', async () => {
      await voting.write.addVoter([signersRegistered[0].account.address], { account: owner.account });
      assert.ok(true);
    });
  });

  describe("getVoter", () => {
    beforeEach(async () => {
      ({ voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpAddALotOfVoters());
    });

    it("Should revert if the caller is not a voter", async () => {
      await assert.rejects(
        async () => await voting.read.getVoter([signersRegistered[0].account.address], {
          account: signerNotRegistered.account
        }),
        /You're not a voter/
      );
    });

    it("Should return an unregistered voter", async () => {
      const voter = await voting.read.getVoter([signerNotRegistered.account.address], {
        account: signersRegistered[0].account
      });
      assert.equal(voter.isRegistered, false);
    });

    it("Should return a registered voter", async () => {
      const voter = await voting.read.getVoter([signersRegistered[1].account.address], {
        account: signersRegistered[0].account
      });
      assert.equal(voter.isRegistered, true);
    });
  });

  describe("getOneProposal", () => {
    beforeEach(async () => {
      ({ voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpAddThreeProposals());
    });

    it("Should revert if the caller is not a voter", async () => {
      await assert.rejects(
        async () => await voting.read.getOneProposal([0n], {
          account: signerNotRegistered.account
        }),
        /You're not a voter/
      );
    });

    it("Should return the proposal", async () => {
      const proposal1 = await voting.read.getOneProposal([1n], {
        account: signersRegistered[1].account
      });
      assert.equal(proposal1.description, "Proposal 1");
    });
  });

  describe("addProposal", () => {
    beforeEach(async () => {
      ({ voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpAddALotOfVoters());
    });

    it("Should revert if the caller is not a voter", async () => {
      await assert.rejects(
        async () => await voting.write.addProposal(["Proposal 1"], {
          account: signerNotRegistered.account
        }),
        /You're not a voter/
      );
    });

    it('Should revert with "Proposals are not allowed yet"', async () => {
      await assert.rejects(
        async () => await voting.write.addProposal(["Proposal 1"], {
          account: signersRegistered[0].account
        }),
        /Proposals are not allowed yet/
      );
    });

    it("Should accept a proposal", async () => {
      await voting.write.startProposalsRegistering({ account: owner.account });

      await viem.assertions.emitWithArgs(voting.write.addProposal(["Proposal 1"],{account: signersRegistered[1].account}),voting, "ProposalRegistered",[1n]);
    });

    it("Should refuse an empty proposal", async () => {
      await voting.write.startProposalsRegistering({ account: owner.account });
      await assert.rejects(
        async () => await voting.write.addProposal([""], {
          account: signersRegistered[0].account
        }),
        /Vous ne pouvez pas ne rien proposer/
      );
    });
  });

  describe("setVote", () => {
    beforeEach(async () => {
      ({ voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpAddThreeProposals());
      await voting.write.endProposalsRegistering({ account: owner.account });
    });

    it("Should revert if the caller is not a voter", async () => {
      await voting.write.startVotingSession({ account: owner.account });
      await assert.rejects(
        async () => await voting.write.setVote([1n], {
          account: signerNotRegistered.account
        }),
        /You're not a voter/
      );
    });

    it('Should revert with "Voting session havent started yet"', async () => {
      await assert.rejects(
        async () => await voting.write.setVote([1n], {
          account: signersRegistered[0].account
        }),
        /Voting session havent started yet/
      );
    });

    it('Should revert with "You have already voted"', async () => {
      await voting.write.startVotingSession({ account: owner.account });
      await voting.write.setVote([1n], { account: signersRegistered[0].account });
      await assert.rejects(
        async () => await voting.write.setVote([1n], {
          account: signersRegistered[0].account
        }),
        /You have already voted/
      );
    });

    it("Should accept a vote", async () => {
      await voting.write.startVotingSession({ account: owner.account });
      await viem.assertions.emitWithArgs(voting.write.setVote([1n],{account: signersRegistered[1].account}),voting, "Voted",[getAddress(signersRegistered[1].account.address),1n]);
    });

    it("Should not accept an invalid proposal ID", async () => {
      await voting.write.startVotingSession({ account: owner.account });
      await assert.rejects(
        async () => await voting.write.setVote([25n], {
          account: signersRegistered[0].account
        }),
        /Proposal not found/
      );
    });
  });

  describe("Workflow", () => {
    beforeEach(async () => {
      ({ voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpSmartContract());
    });

    it("Should allow only the owner to change state", async () => {
      await assert.rejects(
        async () => await voting.write.startProposalsRegistering({ account: signersRegistered[0].account }),
        /OwnableUnauthorizedAccount/
      );
      await assert.rejects(
        async () => await voting.write.endProposalsRegistering({ account: signersRegistered[0].account }),
        /OwnableUnauthorizedAccount/
      );
      await assert.rejects(
        async () => await voting.write.startVotingSession({ account: signersRegistered[0].account }),
        /OwnableUnauthorizedAccount/
      );
      await assert.rejects(
        async () => await voting.write.endVotingSession({ account: signersRegistered[0].account }),
        /OwnableUnauthorizedAccount/
      );
      await assert.rejects(
        async () => await voting.write.tallyVotes({ account: signersRegistered[0].account }),
        /OwnableUnauthorizedAccount/
      );
    });

    it("Should revert if the workflow order is not respected", async () => {
      await assert.rejects(
        async () => await voting.write.endProposalsRegistering({ account: owner.account }),
        /Registering proposals havent started yet/
      );
      await assert.rejects(
        async () => await voting.write.startVotingSession({ account: owner.account }),
        /Registering proposals phase is not finished/
      );
      await assert.rejects(
        async () => await voting.write.endVotingSession({ account: owner.account }),
        /Voting session havent started yet/
      );
      await assert.rejects(
        async () => await voting.write.tallyVotes({ account: owner.account }),
        /Current status is not voting session ended/
      );

      await voting.write.startProposalsRegistering({ account: owner.account });
      await assert.rejects(
        async () => await voting.write.startProposalsRegistering({ account: owner.account }),
        /Registering proposals cant be started now/
      );

      await voting.write.endProposalsRegistering({ account: owner.account });
      await voting.write.startVotingSession({ account: owner.account });
      await voting.write.endVotingSession({ account: owner.account });
    });

    it("Should go through all workflow steps", async () => {
      await voting.write.startProposalsRegistering({ account: owner.account });
      await voting.write.endProposalsRegistering({ account: owner.account });
      await voting.write.startVotingSession({ account: owner.account });
      await voting.write.endVotingSession({ account: owner.account });
      await voting.write.tallyVotes({ account: owner.account });
      
      const status = await voting.read.workflowStatus();
      assert.equal(status, 5); // VotesTallied
    });
  });

  describe("tallyVotes", () => {
    beforeEach(async () => {
      ({ voting, signersRegistered, signerNotRegistered, owner, publicClient } = await setUpAddThreeProposals());
    });

    it("Should tally votes and declare the winner", async () => {
      await voting.write.endProposalsRegistering({ account: owner.account });
      await voting.write.startVotingSession({ account: owner.account });

      await voting.write.setVote([0n], { account: signersRegistered[0].account });
      await voting.write.setVote([1n], { account: signersRegistered[1].account });
      await voting.write.setVote([2n], { account: signersRegistered[2].account });
      await voting.write.setVote([2n], { account: signersRegistered[3].account });

      await voting.write.endVotingSession({ account: owner.account });
      await voting.write.tallyVotes({ account: owner.account });

      const winningProposalID = await voting.read.winningProposalID();
      assert.equal(winningProposalID, 2n);
    });

    it("Should tally votes and declare the first tied proposal as the winner", async () => {
      await voting.write.endProposalsRegistering({ account: owner.account });
      await voting.write.startVotingSession({ account: owner.account });

      await voting.write.setVote([0n], { account: signersRegistered[0].account });
      await voting.write.setVote([1n], { account: signersRegistered[1].account });
      await voting.write.setVote([2n], { account: signersRegistered[2].account });

      await voting.write.endVotingSession({ account: owner.account });
      await voting.write.tallyVotes({ account: owner.account });

      const winningProposalID = await voting.read.winningProposalID();
      assert.equal(winningProposalID, 0n);
    });

    it("Should return Genesis proposal if there is no vote", async () => {
      await voting.write.endProposalsRegistering({ account: owner.account });
      await voting.write.startVotingSession({ account: owner.account });
      await voting.write.endVotingSession({ account: owner.account });
      await voting.write.tallyVotes({ account: owner.account });

      const winningProposalID = await voting.read.winningProposalID();
      assert.equal(winningProposalID, 0n);
    });
  });
});