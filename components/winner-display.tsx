"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGame } from "./game-provider"
import confetti from "canvas-confetti"

export default function WinnerDisplay() {
  const { teams } = useGame()

  // Sort teams by score
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
  const winner = sortedTeams[0]

  useEffect(() => {
    // Trigger confetti when component mounts
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto text-center"
    >
      <h2 className="text-5xl font-bold mb-8 text-yellow-400">Winner!</h2>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 mb-8">
          <CardHeader>
            <CardTitle className="text-4xl text-blue-900">{winner.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-blue-900 mb-4">{winner.score} pts</div>
            <div className="text-2xl text-blue-800">Congratulations!</div>
          </CardContent>
        </Card>
      </motion.div>

      <h3 className="text-2xl font-bold mb-4">Final Standings</h3>

      <div className="space-y-4 mb-8">
        {sortedTeams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <Card className={index === 0 ? "bg-yellow-600 border-yellow-500" : "bg-blue-800 border-blue-700"}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center">{index + 1}</div>
                    <h3 className="font-bold text-lg">{team.name}</h3>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">{team.score} pts</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={() => window.location.reload()}
        size="lg"
        className="bg-green-600 hover:bg-green-500 text-white font-bold px-8"
      >
        Start New Game
      </Button>
    </motion.div>
  )
}

