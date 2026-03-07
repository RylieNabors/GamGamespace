import {useEffect, useRef, useState} from "react"
import { Link } from "react-router-dom"
import { InferenceClient } from '@huggingface/inference'
import { nanoid } from 'nanoid'
import ReactMarkdown from "react-markdown"
import type {JSX} from "react"

interface QuizSummaryProps {
    score: number,
    correctAns: string[],
    userAns: string[],
    questions: string[]
}

export function QuizSummary({score, correctAns, userAns, questions}: QuizSummaryProps): JSX.Element {
    console.log('QuizSummary rendered...')

    const responseGenerated = useRef<boolean>(false)
    const [recommendation, setRecommendation] = useState<string>("")
    const HF_ACCESS_TOKEN = import.meta.env.VITE_HF_KEY
    const hf = new InferenceClient(HF_ACCESS_TOKEN)

    type MissedQuestionType = {
        question: string | undefined,
        answer: string
    }
    let missed_questions: MissedQuestionType[] = correctAns.map((ans: string, index: number) => ({ans, 'orig': index}))
                            .filter((ansObj, index) => ansObj.ans !== userAns[index])
                            .map(ansObj => {
                                return {
                                    'question': questions[ansObj.orig],
                                    'answer': ansObj.ans
                                }
                            })

    useEffect(() => {
        if (responseGenerated.current === false) {
           
            const prompt = `/nothinking\n\nBased on the following JSON formatted array of Q&A objects, list 3 relevant
            topics to study further. If the array is empty, suggest a random topic to study further. Do not say that the list
            is based on a JSON formatted array in your response. Say it is 'based on your quiz results'. Return response in 
            markdown. ${JSON.stringify(missed_questions)}`

            async function getSummary() {
                try {
                    const response = await hf.chatCompletion({
                        model: "Qwen/Qwen3-32B",
                        provider: "cerebras",
                        messages: [
                            { role: "user", content: prompt }
                        ],
                        max_tokens: 512,
                    })
                    if (!response.ok) throw new Error('Error: HuggingFace response invalid')
                    if (!("choices" in response && response.choices[0]?.message)) {
                        throw new Error('Error: No choices in response')
                    }
                    const text = response.choices[0].message.content
                    if (typeof text === "string") setRecommendation(text.replace(/^<think>\s*<\/think>\s*/i, ""))
                } catch (err) {
                    if (!(err instanceof Error)) {
                        console.error("Unknown Error")
                        return
                    }
                    console.error(err.message)
                }
            }
            getSummary()

            return () => {
                responseGenerated.current = true
            }
        }
    }, [])

    const missed_question_section: JSX.Element[] = missed_questions.map((questionObj: MissedQuestionType): JSX.Element => {
        return (
            <span key={nanoid()}>
                <p>{questionObj.question}</p>
                <p>{questionObj.answer}</p>
            </span>
        )
    })

    const recommendation_section: JSX.Element[] = recommendation.split(/\r?\n\r?\n+/).map((recStr: string): JSX.Element => {
        return (
            <ReactMarkdown key={nanoid()}>{recStr}</ReactMarkdown>
        )
    })

    return (
        <main className="main-container summary">
            <section className="summary-box quiz-container">
                <header>
                    <p>Score: {score} pts</p>
                </header>
                <div>
                    <h2>Questions Missed</h2>
                    {missed_question_section}
                </div>
                <button><Link to="/quiz">New Game</Link></button>
            </section>
            <section className="recommendation quiz-container">
                {recommendation_section}
            </section>
        </main>
    )
}