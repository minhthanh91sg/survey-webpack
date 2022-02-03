import { 
  TextField, 
  Button, 
  Box, 
  FormGroup, 
  List, 
  ListItem,
  IconButton,
  Typography
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ContractFactory, ethers } from 'ethers';
import semaphore from '../contracts/Semaphore.json';
import survey from '../contracts/Survey.json';
import platform from '../contracts/Platform.json';
const address = require('../../public/address.json');

export const CreateSurveyView = () => {
  const [inputs, setInputs] = useState([
    { "id": uuidv4(), "question": "" },
  ]);
  const [surveyName, setSurveyName] = useState("");
  const [participants, setParticipants] = useState([]);

  const handleChangeOnQuestion = (id, event) => {
    const newInputFields = inputs.map(input => {
      if(id === input.id) {
        input["question"] = event.target.value;
      }
      return input;
    })
    
    setInputs(newInputFields);
  }

  const handleChangeOnSurveyName = (event) => {
    const newSurveyName = event.target.value;
    setSurveyName(newSurveyName);
  }

  console.log("Survey Name: ", surveyName);

  const handleRemoveFields = (index) => {
    const values  = [...inputs];
    values.splice(index, 1);
    setInputs(values);
  }

  const handleAddFields = () => {
    setInputs([...inputs, { id: uuidv4(), question: "" }])
  }

  const handleParticipantInput = (event) => {
    const values = event.target.value.split(",");
    const trimmedValues = values.map(value => value.trim());
    console.log("Values: ", trimmedValues);
    const combined = [...trimmedValues];
    setParticipants(combined);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const questions = inputs.map(input => {
      return input.question
    });
    
    console.log("InputFields", questions);
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const semaphoreFactory = new ContractFactory(semaphore.abi, semaphore.bytecode, signer);
      console.log("deploying semaphore");
      const semaphoreContract = await semaphoreFactory.deploy(20, 1111);
      const semaphoreAddress = semaphoreContract.address;
      console.log("this is semaphore address", semaphoreAddress);
      const surveyFactory = new ContractFactory(survey.abi, survey.bytecode, signer);
      console.log("deploying survey");
      // questions list
      const questions = inputs.map(input => {
        return input.question.trim();
      });

      const surveyContract = await surveyFactory.deploy(
        questions,
        participants,
        surveyName,
        semaphoreAddress,
      );

      console.log("this is survey address", surveyContract.address);
      console.log("transfering ownership");
      await semaphoreContract.transferOwnership(surveyContract.address);

      console.log("finished transfering ownership");
      console.log("add nullifier start");
      await surveyContract.addExternalNullifier();
      console.log("add nullifier finish");
      
      console.log("insert new survey to platform");
      const platformContract = new ethers.Contract(address.Platform, platform.abi, signer);
      console.log("Participant addresses: ", participants);
      
      const addSurveyTx = await platformContract.addExistingSurvey(participants, surveyContract.address);
      await addSurveyTx.wait();

      console.log("complete insert new survey");
    }
  };

  return (
    <Box>
      <Typography variant="h3">
        CREATE NEW SURVEY
      </Typography>
      <FormGroup>
        <TextField   
          fullWidth
          name="Survey name"
          variant="filled"
          value={surveyName}
          label="Survey name"
          onChange={event => handleChangeOnSurveyName(event)}
        />
        <List>
          { inputs.map((input, index) => (
            <ListItem key={input.id}>            
              <TextField
                multiline
                fullWidth
                name="New Question"
                label={`Question ${index + 1}`}
                variant="filled"
                value={input.question}
                onChange={event => handleChangeOnQuestion(input.id, event)}
              />
              <IconButton 
                onClick={handleAddFields}><AddIcon /></IconButton>
              <IconButton 
                disabled={inputs.length === 1} 
                onClick={() => handleRemoveFields(index)}
              >
                <RemoveIcon />
              </IconButton>
            </ListItem>
          )) }
        </List>
        <TextField 
          multiline
          fullWidth
          name="Participants accounts"
          label="Participants"
          variant="filled"
          onChange={event => handleParticipantInput(event)}
        />
        <Button
          variant="contained" 
          color="primary" 
          type="submit"
          onClick={handleSubmit}
          size="medium"
          display="inline-block"
        >
          Submit
        </Button>
      </FormGroup>
    </Box>
  )
}