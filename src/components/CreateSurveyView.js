import { TextField, Button, Container } from "@material-ui/core";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ContractFactory, ethers, providers } from 'ethers';
import semaphore from '../contracts/Semaphore.json';
import survey from '../contracts/Survey.json';
import platform from '../contracts/Platform.json';

const platformAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CreateSurveyView = (props) => {
  const [inputs, setInputs] = useState([
    { "id": uuidv4(), "question": "" },
  ]);

  const handleChange = (id, event) => {
    const newInputFields = inputs.map(input => {
      if(id === input.id) {
        input["question"] = event.target.value
      }
      return input;
    })
    
    setInputs(newInputFields);
  }

  const handleRemoveFields = (index) => {
    const values  = [...inputs];
    values.splice(index, 1);
    setInputs(values);
  }

  const handleAddFields = () => {
    setInputs([...inputs, { id: uuidv4(), question: "" }])
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
        return input.question;
      });
      const participantAddress = [
        "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
      ];
      const surveyContract = 
        await surveyFactory.deploy(
          questions,
          participantAddress,
          10000,
          "test",
          semaphoreAddress,
        );
      console.log("this is survey address", surveyContract.address);
      console.log("transfering ownership");
      await semaphoreContract.transferOwnership(surveyContract.address);
      console.log("finished transfering ownership");
      console.log("add nullifier start");
      await surveyContract.addExternalNullifier();
      console.log("add nullifier finish");
      // console.log("insert new survey to platform");
      // const platformContract = new ethers.Contract(platformAddress, platform.abi, signer);
      // const addSurveyTx = await platformContract.addExistingSurvey(participantAddress, surveyContract.address);
      // await addSurveyTx.wait()
      // console.log("complete insert new survey");
    }
  };

  return (
    <Container>
      <h1>Add New Question</h1>
      <form className="classes.root">
        { inputs.map((input, index) => (
          <div key={input.id}>
            <TextField 
              name="New Question"
              label={`Question ${index + 1}`}
              variant="filled"
              value={input.question}
              onChange={event => handleChange(input.id, event)}
            />
            <Button onClick={handleAddFields}>Add</Button>
            <Button disabled={inputs.length === 1} onClick={() => handleRemoveFields(index)}>Remove</Button>
          </div>
        )) }
        <Button href="" variant="contained" color="primary" type="submit" onClick={handleSubmit}>Submit</Button>
      </form>
    </Container>
  )
}