/** @format */
const { ethers } = require("ethers");
// Connect to our Ethereum node
async function main(yearX) {
  const provider = new ethers.JsonRpcProvider(process.env.NETWORK);

  // Define a list of addresses to check against as
  const addressList = process.env.ADDRESS_LIST;

  // ERC20 token contract address and ABI
  const barAddress = process.env.TOKEN_ADRESS;
  const contractABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ];

  // Contract Init
  const tokenContract = new ethers.Contract(barAddress, contractABI, provider);
  const currentBlock = await provider.getBlockNumber();
  const blocksPerYear = 2102400; // Approximate number of blocks per year
  const startBlock = currentBlock - yearX * blocksPerYear;

  const transferEvents = await tokenContract.queryFilter(
    tokenContract.filters.Transfer(),
    startBlock,
    "latest"
  );

  const eventsByBlock = {};

  for (const event of transferEvents) {
    if (
      addressList.includes(event.args[0]) ||
      addressList.includes(event.args[1])
    ) {
      const blockNum = event.blockNumber;
      if (!eventsByBlock[blockNum]) {
        eventsByBlock[blockNum] = [];
      }
      eventsByBlock[blockNum].push(event);
    }
  }

  for (const blockNumber in eventsByBlock) {
    console.log(`Block Number ======== ${blockNumber} ======== \n \n`);
    eventsByBlock[blockNumber].forEach((event) => {
      console.log(`\t From: ${event.args[0]}`);
      console.log(`\t To: ${event.args[1]}`);
      console.log(`\t Value: ${event.args[2].toString()}`);
      console.log("\t -----------------------------------");
    });
  }
}
main(5);
