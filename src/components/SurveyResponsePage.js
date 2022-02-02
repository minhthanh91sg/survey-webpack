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
import { Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@material-ui/core";
import React, { useState } from "react";
import survey from '../contracts/Survey.json';
import { ethers } from 'ethers';

export const SurveyResponsePage = (props) => {
  const surveyAddress = props.surveyAddress;
  const surveyName = props.surveyName;
  const surveyQuestions = props.surveyQuestions;
  const goBack = props.goBack;

  const [selected, setSelected] = useState([]);

  const handleChange = (event, questionIndex) => {
    const value = event.target.value;
    let found = false;
    let newInputs = selected.map(input => {
      if (questionIndex == input["question"]) {
        input["answer"] = value;
        found = true;
      }
      return input;
    });
    if (!found) {
      newInputs = [...newInputs, {
        "question" : questionIndex,
        "answer" : value,
      }];
    }
    setSelected(newInputs);
  }

  const order = (inputs) => {
    inputs.sort((a, b) => {
      if (a["question"] < b["question"]) return -1;
      if (a["question"] > b["question"]) return 1;
      return 0;
    });
    return inputs;
  }
  console.log("Selected: ", selected);

  const handleBroadcast = async () => {
    console.log(surveyAddress);
    const identity = unSerialiseIdentity(window.localStorage.getItem(surveyAddress));
    console.log(identity);
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const surveyContract = new ethers.Contract(surveyAddress, survey.abi, signer);
      console.log("Getting leaves...");
      const idCommitments = await surveyContract.getIdentityCommitments();
      console.log('Leaves:', idCommitments);
      const en = await surveyContract.getExternalNullifier();
      console.log("external nullifier", en);

      const cirDef = await 
        (await fetch("/public/circuit.json"))
        .json();
      const circuit = genCircuit(cirDef);

      const orderList = order(selected).map((input) => input["answer"]);
      console.log("Order List", orderList);
      const stringifyOrderList = JSON.stringify(orderList);
      console.log("Generating witness...");
      const result = await genWitness(
        stringifyOrderList,
        circuit,
        // 3 items
        identity,
        idCommitments,
        // from survey creator
        20,
        BigInt(en.toString()),
      )
      console.log("Complete generating witness"); 
      console.log("full result: ", result);
      const witness = result.witness;
      console.log("Proving...");
      const provingKey = new Uint8Array(await (await fetch("/public/proving_key.bin")).arrayBuffer());
      const proof = await genProof(witness, provingKey);
      console.log("Complete proving", proof);

      const publicSignals = genPublicSignals(witness, circuit);
      const params = genBroadcastSignalParams(result, proof, publicSignals);
      console.log("genBroadcastSignalParams: ", params);
      console.log("Updating survey result...");
      
      const tx = await surveyContract.updateSurveyResult(
        surveyQuestions,
        orderList,
        ethers.utils.toUtf8Bytes(stringifyOrderList),
        params.proof,
        params.root,
        params.nullifiersHash
      );
      
      const receipt = await tx.wait();
      console.log("Questions", surveyQuestions);

      console.log("Complete update survey result...");
      console.log(receipt);
    }
  }

  return (
    <>
      <Button
        onClick={goBack}
      >
        Back to survey selection
      </Button>
      <h1>{surveyName}</h1>
      <FormControl>
        { surveyQuestions.map((surveyQuestion, index) => {
          return (
            <div key={index}>
              <FormLabel>{surveyQuestion}</FormLabel>
              <RadioGroup
                row
                onChange={ (event) => { handleChange(event, index) } }
              >
                <FormControlLabel value="1" control={<Radio color="primary" />} label="1" />
                <FormControlLabel value="2" control={<Radio color="primary" />} label="2" />
                <FormControlLabel value="3" control={<Radio color="primary" />} label="3" />
              </RadioGroup>
            </div>
          );
        }) }
        <Button
          variant="contained" 
          color="primary" 
          type="submit"
          onClick={handleBroadcast}
          size="medium"
          display="inline-block"
        >
          Submit
        </Button>
      </FormControl>
    </>
  );
}