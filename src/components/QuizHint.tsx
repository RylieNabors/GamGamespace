import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import type { JSX } from "react";
import { useAIResponse } from "../hooks/useAIResponse.js";

interface QuizHintProps {
  question: string | undefined;
  closeHint: (p: boolean) => void;
  answer: string | undefined;
}

export function QuizHint({
  question,
  closeHint,
  answer,
}: QuizHintProps): JSX.Element | undefined {
  console.log("QuizHint rendered...");
  if (typeof question === undefined) {
    console.log("Question is undefined");
    return undefined;
  }
  if (typeof answer === undefined) {
    console.log("Answer is undefined");
    return undefined;
  }

  const questionObj: { question: string; answer: string } = {
    question: question as string,
    answer: answer as string,
  };
  console.log(questionObj);

  const prompt = `/nothinking\n\nBased on the following JSON formatted object that contains a 
            question and the correct answer, give a hint to what the correct answer is. Do not give the
            correct answer away. Only return the hint ${JSON.stringify(questionObj)}`;

  const { data, isLoading, isError, error } = useAIResponse(prompt);

  if (isLoading) {
    return (
      <div className="hint_section available">
        <h3>
          <FontAwesomeIcon icon={faLightbulb} /> Hint:
        </h3>
        <p>Loading...</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="hint_section not_available">
        <h3>{error ? error.message : null}</h3>
        <p>Try again later</p>
        <button onClick={() => closeHint(false)}>&#10006;</button>
      </div>
    );
  }

  return (
    <div className="hint_section available">
      <h3>
        <FontAwesomeIcon icon={faLightbulb} /> Hint:
      </h3>
      <p>{data}</p>
    </div>
  );
}
