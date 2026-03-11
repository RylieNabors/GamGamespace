import type { JSX } from "react";

interface BoardNumProps {
  rIndex: number;
  cIndex: number;
  className: string;
  insertFunction: (cellValue: string, rIndex: number, cIndex: number) => void;
  cellValue: string;
}

export function BoardNum({
  rIndex,
  cIndex,
  className,
  insertFunction,
  cellValue,
}: BoardNumProps): JSX.Element {
  return (
    <div
      id={rIndex.toString() + "-" + cIndex.toString()}
      className={className}
      onClick={() => insertFunction(cellValue, rIndex, cIndex)}
      //value={cellValue}
    >
      {cellValue !== "0" ? cellValue : ""}
    </div>
  );
}
