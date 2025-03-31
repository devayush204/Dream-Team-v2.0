"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useGame } from "./game-provider"

export default function TeamSelection() {
  const { teams, selectTeamsForQuestion, currentRound, teamsCompeted, showResults, roundQuestionsRequired, currentTeamPair } = useGame()
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [isSelecting, setIsSelecting] = useState(true)

  useEffect(() => {
    // Reset selections when teamsCompeted changes
    setSelectedTeams([])
  }, [teamsCompeted])

  const handleTeamSelect = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter((id) => id !== teamId))
    } else if (selectedTeams.length < 2) {
      setSelectedTeams([...selectedTeams, teamId])
    }
  }

  const handleStartQuestion = () => {
    if (selectedTeams.length === 2) {
      setIsSelecting(false)
      // Briefly animate before actually starting
      setTimeout(() => {
        selectTeamsForQuestion([selectedTeams[0], selectedTeams[1]])
      }, 600)
    }
  }

  // Filter out teams that have already competed in this round
  const availableTeams = teams.filter((team) => !teamsCompeted.includes(team.id))

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-2">Round {currentRound}</h2>
        <p className="text-xl text-blue-200 mt-2">
          Teams compete in pairs. Each pair will answer {roundQuestionsRequired} questions.
        </p>
        {currentTeamPair > 0 && (
          <motion.p 
            className="text-blue-300 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentTeamPair} team pairs have competed so far.
          </motion.p>
        )}
      </motion.div>

      {availableTeams.length === 0 ? (
        <motion.div 
          className="text-center p-8 bg-blue-800/50 rounded-lg backdrop-blur-sm"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h3 className="text-2xl font-bold text-yellow-400 mb-6">All teams have competed in this round!</h3>
          <Button 
            onClick={showResults} 
            className="bg-green-600 hover:bg-green-500 transition-all transform hover:scale-105 text-lg px-8 py-6" 
            size="lg"
          >
            Show Round Results
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {isSelecting ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3 
                className="text-2xl font-bold mb-6 text-center text-blue-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Select 2 Teams for the Next Question Pair
              </motion.h3>
          
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {availableTeams.map((team, index) => (
                  <motion.div 
                    key={team.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -5 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedTeams.includes(team.id) 
                          ? "bg-yellow-500 text-blue-900 border-yellow-300 shadow-lg shadow-yellow-500/20" 
                          : "bg-blue-800/50 hover:bg-blue-700/50 border-blue-600 backdrop-blur-sm"
                      }`}
                      onClick={() => handleTeamSelect(team.id)}
                    >
                      <CardContent className="p-6 text-center">
                        <h3 className="font-bold text-xl mb-2">{team.name}</h3>
                        <p className={`font-bold text-lg ${selectedTeams.includes(team.id) ? "text-blue-900" : "text-yellow-400"}`}>
                          {team.score} pts
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleStartQuestion}
                  disabled={selectedTeams.length !== 2}
                  size="lg"
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-12 py-6 text-xl 
                    disabled:bg-gray-600 transition-all transform hover:scale-105 shadow-lg shadow-green-500/20"
                >
                  Start Questions
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="starting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.2, 1] }}
                transition={{ duration: 0.6, times: [0, 0.6, 1] }}
                className="text-5xl font-bold text-yellow-400 mb-6"
              >
                Get Ready!
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl text-blue-200"
              >
                {roundQuestionsRequired} questions coming up...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}

