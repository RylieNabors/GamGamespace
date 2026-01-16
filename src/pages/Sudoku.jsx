import '../css/sudoku.css'
import { useEffect, useRef, useState } from "react"
import { clsx } from 'clsx'

export function Sudoku() {
    // placeholder data
    let board_nums_placeholder = [
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
    ]

    // state
    const [boardNums, setBoardNums] = useState([])
    const [solution, setSolution] = useState([])
    const [selectedNum, setSelectedNum] = useState(0)
    const [errorCount, setErrorCount] = useState(0)
    const [finishedNums, setFinishedNums] = useState("")
    const [start, setStart] = useState(true)
    console.log('Sudoku rendered...')

    // static values
    const numbers = "123456789"

    // refs
    const puzzleGenerated = useRef(false)
    const initialPuzzle = useRef([])
    const difficulty = useRef("")
    console.log('initial puzzle: ' + initialPuzzle.current)

    // bool
    const has9ofSelectedNum = selectedNum !== 0 ? boardNums.join('').split(selectedNum.toString()).length - 1 === 9 : false;
    const selectedNumFinished = finishedNums.includes(selectedNum)
    const hasHitMaxErrors = errorCount === 3
    const gameFinished = solution.length === boardNums.length && solution.every((v, i) => v === boardNums[i] && v !=='0');

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
        if (puzzleGenerated.current === false) {
            if (!start) return
            console.log('start true -- data is being fetched!')
            async function getPuzzle() {
                try {
                    const response = await fetch('https://sudoku-api.vercel.app/api/dosuku')
                    const data = await response.json()
                    const formattedSolution = data.newboard.grids[0].solution.map(row => {
                        return row.map(String).join("")
                    })
                    const formattedBoard = data.newboard.grids[0].value.map(row => {
                        return row.map(String).join("")
                    })

                    initialPuzzle.current = formattedBoard
                    setBoardNums(formattedBoard)
                    setSolution(formattedSolution)
                    difficulty.current = data.newboard.grids[0].difficulty
                } catch(err) {
                    console.log(err)
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
            return () => puzzleGenerated.current = true
        }
    }, [start])

    function resetGame() {
        console.log('game resetting')
        puzzleGenerated.current = false
        setStart(true)
        setFinishedNums("")
        setErrorCount(0)
    }

    function insertIntoBoard(cell, rIndex, cIndex) {
       console.log('Board update function called')
       if (selectedNum === 0) return
       console.log('selected num not 0')

       // determining if it was previously guessed and if that previous guess was wrong
       const prevGuessedNum = cell !== initialPuzzle.current[rIndex][cIndex] && cell !== '0'
       const prevGuessWrong = prevGuessedNum && cell !== solution[rIndex][cIndex]
       // determining if current guess is wrong (not stored as a guess yet)
       const isWrong = cell === '0' && selectedNum !== solution[rIndex][cIndex]

       console.log('previously guessed: ' + prevGuessedNum)
       console.log('previous guess wrong: ' + prevGuessWrong)
       console.log('current guess Wrong: ' + isWrong)

       if (isWrong) {
            console.log('Wrong guess!')
            setErrorCount(prev => prev + 1)
        }
        if (cell === '0' || prevGuessWrong) {
            // reselecting number after wrong answer clears answer
            if (prevGuessWrong && cell === selectedNum.toString()) {
                console.log('Board Resetting Wrong cell!')
                setBoardNums(prev => {
                    const newArr = [...prev]
                    newArr[rIndex] = [...prev[rIndex]];
                    newArr[rIndex][cIndex] = 0;
                    const joinedString = newArr[rIndex].join('')
                    newArr[rIndex] = joinedString
                    return newArr;
                })
            // normal update to answer
            } else {
                console.log('Board updating!')
                setBoardNums(prev => {
                    const newArr = [...prev]
                    newArr[rIndex] = [...prev[rIndex]];
                    newArr[rIndex][cIndex] = selectedNum;
                    const joinedString = newArr[rIndex].join('')
                    newArr[rIndex] = joinedString
                    return newArr;
                })
            }
        }
    }

    const board = boardNums.map((row, rIndex) => {
        return row.split("").map((cell, cIndex) => {
            const guessedNum = cell !== initialPuzzle.current[rIndex][cIndex]
            const isWrong = guessedNum && cell !== solution[rIndex][cIndex]
            const isRight = guessedNum && cell === solution[rIndex][cIndex]
            const numMatch = cell === selectedNum.toString() && selectedNum !== 0 && cell === solution[rIndex][cIndex]

            const boardNumClassName = clsx({
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
                    value={cell}
                >
                {cell !== '0' ? cell : ''}
                </div>
            )
        })
    })

    function selectNumber(e) {
        e.target.value === selectedNum ? setSelectedNum(0) : setSelectedNum(e.target.value)
    }

    
    const number_options = numbers.split("").map(num => {
        const isDisabledNum = finishedNums.includes(num)
        const isDisabled = isDisabledNum || gameFinished || hasHitMaxErrors
        const numberClassName = clsx({
            num_selected: num === selectedNum,
            not_num_selected: num !== selectedNum,
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

    const gameOverClassName = clsx({
        won: gameFinished,
        lost: hasHitMaxErrors,
        gameOver: true
    })

    return (
        <>
        <section className="sudoku-head">
            <h1>Sudoku</h1>
            <span>{`${difficulty.current || '...Loading'}  |`}<h2>{`Mistakes: ${errorCount}/3`}</h2></span>
        </section>
        <hr />
        <div className="board">
            {(gameFinished || hasHitMaxErrors) ? <div className={gameOverClassName}>
                <p>{hasHitMaxErrors ? "Game Lost!" : "Game Won!"}</p>
                <p>{`Mistakes: ${errorCount}/3`}</p>
            </div> : undefined}  
            {board}
        </div>
        <div className="digits">
            {number_options}
        </div>
        <button className="new-game" onClick={resetGame}>Start New Game</button>    
        </>
    )
}