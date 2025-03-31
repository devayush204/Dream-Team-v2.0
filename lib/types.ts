export type Answer = {
  text: string
  points: number
}

export type Question = {
  id: string
  question: string
  answers: Answer[]
  used?: boolean
}

