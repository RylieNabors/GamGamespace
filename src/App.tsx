import { BrowserRouter, Routes, Route } from "react-router-dom"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import type {JSX} from "react"

import { Home } from "./pages/Home.js"
import { Layout } from "./pages/Layout.js"
import { QuizIntro } from "./pages/QuizIntro.js"
import { Sudoku } from "./pages/Sudoku.js"
import { Yahtzee } from "./pages/Yahtzee.js"
import { PageNotFound } from "./pages/PageNotFound.js"

import { Question } from "./components/Question.js"

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

function App(): JSX.Element {
  return (
    <QueryClientProvider client={client}>
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
    </QueryClientProvider>
  )
}

export default App
