import type { JSX } from "react";

interface DiceScoreContainerProps {
  upperEls: JSX.Element[];
  upperBonus: 0 | 35;
  upperTotal: number;
  lowerEls: JSX.Element[];
  lowerTotal: number;
}

export function DiceScoreContainer({
  upperEls,
  upperBonus,
  upperTotal,
  lowerEls,
  lowerTotal,
}: DiceScoreContainerProps): JSX.Element {
  return (
    <section className="die-container score">
      <p className="emphasized">Upper section</p>
      {upperEls}
      <span>
        <p>Bonus</p>
        <p>{upperBonus}</p>
      </span>
      <span>
        <p>Upper Total</p>
        <p>{upperTotal + upperBonus}</p>
      </span>
      <p className="emphasized">Lower section</p>
      {lowerEls}
      <span>
        <p>Lower Total</p>
        <p>{lowerTotal}</p>
      </span>
      <span className="emphasized">
        <p>Grand Total</p>
        <p>{upperTotal + upperBonus + lowerTotal}</p>
      </span>
    </section>
  );
}
