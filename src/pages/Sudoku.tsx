import '../css/sudoku.css'
import { useEffect, useRef, useState } from "react"
import { clsx } from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import type {JSX} from "react"

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
    const [boardNums, setBoardNums] = useState<string[]>([])
    const [solution, setSolution] = useState<string[]>([])
    const [selectedNum, setSelectedNum] = useState<number>(0)
    const [errorCount, setErrorCount] = useState<number>(0)
    const [finishedNums, setFinishedNums] = useState<string>("")
    const [start, setStart] = useState<boolean>(true)
    const [hintAvailable, setHintAvailable] = useState<boolean>(true)
    const [hintShowing, setHintShowing] = useState<boolean>(false)
    console.log('Sudoku rendered...')

    // static values
    const numbers: "123456789" = "123456789"

    // refs
    const puzzleGenerated = useRef<boolean>(false)
    const initialPuzzle = useRef<string[]>([])
    const difficulty = useRef<string>("")
    console.log('initial puzzle: ' + initialPuzzle.current)

    // bool
    const has9ofSelectedNum: boolean = selectedNum !== 0 ? boardNums.join('').split(selectedNum.toString()).length - 1 === 9 : false;
    const selectedNumFinished: boolean = finishedNums.includes(selectedNum.toString())
    const hasHitMaxErrors: boolean = errorCount === 3
    const gameFinished: boolean = boardNums.length !== 0 && solution.length === boardNums.length 
                        && solution.every((v: string, i: number) => v === boardNums[i] && v !=='0');

    console.log('Game finished? :')
    console.log(gameFinished)

    console.log(selectedNum)
    console.log('Finished Nums:')
    console.log(finishedNums)
    console.log('Is 9 of selected num on board :  ' + has9ofSelectedNum)
    console.log('Is selected num finished ' + selectedNumFinished)
    if (has9ofSelectedNum && !selectedNumFinished) {
        console.log(`Number ${selectedNum} finished!`)
        setFinishedNums(prev => {
            let newStr = prev
            newStr += selectedNum.toString()
            return newStr
        })
    }

    useEffect(() => {
        type GridArray = {
            value: number[][],
            solution: number[][],
            difficulty: string
        }

        type SudokuResponse = {
            newboard: {
                grids: GridArray[],
                results: number
            }
        }

        if (puzzleGenerated.current === false) {
            if (!start) return
            console.log('start true -- data is being fetched!')
            async function getPuzzle() {
                try {
                    const response: Response = await fetch('https://sudoku-api.vercel.app/api/dosuku')
                    if (!response.ok) throw new Error('Error: Sudoku API response invalid')
                    const data: SudokuResponse = await response.json()
                    if (!data || !data?.newboard.grids.length || data.newboard.grids[0] === undefined) {
                        throw new Error('Error: Data undefined or empty')
                    }
                    const formattedSolution: string[] = data.newboard.grids[0].solution.map((row: number[]): string => {
                        return row.map(String).join("")
                    })
                    const formattedBoard: string[] = data.newboard.grids[0].value.map((row: number[]): string => {
                        return row.map(String).join("")
                    })

                    initialPuzzle.current = formattedBoard
                    setBoardNums(formattedBoard)
                    setSolution(formattedSolution)
                    difficulty.current = data.newboard.grids[0].difficulty
                } catch(err) {
                    if (!(err instanceof Error)) {
                        console.error("Unknown error")
                        return
                    }
                    console.error(err)
                }
            }
            getPuzzle()

            // placeholder
            /*
            console.log('Data would be fetched here!')
            initialPuzzle.current = board_nums_placeholder
            setBoardNums(board_nums_placeholder)
            setSolution(solution_nums_placeholder)
            */

            setStart(false)
            return () =>  {
                puzzleGenerated.current = true
            }
        }
    }, [start])

    function resetGame(): void {
        console.log('game resetting')
        puzzleGenerated.current = false
        setStart(true)
        setFinishedNums("")
        setErrorCount(0)
        setHintAvailable(true)
    }

    function insertIntoBoard(cell: string, rIndex: number, cIndex: number) {
       console.log('Board update function called')
       if (hintShowing) {
            console.log('Showing hint!')
            setBoardNums((prev: string[]) => {
                const newArr: string[] = [...prev]
                const row: string | undefined = prev[rIndex]
                if (!row || !solution[rIndex]) return prev
                const value: string = String(solution[rIndex][cIndex])
                newArr[rIndex] = 
                    row.slice(0, cIndex) +
                    value +
                    row.slice(cIndex + 1)
                return newArr
            })
            setHintShowing(false)
            return
       }

       const cellHas9Matches: boolean = boardNums.join('').split(cell.toString()).length - 1 === 9
       if (cell !== '0' && !cellHas9Matches){
            console.log('Changing selected number!')
            setSelectedNum(Number(cell))
       }

       // determining if it was previously guessed and if that previous guess was wrong
       let prevGuessedNum: boolean = typeof initialPuzzle.current[rIndex] === "string" 
                && cell !== initialPuzzle.current[rIndex][cIndex] && cell !== '0'
       const prevGuessWrong: boolean = typeof solution[rIndex] === "string"
                && prevGuessedNum && cell !== solution[rIndex][cIndex]
       // determining if current guess is wrong (not stored as a guess yet)
       const isWrong: boolean = typeof solution[rIndex] === "string" 
                && cell === '0' && String(selectedNum) !== solution[rIndex][cIndex]

       if (isWrong) {
            console.log('Wrong guess!')
            setErrorCount(prev => prev + 1)
        }
        if (cell === '0' || prevGuessWrong) {
            // reselecting number after wrong answer clears answer
            if (prevGuessWrong && cell === selectedNum.toString()) {
                console.log('Board Resetting Wrong cell!')
                setBoardNums((prev: string[]) => {
                    const newArr: string[] = [...prev]
                    const row: string | undefined = prev[rIndex]
                    if (!row) return prev
                    newArr[rIndex] = row.slice(0, cIndex) + '0' + row.slice(cIndex + 1)
                    return newArr
                })
            // normal update to answer
            } else {
                console.log('Board updating!')
                setBoardNums((prev: string[]) => {
                    const newArr: string[] = [...prev]
                    const row: string | undefined = prev[rIndex]
                    if (!row) return prev
                    newArr[rIndex] = 
                        row.slice(0, cIndex) +
                        selectedNum.toString() +
                        row.slice(cIndex + 1)
                    return newArr;
                })
            }
        }
    }

    const board = boardNums.map((row: string, rIndex: number) => {
        return row.split("").map((cell: string, cIndex: number) => {
            const guessedNum: boolean = typeof initialPuzzle.current[rIndex] === "string" 
                    && cell !== initialPuzzle.current[rIndex][cIndex]
            const isWrong: boolean = typeof solution[rIndex] === "string" && guessedNum && cell !== solution[rIndex][cIndex]
            const isRight: boolean = typeof solution[rIndex] === "string" && guessedNum && cell === solution[rIndex][cIndex]
            const numMatch: boolean = typeof solution[rIndex] === "string" && cell === selectedNum.toString() 
                    && selectedNum !== 0 && cell === solution[rIndex][cIndex]

            const boardNumClassName: string = clsx({
                right_guess: isRight,
                wrong_guess: isWrong,
                tile: true,
                left_border: cIndex === 3 || cIndex === 6,
                bottom_border: rIndex === 2 || rIndex === 5,
                matches_selected: numMatch
            })
            return (
                <div 
                    key={rIndex.toString() + '-' + cIndex.toString()} 
                    id={rIndex.toString() + '-' + cIndex.toString()} 
                    className={boardNumClassName}
                    onClick={() => insertIntoBoard(cell, rIndex, cIndex)}
                    //value={cell}
                >
                {cell !== '0' ? cell : ''}
                </div>
            )
        })
    })

    function selectNumber(e: React.MouseEvent<HTMLButtonElement>) {
        e.currentTarget.value === String(selectedNum) ? setSelectedNum(0) : setSelectedNum(Number(e.currentTarget.value))
    }

    
    const number_options: JSX.Element[] = numbers.split("").map((num: string): JSX.Element => {
        const isDisabledNum: boolean = finishedNums.includes(num)
        const isDisabled: boolean = isDisabledNum || gameFinished || hasHitMaxErrors
        const numberClassName: string = clsx({
            num_selected: Number(num) === selectedNum,
            not_num_selected: Number(num) !== selectedNum,
            disabled: isDisabledNum || isDisabled,
            number: true
        })
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
        )
    })

    const gameOverClassName: string = clsx({
        won: gameFinished,
        lost: hasHitMaxErrors,
        gameOver: true
    })

    function showHint(): void {
        setHintShowing(true)
        setHintAvailable(false)
    }

    return (
        <>
        <section className="sudoku-head">
            <h1>Sudoku</h1>
            <span>{`${difficulty.current || '...Loading'}  |`}<h2>{`Mistakes: ${errorCount}/3`}</h2>
                <button onClick={showHint} disabled={!hintAvailable} title="Show Hint"><FontAwesomeIcon icon={faLightbulb} /></button>
            </span>
        </section>
        <hr />
        <div className="board">
            {(gameFinished || hasHitMaxErrors) ? <div className={gameOverClassName}>
                <p>{hasHitMaxErrors ? "Game Lost!" : "Game Won!"}</p>
                <p>{`Mistakes: ${errorCount}/3`}</p>
            </div> : undefined} 
            {hintShowing ? <p className="hint-message">Choose a cell to reveal.</p> : undefined}
            {board}
        </div>
        <div className="digits">
            {number_options}
        </div>
        <button className="new-game" onClick={resetGame}>Start New Game</button>    
        </>
    )
}