import 'regenerator-runtime/runtime';
import React, { useState } from 'react';
import { Button, ThemeProvider, Box, createTheme, Avatar } from '@material-ui/core';
import { MainMenuPage } from "./components/MainMenuPage.js"
import { bgcolor } from '@material-ui/system';

const theme = createTheme({
  typography: {
    "fontFamily": `"Roboto", "Helvetica", "Arial", sans-serif`,
    "fontSize": 14,
    "fontWeightLight": 300,
    "fontWeightRegular": 400,
    "fontWeightMedium": 500
  },
  palette: {
    type: "light",
    primary: {
      main: '#374785',
    },
    secondary: {
      main: '#A8D0E6',
      light: 'rgb(185, 217, 235)'
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
        <>
          <Box sx={{ p: 1, m: 1 }}>
            <Avatar 
              src="/public/Pretzel-Ninja-Leap.svg"
              alt="Ninja Survey" 
              style={{ width: "100px", height: "100px" }}
              variant='square'
            />
          </Box>
          <Button 
            onClick={connectWalletHandler}
            color="primary"
            variant="contained"
            size="medium"
            style={{ height: 40 }}
            display="inline-flex"
          >
            Connect to your Metamask
          </Button>
        </>
      );
    }
    return (
      <ThemeProvider theme={theme}>
        <Box
          textAlign="center"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "secondary.main",
            height: "100vh",
          }}
        >
          {currentAccount ? <MainMenuPage /> : connectWalletButton()}
        </Box>
      </ThemeProvider>
    )
}

export default App