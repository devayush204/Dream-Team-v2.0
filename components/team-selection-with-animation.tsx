import { motion } from 'framer-motion'
import { useState } from 'react'
import { useGame } from './game-provider'

export function TeamSelectionWithAnimation() {
  const { teams, teamsCompeted, selectTeamsForQuestion } = useGame()
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  
  const availableTeams = teams.filter(team => !teamsCompeted.includes(team.id))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Select Next Two Teams</h2>
      <div className="grid grid-cols-2 gap-4">
        {availableTeams.map((team) => (
          <motion.div
            key={team.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className={`p-4 rounded-lg cursor-pointer ${
              selectedTeams.includes(team.id)
                ? 'bg-green-500'
                : 'bg-white'
            }`}
            onClick={() => {
              if (selectedTeams.includes(team.id)) {
                setSelectedTeams(selectedTeams.filter(id => id !== team.id))
              } else if (selectedTeams.length < 2) {
                setSelectedTeams([...selectedTeams, team.id])
              }
            }}
          >
            <h3 className="font-bold">{team.name}</h3>
            <p>Score: {team.score}</p>
          </motion.div>
        ))}
      </div>
      {selectedTeams.length === 2 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg"
          onClick={() => selectTeamsForQuestion([selectedTeams[0], selectedTeams[1]])}
        >
          Start Match
        </motion.button>
      )}
    </motion.div>
  )
}