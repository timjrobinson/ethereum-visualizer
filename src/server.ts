import express from "express";
import path from "path";
import Web3 from "web3";
import { getErc20Transfers } from '../plugins/erc20'



// Replace with your Ethereum node's URL
const ethNodeUrl = "http://localhost:8545";
const web3 = new Web3(ethNodeUrl);

const app = express();
const port = process.env.PORT || 3000;

// Serve the static index.html file
app.use(express.static(path.join(__dirname, "../public")));

// Default route to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/transactions/erc20", async (req, res) => {
  try {
    const erc20Transfers = await getErc20Transfers();
    res.json(erc20Transfers);
  } catch (error) {
    console.error("Error fetching ERC20 transfers:", error);
    res.status(500).json({ error: "Error fetching ERC20 transfers" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

