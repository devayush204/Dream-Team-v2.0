"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGame } from "./game-provider";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Star, Check, ArrowRight, Award } from "lucide-react";

type Props = {
  onClose?: () => void;
};

export default function ResultsDisplay({ onClose }: Props) {
  const {
    teams,
    currentRound,
    advanceToNextRound,
    teamsCompeted,
    showResults,
    advancingTeamIds,
    gameState,
  } = useGame();

  // Check if all teams have competed in this round
  const allTeamsCompeted =
    teams.length > 0 &&
    teamsCompeted.length >= Math.floor(teams.length / 2) * 2;

  const getTeamStatus = (teamId: string, index: number) => {
    if (!allTeamsCompeted) {
      return {
        status: "Current Score",
        bgColor: "bg-blue-700",
        borderColor: "border-blue-600",
        textColor: "text-white",
        icon: null,
      };
    }

    // Round 1: Top 4 teams advance
    if (currentRound === 1) {
      const isAdvancing = index < 4;
      return {
        status: isAdvancing ? "Advancing to Round 2!" : "Eliminated",
        bgColor: isAdvancing ? "bg-green-600" : "bg-red-700",
        borderColor: isAdvancing ? "border-green-500" : "border-red-600",
        textColor: "text-white",
        icon: isAdvancing ? <Check className="h-5 w-5 text-white" /> : null,
      };
    }

    // Round 2: Top 2 teams advance
    if (currentRound === 2) {
      const isAdvancing = index < 2;
      return {
        status: isAdvancing ? "Advancing to Finals!" : "Eliminated",
        bgColor: isAdvancing ? "bg-green-600" : "bg-red-700",
        borderColor: isAdvancing ? "border-green-500" : "border-red-600",
        textColor: "text-white",
        icon: isAdvancing ? (
          <Trophy className="h-5 w-5 text-yellow-300" />
        ) : null,
      };
    }

    // Round 3: Final results with winner
    if (currentRound === 3) {
      if (index === 0) {
        return {
          status: "Champion!",
          bgColor: "bg-yellow-500",
          borderColor: "border-yellow-400",
          textColor: "text-blue-900",
          icon: <Trophy className="h-6 w-6 text-yellow-300" />,
        };
      }
      if (index === 1) {
        return {
          status: "Runner Up",
          bgColor: "bg-red-700",
          borderColor: "border-red-600",
          textColor: "text-white",
          icon: <Award className="h-5 w-5 text-silver" />,
        };
      }
      if (index === 2) {
        return {
          status: "Third Place",
          bgColor: "bg-red-700",
          borderColor: "border-red-600",
          textColor: "text-white",
          icon: <Award className="h-5 w-5 text-amber-700" />,
        };
      }
      return {
        status: "Eliminated",
        bgColor: "bg-red-700",
        borderColor: "border-red-600",
        textColor: "text-white",
        icon: null,
      };
    }

    // Default fallback
    const isAdvancing = advancingTeamIds.includes(teamId);
    return {
      status: isAdvancing ? "Advancing!" : "Eliminated",
      bgColor: isAdvancing ? "bg-green-600" : "bg-red-700",
      borderColor: isAdvancing ? "border-green-500" : "border-red-600",
      textColor: "text-white",
      icon: null,
    };
  };

  // Trigger confetti effect
  useEffect(() => {
    if (allTeamsCompeted) {
      // Run confetti for advancing teams or for the winner in the final round
      setTimeout(() => {
        confetti({
          particleCount: currentRound === 3 ? 200 : 100,
          spread: 70,
          origin: { x: 0.5, y: 0.4 },
          colors: ["#FFD700", "#FFA500", "#4299e1", "#48bb78"],
        });
      }, 600);
    }
  }, [allTeamsCompeted, currentRound]);

  const handleAdvance = () => {
    showResults(); // Update the teams that will advance
    advanceToNextRound();
    onClose?.();
  };

  // Title based on current round and state
  const getResultTitle = () => {
    if (!allTeamsCompeted) return "Current Standings";

    if (currentRound === 1) return "Round 1 Results - Top 4 Advance";
    if (currentRound === 2) return "Round 2 Results - Top 2 Advance";
    if (currentRound === 3) return "Final Results";

    return `Round ${currentRound} Results`;
  };

  // Get position label for teams
  const getPositionLabel = (index: number) => {
    if (currentRound === 3 && allTeamsCompeted) {
      if (index === 0) return "1st";
      if (index === 1) return "2nd";
      if (index === 2) return "3rd";
      return `${index + 1}th`;
    }
    return `${index + 1}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-gradient-to-b from-blue-800 to-blue-900 border-blue-600">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-yellow-400">
            {getResultTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...teams]
              .sort((a, b) => b.score - a.score)
              .map((team, index) => {
                const status = getTeamStatus(team.id, index);
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`${status.bgColor} border ${status.borderColor}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center">
                              {getPositionLabel(index)}
                            </div>
                            <h3 className="font-bold text-lg">{team.name}</h3>
                            {status.icon && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: 0.7 + index * 0.1,
                                  type: "spring",
                                }}
                              >
                                {status.icon}
                              </motion.div>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-yellow-400">
                            {team.score} pts
                          </div>
                        </div>
                        {allTeamsCompeted && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className={`mt-2 text-sm ${status.textColor}`}
                          >
                            {status.status}
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
          {allTeamsCompeted && currentRound < 3 ? (
            <Button
              onClick={handleAdvance}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-400 text-blue-900"
            >
              Start Round {currentRound + 1}
            </Button>
          ) : currentRound === 3 && allTeamsCompeted ? (
            <Button
              onClick={onClose}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-400 text-blue-900"
            >
              End Game
            </Button>
          ) : (
            <Button
              onClick={onClose}
              size="lg"
              className="bg-blue-600 hover:bg-blue-500"
            >
              Continue Round {currentRound}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
