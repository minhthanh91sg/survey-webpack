import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from "@material-ui/core";

export const SurveyResultPage = (props) => {
  const surveyName = props.surveyName;
  const surveyResults = props.surveyResults;

  const surveyQuestions = surveyResults[0];
  const surveyScores = surveyResults[1];

  const questionToScoreArray = [];
  for (let i = 0; i < surveyQuestions.length; i += 1) {
    questionToScoreArray.push({
      "question" : surveyQuestions[i],
      "score" : Number(surveyScores[i])
    })
  }
  console.log("questionToScoreArray", questionToScoreArray);
  return (
    <div>
      <Typography variant="h2">{surveyName}</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6">
                  Question
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6">
                  Average Score
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questionToScoreArray.map((result, index) => {
              return (
                <TableRow key={index}>
                  <TableCell align="left">
                    <Typography>{result.question}</Typography> 
                  </TableCell>
                  <TableCell align="center">
                    <Typography>{result.score}</Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}