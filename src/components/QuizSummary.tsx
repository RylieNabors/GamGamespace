import {useEffect, useRef, useState} from "react"
import { Link } from "react-router-dom"
import { InferenceClient } from '@huggingface/inference'
import { nanoid } from 'nanoid'
import ReactMarkdown from "react-markdown"

export function QuizSummary({score, correctAns, userAns, questions}) {
    console.log('QuizSummary rendered...')

    const responseGenerated = useRef(false)
    const [recommendation, setRecommendation] = useState("")
    const HF_ACCESS_TOKEN = import.meta.env.VITE_HF_KEY
    const hf = new InferenceClient(HF_ACCESS_TOKEN)

    let missed_questions = correctAns.map((ans, index) => ({ans, 'orig': index}))
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
                    const text = response.choices[0].message.content
                    setRecommendation(text.replace(/^<think>\s*<\/think>\s*/i, ""))
                } catch (err) {
                    console.error(err.message)
                }
            }
            getSummary()

            return () => responseGenerated.current = true
        }
    }, [])

    const missed_question_section = missed_questions.map(questionObj => {
        return (
            <span key={nanoid()}>
                <p>{questionObj.question}</p>
                <p>{questionObj.answer}</p>
            </span>
        )
    })

    const recommendation_section = recommendation.split(/\r?\n\r?\n+/).map(recStr => {
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