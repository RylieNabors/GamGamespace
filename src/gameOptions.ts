export interface gameDataType {
    id: number,
    name: string,
    imgUrl: string,
    description: string,
    linkUrl: string
}

export const gameData: gameDataType[] = [
    {
        "id": 1,
        "name": "Quizly",
        "imgUrl": "quizly",
        "description": "trivia quiz game",
        "linkUrl": "quiz"
    },
    {
        "id": 2,
        "name": "Yahtzee",
        "imgUrl": "yahtzee",
        "description": "dice game",
        "linkUrl": "yahtzee"
    },
    {
        "id": 3,
        "name": "Sudoku",
        "imgUrl" : "sudoku",
        "description" : "number game",
        "linkUrl": "sudoku"
    }
]