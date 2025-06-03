import express from 'express';
import { ethers } from 'ethers';
import { SafeFactory, EthersAdapter } from '@safe-global/protocol-kit';
import { JsonRpcProvider } from '@ethersproject/providers';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const provider = new JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });
let safeFactory;

(async () => {
    safeFactory = await SafeFactory.create({ ethAdapter });
})();

app.post('/create-safe', async (req, res) => {
    try {
        const { buyer, seller } = req.body;
        const safeAccountConfig = {
            owners: [buyer, seller],
            threshold: 2,
        };
        const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });
        const safeAddress = await safeSdk.getAddress();
        res.json({ safeAddress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));