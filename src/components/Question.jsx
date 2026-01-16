import '../css/quiz.css'
import { QuizSummary } from './QuizSummary'
import { QuizHint } from './QuizHint'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect, useRef } from "react"
import { decode } from 'html-entities'
import { clsx } from 'clsx'
import Confetti from "react-confetti"
import { useWindowSize } from 'react-use'


export function Question(props) {
    // state values
    const [questions, setQuestions] = useState([])
    const [userAnswers, setUserAnswers] = useState([])
    const [score, setScore] = useState(0)
    const [qIndex, setQIndex] = useState(0)
    const [showHintBool, setShowHintBool] = useState(false)

    // Derived values
    const gameOver = false
    const isGuessed = typeof userAnswers[qIndex] !== 'undefined'
    const isUserCorrect = userAnswers[qIndex] === questions[qIndex]?.correct
    const showQuizSummary = questions.length!== 0 && qIndex == questions.length
    //const showQuizSummary = true // temporary

    // Ref
    const formRef = useRef(null)

    const {width, height} = useWindowSize()

    // create new array containing all responses and randomly shuffle them
    function fisherYatesShuffle(arr, correctAns) {
        const newArr = [...arr, correctAns]; 
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [decode(newArr[j]), decode(newArr[i])];
        }
        return newArr;
    }

    useEffect(() => {
        const abortController = new AbortController()
        async function getQuestionsArray() {
            try {
                const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple', {
                    signal: abortController.signal
                })
                const data = await response.json()
                const renderedQuestions = data.results.map(q => ({
                    category: decode(q.category),
                    difficulty: q.difficulty,
                    question: decode(q.question),
                    answers: fisherYatesShuffle(q.incorrect_answers, q.correct_answer),
                    correct: decode(q.correct_answer)
                }))
                console.log('Fetch successful!')
                console.log(renderedQuestions)
                setQuestions(renderedQuestions)
            } catch(err) {
                err.name === 'AbortError' 
                ? console.log('Fetch aborted!') 
                : console.log('Fetch Error: ' + err)
            }
        }
        getQuestionsArray()
        return () => abortController.abort()
    }, [gameOver]); 

    console.log("Question rendered...")
    console.log("Score" + score)
    console.log("Guessed: " + isGuessed)

    function incrementIndex() {
        console.log('incrementing index')
        if (qIndex < questions.length) setQIndex(prevIndex => prevIndex + 1)
        setShowHintBool(false)
    }

    function handleSubmit(event) {
        event.preventDefault()
        const formEl = event.currentTarget 
        const formData = new FormData(formEl)
        const ans = formData.get("answer")
        setUserAnswers(prevAns => [...prevAns, ans])
        if (ans === questions[qIndex]?.correct) setScore(prevScore => prevScore + 1)
        formEl.reset()
    }

    function showHint() {
        setShowHintBool(true)
        //if (score !== 0) setScore(prevScore => prevScore - 1)
    }

    const answerElements =  questions[qIndex]?.answers.map((answer, index) => {
        const isCorrect = isGuessed && answer === questions[qIndex].correct
        const isNotCorrect = isGuessed && answer !== questions[qIndex].correct

        const answerClassName = clsx({
            correct: isCorrect,
            wrong: isNotCorrect
        })
        return (
            <div key={index} className="opt">
                <input type="radio" name="answer" 
                id={String.fromCharCode(65 + index)} className="answer" 
                value={answer || '...Loading answer'} disabled={isGuessed} />
                <label className={answerClassName}
                htmlFor={String.fromCharCode(65 + index)}>{answer || 'answer'}</label>
            </div>
        )
    })

    function showCorrectAnswers() {
        const correct_answers = questions.map(questionObj => questionObj.correct)
        return correct_answers
    }

    function showQuestions() {
        const question_list = questions.map(questionObj => questionObj.question)
        return question_list
    }
    
    return (
        showQuizSummary ? <QuizSummary 
                            score={score} 
                            correctAns={showCorrectAnswers()} 
                            userAns={userAnswers}
                            questions={showQuestions()}/> :
        <main className="main-container">
        {isUserCorrect ? <Confetti width={width} height={height}/> : undefined}
        <section className="question-box quiz-container">
            <header>
                <p className="question-count">Question {qIndex + 1}/{questions.length}</p>
                <p className="question-level">{questions[qIndex]?.category || '...Loading Category'}</p>
                <span>{score} pts
                <button title="Hint" onClick={showHint}><FontAwesomeIcon icon={faLightbulb} /></button>
                </span>
            </header>

            {showHintBool? <QuizHint 
                    question={questions[qIndex]?.question} 
                    score={score}
                    answer={questions[qIndex]?.correct}
                    closeHint={setShowHintBool}
                    setScore={setScore}/> 
                : null }

            <h1 className="question">{questions[qIndex]?.question || '...Loading Question'}</h1>

            <form className="answers" ref={formRef} id="answers" onSubmit={handleSubmit}>
                {answerElements}
            </form>

            <footer>
                <button 
                    type="button"
                    onClick = {() => {!isGuessed ? formRef.current?.requestSubmit() : incrementIndex()}}
                >
                    {isGuessed? "Next" : "Submit"}
                </button>
            </footer>
        </section>
        </main>
    )
}