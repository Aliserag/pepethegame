import { useState, useEffect } from "react";

export default function useScores(userId: string) {
  const [totalScore, setTotalScore] = useState(0);
  const [topScore, setTopScore] = useState(0);

  useEffect(() => {
    loadScores();
  }, [userId]);

  function loadScores() {
    try {
      const key = `flowpepe_scores_${userId}`;
      const storedData = localStorage.getItem(key);

      if (storedData) {
        const scores = JSON.parse(storedData);
        setTotalScore(scores.totalScore || 0);
        setTopScore(scores.topScore || 0);
      } else {
        setTotalScore(0);
        setTopScore(0);
      }
    } catch (error) {
      console.error("Error loading scores:", error);
      setTotalScore(0);
      setTopScore(0);
    }
  }

  function saveScore(score: number) {
    try {
      const key = `flowpepe_scores_${userId}`;
      const newTotalScore = totalScore + score;
      const newTopScore = Math.max(topScore, score);

      const scoresData = {
        totalScore: newTotalScore,
        topScore: newTopScore,
        lastPlayed: new Date().toISOString(),
      };

      localStorage.setItem(key, JSON.stringify(scoresData));

      setTotalScore(newTotalScore);
      setTopScore(newTopScore);
    } catch (error) {
      console.error("Error saving score:", error);
    }
  }

  return { totalScore, topScore, saveScore };
}
