"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Question } from "@/lib/types"
import { dummyQuestions, extraQuestions as extraQuestionsData } from "@/lib/dummy-data"

type Team = {
  id: string
  name: string
  score: number
}

type GameState = "setup" | "round1" | "round2" | "round3" | "finished"

interface GameContextType {
  teams: Team[]
  currentRound: number
  gameState: GameState
  currentTeams: [string, string] | null
  questions: Question[]
  extraQuestions: Question[]
  currentQuestion: Question | null
  timer: number
  isTimerRunning: boolean
  teamsCompeted: string[]
  questionsAnswered: number
  roundQuestionsRequired: number
  currentTeamPair: number
  advancingTeamIds: string[]

  setTeams: (teams: Team[]) => void
  setCurrentQuestion: (question: Question | null) => void
  setCurrentTeams: (teams: [string, string] | null) => void
  setQuestionsAnswered: (count: number) => void
  startGame: () => void
  selectTeamsForQuestion: (teamIds: [string, string]) => void
  startTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  addScore: (teamId: string, score: number) => void
  nextQuestion: () => void
  showResults: () => void
  advanceToNextRound: () => void
  useExtraQuestion: () => void
  markTeamAsCompeted: (teamId: string) => void
  resetQuestionsAnswered: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [gameState, setGameState] = useState<GameState>("setup")
  const [currentTeams, setCurrentTeams] = useState<[string, string] | null>(null)
  const [questions, setQuestions] = useState<Question[]>(dummyQuestions.map(q => ({ ...q, used: false })))
  const [extraQuestions, setExtraQuestions] = useState<Question[]>(extraQuestionsData.map(q => ({ ...q, used: false })))
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [timer, setTimer] = useState(100)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [teamsCompeted, setTeamsCompeted] = useState<string[]>([])
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [roundQuestionsRequired, setRoundQuestionsRequired] = useState(5) // Default for round 1
  const [currentTeamPair, setCurrentTeamPair] = useState<number>(0)
  const [advancingTeamIds, setAdvancingTeamIds] = useState<string[]>([])

  const startGame = () => {
    setGameState("round1")
    setCurrentRound(1)
    setRoundQuestionsRequired(1) // Only 1 question for round 1
    setCurrentTeamPair(0)
    
    // Reset all state for a new game
    setTeamsCompeted([])
    setQuestionsAnswered(0)
    setCurrentQuestion(questions[0])
    setCurrentTeams(null)
    
    // Reset all questions as unused
    setQuestions(questions.map(q => ({ ...q, used: false })))
    setExtraQuestions(extraQuestions.map(q => ({ ...q, used: false })))
  }

  const selectTeamsForQuestion = (teamIds: [string, string]) => {
    setCurrentTeams(teamIds)
    
    // Select a random question that hasn't been used yet
    const unusedQuestions = questions.filter((q) => !q.used)
    if (unusedQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * unusedQuestions.length)
      const selectedQuestion = unusedQuestions[randomIndex]
      setCurrentQuestion(selectedQuestion)

      // Mark question as used
      setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? { ...q, used: true } : q)))
    }
  }

  const startTimer = () => {
    setIsTimerRunning(true)
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsTimerRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setTimerInterval(interval)
  }

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
    setIsTimerRunning(false)
  }

  const resetTimer = () => {
    stopTimer()
    setTimer(100)
  }

  const addScore = (teamId: string, score: number) => {
    setTeams(teams.map((team) => (team.id === teamId ? { ...team, score: team.score + score } : team)))
  }

  const nextQuestion = () => {
    const nextIndex = questionsAnswered + 1
    if (nextIndex < roundQuestionsRequired) {
      setQuestionsAnswered(nextIndex)
      setCurrentQuestion(questions[nextIndex])
    } else {
      setCurrentQuestion(null) // No more questions
    }
  }

  const markTeamAsCompeted = (teamId: string) => {
    if (!teamsCompeted.includes(teamId)) {
      setTeamsCompeted((prev) => [...prev, teamId])
    }
  }

  const resetQuestionsAnswered = () => {
    setQuestionsAnswered(0)
  }

  const showResults = () => {
    setCurrentQuestion(null)
    setCurrentTeams(null)
    setQuestionsAnswered(0)
    
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
    
    // Set advancing teams based on current round
    if (currentRound === 1) {
        // Top 4 teams advance to round 2
        const advancingIds = sortedTeams.slice(0, 4).map(team => team.id)
        setAdvancingTeamIds(advancingIds)
    } else if (currentRound === 2) {
        // Top 2 teams advance to finals
        const advancingIds = sortedTeams.slice(0, 2).map(team => team.id)
        setAdvancingTeamIds(advancingIds)
    } else if (currentRound === 3) {
        // Winner of final round
        const winnerId = sortedTeams[0]?.id
        setAdvancingTeamIds(winnerId ? [winnerId] : [])
    }
    
    return sortedTeams
  }

  const advanceToNextRound = () => {
    const nextRound = currentRound + 1
    setCurrentRound(nextRound)
    
    // Filter teams to keep only advancing teams
    const advancingTeams = teams.filter(team => advancingTeamIds.includes(team.id))
    
    // Reset scores for advancing teams
    const teamsWithResetScores = advancingTeams.map(team => ({
        ...team,
        score: 0
    }))
    
    setTeams(teamsWithResetScores)

    // Set questions required for next round
    if (nextRound === 2) {
        setGameState("round2")
        setRoundQuestionsRequired(2)
    } else if (nextRound === 3) {
        setGameState("round3")
        setRoundQuestionsRequired(3)
    } else if (nextRound > 3) {
        setGameState("finished")
    }

    // Reset state for new round
    resetTimer()
    setCurrentQuestion(null)
    setCurrentTeams(null)
    setTeamsCompeted([])
    resetQuestionsAnswered()
    setCurrentTeamPair(0)
    setAdvancingTeamIds([])
  }

  const useExtraQuestion = () => {
    const unusedExtraQuestions = extraQuestions.filter((q) => !q.used)
    if (unusedExtraQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * unusedExtraQuestions.length)
      const selectedQuestion = unusedExtraQuestions[randomIndex]
      setCurrentQuestion(selectedQuestion)

      // Mark question as used
      setExtraQuestions(extraQuestions.map((q) => (q.id === selectedQuestion.id ? { ...q, used: true } : q)))
    }
  }

  return (
    <GameContext.Provider
      value={{
        teams,
        currentRound,
        gameState,
        currentTeams,
        questions,
        extraQuestions,
        currentQuestion,
        timer,
        isTimerRunning,
        teamsCompeted,
        questionsAnswered,
        roundQuestionsRequired,
        currentTeamPair,
        advancingTeamIds,

        setTeams,
        setCurrentQuestion,
        setCurrentTeams,
        setQuestionsAnswered,
        startGame,
        selectTeamsForQuestion,
        startTimer,
        stopTimer,
        resetTimer,
        addScore,
        nextQuestion,
        showResults,
        advanceToNextRound,
        useExtraQuestion,
        markTeamAsCompeted,
        resetQuestionsAnswered,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

