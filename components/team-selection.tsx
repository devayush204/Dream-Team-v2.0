"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useGame } from "./game-provider"
import { ArrowRight } from "lucide-react"

export default function TeamSelection() {
  const {
    teams,
    currentRound,
    teamsCompeted,
    roundQuestionsRequired,
    selectTeamsForQuestion,
    showResults,
    currentTeamPair,
  } = useGame()

  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [isSelecting, setIsSelecting] = useState(true)

  // Filter out teams that have already competed in this round
  const availableTeams = teams.filter((team) => !teamsCompeted.includes(team.id))

  // Reset selected teams when teams competed changes
  useEffect(() => {
    setSelectedTeams([])
  }, [teamsCompeted])

  // Calculate if all possible teams have competed (based on team pairings)
  // For pairs of teams, we need to ensure that we've used all possible pairs
  const allTeamsCompeted = teams.length > 0 && 
    teamsCompeted.length >= Math.floor(teams.length / 2) * 2;

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
      
      // Add a delay before starting questions to show the "Get Ready" animation
      setTimeout(() => {
        selectTeamsForQuestion([selectedTeams[0], selectedTeams[1]])
      }, 1500)
    }
  }

  // If there are no teams yet (at the very start), don't show anything
  if (teams.length === 0) {
    return null;
  }

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

      {allTeamsCompeted ? (
        <motion.div 
          className="text-center p-8 bg-blue-800/50 rounded-lg backdrop-blur-sm shadow-lg border border-blue-600"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h3 className="text-2xl font-bold text-yellow-400 mb-6">All teams have competed in this round!</h3>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={showResults} 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all text-white text-lg px-8 py-6 shadow-lg shadow-green-600/20 flex items-center gap-2" 
              size="lg"
            >
              <span>Show Round Results</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      ) : availableTeams.length < 2 ? (
        <motion.div 
          className="text-center p-8 bg-blue-800/50 rounded-lg backdrop-blur-sm border border-blue-600"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">Not enough teams available!</h3>
          <p className="text-blue-200 mb-6">There are not enough teams available to form a pair.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={showResults} 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all text-white text-lg px-8 py-6 shadow-lg shadow-purple-600/20" 
              size="lg"
            >
              Show Round Results
            </Button>
          </motion.div>
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
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-blue-900 border-yellow-300 shadow-lg shadow-yellow-500/20" 
                          : "bg-gradient-to-r from-blue-800 to-blue-700/80 hover:from-blue-700 hover:to-blue-600/80 border-blue-600 backdrop-blur-sm"
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
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold px-12 py-6 text-xl 
                    disabled:bg-gray-600 transition-all transform hover:scale-105 shadow-lg shadow-green-600/20"
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

