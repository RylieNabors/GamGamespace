// Question
export type ResultsType = {
  category: string;
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

export type ResponseType = {
  response_code: number;
  results: ResultsType[];
};

export type QuestionType = Pick<
  ResultsType,
  "category" | "difficulty" | "question"
> & {
  answers: string[];
  correct: string;
};

// sudoku
export type GridArray = {
  value: number[][];
  solution: number[][];
  difficulty: string;
};

export type SudokuResponse = {
  newboard: {
    grids: GridArray[];
    results: number;
  };
};

// Yahtzee
export type LowerCategoryName =
  | "Aces"
  | "Twos"
  | "Threes"
  | "Fours"
  | "Fives"
  | "Sixes";
export type UpperCategoryName =
  | "3 of a kind"
  | "4 of a kind"
  | "Full house"
  | "Sm. straight"
  | "Lg. straight"
  | "Yahtzee"
  | "Chance"
  | "Yahtzee bonus";
export type CategoryName = LowerCategoryName | UpperCategoryName;
export type ScoreType = {
  name: CategoryName;
  score: number;
  isFilled: boolean;
};

export type DiceObjectType = {
  value: number;
  isHeld: boolean;
  id: string;
};

export type LowerPointType = {
  name: string;
  value: boolean;
  points: number;
};
