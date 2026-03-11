import { useQuery } from "@tanstack/react-query";
import { decode } from "html-entities";
import type { ResultsType, QuestionType } from "../entities.js";

// create new array containing all responses and randomly shuffle them
function fisherYatesShuffle(arr: string[], correctAns: string): string[] {
  const newArr: string[] = [...arr, correctAns];
  for (let i: number = newArr.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [decode(newArr[j]), decode(newArr[i])];
  }
  return newArr;
}

export const useQuestionResponse = () => {
  const getQuestionsArray = async () => {
    const response: Response = await fetch(
      "https://opentdb.com/api.php?amount=10&type=multiple",
    );
    if (!response.ok) throw new Error("API response error");
    const data = await response.json();
    const renderedQuestions: QuestionType[] = data.results.map(
      (q: ResultsType) => ({
        category: decode(q.category),
        difficulty: q.difficulty,
        question: decode(q.question),
        answers: fisherYatesShuffle(q.incorrect_answers, q.correct_answer),
        correct: decode(q.correct_answer),
      }),
    );
    console.log("Fetch successful!");
    console.log(renderedQuestions);
    return renderedQuestions;
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["hint"],
    queryFn: getQuestionsArray,
  });

  return { data, isLoading, isError, error, refetch };
};
