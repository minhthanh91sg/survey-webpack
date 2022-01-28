import 'regenerator-runtime/runtime';
import React, { useState } from 'react';
import { ethers, providers } from 'ethers';
import { Button } from '@material-ui/core';
import { MainMenuPage } from "./components/MainMenuPage.js"

// import { 
//     genIdentity, 
//     genIdentityCommitment
//   } from "libsemaphore";

// const identity = genIdentity();
// const identityCommitment = genIdentityCommitment(identity);

function App() {
    const [currentAccount, setCurrentAccount] = useState(null);

    const checkWalletIsConnected = async () => { 
      const { ethereum } = window;

      if (!ethereum) {
          alert('Please install Metamask!');
          return;
      } else {
          console.log('Wallet exists');
      }
      const accounts = await ethereum.request({
          method: 'eth_requestAccounts'
      });
      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an account! Address: ", accounts[0]);
          setCurrentAccount(account);
      } else {
          console.log('No authorized account found');
      }
    }

    const connectWalletHandler = async () => { 
      await checkWalletIsConnected();
    }
  
    const connectWalletButton = () => {
      return(
        <Button onClick={connectWalletHandler}>
          Connect to your Metamask
        </Button>
    );
    }
    console.log("kasdjfaksjdfka");
    return (
      <div>
        {currentAccount ? <MainMenuPage/> : connectWalletButton()}
      </div>
    )
}

export default App