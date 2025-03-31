"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGame } from "./game-provider"

type Props = {
  onClose: () => void
}

export default function ResultsDisplay({ onClose }: Props) {
  const { teams, currentRound, advanceToNextRound, teamsCompeted, showResults } = useGame()

  // Check if all teams have competed
  const allTeamsCompeted = teams.every(team => teamsCompeted.includes(team.id))

  // Sort teams by score
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)

  // Determine which teams advance based on current round
  let advancingTeams: typeof teams = []
  const teamsToAdvance = currentRound === 1 ? 4 : currentRound === 2 ? 2 : 0

  if (currentRound === 1) {
    // Top 4 teams advance to round 2
    advancingTeams = sortedTeams.slice(0, 4)
  } else if (currentRound === 2) {
    // Top 2 teams advance to round 3
    advancingTeams = sortedTeams.slice(0, 2)
  }

  const handleAdvance = () => {
    showResults() // Update the teams that will advance
    advanceToNextRound()
    onClose()
  }

  const handleContinue = () => {
    onClose() // Just close the results and continue with the current round
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-blue-800 border-blue-600">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-yellow-400">
            {allTeamsCompeted ? `Round ${currentRound} Results` : "Team Pair Results"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card
                  className={`
                  ${
                    allTeamsCompeted && index < teamsToAdvance
                      ? "bg-green-700 border-green-600"
                      : allTeamsCompeted
                      ? "bg-red-800 border-red-700"
                      : "bg-blue-700 border-blue-600"
                  }
                `}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                          ${allTeamsCompeted && index < teamsToAdvance ? "bg-yellow-500 text-blue-900" : "bg-blue-900"}`}
                        >
                          {index + 1}
                        </div>
                        <h3 className="font-bold text-lg">{team.name}</h3>
                      </div>
                      <motion.div 
                        className="text-2xl font-bold text-yellow-400"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      >
                        {team.score} pts
                      </motion.div>
                    </div>
                    {allTeamsCompeted && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className="mt-2 text-sm"
                      >
                        {index < teamsToAdvance
                          ? "Advances to next round!"
                          : "Eliminated"}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          {allTeamsCompeted ? (
            <Button
              onClick={handleAdvance}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-8 transition-all transform hover:scale-105"
            >
              {currentRound < 3 ? "Start Round " + (currentRound + 1) : "Show Final Winner"}
            </Button>
          ) : (
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 transition-all transform hover:scale-105"
            >
              Continue Round {currentRound}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

