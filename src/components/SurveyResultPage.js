export const SurveyResultPage = (props) => {
  const surveyAddress = props.surveyAddress;
  console.log("survey address", surveyAddress);
  const surveyName = props.surveyName;
  console.log("survey name", surveyName);
  const surveyResults = props.surveyResults;
  console.log("Survey Results: ", surveyResults);
  const surveyQuestions = surveyResults[0];
  console.log("surveyQuestions: ", surveyQuestions);
  const surveyScores = surveyResults[1];
  console.log("surveyScores: ", surveyScores);
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
      <span>{surveyAddress}</span>
      <span>{surveyName}</span>
      <ul>
        {questionToScoreArray.map((result, index) => {
          return (
            <li key={index}>{result.question} {result.score} </li>
          )
        })}
      </ul>
    </div>
  )
  
}