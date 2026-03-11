import "../css/quiz.css";
import { QuizSummary } from "./QuizSummary.js";
import { QuizHint } from "./QuizHint.js";
import { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import type { JSX } from "react";
import type { ResultsType, ResponseType, QuestionType } from "../entities.ts";
import { useQuestionResponse } from "../hooks/useQuestionResponse.js";
import { Answer } from "./Answer.js";
import { QuestionHeader } from "./QuestionHeader.js";

export function Question() {
  // state values
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [qIndex, setQIndex] = useState<number>(0);
  const [showHintBool, setShowHintBool] = useState<Boolean>(false);
  const [hintOpened, setHintOpened] = useState<boolean>(false);

  // Derived values
  const gameOver: boolean = false;
  const isGuessed: boolean = typeof userAnswers[qIndex] !== "undefined";
  const isUserCorrect: boolean =
    userAnswers[qIndex] === questions[qIndex]?.correct;
  const showQuizSummary: boolean =
    questions.length !== 0 && qIndex == questions.length;
  //const showQuizSummary = true // temporary

  // Ref
  const formRef = useRef<HTMLFormElement>(null);

  const { width, height } = useWindowSize();
  const { data, isLoading, isError, error, refetch } = useQuestionResponse();

  useEffect(() => {
    if (!data) return;
    setQuestions(data);
  }, [data]);

  useEffect(() => {
    if (gameOver) {
      refetch();
    }
  }, [gameOver, refetch]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isError) {
    return <h1>{error ? error.message : null}</h1>;
  }

  function incrementIndex(): void {
    console.log("incrementing index");
    if (qIndex < questions.length) setQIndex((prevIndex) => prevIndex + 1);
    setHintOpened(false);
    setShowHintBool(false);
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget as EventTarget;
    const formData = new FormData(formEl as HTMLFormElement);
    const ans: string = formData.get("answer") as string;
    setUserAnswers((prevAns: string[]): string[] => [...prevAns, ans]);
    if (ans === questions[qIndex]?.correct)
      setScore((prevScore) => prevScore + 1);
    (formEl as HTMLFormElement).reset();
  }

  function openHint(): void {
    setHintOpened(true);
    if (score <= 0) return;
    setShowHintBool(true);
    setScore((prev) => prev - 1);
  }

  const answerElements: JSX.Element[] | undefined = questions[
    qIndex
  ]?.answers.map((answer: string, index: number): JSX.Element => {
    const isCorrect: boolean =
      isGuessed && answer === questions[qIndex]?.correct;
    const isNotCorrect: boolean =
      isGuessed && answer !== questions[qIndex]?.correct;

    const answerClassName: string = clsx({
      correct: isCorrect,
      wrong: isNotCorrect,
    });
    return (
      <div key={index} className="opt">
        <Answer
          index={index}
          answer={answer}
          isGuessed={isGuessed}
          answerClassName={answerClassName}
        />
      </div>
    );
  });

  function showCorrectAnswers(): string[] {
    return questions.map((questionObj: QuestionType) => questionObj.correct);
  }

  function showQuestions(): string[] {
    return questions.map((questionObj: QuestionType) => questionObj.question);
  }

  return showQuizSummary ? (
    <QuizSummary
      score={score}
      correctAns={showCorrectAnswers()}
      userAns={userAnswers}
      questions={showQuestions()}
    />
  ) : (
    <main className="main-container">
      {isUserCorrect ? <Confetti width={width} height={height} /> : undefined}
      <section className="question-box quiz-container">
        <QuestionHeader
          index={qIndex + 1}
          length={questions.length}
          category={questions[qIndex]?.category}
          score={score}
          openHint={openHint}
        />

        {hintOpened && showHintBool ? (
          <QuizHint
            question={questions[qIndex]?.question}
            answer={questions[qIndex]?.correct}
            closeHint={setHintOpened}
          />
        ) : hintOpened ? (
          <div className="hint_section not_available">
            <h3>"You must have at least 1pt to view hint!"</h3>
            <p>Try again later</p>
            <button onClick={() => setHintOpened(false)}>&#10006;</button>
          </div>
        ) : null}

        <h1 className="question">
          {questions[qIndex]?.question || "...Loading Question"}
        </h1>

        <form
          className="answers"
          ref={formRef}
          id="answers"
          onSubmit={handleSubmit}
        >
          {answerElements}
        </form>

        <footer>
          <button
            type="button"
            onClick={() => {
              !isGuessed ? formRef.current?.requestSubmit() : incrementIndex();
            }}
          >
            {isGuessed ? "Next" : "Submit"}
          </button>
        </footer>
      </section>
    </main>
  );
}
