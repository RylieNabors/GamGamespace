import type { JSX } from "react";

interface AnswerProps {
  index: number;
  answer: string;
  isGuessed: boolean;
  answerClassName: string;
}

export function Answer({
  index,
  answer,
  isGuessed,
  answerClassName,
}: AnswerProps): JSX.Element {
  return (
    <>
      <input
        type="radio"
        name="answer"
        id={String.fromCharCode(65 + index)}
        className="answer"
        value={answer || "...Loading answer"}
        disabled={isGuessed}
      />
      <label
        className={answerClassName}
        htmlFor={String.fromCharCode(65 + index)}
      >
        {answer || "answer"}
      </label>
    </>
  );
}
