import {gameData} from "../gameOptions.js"
import type {gameDataType} from "../gameOptions.js"
import { Link } from "react-router-dom"
import '../css/index.css'
import type {JSX} from "react"

export function Home(): JSX.Element {
    const gameOptions: JSX.Element[] = gameData.map((game: gameDataType): JSX.Element => {
        return (
            <div key={game.id} className="home-menu-div">
                <Link to={game.linkUrl}>
                    <div></div>
                    <h3>{game.name}</h3>
                    <p>{game.description}</p>
                </Link>
            </div>
        )
    })

    return (
        <>
        <main className="home-menu-container">
            <h2>Our Selection</h2>
            <section className="home-menu-box">
                {gameOptions}
                <div className="arrow left-arrow"><p>&larr;</p></div>
                <div className="arrow right-arrow"><p>&rarr;</p></div>
            </section>
        </main>
        </>
    )
}