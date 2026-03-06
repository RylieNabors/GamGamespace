import { BrowserRouter, Routes, Route } from "react-router-dom"

import { Home } from "./pages/Home.js"
import { Layout } from "./pages/Layout.js"
import { QuizIntro } from "./pages/QuizIntro.js"
import { Sudoku } from "./pages/Sudoku.js"
import { Yahtzee } from "./pages/Yahtzee.js"
import { PageNotFound } from "./pages/PageNotFound.js"

import { Question } from "./components/Question.js"

function App() {
  console.log("parent render")

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path="quiz" element={<QuizIntro />}/>
          <Route path="quiz/question" element={<Question />}/>
          <Route path="sudoku" element={<Sudoku />}/>
          <Route path="yahtzee" element={<Yahtzee />} />
          <Route path="*" element={<PageNotFound />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
