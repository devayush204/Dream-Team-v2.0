"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGame } from "./game-provider"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import confetti from 'canvas-confetti'
import { ArrowRight, Award, Timer, Star } from "lucide-react"

type Props = {
  onShowResults: () => void
}

// export function QuestionDisplay({ onShowResults }: { onShowResults: () => void }) {
//   const {
//     currentQuestion,
//     currentTeams,
//     questionsAnswered,
//     roundQuestionsRequired,
//     markTeamAsCompeted,
//   } = useGame()

//   const handleFinishRound = () => {
//     if (currentTeams) {
//       markTeamAsCompeted(currentTeams[0])
//       markTeamAsCompeted(currentTeams[1])
//     }
//     onShowResults()
//   }

//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={currentQuestion?.id}
//         initial={{ opacity: 0, x: 20 }}
//         animate={{ opacity: 1, x: 0 }}
//         exit={{ opacity: 0, x: -20 }}
//         className="p-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"
//       >
//         {questionsAnswered >= roundQuestionsRequired ? (
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="px-6 py-2 bg-green-500 text-white rounded-lg"
//             onClick={handleFinishRound}
//           >
//             Finish Round for This Team Pair
//           </motion.button>
//         ) : (
//           <div className="space-y-4">
//             <h3 className="text-xl font-bold text-white">
//               Question {questionsAnswered + 1} of {roundQuestionsRequired}
//             </h3>
//             <div className="bg-white p-4 rounded-lg">
//               <p className="text-lg">{currentQuestion?.question}</p>
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </AnimatePresence>
//   )
// }

export default function QuestionDisplay({ onShowResults }: Props) {
  const {
    currentQuestion,
    currentTeams,
    teams,
    timer,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer,
    addScore,
    nextQuestion,
    currentRound,
    questionsAnswered,
    roundQuestionsRequired,
    markTeamAsCompeted,
    resetQuestionsAnswered,
    teamsCompeted,
    setCurrentQuestion,
    setCurrentTeams,
    setQuestionsAnswered,
  } = useGame()

  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([])
  const [assignedAnswers, setAssignedAnswers] = useState<{ [key: string]: number[] }>({})
  const [questionNumber, setQuestionNumber] = useState(questionsAnswered + 1)
  const [isAnswerRevealing, setIsAnswerRevealing] = useState(false)
  const [isAnswerDragging, setIsAnswerDragging] = useState<number | null>(null)
  const [showDropHint, setShowDropHint] = useState(false)
  
  // Add confetti effect function
  const triggerConfetti = useCallback((originX: number = 0.5, originY: number = 0.5) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: originX, y: originY },
      colors: ['#FFD700', '#FFA500', '#4299e1', '#9f7aea', '#48bb78'],
    });
  }, []);

  const team1 = teams.find((t) => t.id === currentTeams?.[0])
  const team2 = teams.find((t) => t.id === currentTeams?.[1])

  // Reset revealed answers when question changes
  useEffect(() => {
    if (currentQuestion) {
      setRevealedAnswers([])
      setAssignedAnswers({})
      setIsAnswerRevealing(false)
    }
  }, [currentQuestion])

  // Update question number when questions answered changes
  useEffect(() => {
    setQuestionNumber(questionsAnswered + 1)
  }, [questionsAnswered])

  const handleRevealAnswer = (index: number) => {
    setIsAnswerRevealing(true)
    
    // Add animation delay before revealing
    setTimeout(() => {
      if (!revealedAnswers.includes(index)) {
        setRevealedAnswers((prev) => [...prev, index])
        
        // Trigger confetti from the middle of the screen
        triggerConfetti(0.5, 0.4)
      }
      setIsAnswerRevealing(false)
    }, 300)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setIsAnswerDragging(null)

    if (over && active.id.toString().startsWith("answer-")) {
      const answerId = Number.parseInt(active.id.toString().replace("answer-", ""))
      const teamId = over.id.toString().replace("team-", "")

      // Remove this answer from any team that might have it
      const newAssignedAnswers = { ...assignedAnswers }

      Object.keys(newAssignedAnswers).forEach((tid) => {
        newAssignedAnswers[tid] = newAssignedAnswers[tid].filter((a) => a !== answerId)
      })

      // Assign to new team
      if (!newAssignedAnswers[teamId]) {
        newAssignedAnswers[teamId] = []
      }

      newAssignedAnswers[teamId] = [...newAssignedAnswers[teamId], answerId]
      setAssignedAnswers(newAssignedAnswers)

      // Add score to team
      if (currentQuestion) {
        const answerScore = currentQuestion.answers[answerId].points
        addScore(teamId, answerScore)
        
        // Trigger confetti from the drop position
        const overRect = document.getElementById(`team-${teamId}`)?.getBoundingClientRect()
        if (overRect) {
          triggerConfetti(
            overRect.left / window.innerWidth, 
            overRect.top / window.innerHeight
          )
        }
      }
    }
    
    setShowDropHint(false)
  }

  const handleDragStart = (event: any) => {
    if (event.active.id.toString().startsWith("answer-")) {
      const answerId = Number.parseInt(event.active.id.toString().replace("answer-", ""))
      setIsAnswerDragging(answerId)
      setShowDropHint(true)
    }
  }

  const handleNextQuestion = () => {
    if (questionsAnswered + 1 >= roundQuestionsRequired) {
      // Mark both teams as having competed in this round
      if (currentTeams) {
        markTeamAsCompeted(currentTeams[0])
        markTeamAsCompeted(currentTeams[1])
      }

      // Reset for the next team pair
      setCurrentQuestion(null)
      setCurrentTeams(null)
      setQuestionsAnswered(0)
      onShowResults()
    } else {
      // Increment the question count and move to the next question
      nextQuestion()
      setQuestionNumber((prev) => prev + 1)
    }
  }

  if (!currentQuestion || !team1 || !team2) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <motion.div 
            className="text-xl font-bold text-yellow-400 flex items-center"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="mr-2">Question {questionNumber} of {roundQuestionsRequired}</span>
            {questionNumber > 1 && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 4 }}
              >
                <ArrowRight className="h-5 w-5 text-green-400" />
              </motion.div>
            )}
          </motion.div>
          <motion.div 
            className="text-lg flex items-center bg-blue-800/60 px-4 py-1 rounded-full"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Award className="h-5 w-5 text-yellow-400 mr-2" />
            <span>Round {currentRound}</span>
          </motion.div>
        </div>

        <div className="flex justify-between mb-8">
          <TeamScoreCard team={team1} assignedAnswers={assignedAnswers[team1.id] || []} />
          <motion.div 
            className="text-center py-3 px-6 bg-blue-900/60 rounded-lg backdrop-blur-sm border border-blue-700"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold mb-2 flex items-center justify-center">
              <Timer className="h-6 w-6 text-yellow-400 mr-2" />
              <span>Timer</span>
            </div>
            <motion.div 
              className={`text-4xl font-mono ${timer < 20 ? "text-red-500" : "text-white"}`}
              animate={timer < 20 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: timer < 20 ? Infinity : 0 }}
            >
              {timer}s
            </motion.div>
            <div className="flex gap-2 mt-4">
              {!isTimerRunning ? (
                <Button onClick={startTimer} className="bg-green-600 hover:bg-green-500">
                  Start Timer
                </Button>
              ) : (
                <Button onClick={stopTimer} className="bg-red-600 hover:bg-red-500">
                  Stop Timer
                </Button>
              )}
              <Button onClick={resetTimer} variant="outline">
                Reset
              </Button>
            </div>
          </motion.div>
          <TeamScoreCard team={team2} assignedAnswers={assignedAnswers[team2.id] || []} />
        </div>

        <DndContext 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd} 
          onDragStart={handleDragStart}
          modifiers={[restrictToWindowEdges]}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-600 mb-8 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-yellow-400">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.answers.map((answer, index) => (
                    <AnswerCard
                      key={index}
                      answer={answer}
                      index={index}
                      isRevealed={revealedAnswers.includes(index)}
                      onReveal={() => handleRevealAnswer(index)}
                      isAssigned={Object.values(assignedAnswers).flat().includes(index)}
                      isAnswerRevealing={isAnswerRevealing}
                      isDragging={isAnswerDragging === index}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={handleNextQuestion} 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 px-8 py-6 shadow-lg shadow-purple-700/30 text-lg"
                  >
                    {questionsAnswered + 1 >= roundQuestionsRequired ? "Finish Round for This Team Pair" : "Next Question"}
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>

          <div className="flex justify-between">
            <TeamDropZone 
              teamId={team1.id} 
              teamName={team1.name} 
              showHint={showDropHint && isAnswerDragging !== null} 
            />
            <TeamDropZone 
              teamId={team2.id} 
              teamName={team2.name} 
              showHint={showDropHint && isAnswerDragging !== null} 
            />
          </div>
        </DndContext>
      </motion.div>
    </AnimatePresence>
  )
}

function TeamScoreCard({ team, assignedAnswers }: { team: any; assignedAnswers: number[] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="w-64 bg-gradient-to-b from-blue-900 to-blue-950 border-blue-700 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{team.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <Star className="h-5 w-5 text-yellow-400" />
            {team.score} pts
          </motion.div>
          <div className="text-sm mt-2 text-blue-300">Answers: {assignedAnswers.length}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function AnswerCard({
  answer,
  index,
  isRevealed,
  onReveal,
  isAssigned,
  isAnswerRevealing,
  isDragging,
}: {
  answer: any
  index: number
  isRevealed: boolean
  onReveal: () => void
  isAssigned: boolean
  isAnswerRevealing: boolean
  isDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `answer-${index}`,
    disabled: !isRevealed || isAssigned,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.1 }}
    >
      <motion.div
        whileHover={isRevealed && !isAssigned ? { scale: 1.05, rotate: 1 } : {}}
        animate={isDragging ? { scale: 1.1, zIndex: 10, rotate: [-1, 1, -1] } : {}}
      >
        <Card
          className={`cursor-pointer transition-all shadow-lg ${
            isRevealed
              ? isAssigned
                ? "bg-gray-700 opacity-60 rotate-3"
                : "bg-gradient-to-r from-yellow-500 to-yellow-400 text-blue-900 border-yellow-300"
              : "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 border border-blue-500"
          }`}
          onClick={isRevealed || isAnswerRevealing ? undefined : onReveal}
          ref={isRevealed && !isAssigned ? setNodeRef : undefined}
          style={isRevealed && !isAssigned ? style : undefined}
          {...(isRevealed && !isAssigned ? { ...attributes, ...listeners } : {})}
        >
          <CardContent className="p-4">
            <motion.div 
              className="flex justify-between items-center"
              animate={isRevealed ? { scale: [1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="font-bold">{isRevealed ? answer.text : `Answer ${index + 1}`}</div>
              {isRevealed && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="bg-blue-900 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold flex items-center"
                >
                  <Star className="h-3 w-3 mr-1" /> {answer.points} pts
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function TeamDropZone({ teamId, teamName, showHint }: { teamId: string; teamName: string; showHint: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `team-${teamId}`,
  })

  return (
    <motion.div
      id={`team-${teamId}`}
      whileHover={{ scale: 1.05 }}
      ref={setNodeRef}
      animate={showHint ? { 
        scale: [1, 1.05, 1], 
        boxShadow: ["0 0 0 rgba(255,215,0,0)", "0 0 20px rgba(255,215,0,0.5)", "0 0 0 rgba(255,215,0,0)"] 
      } : {}}
      transition={{ duration: 1.5, repeat: showHint ? Infinity : 0 }}
      className={`w-64 h-32 border-2 border-dashed rounded-lg flex items-center justify-center ${
        isOver ? "border-yellow-400 bg-blue-800/70 shadow-lg shadow-yellow-400/30" : "border-blue-600"
      }`}
    >
      <div className="text-center">
        <div className="font-bold mb-2 text-lg">{teamName}</div>
        <motion.div 
          className="text-sm text-blue-300"
          animate={showHint ? { scale: [1, 1.1, 1], color: ["#93c5fd", "#fff", "#93c5fd"] } : {}}
          transition={{ duration: 1, repeat: showHint ? Infinity : 0 }}
        >
          Drop answer here
        </motion.div>
      </div>
    </motion.div>
  )
}

