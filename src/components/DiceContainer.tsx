import type { JSX } from "react";

interface DiceContainerProps {
  rollsLeft: number;
  diceElements: JSX.Element[];
  roundNotSubmitted: boolean;
  roll: () => void;
  submitScore: () => void;
  resetGame: () => void;
}

export function DiceContainer({
  rollsLeft,
  diceElements,
  roundNotSubmitted,
  roll,
  submitScore,
  resetGame,
}: DiceContainerProps): JSX.Element {
  return (
    <section className="die-container">
      <span>
        <p>Rolls left: </p>
        <p>{rollsLeft}</p>
      </span>
      <div>{diceElements}</div>
      {roundNotSubmitted ? (
        <p>Submit round to end round.</p>
      ) : (
        <p>Choose a score key to update. &#8593;</p>
      )}
      {rollsLeft !== 0 ? (
        <button className="first" onClick={roll}>
          Roll again
        </button>
      ) : undefined}
      <button onClick={submitScore}>Submit round</button>
      <button className="third" onClick={resetGame}>
        New Game
      </button>
    </section>
  );
}
