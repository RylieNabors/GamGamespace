import type { JSX } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";

interface SudokuHeaderProps {
  difficulty: string;
  errorCount: number;
  showHint: () => void;
  isButtonDisabled: boolean;
}

export function SudokuHeader({
  difficulty,
  errorCount,
  showHint,
  isButtonDisabled,
}: SudokuHeaderProps): JSX.Element {
  return (
    <>
      <section className="sudoku-head">
        <h1>Sudoku</h1>
        <span>
          {`${difficulty || "...Loading"}  |`}
          <h2>{`Mistakes: ${errorCount}/3`}</h2>
          <button
            onClick={showHint}
            disabled={isButtonDisabled}
            title="Show Hint"
          >
            <FontAwesomeIcon icon={faLightbulb} />
          </button>
        </span>
      </section>
    </>
  );
}
