"use client"
import { GameProvider } from "@/components/game-provider"
import QuizGameShow from "@/components/quiz-game-show"
import { useState } from "react"
import { motion } from "framer-motion"

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)

  if (!gameStarted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white">
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
          <motion.div 
            className="text-center max-w-3xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-6xl sm:text-7xl font-bold mb-6 text-yellow-400"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              Dream Team v2.0
            </motion.h1>

            <motion.p 
              className="text-xl mb-12 text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Test your knowledge and compete with your family and friends in this exciting game!
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.ul className="mb-10 text-left bg-blue-800/50 p-6 rounded-lg inline-block">
                <li className="mb-3 flex items-start">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold mr-3 mt-1">1</div>
                  <div>
                    <span className="font-semibold text-yellow-300">Round 1:</span> 5 questions per team pair
                  </div>
                </li>
                <li className="mb-3 flex items-start">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold mr-3 mt-1">2</div>
                  <div>
                    <span className="font-semibold text-yellow-300">Round 2:</span> 2 questions per team pair
                  </div>
                </li>
                <li className="mb-3 flex items-start">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold mr-3 mt-1">3</div>
                  <div>
                    <span className="font-semibold text-yellow-300">Round 3:</span> 3 questions per team pair
                  </div>
                </li>
              </motion.ul>
            </motion.div>

            <motion.button
              onClick={() => setGameStarted(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 px-10 rounded-full text-xl transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Game
            </motion.button>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white">
      <GameProvider>
        <QuizGameShow />
      </GameProvider>
    </main>
  )
}

