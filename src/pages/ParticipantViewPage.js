import { 
  genIdentity,
  genIdentityCommitment,
  genCircuit,
  serialiseIdentity,
  genWitness,
  genProof,
  genPublicSignals,
  genBroadcastSignalParams,
  unSerialiseIdentity,
} from "libsemaphore-no-test";
import { useState } from "react";
import survey from '../contracts/Survey.json';
import respondentView from '../contracts/RespondentView.json';
import platform from '../contracts/Platform.json';
import { ethers } from 'ethers';
import { List, Button, ListItem, Box } from "@material-ui/core";
import { SurveyResponsePage } from "./SurveyResponsePage";
const address = require('../../public/address.json');

export const ParticipantView = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const platformContract = new ethers.Contract(address.Platform, platform.abi, signer);
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
        
        const updatedSurveyList = [...surveys];
        for (let i = 0; i < surveyAddresses.length; i += 1) {
          updatedSurveyList.push({address: surveyAddresses[i], name: surveyNames[i]});
        }
        
        setSurveys(updatedSurveyList);
      }
    } catch (e) {
      console.log(e.message);
    }
    setLoading(false);
  }

  const handleSelectSurvey = async (_address, _name) => {
    const {ethereum } = window;
    if (!ethereum) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    // the part below inserts identity
    const surveyContract = new ethers.Contract(_address, survey.abi, signer);
    const _surveyQuestions = await surveyContract.getSurveyQuestions();
    // TODO: replace try/catch with backend variable AlreadyInsertedIdentityCommitment
    const insertIdentityStatus = await surveyContract.checkInsertIdentityStatus();
    if (!insertIdentityStatus) {
      try {
        const identity = genIdentity();
        console.log(identity);
        const identityCommitment = genIdentityCommitment(identity);
        console.log(identityCommitment);
        const insertIdentityTx = await surveyContract.insertIdentity(identityCommitment);
        await insertIdentityTx.wait();
        console.log(serialiseIdentity(identity));
        window.localStorage.setItem(_address, serialiseIdentity(identity));
  
        const serialized = serialiseIdentity(identity);
        console.log("Unserialized identity: ", unSerialiseIdentity(serialized));
      } catch (e) {
        console.log(e.message);
      }
    }

    const value = { address: _address, name: _name, surveyQuestions: _surveyQuestions };
    setSelectedSurvey(value);
  }
  
  const renderSurveys = () => {
    return surveys.map((survey, index) => {
      return (
        <List>
          <ListItem key={index}>
            <Button onClick={async() => await handleSelectSurvey(survey.address, survey.name)}>
              {survey.name}
            </Button>
          </ListItem>
        </List>
      );
    });
  }

  return (
    <>
      {!selectedSurvey && 
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Button 
            onClick={handleSignIn}
            variant="contained" 
            color="primary"
            size="medium"
            display="inline-block"
            disabled={loading}
          >
            Fetch Surveys
          </Button>
          {renderSurveys()}
        </Box>
      }
      {selectedSurvey && 
        <SurveyResponsePage 
          surveyAddress={selectedSurvey.address} 
          surveyName={selectedSurvey.name}
          surveyQuestions={selectedSurvey.surveyQuestions}
          goBack={() => setSelectedSurvey(null)}
        />
      }
    </>  
  );
}