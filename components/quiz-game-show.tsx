"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGame } from "./game-provider"
import TeamSetup from "./team-setup"
import RoundIntro from "./round-intro"
import TeamSelection from "./team-selection"
import QuestionDisplay from "./question-display"
import ResultsDisplay from "./results-display"
import WinnerDisplay from "./winner-display"
import ExtraQuestions from "./extra-questions"

export default function QuizGameShow() {
  const { gameState, currentRound } = useGame()
  const [showExtraQuestions, setShowExtraQuestions] = useState(false)
  const [showingResults, setShowingResults] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-2 text-yellow-400">Quiz Game Show</h1>
        {gameState !== "setup" && <div className="text-2xl font-semibold">Round {currentRound}</div>}
        {gameState !== "setup" && (
          <button
            onClick={() => setShowExtraQuestions(!showExtraQuestions)}
            className="mt-4 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-white"
          >
            {showExtraQuestions ? "Back to Game" : "Extra Questions"}
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {showExtraQuestions ? (
          <motion.div
            key="extra-questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ExtraQuestions />
          </motion.div>
        ) : (
          <motion.div
            key={gameState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {gameState === "setup" && <TeamSetup />}
            {gameState === "round1" &&
              (showingResults ? (
                <ResultsDisplay onClose={() => setShowingResults(false)} />
              ) : (
                <GameRound onShowResults={() => setShowingResults(true)} />
              ))}
            {gameState === "round2" &&
              (showingResults ? (
                <ResultsDisplay onClose={() => setShowingResults(false)} />
              ) : (
                <GameRound onShowResults={() => setShowingResults(true)} />
              ))}
            {gameState === "round3" &&
              (showingResults ? (
                <ResultsDisplay onClose={() => setShowingResults(false)} />
              ) : (
                <GameRound onShowResults={() => setShowingResults(true)} />
              ))}
            {gameState === "finished" && <WinnerDisplay />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GameRound({ onShowResults }: { onShowResults: () => void }) {
  const { currentQuestion, currentTeams } = useGame()

  if (!currentTeams) {
    return <TeamSelection />
  }

  if (!currentQuestion) {
    return <RoundIntro />
  }

  return <QuestionDisplay onShowResults={onShowResults} />
}

