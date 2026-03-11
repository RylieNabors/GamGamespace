import type { GridArray, SudokuResponse } from "../entities.js";
import { useQuery } from "@tanstack/react-query";

export const useSudokuResponse = () => {
  const getPuzzle = async () => {
    const response: Response = await fetch(
      "https://sudoku-api.vercel.app/api/dosuku",
    );
    if (!response.ok) throw new Error("Error: Sudoku API response invalid");
    const data: SudokuResponse = await response.json();
    if (
      !data ||
      !data?.newboard.grids.length ||
      data.newboard.grids[0] === undefined
    ) {
      throw new Error("Error: Data undefined or empty");
    }
    return data;
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["sudoku"],
    queryFn: getPuzzle,
  });

  return { data, isLoading, isError, error, refetch };
};
