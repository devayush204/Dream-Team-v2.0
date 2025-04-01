"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Question } from "@/lib/types";
import {
  dummyQuestions,
  extraQuestions as extraQuestionsData,
} from "@/lib/dummy-data";
import { useRouter } from "next/navigation";

type Team = {
  id: string;
  name: string;
  score: number;
};

type GameState = "setup" | "round1" | "round2" | "round3" | "finished";

interface GameContextType {
  teams: Team[];
  currentRound: number;
  gameState: GameState;
  currentTeams: [string, string] | null;
  questions: Question[];
  extraQuestions: Question[];
  currentQuestion: Question | null;
  timer: number;
  isTimerRunning: boolean;
  teamsCompeted: string[];
  questionsAnswered: number;
  roundQuestionsRequired: number;
  currentTeamPair: number;
  advancingTeamIds: string[];

  setTeams: (teams: Team[]) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setCurrentTeams: (teams: [string, string] | null) => void;
  setQuestionsAnswered: (count: number) => void;
  startGame: () => void;
  selectTeamsForQuestion: (teamIds: [string, string]) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  addScore: (teamId: string, score: number) => void;
  nextQuestion: () => void;
  showResults: () => void;
  advanceToNextRound: () => void;
  markTeamAsCompeted: (teamId: string) => void;
  resetQuestionsAnswered: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Helper function to save teams to localStorage
const saveTeamsToLocalStorage = (teams: Team[]) => {
  try {
    localStorage.setItem("gameTeams", JSON.stringify(teams));
  } catch (error) {
    console.error("Error saving teams to localStorage:", error);
  }
};

// Helper function to save game state to localStorage
const saveGameStateToLocalStorage = (
  gameState: GameState,
  currentRound: number,
  advancingTeamIds: string[]
) => {
  try {
    localStorage.setItem(
      "gameState",
      JSON.stringify({
        gameState,
        currentRound,
        advancingTeamIds,
      })
    );
  } catch (error) {
    console.error("Error saving game state to localStorage:", error);
  }
};

// Helper function to get game state from localStorage
const getGameStateFromLocalStorage = () => {
  try {
    const stateString = localStorage.getItem("gameState");
    if (stateString) {
      return JSON.parse(stateString);
    }
    return null;
  } catch (error) {
    console.error("Error getting game state from localStorage:", error);
    return null;
  }
};

// Helper function to get teams from localStorage
const getTeamsFromLocalStorage = (): Team[] | null => {
  try {
    const teamsString = localStorage.getItem("gameTeams");
    if (teamsString) {
      return JSON.parse(teamsString);
    }
    return null;
  } catch (error) {
    console.error("Error getting teams from localStorage:", error);
    return null;
  }
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [teams, setTeamsState] = useState<Team[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameState, setGameState] = useState<GameState>("setup");
  const [currentTeams, setCurrentTeams] = useState<[string, string] | null>(
    null
  );
  const [questions, setQuestions] = useState<Question[]>(
    dummyQuestions.map((q) => ({ ...q, used: false }))
  );
  const [extraQuestions, setExtraQuestions] = useState<Question[]>(
    extraQuestionsData.map((q) => ({ ...q, used: false }))
  );
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timer, setTimer] = useState(100);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [teamsCompeted, setTeamsCompeted] = useState<string[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [roundQuestionsRequired, setRoundQuestionsRequired] = useState(5); // Default for round 1
  const [currentTeamPair, setCurrentTeamPair] = useState<number>(0);
  const [advancingTeamIds, setAdvancingTeamIds] = useState<string[]>([]);
  const router = useRouter();
  // Load teams and game state from localStorage on initial render
  useEffect(() => {
    const savedTeams = getTeamsFromLocalStorage();
    const savedGameState = getGameStateFromLocalStorage();

    if (savedTeams && savedTeams.length > 0) {
      setTeamsState(savedTeams);
    }

    if (savedGameState) {
      setGameState(savedGameState.gameState);
      setCurrentRound(savedGameState.currentRound);
      setAdvancingTeamIds(savedGameState.advancingTeamIds || []);

      // Set the round questions required based on the current round
      if (savedGameState.currentRound === 1) {
        setRoundQuestionsRequired(1);
      } else if (savedGameState.currentRound === 2) {
        setRoundQuestionsRequired(2);
      } else if (savedGameState.currentRound === 3) {
        setRoundQuestionsRequired(3);
      }

      // If we're in round 2 or 3, ensure we're showing only the advancing teams
      if (
        savedGameState.gameState !== "setup" &&
        savedGameState.advancingTeamIds?.length > 0
      ) {
        const activeTeams =
          savedTeams?.filter((team) =>
            savedGameState.advancingTeamIds.includes(team.id)
          ) || [];

        if (activeTeams.length > 0) {
          setTeamsState(activeTeams);
        }
      }
    }
  }, []);

  // Custom setTeams function that also updates localStorage
  const setTeams = (newTeams: Team[]) => {
    setTeamsState(newTeams);
    saveTeamsToLocalStorage(newTeams);
  };

  const startGame = () => {
    setGameState("round1");
    setCurrentRound(1);
    setRoundQuestionsRequired(1); // Only 1 question for round 1
    setCurrentTeamPair(0);

    // Reset all state for a new game
    setTeamsCompeted([]);
    setQuestionsAnswered(0);
    setCurrentQuestion(questions[0]);
    setCurrentTeams(null);
    setAdvancingTeamIds([]);

    // Reset all questions as unused
    setQuestions(questions.map((q) => ({ ...q, used: false })));
    setExtraQuestions(extraQuestions.map((q) => ({ ...q, used: false })));

    // Save game state to localStorage
    saveGameStateToLocalStorage("round1", 1, []);
  };

  const selectTeamsForQuestion = (teamIds: [string, string]) => {
    setCurrentTeams(teamIds);

    // Select a random question that hasn't been used yet
    const unusedQuestions = questions.filter((q) => !q.used);
    if (unusedQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
      const selectedQuestion = unusedQuestions[randomIndex];
      setCurrentQuestion(selectedQuestion);

      // Mark question as used
      setQuestions(
        questions.map((q) =>
          q.id === selectedQuestion.id ? { ...q, used: true } : q
        )
      );
    }
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setTimer(100);
  };

  const addScore = (teamId: string, score: number) => {
    const updatedTeams = teams.map((team) =>
      team.id === teamId ? { ...team, score: team.score + score } : team
    );
    setTeams(updatedTeams); // This will also save to localStorage
  };

  const nextQuestion = () => {
    const nextIndex = questionsAnswered + 1;
    if (nextIndex < roundQuestionsRequired) {
      setQuestionsAnswered(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
    } else {
      setCurrentQuestion(null); // No more questions
    }
  };

  const markTeamAsCompeted = (teamId: string) => {
    if (!teamsCompeted.includes(teamId)) {
      setTeamsCompeted((prev) => [...prev, teamId]);
    }
  };

  const resetQuestionsAnswered = () => {
    setQuestionsAnswered(0);
  };

  const showResults = () => {
    setCurrentQuestion(null);
    setCurrentTeams(null);
    setQuestionsAnswered(0);

    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    console.log("Sorted teams for results:", sortedTeams);

    // Set advancing teams based on current round
    let newAdvancingIds: string[] = [];

    if (currentRound === 1) {
      // Top 4 teams advance to round 2
      newAdvancingIds = sortedTeams
        .slice(0, Math.min(4, sortedTeams.length))
        .map((team) => team.id);
      console.log("Teams advancing to round 2:", newAdvancingIds);
    } else if (currentRound === 2) {
      // Top 2 teams advance to finals
      newAdvancingIds = sortedTeams
        .slice(0, Math.min(2, sortedTeams.length))
        .map((team) => team.id);
      console.log("Teams advancing to finals:", newAdvancingIds);
    } else if (currentRound === 3) {
      // Winner of final round
      const winnerId = sortedTeams[0]?.id;
      newAdvancingIds = winnerId ? [winnerId] : [];
      console.log("Winner:", newAdvancingIds);
    }

    // Directly store to localStorage to ensure it persists
    localStorage.setItem("advancingTeamIds", JSON.stringify(newAdvancingIds));

    // Update state
    setAdvancingTeamIds(newAdvancingIds);

    return sortedTeams;
  };

  const advanceToNextRound = () => {
    // Get the advancing team IDs directly from localStorage as a fallback
    const storedAdvancingIds = JSON.parse(
      localStorage.getItem("advancingTeamIds") || "[]"
    );
    const teamIdsToUse =
      advancingTeamIds.length > 0 ? advancingTeamIds : storedAdvancingIds;

    console.log("Advancing to next round from", currentRound);
    console.log("Current advancing team IDs:", teamIdsToUse);

    if (teamIdsToUse.length === 0) {
      console.error("No advancing teams found! This is a critical error.");
      alert(
        "Error: No teams selected to advance to next round. Please try again."
      );
      return;
    }

    const nextRound = currentRound + 1;

    // Determine the new game state based on the next round
    let newGameState: GameState = "setup";
    if (nextRound === 2) {
      newGameState = "round2";
    } else if (nextRound === 3) {
      newGameState = "round3";
    } else if (nextRound > 3) {
      newGameState = "finished";
    }

    // Get all teams from localStorage
    const allTeams = getTeamsFromLocalStorage() || [];

    // Filter teams to keep only advancing teams
    const advancingTeams = allTeams.filter((team) =>
      teamIdsToUse.includes(team.id)
    );
    console.log("Teams advancing to next round:", advancingTeams);

    if (advancingTeams.length === 0) {
      console.error(
        "No advancing teams found after filtering! Check team IDs:",
        teamIdsToUse
      );
      console.error(
        "Available teams:",
        allTeams.map((t) => `${t.id}: ${t.name}`)
      );
      alert(
        "Error: Could not find advancing teams. Please check console for details."
      );
      return;
    }

    if (newGameState === "round3") {
      router.refresh();
    }

    // First update the specific states that matter for the next render
    setCurrentRound(nextRound);
    setGameState(newGameState);
    setAdvancingTeamIds(teamIdsToUse);

    // Then update the teams state
    setTeamsState(advancingTeams);

    // Set questions required for next round
    if (newGameState === "round2") {
      setRoundQuestionsRequired(2);
    } else if (newGameState === "round3") {
      setRoundQuestionsRequired(3);
    }

    // Reset other state for new round
    resetTimer();
    setCurrentQuestion(null);
    setCurrentTeams(null);
    setTeamsCompeted([]);
    resetQuestionsAnswered();
    setCurrentTeamPair(0);

    const advance_id = localStorage.getItem("advancingTeamIds");

    // Save the game state after all state updates
    saveGameStateToLocalStorage(
      newGameState,
      nextRound,
      JSON.parse(advance_id)
    );

    // Save all teams to localStorage to preserve eliminated teams
    // saveTeamsToLocalStorage(allTeams);

    console.log("Advanced to round", nextRound, "with state", newGameState);
    console.log("Teams for next round:", advancingTeams);
  };

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

        markTeamAsCompeted,
        resetQuestionsAnswered,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
