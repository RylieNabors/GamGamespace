import "../css/sudoku.css";
import { useEffect, useRef, useState, Fragment } from "react";
import { clsx } from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import type { JSX } from "react";
import type { GridArray, SudokuResponse } from "../entities.js";
import { useSudokuResponse } from "../hooks/useSudokuResponse.js";
import { BoardNum } from "../components/BoardNum.js";
import { SudokuHeader } from "../components/SudokuHeader.js";

export function Sudoku(): JSX.Element {
  // placeholder data
  /*let board_nums_placeholder = [
        "007491605",
        "200060309",
        "000007010",
        "058600004",
        "003000090",
        "006200187",
        "904070002",
        "670830000",
        "810045000"
    ]

    let solution_nums_placeholder = [
        "387491625",
        "241568379",
        "569327418",
        "758619234",
        "123784596",
        "496253187",
        "934176852",
        "675832941",
        "812945763"
    ]*/

  // state
  const [boardNums, setBoardNums] = useState<string[]>([]);
  const [solution, setSolution] = useState<string[]>([]);
  const [selectedNum, setSelectedNum] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [finishedNums, setFinishedNums] = useState<string>("");
  const [start, setStart] = useState<boolean>(false);
  const [hintAvailable, setHintAvailable] = useState<boolean>(true);
  const [hintShowing, setHintShowing] = useState<boolean>(false);
  console.log("Sudoku rendered...");

  // static values
  const numbers: "123456789" = "123456789";

  // refs
  const initialPuzzle = useRef<string[]>([]);
  const difficulty = useRef<string>("");
  console.log("initial puzzle: " + initialPuzzle.current);

  // bool
  const has9ofSelectedNum: boolean =
    selectedNum !== 0
      ? boardNums.join("").split(selectedNum.toString()).length - 1 === 9
      : false;
  const selectedNumFinished: boolean = finishedNums.includes(
    selectedNum.toString(),
  );
  const hasHitMaxErrors: boolean = errorCount === 3;
  const gameFinished: boolean =
    boardNums.length !== 0 &&
    solution.length === boardNums.length &&
    solution.every((v: string, i: number) => v === boardNums[i] && v !== "0");

  if (has9ofSelectedNum && !selectedNumFinished) {
    console.log(`Number ${selectedNum} finished!`);
    setFinishedNums((prev) => {
      let newStr = prev;
      newStr += selectedNum.toString();
      return newStr;
    });
  }

  const { data, isLoading, isError, error, refetch } = useSudokuResponse();

  useEffect(() => {
    if (!data) return;
    if (
      !data ||
      !data?.newboard.grids.length ||
      data.newboard.grids[0] === undefined
    ) {
      throw new Error("Error: Data undefined or empty");
    }
    const formattedSolution: string[] = data.newboard.grids[0].solution.map(
      (row: number[]): string => {
        return row.map(String).join("");
      },
    );
    const formattedBoard: string[] = data.newboard.grids[0].value.map(
      (row: number[]): string => {
        return row.map(String).join("");
      },
    );
    initialPuzzle.current = formattedBoard;
    setBoardNums(formattedBoard);
    setSolution(formattedSolution);
    difficulty.current = data.newboard.grids[0].difficulty;
  }, [data]);

  useEffect(() => {
    if (start) {
      refetch();
    }
  }, [start, refetch]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isError) {
    return <h1>{error ? error.message : null}</h1>;
  }

  function resetGame(): void {
    console.log("game resetting");
    setStart(true);
    setFinishedNums("");
    setErrorCount(0);
    setHintAvailable(true);
    setSelectedNum(0);
  }

  function insertIntoBoard(cell: string, rIndex: number, cIndex: number): void {
    console.log("Board update function called");
    if (hintShowing) {
      console.log("Showing hint!");
      setBoardNums((prev: string[]) => {
        const newArr: string[] = [...prev];
        const row: string | undefined = prev[rIndex];
        if (!row || !solution[rIndex]) return prev;
        const value: string = String(solution[rIndex][cIndex]);
        newArr[rIndex] = row.slice(0, cIndex) + value + row.slice(cIndex + 1);
        return newArr;
      });
      setHintShowing(false);
      return;
    }

    const cellHas9Matches: boolean =
      boardNums.join("").split(cell.toString()).length - 1 === 9;
    if (cell !== "0" && !cellHas9Matches) {
      console.log("Changing selected number!");
      setSelectedNum(Number(cell));
    }

    // determining if it was previously guessed and if that previous guess was wrong
    let prevGuessedNum: boolean =
      typeof initialPuzzle.current[rIndex] === "string" &&
      cell !== initialPuzzle.current[rIndex][cIndex] &&
      cell !== "0";
    const prevGuessWrong: boolean =
      typeof solution[rIndex] === "string" &&
      prevGuessedNum &&
      cell !== solution[rIndex][cIndex];
    // determining if current guess is wrong (not stored as a guess yet)
    const isWrong: boolean =
      typeof solution[rIndex] === "string" &&
      cell === "0" &&
      String(selectedNum) !== solution[rIndex][cIndex];

    if (isWrong) {
      console.log("Wrong guess!");
      setErrorCount((prev) => prev + 1);
    }
    if (cell === "0" || prevGuessWrong) {
      // reselecting number after wrong answer clears answer
      if (prevGuessWrong && cell === selectedNum.toString()) {
        console.log("Board Resetting Wrong cell!");
        setBoardNums((prev: string[]) => {
          const newArr: string[] = [...prev];
          const row: string | undefined = prev[rIndex];
          if (!row) return prev;
          newArr[rIndex] = row.slice(0, cIndex) + "0" + row.slice(cIndex + 1);
          return newArr;
        });
        // normal update to answer
      } else {
        console.log("Board updating!");
        setBoardNums((prev: string[]) => {
          const newArr: string[] = [...prev];
          const row: string | undefined = prev[rIndex];
          if (!row) return prev;
          newArr[rIndex] =
            row.slice(0, cIndex) +
            selectedNum.toString() +
            row.slice(cIndex + 1);
          return newArr;
        });
      }
    }
  }

  const board = boardNums.map((row: string, rIndex: number) => {
    return row.split("").map((cell: string, cIndex: number) => {
      const guessedNum: boolean =
        typeof initialPuzzle.current[rIndex] === "string" &&
        cell !== initialPuzzle.current[rIndex][cIndex];
      const isWrong: boolean =
        typeof solution[rIndex] === "string" &&
        guessedNum &&
        cell !== solution[rIndex][cIndex];
      const isRight: boolean =
        typeof solution[rIndex] === "string" &&
        guessedNum &&
        cell === solution[rIndex][cIndex];
      const numMatch: boolean =
        typeof solution[rIndex] === "string" &&
        cell === selectedNum.toString() &&
        selectedNum !== 0 &&
        cell === solution[rIndex][cIndex];

      const boardNumClassName: string = clsx({
        right_guess: isRight,
        wrong_guess: isWrong,
        tile: true,
        left_border: cIndex === 3 || cIndex === 6,
        bottom_border: rIndex === 2 || rIndex === 5,
        matches_selected: numMatch,
      });
      return (
        <Fragment key={rIndex.toString() + "-" + cIndex.toString()}>
          <BoardNum
            rIndex={rIndex}
            cIndex={cIndex}
            className={boardNumClassName}
            insertFunction={insertIntoBoard}
            cellValue={cell}
          />
        </Fragment>
      );
    });
  });

  function selectNumber(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.value === String(selectedNum)
      ? setSelectedNum(0)
      : setSelectedNum(Number(e.currentTarget.value));
  }

  const number_options: JSX.Element[] = numbers
    .split("")
    .map((num: string): JSX.Element => {
      const isDisabledNum: boolean = finishedNums.includes(num);
      const isDisabled: boolean =
        isDisabledNum || gameFinished || hasHitMaxErrors;
      const numberClassName: string = clsx({
        num_selected: Number(num) === selectedNum,
        not_num_selected: Number(num) !== selectedNum,
        disabled: isDisabledNum || isDisabled,
        number: true,
      });
      return (
        <button
          key={num}
          className={numberClassName}
          onClick={selectNumber}
          value={num}
          disabled={isDisabled}
        >
          {num}
        </button>
      );
    });

  const gameOverClassName: string = clsx({
    won: gameFinished,
    lost: hasHitMaxErrors,
    gameOver: true,
  });

  function showHint(): void {
    setHintShowing(true);
    setHintAvailable(false);
  }

  return (
    <>
      <SudokuHeader
        difficulty={difficulty.current}
        errorCount={errorCount}
        showHint={showHint}
        isButtonDisabled={!hintAvailable}
      />
      <hr />
      <div className="board">
        {gameFinished || hasHitMaxErrors ? (
          <div className={gameOverClassName}>
            <p>{hasHitMaxErrors ? "Game Lost!" : "Game Won!"}</p>
            <p>{`Mistakes: ${errorCount}/3`}</p>
          </div>
        ) : undefined}
        {hintShowing ? (
          <p className="hint-message">Choose a cell to reveal.</p>
        ) : undefined}
        {board}
      </div>
      <div className="digits">{number_options}</div>
      <button className="new-game" onClick={resetGame}>
        Start New Game
      </button>
    </>
  );
}
