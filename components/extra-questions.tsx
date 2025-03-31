"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGame } from "./game-provider"

export default function ExtraQuestions() {
  const { extraQuestions, useExtraQuestion } = useGame()
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([])
  const [isQuestionBeingUsed, setIsQuestionBeingUsed] = useState(false)

  useEffect(() => {
    if (isQuestionBeingUsed) {
      useExtraQuestion()
      setIsQuestionBeingUsed(false) // Reset the flag after using the question
    }
  }, [isQuestionBeingUsed, useExtraQuestion])

  const handleRevealAnswer = (index: number) => {
    if (!revealedAnswers.includes(index)) {
      setRevealedAnswers([...revealedAnswers, index])
    }
  }

  const handleSelectQuestion = (index: number) => {
    setSelectedQuestion(index)
    setRevealedAnswers([])
  }

  const handleUseQuestion = () => {
    if (selectedQuestion !== null) {
      setIsQuestionBeingUsed(true)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Extra Questions</h2>

      {selectedQuestion === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {extraQuestions.map((question, index) => (
            <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer ${question.used ? "bg-gray-700 opacity-60" : "bg-blue-800 hover:bg-blue-700"}`}
                onClick={() => !question.used && handleSelectQuestion(index)}
              >
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">Question {index + 1}</h3>
                  <p className="line-clamp-2">{question.question}</p>
                  {question.used && <div className="mt-2 text-sm text-red-400">Already used</div>}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div>
          <Button variant="outline" onClick={() => setSelectedQuestion(null)} className="mb-4">
            ← Back to questions
          </Button>

          <Card className="bg-blue-800 border-blue-600 mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-400">{extraQuestions[selectedQuestion].question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {extraQuestions[selectedQuestion].answers.map((answer, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${
                      revealedAnswers.includes(index) ? "bg-yellow-500 text-blue-900" : "bg-blue-700 hover:bg-blue-600"
                    }`}
                    onClick={() => handleRevealAnswer(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="font-bold">
                          {revealedAnswers.includes(index) ? answer.text : `Answer ${index + 1}`}
                        </div>
                        {revealedAnswers.includes(index) && (
                          <div className="bg-blue-900 text-yellow-400 px-2 py-1 rounded-full text-sm">
                            {answer.points} pts
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={handleUseQuestion}
              disabled={extraQuestions[selectedQuestion].used}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600"
            >
              Use This Question In Game
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

