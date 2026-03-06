import { nanoid } from "nanoid"
import { useState } from "react"
import '../css/yahtzee.css'

export function Yahtzee() {
    const scoreCardNums = {
        ACES: 1,
        TWOS: 2,
        THREES: 3,
        FOURS: 4,
        FIVES: 5,
        SIXES: 6
    }

    const INITIAL_SCORE = [
        {'Aces': 0, 'isFilled': false},
        {'Twos': 0, 'isFilled': false},
        {'Threes': 0, 'isFilled': false},
        {'Fours': 0, 'isFilled': false},
        {'Fives': 0, 'isFilled': false},
        {'Sixes': 0, 'isFilled': false},
        {'3 of a kind': 0, 'isFilled': false},
        {'4 of a kind': 0, 'isFilled': false},
        {'Full house': 0, 'isFilled': false},
        {'Sm. straight': 0, 'isFilled': false},
        {'Lg. straight': 0, 'isFilled': false},
        {'Yahtzee': 0, 'isFilled': false},
        {'Chance': 0, 'isFilled': false},
        {'Yahtzee bonus': 0, 'isFilled': false}
    ]


    // state
    const [dice, setDice] = useState(generateDice())
    const [rollCount, setRollCount] = useState(2)
    const [roundSubmitEvent, setRoundSubmitEvent] = useState(false)
    const [scoreData, setScoreData] = useState(INITIAL_SCORE)

    // functions for derived values
    function includesAll(array) {
        return array.every(v => dice.some(o => o.value === v))
    }
    function checkCounts(threshold) {
        return Object.values(dieCounts).some(count => count >= threshold);
    }
    function checkFullHouse(array, ans) {
        return array.every(v => ans.some(a => a === v))
    }

    // derived values
    const addedDiceTotal = dice.reduce((total, currentDie) => {
        return total + currentDie.value
    }, 0)
    const upperTotal = scoreData.slice(0, 6).reduce((total, currentScoreObj) => {
        return total + Object.values(currentScoreObj)[0]
    }, 0)
    const upperBonus = upperTotal >= 63 ? 35 : 0
    const lowerTotal = scoreData.slice(6, 13).reduce((total, currentScoreObj) => {
        return total + Object.values(currentScoreObj)[0]
    }, 0)
    const dieCounts = dice.reduce((count, { value }) => {
        count[value] = (count[value] || 0) + 1;
        return count;
    }, {})
    const lgStraight = includesAll([1,2,3,4,5]) || includesAll([2,3,4,5,6])
    const smStraight = includesAll([1,2,3,4]) || includesAll([2,3,4,5]) || includesAll([3,4,5,6])
    const threeOfKind = checkCounts(3)
    const fourOfKind = checkCounts(4)
    const yahtzee = checkCounts(5)
    const fullHouse = checkFullHouse([2,3], Object.values(dieCounts))
    const gameOver = scoreData.every(scoreObj => scoreObj.isFilled === true)

    const lowerPointSystem = [
        {'3 of a kind': threeOfKind, 'points': addedDiceTotal},
        {'4 of a kind': fourOfKind, 'points': addedDiceTotal},
        {'Full house': fullHouse, 'points': 25},
        {'Sm. straight': smStraight, 'points': 30},
        {'Lg. straight': lgStraight, 'points': 40},
        {'Yahtzee': yahtzee, 'points': 50},
        {'Chance': true, 'points': addedDiceTotal},
        {'Yahtzee bonus': yahtzee, 'points': 100}
    ]

    function generateDice() {
        return new Array(5)
            .fill(0)
            .map(() => ({
                value: Math.ceil(Math.random() * 6),
                isHeld: false,
                id: nanoid()
            }))
    }

    function resetGame() {
        setDice(oldDice => oldDice.map(die => (
            die.isHeld? die : {...die, value: Math.ceil(Math.random() * 6)}
        )))
        setScoreData(INITIAL_SCORE)
        setRollCount(2)
        setRoundSubmitEvent(false)
    }

    const range = (start, stop, step = 1) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

    function hold(id) {
        setDice(oldDice => oldDice.map(die => (
            die.id == id ? {...die, isHeld: !die.isHeld} : die
        )))
    }

    function roll() {
        setDice(oldDice => oldDice.map(die => (
            die.isHeld? die : {...die, value: Math.ceil(Math.random() * 6)}
        )))
        setRollCount(prev => prev - 1)
    }

    function submitScore() {
        console.log('Score submitted!')
        setRoundSubmitEvent(true)
    }

    const diceElements = dice.map(die => {
        const dieDots = range(1, die.value)
        const diePlacement = dieDots.map(() => {
            return <div key={nanoid()} className="dot"></div>
        })
        return (
            <button 
                className={`die-${die.value} ${die.isHeld && 'held'}`} 
                key={die.id} 
                value={die.value}
                onClick={() => hold(die.id)}
            >
                    {diePlacement}
            </button>
        )
    })

    function calculateScoreUpper(category, index) {
        if (!roundSubmitEvent || scoreData[index].isFilled !== false) return
        const selectedNum = scoreCardNums[category.toUpperCase()]
        console.log('Score data updating...')
        const calculatedScore = dice.reduce((total, currentDie) => {
            if (currentDie.value === selectedNum) return total + currentDie.value
            return total
        }, 0)
        setScoreData(prevScoreData => prevScoreData.map(scoreObj => {
            if (scoreObj[category] !== undefined) return {...scoreObj, [category]: calculatedScore, 'isFilled': true}
            return scoreObj
        }))
        setRoundSubmitEvent(false)
        setDice(generateDice())
        setRollCount(2)
    }

    function calculateScoreLower(category, index) {
        if (!roundSubmitEvent || scoreData[index + 6].isFilled !== false) return
        if (category === 'Yahtzee bonus' && scoreData[11].isFilled === false) return
        if (lowerPointSystem[index][category] !== true) {
            setScoreData(prevScoreData => prevScoreData.map(scoreObj => {
                if (scoreObj[category] !== undefined) return {...scoreObj, [category]: 0, 'isFilled': true}
                return scoreObj
            }))
        } else {
            console.log(lowerPointSystem[index].points)
            setScoreData(prevScoreData => prevScoreData.map(scoreObj => {
                if (scoreObj[category] !== undefined) return {...scoreObj, [category]: lowerPointSystem[index].points, 'isFilled': true}
                return scoreObj
            }))
        }
        setRoundSubmitEvent(false)
        setDice(generateDice())
        setRollCount(2)
    }

    const upperScoreElements = scoreData.slice(0, 6).map((scoreObj, index) => {
        const [category, value] = Object.entries(scoreObj)[0]
        return (
            <span key={category} className={roundSubmitEvent ? 'selectable' : ''} 
            onClick={() => calculateScoreUpper(category, index)}>
                <p>{category}</p>
                <p>{scoreData[index].isFilled ? value : ''}</p>
            </span>
        )
    })

    const lowerScoreElements = scoreData.slice(6, 14).map((scoreObj, index) => {
        const [category, value] = Object.entries(scoreObj)[0]
        return (
            <span key={category} className={roundSubmitEvent ? 'selectable' : ''}
            onClick={() => calculateScoreLower(category, index)}
            >
                <p>{category}</p>
                <p>{scoreData[index + 6].isFilled ? value : ''}</p>
            </span>
        )
    })

    return (
        <main className="die-page">
            {gameOver ? <div className="game-over">
                <p>Game Over!</p>
                <p>{`Score: ${upperTotal + upperBonus + lowerTotal}`}</p>
            </div> : undefined}
            <section className="die-container">
                <span><p>Rolls left: </p><p>{rollCount}</p></span>
                <div>
                    {diceElements}
                </div>
                {!roundSubmitEvent ? <p>Submit round to end round.</p> : <p>Choose a score key to update. &#8593;</p>}
                {rollCount !== 0 ? <button className="first" onClick={roll}>Roll again</button> : undefined}
                <button onClick={submitScore}>Submit round</button>
                <button className="third" onClick={resetGame}>New Game</button>
            </section>
            <section className="die-container score">
                <p className="emphasized">Upper section</p>
                {upperScoreElements}
                <span><p>Bonus</p><p>{upperBonus}</p></span>
                <span><p>Upper Total</p><p>{upperTotal + upperBonus}</p></span>
                <p className="emphasized">Lower section</p>
                {lowerScoreElements}
                <span><p>Lower Total</p><p>{lowerTotal}</p></span>
                <span className="emphasized"><p>Grand Total</p><p>{upperTotal + upperBonus + lowerTotal}</p></span>
            </section>
        </main>
    )
}