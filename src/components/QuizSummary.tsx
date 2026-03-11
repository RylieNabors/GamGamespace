import { Link } from "react-router-dom";
import { nanoid } from "nanoid";
import ReactMarkdown from "react-markdown";
import type { JSX } from "react";
import { useAIResponse } from "../hooks/useAIResponse.js";

interface QuizSummaryProps {
  score: number;
  correctAns: string[];
  userAns: string[];
  questions: string[];
}

export function QuizSummary({
  score,
  correctAns,
  userAns,
  questions,
}: QuizSummaryProps): JSX.Element {
  console.log("QuizSummary rendered...");

  type MissedQuestionType = {
    question: string | undefined;
    answer: string;
  };
  let missed_questions: MissedQuestionType[] = correctAns
    .map((ans: string, index: number) => ({ ans, orig: index }))
    .filter((ansObj, index) => ansObj.ans !== userAns[index])
    .map((ansObj) => {
      return {
        question: questions[ansObj.orig],
        answer: ansObj.ans,
      };
    });

  const prompt = `/nothinking\n\nBased on the following JSON formatted array of Q&A objects, list 3 relevant
            topics to study further. If the array is empty, suggest a random topic to study further. Do not say that the list
            is based on a JSON formatted array in your response. Say it is 'based on your quiz results'. Return response in 
            markdown. ${JSON.stringify(missed_questions)}`;

  const { data, isLoading, isError, error } = useAIResponse(prompt);

  const missed_question_section: JSX.Element[] = missed_questions.map(
    (questionObj: MissedQuestionType): JSX.Element => {
      return (
        <span key={nanoid()}>
          <p>{questionObj.question}</p>
          <p>{questionObj.answer}</p>
        </span>
      );
    },
  );

  const recommendation_section: JSX.Element[] | undefined = data
    ?.split(/\r?\n\r?\n+/)
    .map((recStr: string): JSX.Element => {
      return <ReactMarkdown key={nanoid()}>{recStr}</ReactMarkdown>;
    });

  return (
    <main className="main-container summary">
      <section className="summary-box quiz-container">
        <header>
          <p>Score: {score} pts</p>
        </header>
        <div>
          <h2>Questions Missed</h2>
          {missed_question_section}
        </div>
        <button>
          <Link to="/quiz">New Game</Link>
        </button>
      </section>
      <section className="recommendation quiz-container">
        {isLoading
          ? "loading..."
          : isError
            ? error
              ? error.message
              : null
            : recommendation_section}
      </section>
    </main>
  );
}
