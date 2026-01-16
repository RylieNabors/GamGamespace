import {gameData} from "../gameOptions"
import { Link } from "react-router-dom"
import '../css/index.css'

export function Home() {
    console.log(gameData)
    const gameOptions = gameData.map(game => {
        console.log(game.imgUrl)
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