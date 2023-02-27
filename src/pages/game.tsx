import styles from './index.module.css';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { api } from '~/utils/api';

const shuffleArray = (array: string[] | undefined) => {
  if (!array) return;

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];

    if (temp) {
      array[i] = array[j];
      array[j] = temp;
    }
  }
  return array;
};

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
      setStateLetters(shuffleArray(letters));
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
    const newLetters = shuffleArray(letters);
    console.log('shuffleArray(letters)', newLetters);
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
      }
    } catch (error) {}
  };

  console.log('stateLetters', stateLetters);

  return (
    <Container>
      <div>{stateInput}</div>

      <LetterContainer>
        <CenterLetterContainer>
          {centerLetter && (
            <Letter letter={centerLetter} isCenterLetter onClick={handleSelectLetter} />
          )}
        </CenterLetterContainer>

        {stateLetters?.map((letter, index) => (
          <Letter key={index} letter={letter} isCenterLetter={false} onClick={handleSelectLetter} />
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
  onClick: (letter: string) => void;
}

const Letter = ({ letter, isCenterLetter, onClick }: LetterProps) => {
  const handleSelect = () => {
    onClick(letter);
  };

  return (
    <LetterButton
      className={isCenterLetter ? 'centerLetterButton' : 'normalLetterButton'}
      onClick={handleSelect}
    >
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
  width: 50px;
  height: 50px;
`;
