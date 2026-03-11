import { Outlet, Link } from "react-router-dom"
import { useState } from "react"
import { clsx } from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import type {JSX} from "react"

export function Layout(): JSX.Element {
    const [navShown, setNavShown] = useState<boolean>(false)

    function showNav(): void {
        setNavShown(prev => !prev)
    }

    const menuClassName: string = clsx({
        menuHidden: navShown === false,
    })

    return (
        <>
            <nav className="home-header">
                <h1><Link to="/">Gam Gamespace</Link></h1>
                <div className={menuClassName} onClick={showNav}><FontAwesomeIcon icon={faBars} size="2xl" />
                    <ul className={menuClassName}>
                        <Link to="quiz">Quizly</Link>
                        <Link to="yahtzee">Yahtzee</Link>
                        <Link to="sudoku">Sudoku</Link>
                    </ul>
                </div>
            </nav>
            <Outlet />
        </>
    )
}