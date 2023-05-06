import Web3 from "web3";
const erc20Abi = require("./erc20.json");
import { AbiItem } from 'web3-utils'

interface ERC20Transfer {
  address: string;
  symbol: string;
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

              console.log("\nERC20 Transfer:");
              console.log(`Token: ${symbol} (${transaction.to})`);
              // console.log("Log: ", decodedLog);
              console.log("From:", decodedLog.from);
              console.log("To:", decodedLog.to);
              console.log("Amount:", amount);
              console.log("\n---------------------\n")
              
              erc20Transfers.push({address: transaction.to, symbol})
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