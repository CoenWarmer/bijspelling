import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import classNames from 'classnames';

import { api } from '~/utils/api';
import styles from './index.module.css';

export const Game = () => {
  const date = Date.now();
  const { data: game } = api.game.getGameByDate.useQuery({ date: new Date('2023-02-26') });
  const { data: userGame } = api.game.getUserGameByGameId.useQuery(
    { gameId: game?.id },
    { enabled: game?.id !== undefined }
  );
  const { mutateAsync: postWord } = api.game.postWord.useMutation();

  const [stateInput, setStateInput] = useState('');
  const [stateLetters, setStateLetters] = useState<string[] | undefined>();

  const [stateScore, setStateScore] = useState(0);
  const [stateWords, setStateWords] = useState<string[]>([]);

  const centerLetter = game?.centerLetter;
  const letters = game?.letters;

  const score = userGame?.score;
  const words = userGame?.words;

  useEffect(() => {
    if (letters && !stateLetters) {
      setStateLetters(letters);
    }

    if (words && words?.length > stateWords.length) {
      setStateWords(words);
    }

    if (score && stateScore !== score) {
      setStateScore(score);
    }
  }, [letters, score, stateLetters, stateScore, stateWords.length, words]);

  const handleSelectLetter = (letter: string) => {
    setStateInput(`${stateInput}${letter}`);
  };

  const handleShuffle = () => {
    const newLetters = stateLetters?.sort(() => (Math.random() > 0.5 ? 1 : -1));

    setStateLetters(newLetters);
  };

  const handleDelete = () => {
    setStateInput('');
  };

  const handleSubmit = async () => {
    try {
      const { status, score } = await postWord({ word: stateInput });

      if (score) {
        setStateScore(score);
      }

      if (status === 'ok') {
        setStateInput('');
      }
    } catch (error) {}
  };

  return (
    <Container>
      <div>{stateInput}</div>

      <LetterContainer>
        <CenterLetterContainer>
          {centerLetter && (
            <Letter isCenterLetter letter={centerLetter} onClick={handleSelectLetter} />
          )}
        </CenterLetterContainer>

        {stateLetters?.map((letter, index) => (
          <Letter
            key={letter}
            position={index + 1}
            isCenterLetter={false}
            letter={letter}
            onClick={handleSelectLetter}
          />
        ))}
      </LetterContainer>

      <Actions>
        <button className={styles.loginButton} onClick={handleDelete}>
          Delete
        </button>

        <button className={styles.loginButton} onClick={handleShuffle}>
          Husselen
        </button>

        <button className={styles.loginButton} onClick={handleSubmit}>
          Enter
        </button>
      </Actions>
    </Container>
  );
};

interface LetterProps {
  letter: string;
  isCenterLetter: boolean;
  position?: number;
  onClick: (letter: string) => void;
}

const Letter = ({ letter, isCenterLetter, position, onClick }: LetterProps) => {
  const classes = classNames({
    'position-center': isCenterLetter,
    ...(position && { [`position-${position}`]: true }),
  });

  const handleSelect = () => {
    onClick(letter);
  };

  return (
    <LetterButton className={classes} onClick={handleSelect}>
      {letter}
    </LetterButton>
  );
};

const Container = styled.div`
  display: flex;
  max-width: 500px;
  width: 100%;
  flex-direction: column;
  align-items: center;
`;

const LetterContainer = styled.div`
  display: flex;
  position: relative;
  height: 250px;
`;

const CenterLetterContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -25px;
  margin-top: -25px;
`;

const Actions = styled.div`
  display: flex;
`;

const LetterButton = styled.button`
  display: flex;
  position: absolute;
  width: 50px;
  height: 50px;
  padding: 0;
  border-radius: 100%;
  justify-content: center;
  align-items: center;
  margin-left: -25px;
  border: solid 0 #000;
  font-weight: bold;
  font-size: 14px;

  &.position-center {
    top: -37px;
    left: 25px;
    background: yellow;
  }

  &.position-1 {
    top: 5px;
    left: 0px;
  }

  &.position-2 {
    top: 35px;
    left: 47px;
  }

  &.position-3 {
    top: 90px;
    left: 47px;
  }

  &.position-4 {
    top: 120px;
    left: 0px;
  }

  &.position-5 {
    top: 90px;
    left: -47px;
  }

  &.position-6 {
    top: 35px;
    left: -47px;
  }
`;
