import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { clsx } from 'clsx'
import { useEffect, useRef, useState } from "react"
import { InferenceClient } from '@huggingface/inference'
import type {JSX} from "react"

interface QuizHintProps {
    question: string | undefined,
    score: number,
    closeHint: (p: boolean) => void,
    setScore: React.Dispatch<React.SetStateAction<number>>,
    answer: string | undefined
}

export function QuizHint({question, score, closeHint, setScore, answer}: QuizHintProps): JSX.Element | undefined {
    console.log("QuizHint rendered...")
    if (typeof question === undefined) {
        console.log("Question is undefined")
        return undefined
    }
    if (typeof answer === undefined) {
        console.log("Answer is undefined")
        return undefined
    }
    // refs
    const scoreUpdated = useRef<boolean>(false)
    const prevScore = useRef<number>(score)
    // state
    const [hint, setHint] = useState<string>("")

    const HF_ACCESS_TOKEN = import.meta.env.VITE_HF_KEY
    const hf = new InferenceClient(HF_ACCESS_TOKEN)

    const questionObj: {question: string, answer: string} = {
        "question": question as string,
        "answer": answer as string
    }

    useEffect(() => {
        if (scoreUpdated.current === false && score !== 0) {
            const prompt = `/nothinking\n\nBased on the following JSON formatted object that contains a 
            question and the correct answer, give a hint to what the correct answer is. Do not give the
            correct answer away. Only return the hint ${JSON.stringify(questionObj)}`

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
                    if (!response.ok) throw new Error('Error: Hugging Face response invalid')
                    if (!("choices" in response && response.choices[0]?.message)) {
                        throw new Error('Error: No choices in response')
                    } 
                    let text = response.choices[0].message.content
                    if (typeof text === "string") setHint(text.replace(/^<think>\s*<\/think>\s*/i, ""))
                    setScore(prev => prev - 1)
                    
                } catch (err) {
                    if (!(err instanceof Error)) {
                        console.error("Unknown error")
                        return
                    }
                    console.error(err.message)
                }
            }
            getSummary()
        
            return () => {
                scoreUpdated.current = true
            }
        }
    }, [])

    const hintClassName: string = clsx({
        available: prevScore.current > 0,
        not_available: prevScore.current <= 0,
        hint_section: true   
    })
    return (
        <>
        {prevScore.current > 0
        ?(<div className={hintClassName}>
            <h3><FontAwesomeIcon icon={faLightbulb}/> Hint:</h3>
            <p>{hint}</p>
        </div>)
        :(<div className={hintClassName}>
            <h3>You must have at least 1pt to view hint!</h3>
            <p>Try again later</p>
            <button onClick={()=> closeHint(false)}>&#10006;</button>
        </div>)
        }
        </>
    )
}