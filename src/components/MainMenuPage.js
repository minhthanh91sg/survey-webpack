import { Button, menuClasses } from '@material-ui/core';
import { useState } from "react";
import { ParticipantView, SurveyorView, CreateSurveyView} from ".";

export const MainMenuPage = () => {
  const [menuState, setState] = useState("Main");
  if (menuState == "Main") {
    return(
      <div>
        <Button onClick={() => setState("SurveyorView")}>
          View Surveys Results
        </Button> 
        <Button onClick={() => setState("Participant")}>
          Choose Survey To Take
        </Button>
        <Button onClick={() => setState("SurveyorCreate")}>
          Create New Survey
        </Button>
      </div>
    );
  } else if (menuState == "SurveyorView") {
    return (
      <div>
        <Button onClick={() => setState("Main")}>
          Go Back
        </Button>
        <ParticipantView>
        </ParticipantView>
      </div>
    );
  } else if (menuState == "SurveyorCreate") {
    return (
      <div>
        <Button onClick={() => setState("Main")}>
          Go Back
        </Button>
        <CreateSurveyView goBack={() => {setState(MenuState.Main)}} />
      </div>
    );
  } else {
    return(
      <div>
        <Button onClick={() => setState("Main")}>
          Go Back
        </Button>
        <SurveyorView>
        </SurveyorView>
      </div>
    );
  }
}