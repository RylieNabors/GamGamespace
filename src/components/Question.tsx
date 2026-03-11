import '../css/quiz.css'
import { QuizSummary } from './QuizSummary.js'
import { QuizHint } from './QuizHint.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect, useRef } from "react"
import { decode } from 'html-entities'
import { clsx } from 'clsx'
import Confetti from "react-confetti"
import { useWindowSize } from 'react-use'
import type {JSX} from "react"


export function Question() {
    type ResultsType = {
        category: string,
        type: "multiple" | "boolean"
        difficulty: "easy" | "medium" | "hard",
        question: string,
        correct_answer: string,
        incorrect_answers: string[]
    }

    type ResponseType = {
        response_code: number,
        results: ResultsType[]
    }

    type QuestionType = Pick<ResultsType, "category" | "difficulty" | "question"> & {
        answers: string[],
        correct: string
    }

    // state values
    const [questions, setQuestions] = useState<QuestionType[]>([])
    const [userAnswers, setUserAnswers] = useState<string[]>([])
    const [score, setScore] = useState<number>(0)
    const [qIndex, setQIndex] = useState<number>(0)
    const [showHintBool, setShowHintBool] = useState<Boolean>(false)
    const [hintOpened, setHintOpened] = useState<boolean>(false)

    // Derived values
    const gameOver: boolean = false
    const isGuessed: boolean = typeof userAnswers[qIndex] !== 'undefined'
    const isUserCorrect: boolean = userAnswers[qIndex] === questions[qIndex]?.correct
    const showQuizSummary: boolean = questions.length!== 0 && qIndex == questions.length
    //const showQuizSummary = true // temporary

    // Ref
    const formRef = useRef<HTMLFormElement>(null)

    const {width, height} = useWindowSize()

    // create new array containing all responses and randomly shuffle them
    function fisherYatesShuffle(arr: string[], correctAns: string): string[] {
        const newArr: string[] = [...arr, correctAns]; 
        for (let i: number = newArr.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [decode(newArr[j]), decode(newArr[i])];
        }
        return newArr;
    }

    useEffect(() => {
        const abortController: AbortController = new AbortController()

        async function getQuestionsArray() {
            try {
                const response: Response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple', {
                    signal: abortController.signal
                })
                if (!response.ok) throw new Error('API response error')
                const data: ResponseType = await response.json()
                const renderedQuestions: QuestionType[] = data.results.map((q: ResultsType) => ({
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
                if (!(err instanceof Error)) {
                    console.error("Unknown Error")
                    return
                }
                err.name === 'AbortError' 
                ? console.error('Fetch aborted!') 
                : console.error('Fetch Error: ' + err)
            }
        }
        getQuestionsArray()
        return (): void => abortController.abort()
    }, [gameOver]); 

    console.log("Question rendered...")
    console.log("Score" + score)
    console.log("Guessed: " + isGuessed)

    function incrementIndex(): void {
        console.log('incrementing index')
        if (qIndex < questions.length) setQIndex(prevIndex => prevIndex + 1)
        setHintOpened(false)
        setShowHintBool(false)
    }

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>){
        event.preventDefault()
        const formEl = event.currentTarget as EventTarget
        const formData = new FormData(formEl as HTMLFormElement)
        const ans: string = formData.get("answer") as string
        setUserAnswers((prevAns: string[]): string[] => [...prevAns, ans])
        if (ans === questions[qIndex]?.correct) setScore(prevScore => prevScore + 1)
        ;(formEl as HTMLFormElement).reset()
    }

    function openHint(): void {
        setHintOpened(true)
        if (score <= 0) return
        setShowHintBool(true)
        setScore(prev => prev - 1)
    }

    const answerElements: JSX.Element[] | undefined =  questions[qIndex]?.answers.map((answer: string, index: number): JSX.Element => {
        const isCorrect: boolean = isGuessed && answer === questions[qIndex]?.correct
        const isNotCorrect: boolean = isGuessed && answer !== questions[qIndex]?.correct

        const answerClassName: string = clsx({
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

    function showCorrectAnswers(): string[] {
        return questions.map((questionObj: QuestionType) => questionObj.correct)
    }

    function showQuestions(): string[] {
        return questions.map((questionObj: QuestionType)=> questionObj.question)
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
                <button title="Hint" onClick={openHint}><FontAwesomeIcon icon={faLightbulb} /></button>
                </span>
            </header>

            { hintOpened && showHintBool? <QuizHint 
                    question={questions[qIndex]?.question} 
                    answer={questions[qIndex]?.correct}
                    closeHint={setHintOpened}/> 
                : hintOpened ? (
                    <div className="hint_section not_available">
                        <h3>"You must have at least 1pt to view hint!"</h3>
                        <p>Try again later</p>
                        <button onClick={()=> setHintOpened(false)}>&#10006;</button>
                    </div>
                ) : null}

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