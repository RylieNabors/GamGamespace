import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { clsx } from 'clsx'
import { useEffect, useRef, useState } from "react"
import { InferenceClient } from '@huggingface/inference'

export function QuizHint({question, score, closeHint, setScore, answer}) {
    console.log("QuizHint rendered...")
    // refs
    const scoreUpdated = useRef(false)
    const prevScore = useRef(score)
    // state
    const [hint, setHint] = useState("")

    const HF_ACCESS_TOKEN = import.meta.env.VITE_HF_KEY
    const hf = new InferenceClient(HF_ACCESS_TOKEN)

    const questionObj = {
        "question": question,
        "answer": answer
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
                    let text = response.choices[0].message.content
                    setHint(text.replace(/^<think>\s*<\/think>\s*/i, ""))
                    setScore(prev => prev - 1)
                    
                } catch (err) {
                    console.error(err.message)
                }
            }
            getSummary()
        
            return () => {
                scoreUpdated.current = true
            }
        }
    }, [])

    const hintClassName = clsx({
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