import { 
  Box, AppBar, Toolbar, 
  Typography, Drawer, Divider, 
  List, ListItem, ListItemIcon, 
  ListItemText
} from "@material-ui/core";
import { ScoreOutlined, CreateOutlined, QuestionAnswerOutlined } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { theme } from "../App";
import { useState } from "react";
import { CreateSurveyView, CreateSurveyViewWithSteps } from "../components";
import { ParticipantView, SurveyorView } from "./";

export const MainMenuPage = () => {
  const useStyles = makeStyles({
    paper: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      width: '240px',
    }
  });

  const classes = useStyles();

  const [component, setComponent] = useState();

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        classes={{ paper: classes.paper, flexShrink: 0 }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          <ListItem 
            button 
            key={'Survey Results'}
            onClick={() => setComponent('Survey Results')}
          >
            <ListItemIcon>
              <ScoreOutlined fontSize="medium"/>
            </ListItemIcon>
            <ListItemText primary={'Survey Results'} />
          </ListItem>
          <ListItem 
            button 
            key={'Create Surveys'}
            onClick={() => setComponent('Create Surveys')}
          >
            <ListItemIcon>
              <CreateOutlined fontSize="medium"/>
            </ListItemIcon>
            <ListItemText primary={'Create Surveys'} />
          </ListItem>
          <ListItem 
            button
            key={'Take Surveys'}
            onClick={() => setComponent('Take Surveys')}
          >
            <ListItemIcon>
              <QuestionAnswerOutlined fontSize="medium"/>
            </ListItemIcon>
            <ListItemText primary={'Take Surveys'} />
          </ListItem>
        </List>
      </Drawer>
      <Box
        display="flex"
        component="main"
        alignItems="center"
        justifyContent="center"
        bgcolor={theme.palette.secondary.main}
        sx={{ flexGrow: 1, marginLeft: '240px', height: '100vh' }}
      >
        {
          component === 'Survey Results' ?
          <SurveyorView />
          :
          component === 'Create Surveys' ?
          <CreateSurveyViewWithSteps />
          :
          component === 'Take Surveys' ?
          <ParticipantView />
          :
          <></>
        }
      </Box>
    </Box>
  );
}