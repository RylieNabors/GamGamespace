import { nanoid } from "nanoid";
import { useState, Fragment } from "react";
import "../css/yahtzee.css";
import type { JSX } from "react";
import type {
  CategoryName,
  ScoreType,
  DiceObjectType,
  LowerPointType,
} from "../entities.js";
import { CategoryElement } from "../components/CategoryElement.js";
import { DiceContainer } from "../components/DiceContainer.js";
import { DiceScoreContainer } from "../components/DiceScoreContainer.js";

export function Yahtzee(): JSX.Element {
  enum ScoreCardNums {
    ACES = 1,
    TWOS = 2,
    THREES = 3,
    FOURS = 4,
    FIVES = 5,
    SIXES = 6,
  }

  const INITIAL_SCORE: ScoreType[] = [
    { name: "Aces", score: 0, isFilled: false },
    { name: "Twos", score: 0, isFilled: false },
    { name: "Threes", score: 0, isFilled: false },
    { name: "Fours", score: 0, isFilled: false },
    { name: "Fives", score: 0, isFilled: false },
    { name: "Sixes", score: 0, isFilled: false },
    { name: "3 of a kind", score: 0, isFilled: false },
    { name: "4 of a kind", score: 0, isFilled: false },
    { name: "Full house", score: 0, isFilled: false },
    { name: "Sm. straight", score: 0, isFilled: false },
    { name: "Lg. straight", score: 0, isFilled: false },
    { name: "Yahtzee", score: 0, isFilled: false },
    { name: "Chance", score: 0, isFilled: false },
    { name: "Yahtzee bonus", score: 0, isFilled: false },
  ];

  // state
  const [dice, setDice] = useState<DiceObjectType[]>(generateDice());
  const [rollCount, setRollCount] = useState<number>(2);
  const [roundSubmitEvent, setRoundSubmitEvent] = useState<boolean>(false);
  const [scoreData, setScoreData] = useState<ScoreType[]>(INITIAL_SCORE);

  // functions for derived values
  function includesAll(array: number[]) {
    return array.every((v: number): boolean =>
      dice.some((o: DiceObjectType): boolean => o.value === v),
    );
  }
  function checkCounts(threshold: number) {
    return Object.values(dieCounts).some(
      (count: number): boolean => count >= threshold,
    );
  }
  function checkFullHouse(array: number[], ans: number[]) {
    return array.every((v: number): boolean =>
      ans.some((a: number): boolean => a === v),
    );
  }

  // derived values
  const addedDiceTotal: number = dice.reduce(
    (total: number, currentDie: DiceObjectType) => {
      return total + currentDie.value;
    },
    0,
  );
  const upperTotal: number = scoreData
    .slice(0, 6)
    .reduce((total: number, currentScoreObj: ScoreType) => {
      return total + currentScoreObj.score;
    }, 0);
  const upperBonus: 35 | 0 = upperTotal >= 63 ? 35 : 0;
  const lowerTotal: number = scoreData
    .slice(6, 13)
    .reduce((total: number, currentScoreObj: ScoreType) => {
      return total + currentScoreObj.score;
    }, 0);
  type DieCountKey = 1 | 2 | 3 | 4 | 5 | 6;
  type DieCountType = Record<DieCountKey, number>;
  const dieCounts: DieCountType = dice.reduce<DieCountType>(
    (count, { value }) => {
      count[value as DieCountKey] = (count[value as DieCountKey] || 0) + 1;
      return count;
    },
    {} as DieCountType,
  );
  const lgStraight: boolean =
    includesAll([1, 2, 3, 4, 5]) || includesAll([2, 3, 4, 5, 6]);
  const smStraight: boolean =
    includesAll([1, 2, 3, 4]) ||
    includesAll([2, 3, 4, 5]) ||
    includesAll([3, 4, 5, 6]);
  const threeOfKind: boolean = checkCounts(3);
  const fourOfKind: boolean = checkCounts(4);
  const yahtzee: boolean = checkCounts(5);
  const fullHouse: boolean = checkFullHouse([2, 3], Object.values(dieCounts));
  const gameOver: boolean = scoreData.every(
    (scoreObj: ScoreType): boolean => scoreObj.isFilled === true,
  );

  const lowerPointSystem: LowerPointType[] = [
    { name: "3 of a kind", value: threeOfKind, points: addedDiceTotal },
    { name: "4 of a kind", value: fourOfKind, points: addedDiceTotal },
    { name: "Full house", value: fullHouse, points: 25 },
    { name: "Sm. straight", value: smStraight, points: 30 },
    { name: "Lg. straight", value: lgStraight, points: 40 },
    { name: "Yahtzee", value: yahtzee, points: 50 },
    { name: "Chance", value: true, points: addedDiceTotal },
    { name: "Yahtzee bonus", value: yahtzee, points: 100 },
  ];

  function generateDice(): DiceObjectType[] {
    return new Array(5).fill(0).map(
      (): DiceObjectType => ({
        value: Math.ceil(Math.random() * 6),
        isHeld: false,
        id: nanoid(),
      }),
    );
  }

  function resetGame(): void {
    setDice((oldDice) =>
      oldDice.map((die) =>
        die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) },
      ),
    );
    setScoreData(INITIAL_SCORE);
    setRollCount(2);
    setRoundSubmitEvent(false);
  }

  const range = (start: number, stop: number, step: number = 1): number[] =>
    Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step,
    );

  function hold(id: string): void {
    setDice((oldDice: DiceObjectType[]) =>
      oldDice.map((die: DiceObjectType) =>
        die.id == id ? { ...die, isHeld: !die.isHeld } : die,
      ),
    );
  }

  function roll(): void {
    setDice((oldDice) =>
      oldDice.map((die) =>
        die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) },
      ),
    );
    setRollCount((prev) => prev - 1);
  }

  function submitScore(): void {
    console.log("Score submitted!");
    setRoundSubmitEvent(true);
  }

  const diceElements = dice.map((die: DiceObjectType) => {
    const dieDots: number[] = range(1, die.value);
    const diePlacement: JSX.Element[] = dieDots.map((): JSX.Element => {
      return <div key={nanoid()} className="dot"></div>;
    });
    return (
      <button
        className={`die-${die.value} ${die.isHeld && "held"}`}
        key={die.id}
        value={die.value}
        onClick={() => hold(die.id)}
      >
        {diePlacement}
      </button>
    );
  });

  function calculateScoreUpper(category: CategoryName, index: number): void {
    if (
      !roundSubmitEvent ||
      (typeof scoreData[index] !== "undefined" &&
        scoreData[index].isFilled !== false)
    )
      return;
    const key = category.toUpperCase() as keyof typeof ScoreCardNums;
    const selectedNum: ScoreCardNums = ScoreCardNums[key];
    console.log("Score data updating...");
    const calculatedScore: number = dice.reduce(
      (total: number, currentDie: DiceObjectType) => {
        if (currentDie.value === selectedNum) return total + currentDie.value;
        return total;
      },
      0,
    );
    setScoreData((prevScoreData: ScoreType[]) =>
      prevScoreData.map((scoreObj: ScoreType) => {
        if (scoreObj.name === category)
          return { ...scoreObj, score: calculatedScore, isFilled: true };
        return scoreObj;
      }),
    );
    setRoundSubmitEvent(false);
    setDice(generateDice());
    setRollCount(2);
  }

  function calculateScoreLower(category: CategoryName, index: number): void {
    const lowerScoreObj: ScoreType | undefined = scoreData[index + 6];
    const bonusScoreObj: ScoreType | undefined = scoreData[11];
    if (
      !roundSubmitEvent ||
      (typeof lowerScoreObj !== "undefined" && lowerScoreObj.isFilled !== false)
    )
      return;
    if (
      category === "Yahtzee bonus" &&
      typeof bonusScoreObj !== "undefined" &&
      bonusScoreObj.isFilled === false
    )
      return;
    const lowerPointSystemObj: LowerPointType | undefined =
      lowerPointSystem[index];
    if (typeof lowerPointSystemObj !== "undefined")
      console.log(lowerPointSystemObj.points);
    if (
      typeof lowerPointSystemObj !== "undefined" &&
      lowerPointSystemObj.name === category &&
      lowerPointSystemObj.value !== true
    ) {
      setScoreData((prevScoreData: ScoreType[]) =>
        prevScoreData.map((scoreObj: ScoreType) => {
          if (scoreObj.name === category)
            return { ...scoreObj, score: 0, isFilled: true };
          return scoreObj;
        }),
      );
    } else {
      setScoreData((prevScoreData) =>
        prevScoreData.map((scoreObj) => {
          if (typeof lowerPointSystemObj === "undefined") return scoreObj;
          if (scoreObj.name === category)
            return {
              ...scoreObj,
              score: lowerPointSystemObj.points,
              isFilled: true,
            };
          return scoreObj;
        }),
      );
    }
    setRoundSubmitEvent(false);
    setDice(generateDice());
    setRollCount(2);
  }

  const upperScoreElements: JSX.Element[] = scoreData
    .slice(0, 6)
    .map((scoreObj: ScoreType, index: number): JSX.Element => {
      const { name, score, isFilled } = scoreObj;
      return (
        <Fragment key={name}>
          <CategoryElement
            category={name}
            value={score}
            isFilled={isFilled}
            index={index}
            canSelect={roundSubmitEvent}
            calculateFunction={calculateScoreUpper}
          />
        </Fragment>
      );
    });

  const lowerScoreElements: JSX.Element[] = scoreData
    .slice(6, 14)
    .map((scoreObj: ScoreType, index: number): JSX.Element => {
      const { name, score, isFilled } = scoreObj;
      return (
        <Fragment key={name}>
          <CategoryElement
            category={name}
            value={score}
            isFilled={isFilled}
            index={index}
            canSelect={roundSubmitEvent}
            calculateFunction={calculateScoreLower}
          />
        </Fragment>
      );
    });

  return (
    <main className="die-page">
      {gameOver ? (
        <div className="game-over">
          <p>Game Over!</p>
          <p>{`Score: ${upperTotal + upperBonus + lowerTotal}`}</p>
        </div>
      ) : undefined}

      <DiceContainer
        rollsLeft={rollCount}
        diceElements={diceElements}
        roundNotSubmitted={!roundSubmitEvent}
        roll={roll}
        submitScore={submitScore}
        resetGame={resetGame}
      />

      <DiceScoreContainer
        upperEls={upperScoreElements}
        upperBonus={upperBonus}
        upperTotal={upperTotal}
        lowerEls={lowerScoreElements}
        lowerTotal={lowerTotal}
      />
    </main>
  );
}
