import React, { useState, useEffect } from 'react';
import { SimulationParams } from '../types';
import { formatInputNumber, parseInputNumber } from '../utils';

interface Props {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  onCalculate: () => void;
  onClear: () => void;
  darkMode: boolean;
}

const CalculatorForm: React.FC<Props> = ({ params, setParams, onCalculate, onClear, darkMode }) => {
  const [displayValues, setDisplayValues] = useState({
    initialValue: formatInputNumber(params.initialValue),
    monthlyValue: formatInputNumber(params.monthlyValue),
    interestRate: formatInputNumber(params.interestRate),
    period: formatInputNumber(params.period),
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validateField = (name: string, value: number): string | null => {
    switch (name) {
      case 'initialValue':
        if (value < 0) return 'O valor não pode ser negativo';
        if (value > 1000000000) return 'Limite máximo de R$ 1 bilhão';
        return null;
      case 'monthlyValue':
        if (value < 0) return 'O valor não pode ser negativo';
        if (value > 100000000) return 'Limite máximo de R$ 100 milhões';
        return null;
      case 'interestRate':
        if (value < 0) return 'A taxa não pode ser negativa';
        if (params.rateType === 'monthly' && value > 100) return 'Taxa mensal muito alta (máx 100%)';
        if (params.rateType === 'annual' && value > 5000) return 'Taxa anual muito alta (máx 5000%)';
        return null;
      case 'period':
        if (value <= 0) return 'O período deve ser maior que zero';
        const totalMonths = params.periodType === 'years' ? value * 12 : value;
        if (totalMonths > 1200) return 'Período máximo de 100 anos (1200 meses)';
        return null;
      default:
        return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue = value.replace(/[^0-9,.]/g, '');
    
    setDisplayValues(prev => ({ ...prev, [name]: filteredValue }));
    
    const numericValue = parseInputNumber(filteredValue);
    setParams(prev => ({ ...prev, [name]: numericValue }));
    
    // Clear error while typing if it becomes valid
    if (errors[name]) {
      const error = validateField(name, numericValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParams(prev => {
      const newParams = { ...prev, [name]: value };
      // Re-validate related fields if rateType or periodType changes
      if (name === 'rateType' || name === 'periodType') {
        const fieldToValidate = name === 'rateType' ? 'interestRate' : 'period';
        const error = validateField(fieldToValidate, prev[fieldToValidate as keyof SimulationParams] as number);
        setErrors(errs => ({ ...errs, [fieldToValidate]: error }));
      }
      return newParams;
    });
  };

  const handleBlur = (name: string) => {
    const numericValue = params[name as keyof SimulationParams] as number;
    setDisplayValues(prev => ({ 
      ...prev, 
      [name]: formatInputNumber(numericValue) 
    }));
    
    const error = validateField(name, numericValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleCalculateClick = () => {
    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;

    // Validate all fields
    ['initialValue', 'monthlyValue', 'interestRate', 'period'].forEach(field => {
      const val = params[field as keyof SimulationParams] as number;
      const error = validateField(field, val);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      onCalculate();
    }
  };

  useEffect(() => {
    setDisplayValues({
      initialValue: formatInputNumber(params.initialValue),
      monthlyValue: formatInputNumber(params.monthlyValue),
      interestRate: formatInputNumber(params.interestRate),
      period: formatInputNumber(params.period),
    });
    setErrors({});
  }, [params.initialValue, params.monthlyValue, params.interestRate, params.period]);

  const getInputClasses = (name: string) => {
    const base = "flex-1 min-w-0 block w-full px-3 py-2.5 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm outline-none transition-all";
    const status = errors[name] 
      ? "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500" 
      : "border-slate-300 dark:border-slate-700 focus:ring-red-500 focus:border-red-500";
    return `${base} ${status}`;
  };

  const getAddonClasses = (name: string) => {
    const base = "inline-flex items-center px-3 border bg-white dark:bg-slate-700 text-sm font-medium transition-colors";
    const status = errors[name] 
      ? "border-red-500 dark:border-red-500 text-red-500" 
      : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400";
    return `${base} ${status}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
        <span className="w-2 h-6 bg-red-700 rounded-full"></span>
        Simulador de Juros Compostos
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Valor Inicial */}
        <div className="group">
          <label className={`block text-sm font-semibold mb-2 transition-colors ${errors.initialValue ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>Valor inicial</label>
          <div className={`flex shadow-sm rounded-lg overflow-hidden transition-all focus-within:ring-2 ${errors.initialValue ? 'ring-red-500' : 'ring-red-500'} ring-offset-2 dark:ring-offset-slate-900`}>
            <span className={`${getAddonClasses('initialValue')} border-r-0`}>R$</span>
            <input
              type="text"
              inputMode="decimal"
              name="initialValue"
              value={displayValues.initialValue}
              onChange={handleInputChange}
              onBlur={() => handleBlur('initialValue')}
              className={`${getInputClasses('initialValue')} border-l-0`}
              placeholder="0,00"
            />
          </div>
          {errors.initialValue && <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.initialValue}</p>}
        </div>

        {/* Valor Mensal */}
        <div className="group">
          <label className={`block text-sm font-semibold mb-2 transition-colors ${errors.monthlyValue ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>Valor mensal</label>
          <div className={`flex shadow-sm rounded-lg overflow-hidden transition-all focus-within:ring-2 ${errors.monthlyValue ? 'ring-red-500' : 'ring-red-500'} ring-offset-2 dark:ring-offset-slate-900`}>
            <span className={`${getAddonClasses('monthlyValue')} border-r-0`}>R$</span>
            <input
              type="text"
              inputMode="decimal"
              name="monthlyValue"
              value={displayValues.monthlyValue}
              onChange={handleInputChange}
              onBlur={() => handleBlur('monthlyValue')}
              className={`${getInputClasses('monthlyValue')} border-l-0`}
              placeholder="0,00"
            />
          </div>
          {errors.monthlyValue && <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.monthlyValue}</p>}
        </div>

        {/* Taxa de Juros */}
        <div className="group">
          <label className={`block text-sm font-semibold mb-2 transition-colors ${errors.interestRate ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>Taxa de juros</label>
          <div className={`flex shadow-sm rounded-lg overflow-hidden transition-all focus-within:ring-2 ${errors.interestRate ? 'ring-red-500' : 'ring-red-500'} ring-offset-2 dark:ring-offset-slate-900`}>
            <span className={`${getAddonClasses('interestRate')} border-r-0`}>%</span>
            <input
              type="text"
              inputMode="decimal"
              name="interestRate"
              value={displayValues.interestRate}
              onChange={handleInputChange}
              onBlur={() => handleBlur('interestRate')}
              className={`${getInputClasses('interestRate')} border-l-0 border-r-0`}
              placeholder="0"
            />
            <select
              name="rateType"
              value={params.rateType}
              onChange={handleSelectChange}
              className={`inline-flex items-center px-4 border ${errors.interestRate ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold focus:outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors`}
            >
              <option value="monthly">mensal</option>
              <option value="annual">anual</option>
            </select>
          </div>
          {errors.interestRate && <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.interestRate}</p>}
        </div>

        {/* Período */}
        <div className="group">
          <label className={`block text-sm font-semibold mb-2 transition-colors ${errors.period ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>Período</label>
          <div className={`flex shadow-sm rounded-lg overflow-hidden transition-all focus-within:ring-2 ${errors.period ? 'ring-red-500' : 'ring-red-500'} ring-offset-2 dark:ring-offset-slate-900`}>
            <input
              type="text"
              inputMode="numeric"
              name="period"
              value={displayValues.period}
              onChange={handleInputChange}
              onBlur={() => handleBlur('period')}
              className={`${getInputClasses('period')} border-r-0 rounded-l-lg`}
              placeholder="0"
            />
            <select
              name="periodType"
              value={params.periodType}
              onChange={handleSelectChange}
              className={`inline-flex items-center px-4 border ${errors.period ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold focus:outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors`}
            >
              <option value="months">meses</option>
              <option value="years">anos</option>
            </select>
          </div>
          {errors.period && <p className="mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.period}</p>}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={handleCalculateClick}
          className="bg-red-800 hover:bg-red-900 active:scale-95 text-white font-bold py-3 px-12 rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
        >
          Calcular
        </button>
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-red-700 dark:text-slate-500 dark:hover:text-red-500 text-sm font-bold transition-colors uppercase tracking-widest"
        >
          Limpar campos
        </button>
      </div>
    </div>
  );
};

export default CalculatorForm;