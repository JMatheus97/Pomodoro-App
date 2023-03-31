/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useEffect, useCallback } from 'react';
import { useInterval } from '../hooks/use-interval';
import { secondsToTime } from '../utils/seconds-to-time';
import { Button } from './button';
import { Timer } from './timer';

const bellStart = require('../sounds/bell-start.mp3');
const bellFinish = require('../sounds/bell-finish.mp3');

const aduioStartWorking = new Audio(bellStart);
const aduioFinishWorking = new Audio(bellFinish);

interface Props {
  pomodoroTime: number;
  shortRestTime: number;
  LongRestTime: number;
  cycles: number;
}

export function PomodoroTimer(props: Props): JSX.Element {
  const [mainTime, setMainTime] = React.useState(props.pomodoroTime);
  const [timeCounting, setTimeCountig] = React.useState(false);
  const [working, setWorking] = React.useState(false);
  const [resting, setResting] = React.useState(false);
  const [cyclesQtdManger, setCyclesQtdManager] = React.useState(new Array(props.cycles - 1).fill(true));

  const [completedCycles, setCompletedCyles] = React.useState(0);
  const [fullWorkingTime, setFullWorkingTime] = React.useState(0);
  const [numberOfPomodoros, setNumberOfPomodoros] = React.useState(0);

  useInterval(
    () => {
      setMainTime(mainTime - 1);
      if (working) setFullWorkingTime(fullWorkingTime + 1);
    },
    timeCounting ? 1000 : null,
  );

  const configureWork = useCallback(() => {
    setTimeCountig(true);
    setWorking(true);
    setResting(false);
    setMainTime(props.pomodoroTime);
    aduioStartWorking.play();
  }, [setWorking, setTimeCountig, setMainTime, props.pomodoroTime]);

  const configureRest = useCallback(
    (Long: boolean) => {
      setTimeCountig(true);
      setWorking(false);
      setResting(true);
      setMainTime(props.pomodoroTime);

      if (Long) {
        setMainTime(props.LongRestTime);
      } else {
        setMainTime(props.shortRestTime);
      }

      aduioFinishWorking.play();
    },
    [setTimeCountig, setWorking, setResting, setMainTime, props.LongRestTime, props.shortRestTime],
  );

  useEffect(() => {
    if (working) document.body.classList.add('working');
    if (resting) document.body.classList.remove('working');

    if (mainTime > 0) return;

    if (working && cyclesQtdManger.length > 0) {
      configureRest(false);
      cyclesQtdManger.pop();
    } else if (working && cyclesQtdManger.length <= 0) {
      configureRest(true);
      setCyclesQtdManager(new Array(props.cycles - 1).fill(true));
      setCompletedCyles(completedCycles + 1);
    }

    if (working) setNumberOfPomodoros(numberOfPomodoros + 1);
    if (resting) configureWork();
  }, [
    working,
    resting,
    mainTime,
    completedCycles,
    numberOfPomodoros,
    cyclesQtdManger,
    configureRest,
    setCyclesQtdManager,
    configureWork,
    props.cycles,
  ]);

  return (
    <div className="pomodro">
      <h2>Você está: {working ? 'Trabalhando' : 'Descansando'}</h2>
      <Timer mainTime={mainTime}></Timer>
      <div className="controls">
        <Button text="Work" onClick={() => configureWork()}></Button>
        <Button text="Rest" onClick={() => configureRest(false)}></Button>
        <Button
          text={timeCounting ? 'Pause' : 'Play'}
          onClick={() => setTimeCountig(!timeCounting)}
          className={!working && !resting ? 'hidden' : ''}
        ></Button>
      </div>
      <div className="details">
        <p>Ciclos concluídos: {completedCycles}</p>
        <p>Horas trabalhadas: {secondsToTime(fullWorkingTime)}</p>
        <p>Pomodoros concluídos: {numberOfPomodoros}</p>
      </div>
    </div>
  );
}
