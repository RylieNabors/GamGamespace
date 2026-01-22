import { BrowserRouter, Routes, Route } from "react-router-dom"

import { Home } from "./pages/Home"
import { Layout } from "./pages/Layout"
import { QuizIntro } from "./pages/QuizIntro"
import { Sudoku } from "./pages/Sudoku"
import { Yahtzee } from "./pages/Yahtzee"
import { PageNotFound } from "./pages/PageNotFound"

import { Question } from "./components/Question"

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
