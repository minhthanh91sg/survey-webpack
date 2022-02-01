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
import { Button } from "@material-ui/core";

export const SurveyResponsePage = (props) => {
  const surveyAddress = props.surveyAddress;
  const surveyName = props.surveyName;
  const surveyQuestions = props.surveyQuestions;
  const goBack = props.goBack;

  const handleBroadcast = async () => {
    console.log(surveyAddress);
    const identity = unSerialiseIdentity(window.localStorage.getItem(survey.address));
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
      console.log("Questions", questions);

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
      {surveyQuestions.map(surveyQuestion => {
        return <p>{surveyQuestion}</p>
      })}
    </>
  )
}