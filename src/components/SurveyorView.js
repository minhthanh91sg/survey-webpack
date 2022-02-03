import surveyResultsView from '../contracts/SurveyResultsView.json';
import platform from '../contracts/Platform.json';
import { Contract, ethers } from 'ethers';
const address = require('../../public/address.json');
import {
  Button,
  List,
  ListItem
} from "@material-ui/core";
import { useState } from "react";
import survey from '../contracts/Survey.json';
import { SurveyResultPage } from './SurveyResultPage';

export const SurveyorView = () => {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const handleFetchSurvey = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const platformContract = new Contract(address.Platform, platform.abi, signer);
      const surveyResultAddress = await platformContract.getSurveyorsResultAddress();
      console.log("Survey Result address: ", surveyResultAddress);

      const surveyResultViewContract = new Contract(surveyResultAddress, surveyResultsView.abi, signer);
      const surveyNames = await surveyResultViewContract.getAllSurveys();
      console.log("survey names: ", surveyNames);

      const surveyAddresses = await surveyResultViewContract.getAllSurveyAddresses();
      console.log("survey addresses: ", surveyAddresses);

      const updatedSurveyList = [...surveys];
      for (let i = 0; i < surveyAddresses.length; i += 1) {
        updatedSurveyList.push({ address: surveyAddresses[i], name: surveyNames[i] });
      }
      setSurveys(updatedSurveyList);
    }
  }

  const renderSurveys = () => {
    return surveys.map((survey, index) => {
      return (
        <List>
          <ListItem key={index}>
            <Button onClick={async() => await handleSelectSurvey(survey.name, survey.address)}>
              {survey.name}
            </Button>
          </ListItem>
        </List>
      );
    });
  }

  const handleSelectSurvey = async (surveyName, surveyAddress) => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      console.log("survey address: ", surveyAddress);
      const surveyContract = new Contract(surveyAddress, survey.abi, signer);
      console.log("start scoring survey");
      const scoringTx = await surveyContract.calcAverageScorePerQuestion();
      await scoringTx.wait();
      console.log("complete scoring survey");

      const surveyScores = await surveyContract.getSurveyScores();

      console.log("survey scores", surveyScores);

      const value = { address: surveyAddress, name: surveyName, score: surveyScores }
      setSelectedSurvey(value);
    }
  }

  return (
    <>
      {!selectedSurvey && 
        <>
          <Button
            color="primary"
            variant="contained"
            onClick={handleFetchSurvey}
          >
            Fetch Surveys
          </Button>
          {renderSurveys()}
        </>
      }
      { selectedSurvey && <SurveyResultPage 
        surveyAddress={selectedSurvey.address}
        surveyName={selectedSurvey.name}
        surveyResults={selectedSurvey.score}
      /> }
    </>
  );
}