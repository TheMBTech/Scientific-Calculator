import React, { useState, useEffect } from 'react';
import { Calculator, Atom, RotateCcw, Equal, History, Brain, Trash2 } from 'lucide-react';

type HistoryEntry = {
  expression: string;
  result: string;
  timestamp: Date;
};

function App() {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [shift, setShift] = useState(false);

  const scientificOperations = {
    'sin': (n: number) => angleMode === 'DEG' ? Math.sin(n * Math.PI / 180) : Math.sin(n),
    'cos': (n: number) => angleMode === 'DEG' ? Math.cos(n * Math.PI / 180) : Math.cos(n),
    'tan': (n: number) => angleMode === 'DEG' ? Math.tan(n * Math.PI / 180) : Math.tan(n),
    'asin': (n: number) => angleMode === 'DEG' ? (Math.asin(n) * 180 / Math.PI) : Math.asin(n),
    'acos': (n: number) => angleMode === 'DEG' ? (Math.acos(n) * 180 / Math.PI) : Math.acos(n),
    'atan': (n: number) => angleMode === 'DEG' ? (Math.atan(n) * 180 / Math.PI) : Math.atan(n),
    'log': Math.log10,
    'ln': Math.log,
    'exp': Math.exp,
    'sqrt': Math.sqrt,
    'cbrt': Math.cbrt,
    'x²': (n: number) => Math.pow(n, 2),
    'x³': (n: number) => Math.pow(n, 3),
    '1/x': (n: number) => 1 / n,
    'abs': Math.abs,
    'fact': (n: number) => {
      if (n < 0) return NaN;
      if (n === 0) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    },
    'π': () => Math.PI,
    'e': () => Math.E,
  };

  const memoryOperations = {
    'MC': () => setMemory(0),
    'MR': () => {
      setDisplay(memory.toString());
      setNewNumber(true);
    },
    'M+': () => setMemory(memory + parseFloat(display)),
    'M-': () => setMemory(memory - parseFloat(display)),
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        handleNumber(e.key);
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        handleOperation(e.key);
      } else if (e.key === 'Enter') {
        calculate();
      } else if (e.key === 'Escape') {
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, memory, lastOperation]);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    calculate();
    setLastOperation(op);
    setMemory(parseFloat(display));
    setNewNumber(true);
  };

  const handleScientific = (op: keyof typeof scientificOperations) => {
    const input = parseFloat(display);
    let result: number;
    
    if (op === 'π' || op === 'e') {
      result = scientificOperations[op]();
    } else {
      result = scientificOperations[op](input);
    }

    if (isNaN(result) || !isFinite(result)) {
      setDisplay('Error');
    } else {
      setDisplay(result.toString());
    }
    setNewNumber(true);
    
    addToHistory(`${op}(${display})`, result.toString());
  };

  const calculate = () => {
    if (!lastOperation) return;
    
    const current = parseFloat(display);
    const prev = memory;
    let result = 0;

    switch (lastOperation) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/': result = prev / current; break;
      case 'pow': result = Math.pow(prev, current); break;
    }

    const expression = `${prev} ${lastOperation} ${current}`;
    addToHistory(expression, result.toString());

    setDisplay(result.toString());
    setNewNumber(true);
    setLastOperation(null);
  };

  const clear = () => {
    setDisplay('0');
    setMemory(0);
    setLastOperation(null);
    setNewNumber(true);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const addToHistory = (expression: string, result: string) => {
    setHistory(prev => [{
      expression,
      result,
      timestamp: new Date()
    }, ...prev.slice(0, 9)]);
  };

  const toggleAngleMode = () => {
    setAngleMode(prev => prev === 'DEG' ? 'RAD' : 'DEG');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-4xl border border-cyan-500/30 flex gap-4">
        {/* Calculator Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-cyan-400">Quantum Calc</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleAngleMode}
                className="px-2 py-1 text-sm rounded bg-gray-700 text-cyan-400 hover:bg-gray-600"
              >
                {angleMode}
              </button>
              <Atom className="w-6 h-6 text-cyan-400 animate-spin-slow" />
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-xl mb-6 border border-cyan-500/20">
            <div className="text-right mb-2">
              <span className="text-sm text-cyan-400/60">
                {memory !== 0 && `M: ${memory}`}
              </span>
            </div>
            <input
              type="text"
              className="w-full bg-transparent text-right text-3xl font-mono text-cyan-400 outline-none"
              value={display}
              readOnly
            />
          </div>

          <div className="grid grid-cols-5 gap-2">
            {/* Memory Operations */}
            <button onClick={() => memoryOperations['MC']()} className="btn-mem">MC</button>
            <button onClick={() => memoryOperations['MR']()} className="btn-mem">MR</button>
            <button onClick={() => memoryOperations['M+']()} className="btn-mem">M+</button>
            <button onClick={() => memoryOperations['M-']()} className="btn-mem">M-</button>
            <button onClick={() => setShift(!shift)} className={`btn-shift ${shift ? 'active' : ''}`}>
              SHIFT
            </button>

            {/* Scientific Operations - First Row */}
            <button onClick={() => handleScientific(shift ? 'asin' : 'sin')} className="btn-sci">
              {shift ? 'asin' : 'sin'}
            </button>
            <button onClick={() => handleScientific(shift ? 'acos' : 'cos')} className="btn-sci">
              {shift ? 'acos' : 'cos'}
            </button>
            <button onClick={() => handleScientific(shift ? 'atan' : 'tan')} className="btn-sci">
              {shift ? 'atan' : 'tan'}
            </button>
            <button onClick={() => handleScientific('log')} className="btn-sci">log</button>
            <button onClick={() => handleScientific('ln')} className="btn-sci">ln</button>

            {/* Scientific Operations - Second Row */}
            <button onClick={() => handleScientific('sqrt')} className="btn-sci">√</button>
            <button onClick={() => handleScientific('cbrt')} className="btn-sci">∛</button>
            <button onClick={() => handleScientific('x²')} className="btn-sci">x²</button>
            <button onClick={() => handleScientific('x³')} className="btn-sci">x³</button>
            <button onClick={() => handleScientific('1/x')} className="btn-sci">1/x</button>

            {/* Constants and Special Functions */}
            <button onClick={() => handleScientific('π')} className="btn-sci">π</button>
            <button onClick={() => handleScientific('e')} className="btn-sci">e</button>
            <button onClick={() => handleScientific('abs')} className="btn-sci">|x|</button>
            <button onClick={() => handleScientific('fact')} className="btn-sci">n!</button>
            <button onClick={() => handleScientific('exp')} className="btn-sci">exp</button>

            {/* Numbers and Basic Operations */}
            <button onClick={() => handleNumber('7')} className="btn-num">7</button>
            <button onClick={() => handleNumber('8')} className="btn-num">8</button>
            <button onClick={() => handleNumber('9')} className="btn-num">9</button>
            <button onClick={() => handleOperation('/')} className="btn-op col-span-2">÷</button>

            <button onClick={() => handleNumber('4')} className="btn-num">4</button>
            <button onClick={() => handleNumber('5')} className="btn-num">5</button>
            <button onClick={() => handleNumber('6')} className="btn-num">6</button>
            <button onClick={() => handleOperation('*')} className="btn-op col-span-2">×</button>

            <button onClick={() => handleNumber('1')} className="btn-num">1</button>
            <button onClick={() => handleNumber('2')} className="btn-num">2</button>
            <button onClick={() => handleNumber('3')} className="btn-num">3</button>
            <button onClick={() => handleOperation('-')} className="btn-op col-span-2">-</button>

            <button onClick={() => handleNumber('0')} className="btn-num col-span-2">0</button>
            <button onClick={() => handleNumber('.')} className="btn-num">.</button>
            <button onClick={() => handleOperation('+')} className="btn-op col-span-2">+</button>

            {/* Clear and Calculate */}
            <button onClick={clear} className="btn-clear col-span-2">
              <RotateCcw className="w-5 h-5 mr-2" />
              Clear
            </button>
            <button onClick={calculate} className="btn-eq col-span-3">
              <Equal className="w-5 h-5 mr-2" />
              Calculate
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="w-80 bg-gray-900 p-4 rounded-xl border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <History className="w-5 h-5" />
              <h2 className="font-semibold">History</h2>
            </div>
            <button 
              onClick={clearHistory}
              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {history.map((entry, index) => (
              <div 
                key={index}
                className="p-2 bg-gray-800 rounded border border-gray-700 hover:border-cyan-500/30 transition-colors"
              >
                <div className="text-sm text-gray-400">{entry.expression}</div>
                <div className="text-lg text-cyan-400">{entry.result}</div>
                <div className="text-xs text-gray-500">
                  {entry.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No calculations yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;