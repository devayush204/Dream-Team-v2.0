"use client";

import { motion } from "framer-motion";
import { useGame } from "./game-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoundIntro() {
  const { currentRound, teams, roundQuestionsRequired } = useGame();

  const router = useRouter();

  useEffect(() => {
    console.log("imp log to render");
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2 className="text-5xl font-bold mb-8 text-yellow-400">
        Round {currentRound}
      </h2>

      <div className="mb-8">
        <p className="text-xl">
          Each team will answer {roundQuestionsRequired} questions
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {teams.map((team) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-blue-800 p-4 rounded-lg"
          >
            <h3 className="font-bold text-lg">{team.name}</h3>
            <p className="text-yellow-400 text-xl">{team.score} pts</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
