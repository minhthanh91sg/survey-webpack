import React from 'react'
import { 
    genIdentity, 
    genIdentityCommitment
  } from "libsemaphore";

function App() {
    const identity = genIdentity();
    const identityCommitment = genIdentityCommitment(identity);
    console.log("kasdjfaksjdfka");
    console.log(identity);
    console.log(identityCommitment);
    return (
        <div>
            Webpack HMR is Working!
        </div>
    )
}

export default App