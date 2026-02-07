
import React, { useState, useEffect } from 'react';
import CalculatorForm from './components/CalculatorForm';
import ResultsDashboard from './components/ResultsDashboard';
import InfoSection from './components/InfoSection';
import { SimulationParams, CalculationResult, SummaryData } from './types';
import { calculateCompoundInterest } from './utils';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [params, setParams] = useState<SimulationParams>({
    initialValue: 5000,
    monthlyValue: 500,
    interestRate: 11.5,
    rateType: 'annual',
    period: 5,
    periodType: 'years',
  });

  const [results, setResults] = useState<CalculationResult[] | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Pequeno delay artificial para melhorar a percepção do feedback visual do usuário
    await new Promise(resolve => setTimeout(resolve, 800));

    const data = calculateCompoundInterest(params);
    setResults(data);
    
    const lastResult = data[data.length - 1];
    setSummary({
      totalFinal: lastResult.totalAccumulated,
      totalInvested: lastResult.totalInvested,
      totalInterest: lastResult.totalInterest,
      totalTax: lastResult.taxPaid,
      netTotal: lastResult.netAccumulated,
    });
    
    setIsCalculating(false);
  };

  const handleClear = () => {
    setParams({
      initialValue: 0,
      monthlyValue: 0,
      interestRate: 0,
      rateType: 'annual',
      period: 0,
      periodType: 'years',
    });
    setResults(null);
    setSummary(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col items-center relative no-print">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="absolute right-0 top-0 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:ring-2 ring-red-500 transition-all shadow-sm group"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M17.657 17.657l.707.707M6.343 6.343l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 group-hover:-rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter">
            Invest<span className="text-red-700">Smart</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-semibold text-center uppercase text-[10px] tracking-[0.2em]">Simulador de Evolução Patrimonial</p>
        </header>

        <main className="space-y-10">
          <div className="no-print">
            <CalculatorForm 
              params={params} 
              setParams={setParams} 
              onCalculate={handleCalculate} 
              onClear={handleClear} 
              darkMode={darkMode}
              isCalculating={isCalculating}
            />
          </div>

          {results && summary && !isCalculating ? (
            <ResultsDashboard results={results} summary={summary} darkMode={darkMode} params={params} />
          ) : isCalculating ? (
            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-100 dark:border-red-900/20 shadow-sm no-print">
              <div className="mx-auto w-20 h-20 flex items-center justify-center mb-6">
                <div className="w-12 h-12 border-4 border-red-200 border-t-red-700 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Processando projeção...</h3>
              <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium">Estamos calculando a mágica dos juros para você.</p>
            </div>
          ) : (
            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm transition-colors no-print">
              <div className="mx-auto w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-colors">
                <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Pronto para começar?</h3>
              <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium max-w-xs mx-auto">Insira seus dados acima e veja a mágica dos juros compostos acontecer.</p>
            </div>
          )}

          <div className="no-print">
            <InfoSection darkMode={darkMode} />
          </div>
        </main>

        <footer className="mt-20 py-10 border-t border-slate-100 dark:border-slate-900 text-center text-slate-400 dark:text-slate-600 text-xs no-print">
          <p className="font-bold tracking-widest uppercase mb-2">InvestSmart Simulator</p>
          <p>© {new Date().getFullYear()} — Ferramenta Educativa de Planejamento Financeiro.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
