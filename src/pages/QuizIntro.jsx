import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEarthAmericas } from '@fortawesome/free-solid-svg-icons'
import '../css/quiz.css'
import { Link } from "react-router-dom"


export function QuizIntro() {
    console.log("QuizIntro rendered...")
    return (
        <main className="main-container">
            <section className="introduction-popup quiz-container">
                <FontAwesomeIcon icon={faEarthAmericas} size="6x" style={{ color: "black" }} spin/>
                <h1>Quizly</h1>
                <h2>Test your knowledge</h2>

                <button><Link to="/quiz/question">Begin Quiz</Link></button>
            </section>
        </main>
  )
}