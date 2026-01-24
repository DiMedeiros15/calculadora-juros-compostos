import { CalculationResult, SimulationParams } from './types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata um número para string no padrão PT-BR para inputs (sem R$)
 */
export const formatInputNumber = (value: number): string => {
  if (value === 0) return "";
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Converte uma string formatada PT-BR de volta para número (float)
 */
export const parseInputNumber = (value: string): number => {
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

export const calculateCompoundInterest = (params: SimulationParams): CalculationResult[] => {
  const { initialValue, monthlyValue, interestRate, rateType, period, periodType } = params;
  
  const totalMonths = periodType === 'years' ? period * 12 : period;
  
  // Cálculo da taxa mensal equivalente
  const monthlyRate = rateType === 'annual' 
    ? Math.pow(1 + (interestRate / 100), 1 / 12) - 1 
    : interestRate / 100;

  const results: CalculationResult[] = [];
  let currentAccumulated = initialValue;
  let currentTotalInterest = 0;

  for (let m = 0; m < totalMonths; m++) {
    // No Mês 0, o juro incide apenas sobre o valor inicial.
    // Nos meses seguintes, o juro incide sobre o (acumulado anterior + aporte mensal).
    let baseParaJuros = currentAccumulated + (m === 0 ? 0 : monthlyValue);
    
    const juroDoMes = baseParaJuros * monthlyRate;
    currentTotalInterest += juroDoMes;
    currentAccumulated = baseParaJuros + juroDoMes;

    results.push({
      month: m,
      interest: juroDoMes,
      totalInvested: initialValue + (m * monthlyValue),
      totalInterest: currentTotalInterest,
      totalAccumulated: currentAccumulated
    });
  }

  return results;
};