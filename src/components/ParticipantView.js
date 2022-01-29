import { 
  genIdentity, 
  genIdentityCommitment
} from "libsemaphore-no-test";
import { useEffect } from "react";
import survey from '../contracts/Survey.json';
import respondentView from '../contracts/RespondentView.json';
import platform from '../contracts/Platform.json';
import { ContractFactory, ethers, providers } from 'ethers';
import { TextField, Button, Container } from "@material-ui/core";

const platformAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const ParticipantView = () => {
  const handleSignIn = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const platformContract = new ethers.Contract(platformAddress, platform.abi, signer);
      console.log("Signing in as participant...");
      const signInTx = await platformContract.signInAsParticipant();
      console.log("Before waiting");
      await signInTx.wait();
      console.log("Complete signing in as participant");
      const viewAddress = await platformContract.getRespondentViewAddress();
      console.log("Participant view address", viewAddress);

      const respondentViewContract = new ethers.Contract(viewAddress, respondentView.abi, signer);
      const surveyNames = await respondentViewContract.getSurveyNames();
      console.log("Survey names: ", surveyNames);
      const surveyAddresses = await respondentViewContract.getAllSurveyAddresses();
      console.log("Survey addresses: ", surveyAddresses);

      const surveyContract = new ethers.Contract(surveyAddresses[0], survey.abi, signer);

      const identity = genIdentity();
      console.log(identity);
      const identityCommitment = genIdentityCommitment(identity);
      console.log(identityCommitment);
      const insertIdentityTx = await surveyContract.insertIdentity(identityCommitment);
      await insertIdentityTx.wait();
      console.log("Complete insert identity");
    }
  }
  



  return (
    <div>
      <Button onClick={handleSignIn}>Add</Button>
      Participants View
    </div>  
  );
}