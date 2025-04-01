"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGame } from "./game-provider";
import { v4 as uuidv4 } from "uuid";

export default function TeamSetup() {
  const { setTeams, startGame } = useGame();
  const [teamNames, setTeamNames] = useState<string[]>(Array(8).fill(""));
  const [error, setError] = useState("");

  useEffect(() => {
    const savedTeams = localStorage.getItem("gameTeams");
    if (savedTeams) {
      try {
        const parsedTeams = JSON.parse(savedTeams);
        const savedTeamNames = parsedTeams.map(
          (team: { name: string }) => team.name
        );

        if (savedTeamNames.length >= 8) {
          setTeamNames(savedTeamNames);
        } else {
          const newTeamNames = [
            ...savedTeamNames,
            ...Array(8 - savedTeamNames.length).fill(""),
          ];
          setTeamNames(newTeamNames);
        }
      } catch (e) {
        console.error("Error parsing saved teams:", e);
      }
    }
  }, []);

  const handleTeamNameChange = (index: number, value: string) => {
    const newTeamNames = [...teamNames];
    newTeamNames[index] = value;
    setTeamNames(newTeamNames);
  };

  const addTeamInput = () => {
    if (teamNames.length < 10) {
      setTeamNames([...teamNames, ""]);
    }
  };

  const removeTeamInput = (index: number) => {
    if (teamNames.length > 8) {
      const newTeamNames = [...teamNames];
      newTeamNames.splice(index, 1);
      setTeamNames(newTeamNames);
    }
  };

  const resetTeams = () => {
    localStorage.removeItem("gameTeams");
    setTeamNames(Array(8).fill(""));
    setError("");
  };

  const handleStartGame = () => {
    const filledTeamNames = teamNames.filter((name) => name.trim() !== "");

    if (filledTeamNames.length < 8) {
      setError("Please enter at least 8 team names");
      return;
    }

    const teamObjects = filledTeamNames.map((name) => ({
      id: uuidv4(),
      name: name.trim(),
      score: 0,
    }));

    // Save to localStorage
    localStorage.setItem("gameTeams", JSON.stringify(teamObjects));

    setTeams(teamObjects);
    startGame();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-3xl mx-auto bg-blue-800 text-white border-blue-600">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-center text-2xl">
            Enter Team Names
          </CardTitle>
          <Button
            variant="ghost"
            onClick={resetTeams}
            className="text-red-300 hover:text-red-100 hover:bg-red-900/30"
          >
            Reset Teams
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamNames.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  {index + 1}
                </div>
                <Input
                  value={name}
                  onChange={(e) => handleTeamNameChange(index, e.target.value)}
                  placeholder={`Team ${index + 1} name`}
                  className="flex-1 bg-blue-700 border-blue-600 text-white placeholder:text-blue-300"
                />
                {teamNames.length > 8 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeamInput(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}

            {teamNames.length < 10 && (
              <Button
                variant="outline"
                onClick={addTeamInput}
                className="w-full border-dashed border-blue-500 text-blue-300 hover:bg-blue-700/50"
              >
                + Add Team
              </Button>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleStartGame}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold"
            size="lg"
          >
            Start Game
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
