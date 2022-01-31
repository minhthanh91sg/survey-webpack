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
import { TextField, Button, Container } from "@material-ui/core";

const platformAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const ParticipantView = () => {
  const [surveys, setSurveys] = useState([]);

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
      
      const updatedSurveyList = [...surveys];
      for (let i = 0; i < surveyAddresses.length; i += 1) {
        updatedSurveyList.push({address: surveyAddresses[i], name: surveyNames[i]});
      }
      
      // the part below inserts identity
      const surveyContract = new ethers.Contract(surveyAddresses[0], survey.abi, signer);

      const identity = genIdentity();
      console.log(identity);
      const identityCommitment = genIdentityCommitment(identity);
      console.log(identityCommitment);
      const insertIdentityTx = await surveyContract.insertIdentity(identityCommitment);
      await insertIdentityTx.wait();
      console.log(serialiseIdentity(identity));
      window.localStorage.setItem(surveyAddresses[0], serialiseIdentity(identity));

      const serialized = serialiseIdentity(identity);
      console.log("Unserialized identity: ", unSerialiseIdentity(serialized));
      setSurveys(updatedSurveyList);
    }
  }

  const handleBroadcast = async (surveyAddress, identity) => {
    console.log(surveyAddress);
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
      console.log("Generating witness...");
      const result = await genWitness(
        "test",
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
        ["q1"],
        [5],
        ethers.utils.toUtf8Bytes("test"),
        params.proof,
        params.root,
        params.nullifiersHash
      );
      
      const receipt = await tx.wait();
      console.log("Complete update survey result...");
      console.log(receipt);
    }
  }
  
  const renderSurveys = () => {
    return surveys.map((survey, index) => {
      return (
        <li key={index}>
          <Button onClick={() => handleBroadcast(survey.address, 
            unSerialiseIdentity(window.localStorage.getItem(survey.address)))}>
          <span>
            {survey.name}
          </span>
          <span>
            {survey.address}
          </span>
          </Button>
        </li>
      )
    })
  }

  return (
    <div>
      <Button onClick={handleSignIn}>Add</Button>
      Participants View
      {renderSurveys()}
    </div>  
  );
}