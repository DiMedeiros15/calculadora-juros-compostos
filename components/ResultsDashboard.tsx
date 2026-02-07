
import React, { useState } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, SummaryData, SimulationParams } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  results: CalculationResult[];
  summary: SummaryData;
  darkMode: boolean;
  params: SimulationParams;
}

const ResultsDashboard: React.FC<Props> = ({ results, summary, darkMode, params }) => {
  const [activeTab, setActiveTab] = useState<'growth' | 'distribution'>('growth');
  const [showTaxTable, setShowTaxTable] = useState(false);

  const pieData = [
    { name: 'Valor Investido', value: summary.totalInvested },
    { name: 'Lucro Líquido', value: summary.totalInterest - summary.totalTax },
    { name: 'Imposto (IR)', value: summary.totalTax },
  ];

  const ACCENT_COLORS = ['#1e293b', '#10b981', '#f59e0b']; 
  const GRID_COLOR = darkMode ? '#1e293b' : '#f1f5f9';
  const TEXT_COLOR = darkMode ? '#94a3b8' : '#64748b';

  const barData = results.filter((_, i) => i % Math.max(1, Math.floor(results.length / 20)) === 0 || i === results.length - 1);

  const handleExportCSV = () => {
    const headers = [
      'Mês',
      'Juros do Mês (R$)',
      'Capital Investido (R$)',
      'Juros Acumulados (R$)',
      'Total Bruto (R$)',
      'Base de Cálculo IR (R$)',
      'Alíquota IR (%)',
      'Imposto Provisionado (R$)',
      'Total Líquido (R$)'
    ];

    const rows = results.map(row => [
      row.month,
      row.interest.toFixed(2).replace('.', ','),
      row.totalInvested.toFixed(2).replace('.', ','),
      row.totalInterest.toFixed(2).replace('.', ','),
      row.totalAccumulated.toFixed(2).replace('.', ','),
      row.taxBase.toFixed(2).replace('.', ','),
      row.taxRate.toFixed(1).replace('.', ','),
      row.taxPaid.toFixed(2).replace('.', ','),
      row.netAccumulated.toFixed(2).replace('.', ',')
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(e => e.join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `invest-smart-simulacao-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleDateString('pt-BR');

      // Cabeçalho
      doc.setFontSize(22);
      doc.setTextColor(153, 27, 27); // Vermelho escuro
      doc.text('InvestSmart', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('RELATÓRIO DE SIMULAÇÃO DE JUROS COMPOSTOS', 14, 28);
      doc.text(`Data: ${timestamp}`, 160, 20);

      // Resumo dos Dados
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 35, 196, 35);

      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo da Projeção', 14, 45);

      const summaryItems = [
        ['Total Investido:', formatCurrency(summary.totalInvested)],
        ['Juros Brutos:', formatCurrency(summary.totalInterest)],
        ['Imposto de Renda (IR):', formatCurrency(summary.totalTax)],
        ['Valor Líquido Final:', formatCurrency(summary.netTotal)]
      ];

      let yPos = 55;
      summaryItems.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, 14, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 80, yPos);
        yPos += 8;
      });

      // Tabela de Dados
      const tableHeaders = [['Mês', 'Investido', 'Juros (Mês)', 'Juros Acum.', 'Total Bruto', 'IR Devido', 'Total Líquido']];
      const tableData = results.map(r => [
        r.month.toString(),
        formatCurrency(r.totalInvested),
        formatCurrency(r.interest),
        formatCurrency(r.totalInterest),
        formatCurrency(r.totalAccumulated),
        formatCurrency(r.taxPaid),
        formatCurrency(r.netAccumulated)
      ]);

      autoTable(doc, {
        startY: yPos + 10,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [153, 27, 27], fontSize: 8 },
        styles: { fontSize: 7, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 10 },
          4: { fontStyle: 'bold' },
          6: { fontStyle: 'bold', textColor: [16, 185, 129] }
        }
      });

      doc.save(`InvestSmart-Simulacao-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Houve um erro ao gerar o PDF. Por favor, tente novamente.');
    }
  };

  return (
    <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-600">Resumo da Simulação</h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-500 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Exportar PDF
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-500 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-red-800 dark:bg-red-900 p-5 rounded-xl text-white shadow-lg transform hover:scale-[1.02] transition-all border border-transparent dark:border-red-800">
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Valor Líquido Final</p>
          <p className="text-2xl font-bold truncate">{formatCurrency(summary.netTotal)}</p>
          <p className="text-[10px] mt-2 opacity-70">Já descontado o IR</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm transform hover:scale-[1.02] transition-all">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-1">Total Bruto</p>
          <p className="text-2xl font-bold truncate text-slate-800 dark:text-white">{formatCurrency(summary.totalFinal)}</p>
          <p className="text-[10px] mt-2 text-slate-400">Sem descontar impostos</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm transform hover:scale-[1.02] transition-all">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-1">Juros Brutos</p>
          <p className="text-2xl font-bold truncate text-red-700 dark:text-red-500">{formatCurrency(summary.totalInterest)}</p>
          <p className="text-[10px] mt-2 text-slate-400">Rendimento total do período</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm transform hover:scale-[1.02] transition-all">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-1">Imposto Aplicado (IR)</p>
          <p className="text-2xl font-bold truncate text-orange-600 dark:text-orange-500">{formatCurrency(summary.totalTax)}</p>
          <p className="text-[10px] mt-2 text-slate-400">Alíquota de {results[results.length-1]?.taxRate}%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 no-print">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h3 className="text-lg font-bold text-black dark:text-white">Análise Gráfica</h3>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setActiveTab('growth')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'growth' ? 'bg-white dark:bg-slate-700 text-red-700 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Crescimento
            </button>
            <button 
              onClick={() => setActiveTab('distribution')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'distribution' ? 'bg-white dark:bg-slate-700 text-red-700 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Composição
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {activeTab === 'growth' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#991b1b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#991b1b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="month" stroke={TEXT_COLOR} fontSize={12} tickMargin={10} />
                <YAxis tickFormatter={(val) => `R$ ${val/1000}k`} stroke={TEXT_COLOR} fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff', 
                    color: darkMode ? '#f1f5f9' : '#1e293b',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="totalAccumulated" 
                  name="Montante Bruto" 
                  stroke="#991b1b" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorAcc)" 
                  dot={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="netAccumulated" 
                  name="Montante Líquido" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fill="transparent" 
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col lg:flex-row h-full items-center justify-around gap-8">
              <div className="w-full lg:w-1/2 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={ACCENT_COLORS[index]} stroke="transparent" />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                    <XAxis dataKey="month" fontSize={12} stroke={TEXT_COLOR} />
                    <YAxis tickFormatter={(val) => `R$ ${val/1000}k`} fontSize={12} stroke={TEXT_COLOR} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="totalInvested" name="Investido" stackId="a" fill="#1e293b" />
                    <Bar dataKey="totalInterest" name="Juros Brutos" stackId="a" fill="#991b1b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:border-none print:shadow-none">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 no-print flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-black dark:text-white">Detalhamento Mensal</h3>
          <button 
            onClick={() => setShowTaxTable(!showTaxTable)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <svg className={`w-4 h-4 transition-transform ${showTaxTable ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showTaxTable ? 'Ocultar Tabela de Impostos' : 'Mostrar Tabela de Impostos'}
          </button>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-center">
            <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 z-10 print:static">
              {showTaxTable ? (
                <tr>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Mês</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Base de Cálculo (Lucro)</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Alíquota IR</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Imposto Provisionado</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Líquido para Saque</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Mês</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Juros (Mês)</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Capital Investido</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Juros Acumulados</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Total Bruto</th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">{row.month}</td>
                  {showTaxTable ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{formatCurrency(row.taxBase)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-bold">
                          {row.taxRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 dark:text-orange-500 font-bold">-{formatCurrency(row.taxPaid)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-green-600 dark:text-green-500">{formatCurrency(row.netAccumulated)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-500 font-semibold">+{formatCurrency(row.interest)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{formatCurrency(row.totalInvested)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{formatCurrency(row.totalInterest)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(row.totalAccumulated)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
