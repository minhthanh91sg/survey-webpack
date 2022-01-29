import { 
  genIdentity, 
  genIdentityCommitment
} from "libsemaphore-no-test";

export const ParticipantView = () => {
  const identity = genIdentity();
  console.log(identity);
  const identityCommitment = genIdentityCommitment(identity);
  console.log(identityCommitment);
  return (
    <div>Participants View</div>  
  );
}