import { 
  Identity,
  genIdentity,
  genIdentityCommitment,
  genCircuit,
  serialiseIdentity,
  genWitness,
  genExternalNullifier,
  genProof,
  genPublicSignals,
  genBroadcastSignalParams,
  unSerialiseIdentity,
} from "libsemaphore-no-test";
import { useState } from "react";
import survey from '../contracts/Survey.json';
import respondentView from '../contracts/RespondentView.json';
import platform from '../contracts/Platform.json';
import { ContractFactory, ethers, providers } from 'ethers';
import { TextField, Button, Container } from "@material-ui/core";
import { generateWitness } from "../semaphore_js/generate_witness";
import * as snarkjs from 'snarkjs'
import { storage, hashers, tree } from 'semaphore-merkle-tree'

const platformAddress = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";
const MerkleTree = tree.MerkleTree
const MemStorage = storage.MemStorage
const MimcSpongeHasher = hashers.MimcSpongeHasher

export const ParticipantView = () => {
  const [surveys, setSurveys] = useState([{
    address: "abc", name: "tcr"
  }]);

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
      // const surveyContract = new ethers.Contract(surveyAddresses[0], survey.abi, signer);

      // const identity = genIdentity();
      // console.log(identity);
      // const identityCommitment = genIdentityCommitment(identity);
      // console.log(identityCommitment);
      // const insertIdentityTx = await surveyContract.insertIdentity(identityCommitment);
      // await insertIdentityTx.wait();
      // console.log(serialiseIdentity(identity));
      // window.localStorage.setItem(surveyAddresses[0], serialiseIdentity(identity));

      // const serialized = serialiseIdentity(identity);
      // console.log("Unserialized identity: ", unSerialiseIdentity(serialized));
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

      //////////////Cathieso////////////
      const idCommitmentsAsBigInts = []
      for (let idc of idCommitments) {
          idCommitmentsAsBigInts.push(snarkjs.bigInt(idc.toString()))
      }

    const identityCommitment = genIdentityCommitment(identity)
    const index = idCommitmentsAsBigInts.indexOf(identityCommitment)
    const tree = await genTree(20, idCommitments)

    const identityPath = await tree.path(index)

    const { identityPathElements, identityPathIndex } = await genPathElementsAndIndex(
        tree,
        identityCommitment,
    )

    const signalHash = keccak256HexToBigInt("signal")

    const input = {
      signal_hash: signalHash,
      external_nullifier: en,
      identity_nullifier: identity.identity_nullifier,
      identity_trapdoor: identity.identity_trapdoor,
      identity_path_index:identityPathIndex,
      path_elements: identityPathElements
    }
    let witness = await generateWitness(input).then()
      .catch((error) => {
          console.error(error);
          generateWitnessSuccess = false;
    });
    
    console.log("this is the witness", witness);


      //////////////////////////////////
      ////////////////Semaphore-ui/////////
      // const circuit = genCircuit(cirDef);
      // console.log("Generating witness...");
      // const result = await genWitness(
      //   "test",
      //   circuit,
      //   // 3 items
      //   identity,
      //   leaves,
      //   // from survey creator
      //   20,
      //   BigInt(en.toString()),
      // )
      // console.log("Complete generating witness");    
      // const witness = result.witness
      // console.log("Proving...");
      // const provingKey = new Uint8Array(await (await fetch('../circuits/semaphore_0001.zkey')).arrayBuffer());
      // const proof = await genProof(witness, provingKey);
      // console.log("Complete proving", proof);

      // const editedPublicSignals = unstringifyBigInts(publicSignals);
      // const editedProof = unstringifyBigInts(proof);
      // const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
      ///////////////////////////////
    }
  }

  const genTree = async (
    treeDepth,
    leaves,
  ) => {

      const tree = setupTree(treeDepth)

      for (let i=0; i<leaves.length; i++) {
          await tree.update(i, leaves[i].toString())
      }

      return tree
  }

  const setupTree = (
    levels,
    prefix = 'semaphore',
  ) => {
    const storage = new MemStorage()
    const hasher = new MimcSpongeHasher()

    return new MerkleTree(
        prefix,
        storage,
        hasher,
        levels,
        ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')]),
    )
  }

  const genPathElementsAndIndex = async (tree, identityCommitment) => {
    const leafIndex = await tree.element_index(identityCommitment)
    const identityPath = await tree.path(leafIndex)
    const identityPathElements = identityPath.path_elements
    const identityPathIndex = identityPath.path_index

    return { identityPathElements, identityPathIndex }
  }

  const keccak256HexToBigInt = (
    signal,
  ) => {
      const signalAsBuffer = Buffer.from(signal.slice(2), 'hex')
      const signalHashRaw = ethers.utils.solidityKeccak256(
          ['bytes'],
          [signalAsBuffer],
      )
      const signalHashRawAsBytes = Buffer.from(signalHashRaw.slice(2), 'hex');
      const signalHash = beBuff2int(signalHashRawAsBytes.slice(0, 31))

      return signalHash
  }

  const beBuff2int = (buff) => {
    let res = snarkjs.bigInt.zero
    for (let i=0; i<buff.length; i++) {
        const n = snarkjs.bigInt(buff[buff.length - i - 1])
        res = res.add(n.shl(i*8))
    }
    return res
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