import { Button, Box } from "@material-ui/core";
import { useState } from "react";
import { ParticipantView, SurveyorView, CreateSurveyView} from ".";

export const MainMenuPage = () => {
  const [menuState, setState] = useState("Main");
  if (menuState == "Main") {
    return(
      <Box
        sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}
      > 
        <Box sx={{ p: 1, m: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setState("SurveyorView")}
            size="medium"
            display="inline-block"
          >
            View Surveys Results
          </Button>
        </Box>
        <Box>
          <Button 
            onClick={() => setState("Participant")}
            variant="contained"
            color="primary"
            size="medium"
            display="inline-block"
          >
            Choose Survey To Take
          </Button>
        </Box>
        <Box sx={{ p: 1, m: 1 }}>
          <Button
            onClick={() => setState("SurveyorCreate")}
            variant="contained"
            color="primary"
            size="medium"
            display="inline-block"
          >
            Create New Survey
          </Button>
        </Box>
      </Box>
    );
  } else if (menuState == "Participant") {
    return (
      <>
        <Button onClick={() => setState("Main")}>
          Go Back
        </Button>
        <ParticipantView />
      </>
    );
  } else if (menuState == "SurveyorCreate") {
    return (
      <>
        <Button onClick={() => setState("Main")}>
          Go Back
        </Button>
        <CreateSurveyView goBack={() => {setState(MenuState.Main)}} />
      </>
    );
  } else {
    return(
      <>
        <Button onClick={() => setState("Main")}>
          Go Back
        </Button>
        <SurveyorView />
      </>
    );
  }
}