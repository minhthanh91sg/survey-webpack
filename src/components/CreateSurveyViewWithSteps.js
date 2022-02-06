import { useState } from 'react';
import { Box, Stepper, Step, StepButton, Button, Typography, TextField,
  List, ListItem, IconButton, FormGroup
} from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { makeStyles } from '@material-ui/core/styles';
import { v4 as uuidv4 } from "uuid";
import { ContractFactory, ethers } from 'ethers';
import semaphore from '../contracts/Semaphore.json';
import survey from '../contracts/Survey.json';
import platform from '../contracts/Platform.json';
const address = require('../../public/address.json');
import { theme } from "../App";

const steps = ['Enter survey name', 'Add questions', 'Invite participants'];
const useStyles = makeStyles({
  form: {
    height: '100%',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '100%'
  },
  paper: {
    backgroundColor: '#A8D0E6',
    padding: '0'
  },
});


export const CreateSurveyViewWithSteps = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});

  const [surveyName, setSurveyName] = useState("");
  const [inputs, setInputs] = useState([
    { "id": uuidv4(), "question": "" },
  ]);
  const [participants, setParticipants] = useState([]);
  const classes = useStyles();

  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const handleChangeOnSurveyName = (event) => {
    const newSurveyName = event.target.value;
    setSurveyName(newSurveyName);
  }

  const handleChangeOnQuestion = (id, event) => {
    const newInputFields = inputs.map(input => {
      if(id === input.id) {
        input["question"] = event.target.value;
      }
      return input;
    })
    
    setInputs(newInputFields);
  }

  const handleAddFields = () => {
    setInputs([...inputs, { id: uuidv4(), question: "" }])
  }

  const handleRemoveFields = (index) => {
    const values  = [...inputs];
    values.splice(index, 1);
    setInputs(values);
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
    <FormGroup className={classes.form}>
      <Stepper activeStep={activeStep} className={classes.paper}>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton color="inherit" onClick={handleStep(index)}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      {activeStep + 1 === 1 ? 
        <TextField
          name="Survey name"
          fullWidth
          multiline
          variant='filled'
          value={surveyName}
          label="Survey name"
          onChange={event => handleChangeOnSurveyName(event)}
          className={classes.textField}
        /> :
        activeStep + 1 === 2 ?
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
        </List> :
        activeStep + 1 === 3 ?
        <TextField 
          multiline
          fullWidth
          name="Participants accounts"
          label="Participants"
          variant="filled"
          onChange={event => handleParticipantInput(event)}
        /> :
        <></>
      }
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        { activeStep + 1 !== 3 ?
          <Button 
            onClick={handleNext}
          >
            Next
          </Button> : <></>
        }
        { activeStep + 1 === 3 ?
          <Button
            variant="contained" 
            color="primary" 
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </Button> : <></>
        }
      </Box>
    </FormGroup>
  );
}