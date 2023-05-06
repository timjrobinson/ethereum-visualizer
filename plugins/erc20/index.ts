import Web3 from "web3";
const erc20Abi = require("./erc20.json");
import { AbiItem } from 'web3-utils'
import axios from "axios";
import fs from "fs-extra";
import path from "path";

interface ERC20Transfer {
  address: string;
  symbol: string;
  image: string;
}

export async function getErc20Transfers() {
  const transactions = await getTransactions();
  const erc20Transfers: ERC20Transfer[] = await extractTransactions(transactions);

  return erc20Transfers;
}

// Replace with your Ethereum node's URL
const ethNodeUrl = "http://localhost:8545";

const web3 = new Web3(ethNodeUrl);

async function getTransactions() {
  const latestBlockNumber = await web3.eth.getBlockNumber();
  const latestBlock = await web3.eth.getBlock(latestBlockNumber, true);

  console.log(`Latest block number: ${latestBlockNumber}`);
  console.log("Transactions in the latest block:");
  
  return latestBlock.transactions;
}

async function extractTransactions(transactions: any[]) {
    
  const erc20Transfers: ERC20Transfer[] = [];
  
  for (const transaction of transactions) {
    console.log("\nTransaction hash:", transaction.hash);
    // console.log("From:", transaction.from);
    // console.log("To:", transaction.to);
    // console.log("Value:", web3.utils.fromWei(transaction.value, "ether"), "ETH");
    
    if (transaction.to) {
      try {
        const contractCode = await web3.eth.getCode(transaction.to);
        if (contractCode !== "0x") {
          const contract = new web3.eth.Contract(erc20Abi, transaction.to);
          const receipt = await web3.eth.getTransactionReceipt(transaction.hash);
          const transferEventSignature = web3.utils.sha3("Transfer(address,address,uint256)");

          for (const log of receipt.logs) {
            if (log.topics[0] === transferEventSignature) {
              const decodedLog = web3.eth.abi.decodeLog(
                erc20Abi[erc20Abi.length-1].inputs,
                log.data,
                log.topics.slice(1)
              );

              const symbol = await contract.methods.symbol().call();
              const decimals = await contract.methods.decimals().call();
              const amount = Number(decodedLog.value) / 10 ** decimals;
              const tokenAddress = transaction.to;

              console.log("\nERC20 Transfer:");
              console.log(`Token: ${symbol} (${transaction.to})`);
              // console.log("Log: ", decodedLog);
              console.log("From:", decodedLog.from);
              console.log("To:", decodedLog.to);
              console.log("Amount:", amount);
              console.log("\n---------------------\n")
              
              const tokenData = await fetchTokenData(tokenAddress)
              
              erc20Transfers.push({address: tokenAddress, symbol, image: tokenData.logo.src})
            }
          }
        }
      } catch (error) {
        console.error("Error decoding ERC20 transfer:", error);
      }
    }
  }
  
  return erc20Transfers;
}

async function fetchTokenData(tokenAddress: string) {
  const dataDirectory = path.join(__dirname, "./data");
  const tokenFilePath = path.join(dataDirectory, `${tokenAddress}.json`);

  // Create the data directory if it doesn't exist
  await fs.ensureDir(dataDirectory);

  // Check if the token data file exists
  if (await fs.pathExists(tokenFilePath)) {
    // Read the token data from the existing file
    const tokenData = await fs.readJson(tokenFilePath);
    return tokenData;
  } else {
    // Fetch the token data from the URL
    const tokenUrl = `https://raw.githubusercontent.com/ethereum-lists/tokens/master/tokens/eth/${tokenAddress}.json`;
    const response = await axios.get(tokenUrl);

    // Save the token data to a JSON file
    await fs.writeJson(tokenFilePath, response.data);

    return response.data;
  }
}
