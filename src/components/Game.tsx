import React, { useState } from "react";
import styled from "styled-components";
import City from "./City";

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ScoreContainer = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  color: #2c3e50;
`;

const Game: React.FC = () => {
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);

  const handleSniperClick = (sniperId: number) => {
    setScore((prev) => prev + 100);
    setShots((prev) => prev + 1);
  };

  return (
    <GameContainer>
      <City />
    </GameContainer>
  );
};

export default Game;
