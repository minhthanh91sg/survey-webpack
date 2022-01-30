import 'regenerator-runtime/runtime';
import React, { useState } from 'react';
import { Button, ThemeProvider, Box, Paper, createTheme } from '@material-ui/core';
import { MainMenuPage } from "./components/MainMenuPage.js"

const theme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: '#374785',
    },
    secondary: {
      main: '#A8D0E6',
    },
    error: {
      main: '#F76C6C',
    },
  }
})

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
        <Button 
          onClick={connectWalletHandler}
          color="primary"
          variant="contained"
        >
          Connect to your Metamask
        </Button>
      );
    }
    return (
      <ThemeProvider theme={theme}>
        <Box
          textAlign="center"
          sx={{
            height: "100vh",
            width: "100vw",
            backgroundColor: "secondary.light",
            justifyContent: "center"
          }}
        >

          {currentAccount ? <MainMenuPage /> : connectWalletButton()}

        </Box>
      </ThemeProvider>
      
    )
}

export default App