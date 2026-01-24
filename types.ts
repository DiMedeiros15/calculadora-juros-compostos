
export interface CalculationResult {
  month: number;
  interest: number;
  totalInvested: number;
  totalInterest: number;
  totalAccumulated: number;
}

export interface SimulationParams {
  initialValue: number;
  monthlyValue: number;
  interestRate: number;
  rateType: 'monthly' | 'annual';
  period: number;
  periodType: 'months' | 'years';
}

export interface SummaryData {
  totalFinal: number;
  totalInvested: number;
  totalInterest: number;
}
