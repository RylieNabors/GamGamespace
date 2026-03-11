import type { JSX } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";

interface QuestionHeaderProps {
  index: number;
  length: number;
  category: string | undefined;
  score: number;
  openHint: () => void;
}

export function QuestionHeader({
  index,
  length,
  category,
  score,
  openHint,
}: QuestionHeaderProps): JSX.Element {
  return (
    <header>
      <p className="question-count">
        Question {index}/{length}
      </p>
      <p className="question-level">{category || "...Loading Category"}</p>
      <span>
        {score} pts
        <button title="Hint" onClick={openHint}>
          <FontAwesomeIcon icon={faLightbulb} />
        </button>
      </span>
    </header>
  );
}
