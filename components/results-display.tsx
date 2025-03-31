"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGame } from "./game-provider"
import { useEffect } from "react"
import confetti from "canvas-confetti"
import { Trophy, Star, Check, ArrowRight, Award } from "lucide-react"

type Props = {
  onClose?: () => void
}

export default function ResultsDisplay({ onClose }: Props) {
  const { 
    teams, 
    currentRound, 
    advanceToNextRound, 
    teamsCompeted, 
    showResults, 
    advancingTeamIds 
  } = useGame()

  // Check if all teams have competed
  const allTeamsCompeted = teams.length > 0 && 
    teamsCompeted.length >= Math.floor(teams.length / 2) * 2

  // Sort teams by score
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)

  // Trigger confetti effect
  useEffect(() => {
    if (allTeamsCompeted) {
      // Run confetti for advancing teams
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.4 },
          colors: ['#FFD700', '#FFA500', '#4299e1', '#48bb78'],
        });
      }, 600);
    }
  }, [allTeamsCompeted]);

  const handleAdvance = () => {
    showResults() // Update the teams that will advance
    advanceToNextRound()
    onClose?.()
  }

  const handleContinue = () => {
    onClose?.() // Just close the results and continue with the current round
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-gradient-to-b from-blue-800 to-blue-900 border-blue-600 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-yellow-400 flex items-center justify-center gap-2">
            <Trophy className="h-7 w-7" />
            {allTeamsCompeted ? `Round ${currentRound} Results` : "Team Pair Results"}
          </CardTitle>
          {allTeamsCompeted && currentRound < 3 && (
            <motion.div 
              className="text-center text-blue-200 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Top {advancingTeamIds.length} teams will advance to Round {currentRound + 1}
            </motion.div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTeams.map((team, index) => {
              const isAdvancing = advancingTeamIds.includes(team.id);
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Card
                    className={`
                    ${
                      allTeamsCompeted && isAdvancing
                        ? "bg-gradient-to-r from-green-700 to-green-600 border-green-500 shadow-lg shadow-green-600/20"
                        : allTeamsCompeted
                        ? "bg-gradient-to-r from-red-800 to-red-700 border-red-600 shadow-lg shadow-red-600/20"
                        : "bg-gradient-to-r from-blue-700 to-blue-600 border-blue-500"
                    }
                  `}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center
                              ${allTeamsCompeted && isAdvancing ? "bg-yellow-500 text-blue-900" : "bg-blue-900"}`}
                            animate={isAdvancing && allTeamsCompeted ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 1.5, repeat: isAdvancing && allTeamsCompeted ? Infinity : 0, repeatDelay: 1 }}
                          >
                            {index === 0 ? <Award className="h-5 w-5" /> : index + 1}
                          </motion.div>
                          <h3 className="font-bold text-lg">{team.name}</h3>
                        </div>
                        <motion.div 
                          className="text-2xl font-bold text-yellow-400 flex items-center gap-1"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                        >
                          <Star className="h-5 w-5" />
                          {team.score} pts
                        </motion.div>
                      </div>
                      {allTeamsCompeted && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                          className={`mt-2 text-sm flex items-center gap-2 ${isAdvancing ? "text-green-300" : "text-red-300"}`}
                        >
                          {isAdvancing ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Advances to next round!</span>
                            </>
                          ) : (
                            <span>Eliminated</span>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          {allTeamsCompeted ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleAdvance}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-blue-900 font-bold px-8 py-6 text-xl shadow-lg shadow-yellow-500/20 flex items-center gap-2"
              >
                {currentRound < 3 ? (
                  <>
                    <span>Start Round {currentRound + 1}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  "Show Final Winner"
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-8 py-6 text-xl shadow-lg shadow-blue-700/20"
              >
                Continue Round {currentRound}
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

