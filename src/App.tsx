import { useState, useRef } from 'react';

const SIZE = 8;

export default function App() {
  const [solutions, setSolutions] = useState<number[][]>([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(100);
  const [statusText, setStatusText] = useState<string>("「スタート」を押すと解析を開始します");

  const currentBoardRef = useRef<number[]>(new Array(SIZE).fill(-1));
  const timerIdRef = useRef<number | null>(null);

  const [, setTick] = useState<number>(0);
  const rerender = () => setTick(t => t + 1);

  // 配置チェックロジック
  const isValid = (board: number[], row: number, col: number): boolean => {
    for (let i = 0; i < row; i++) {
      const placedCol = board[i];
      if (placedCol === col) return false;
      if (Math.abs(row - i) === Math.abs(col - placedCol)) return false;
    }
    return true;
  };

  // 💡 絵文字を「nextStep」に修正しました！
  const nextStep = (foundSolutions: number[][]) => {
    let board = currentBoardRef.current;
    
    let row = 0;
    while (row < SIZE && board[row] !== -1) {
      row++;
    }

    if (row === SIZE) {
      row = SIZE - 1;
    }

    let col = board[row] + 1;

    while (row >= 0) {
      while (col < SIZE) {
        board[row] = col;
        if (isValid(board, row, col)) {
          if (row === SIZE - 1) {
            const solution = [...board];
            foundSolutions.push(solution);
            setSolutions([...foundSolutions]);
            setStatusText(`🎉 解を発見！ (合計: ${foundSolutions.length} 個)`);
            rerender();
            return;
          }
          setStatusText(`${row + 1}行目・${col + 1}列目に配置して探索中...`);
          rerender();
          return; 
        }
        col++;
      }
      
      setStatusText(`${row + 1}行目は配置不可（戻ります）`);
      board[row] = -1;
      row--;
      if (row >= 0) {
        col = board[row] + 1;
      }
    }

    if (timerIdRef.current) clearInterval(timerIdRef.current);
    setIsRunning(false);
    setStatusText(`探索完了！ すべての解（${foundSolutions.length}個）を見つけました。`);
    rerender();
  };

  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setSolutions([]);
    setCurrentSolutionIndex(-1);
    currentBoardRef.current = new Array(SIZE).fill(-1);
    
    const foundSolutions: number[][] = [];

    // 💡 ここも「nextStep」に修正しました！
    timerIdRef.current = window.setInterval(() => {
      nextStep(foundSolutions);
    }, speed);
  };

  const stopSimulation = () => {
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    setIsRunning(false);
    setStatusText("一時停止しました。");
  };

  const resetSimulation = () => {
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    setIsRunning(false);
    currentBoardRef.current = new Array(SIZE).fill(-1);
    setSolutions([]);
    setCurrentSolutionIndex(-1);
    setStatusText("リセットしました。");
    rerender();
  };

  const viewSolution = (index: number) => {
    if (isRunning) return;
    setCurrentSolutionIndex(index);
    currentBoardRef.current = [...solutions[index]];
    setStatusText(`過去の解パターン ${index + 1} を表示中`);
    rerender();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2>👑 エイト・クイーン・ビジュアライザー</h2>
      
      <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontWeight: 'bold' }}>
        {statusText}
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={startSimulation} disabled={isRunning} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>スタート</button>
        <button onClick={stopSimulation} disabled={!isRunning} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>ストップ</button>
        <button onClick={resetSimulation} style={{ padding: '8px 16px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>リセット</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 50px)`, width: '400px', border: '2px solid #333', margin: '0 auto' }}>
        {Array.from({ length: SIZE }).map((_, row) => (
          Array.from({ length: SIZE }).map((_, col) => {
            const isDark = (row + col) % 2 === 1;
            const hasQueen = currentBoardRef.current[row] === col;
            return (
              <div key={`${row}-${col}`} style={{ width: '50px', height: '50px', backgroundColor: isDark ? '#b58863' : '#f0d9b5', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
                {hasQueen && '👑'}
              </div>
            );
          })
        ))}
      </div>

      {solutions.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>見つかった解のリスト ({solutions.length}個)</h3>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxHeight: '100px', overflowY: 'auto', padding: '5px', border: '1px solid #ccc' }}>
            {solutions.map((_, index) => (
              <button key={index} onClick={() => viewSolution(index)} disabled={isRunning} style={{ padding: '5px 10px', backgroundColor: currentSolutionIndex === index ? '#2196F3' : '#e7e7e7', color: currentSolutionIndex === index ? 'white' : 'black', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                #{index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}