import type { JSX } from "react";
import type { CategoryName } from "../entities.js";

interface CategoryElementProps {
  category: CategoryName;
  value: number;
  index: number;
  isFilled: boolean;
  canSelect: boolean;
  calculateFunction: (category: CategoryName, index: number) => void;
}

export function CategoryElement({
  category,
  value,
  isFilled,
  index,
  canSelect,
  calculateFunction,
}: CategoryElementProps): JSX.Element {
  return (
    <span
      className={canSelect ? "selectable" : ""}
      onClick={() => calculateFunction(category, index)}
    >
      <p>{category}</p>
      <p>{isFilled ? value : ""}</p>
    </span>
  );
}
