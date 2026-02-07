
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
  if (!value) return 0;
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

/**
 * Retorna a alíquota de Imposto de Renda Regressiva (Brasil - Renda Fixa)
 * Baseada no tempo de permanência em meses (aproximação de 30 dias/mês)
 */
const getTaxRate = (months: number): number => {
  if (months <= 6) return 0.225;   // Até 180 dias: 22,5%
  if (months <= 12) return 0.20;   // 181 a 360 dias: 20%
  if (months <= 24) return 0.175;  // 361 a 720 dias: 17,5%
  return 0.15;                     // Acima de 720 dias: 15%
};

/**
 * Calcula a evolução do patrimônio com juros compostos e provisionamento de IR
 */
export const calculateCompoundInterest = (params: SimulationParams): CalculationResult[] => {
  const { initialValue, monthlyValue, interestRate, rateType, period, periodType } = params;
  
  const totalMonths = periodType === 'years' ? Math.round(period * 12) : Math.round(period);
  
  // Conversão de taxa se necessário (Fórmula de Juros Compostos: (1+i_anual) = (1+i_mensal)^12)
  let monthlyRate = 0;
  if (interestRate > 0) {
    monthlyRate = rateType === 'annual' 
      ? Math.pow(1 + (interestRate / 100), 1 / 12) - 1 
      : interestRate / 100;
  }

  const results: CalculationResult[] = [];
  let currentAccumulated = initialValue;
  let currentTotalInterest = 0;

  for (let m = 1; m <= totalMonths; m++) {
    // Cálculo dos juros do mês sobre o montante acumulado até o momento
    const juroDoMes = currentAccumulated * monthlyRate;
    currentTotalInterest += juroDoMes;
    
    // O aporte mensal ocorre após o cálculo dos juros do mês (padrão conservador)
    currentAccumulated = currentAccumulated + juroDoMes + monthlyValue;

    // Capital investido acumulado (Principal)
    const investedSoFar = initialValue + (m * monthlyValue);
    
    // Lucro Bruto (Base de cálculo para o IR)
    const taxBase = Math.max(0, currentAccumulated - investedSoFar);
    
    // Alíquota regressiva com base no mês atual
    const rate = getTaxRate(m);
    
    // Imposto provisionado (quanto seria pago em caso de saque neste mês)
    const taxPaid = taxBase * rate;

    results.push({
      month: m,
      interest: juroDoMes,
      totalInvested: investedSoFar,
      totalInterest: currentTotalInterest,
      totalAccumulated: currentAccumulated,
      taxPaid: taxPaid,
      taxBase: taxBase,
      taxRate: rate * 100,
      netAccumulated: currentAccumulated - taxPaid
    });
  }

  return results;
};
