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
