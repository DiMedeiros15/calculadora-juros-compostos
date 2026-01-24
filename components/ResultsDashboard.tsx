import React, { useState } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const pieData = [
    { name: 'Valor Investido', value: summary.totalInvested },
    { name: 'Total em Juros', value: summary.totalInterest },
  ];

  const ACCENT_COLORS = ['#991b1b', darkMode ? '#334155' : '#1e293b']; 
  const GRID_COLOR = darkMode ? '#1e293b' : '#f1f5f9';
  const TEXT_COLOR = darkMode ? '#94a3b8' : '#64748b';

  const barData = results.filter((_, i) => i % Math.max(1, Math.floor(results.length / 20)) === 0 || i === results.length - 1);

  const handleExportPDF = () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(22);
      doc.setTextColor(153, 27, 27);
      doc.text('InvestSmart', 20, 20);
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.text('Relatório de Simulação de Juros Compostos', 20, 28);
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 35, pageWidth - 20, 35);

      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('Parâmetros da Simulação:', 20, 45);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const paramsList = [
        `Valor Inicial: ${formatCurrency(params.initialValue)}`,
        `Valor Mensal: ${formatCurrency(params.monthlyValue)}`,
        `Taxa de Juros: ${params.interestRate}% (${params.rateType === 'annual' ? 'Anual' : 'Mensal'})`,
        `Período: ${params.period} ${params.periodType === 'years' ? 'anos' : 'meses'}`
      ];
      doc.text(paramsList, 25, 52);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Resumo dos Resultados:', 20, 85);
      const summaryRows = [
        ['Total Final Acumulado', formatCurrency(summary.totalFinal)],
        ['Total Investido', formatCurrency(summary.totalInvested)],
        ['Total Ganho em Juros', formatCurrency(summary.totalInterest)]
      ];
      (doc as any).autoTable({
        startY: 90,
        margin: { left: 20 },
        tableWidth: 100,
        head: [['Métrica', 'Valor']],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: [153, 27, 27], textColor: [255, 255, 255] },
        styles: { font: 'helvetica', fontSize: 10 }
      });

      doc.setFont('helvetica', 'bold');
      doc.text('Detalhamento Mensal:', 20, (doc as any).lastAutoTable.finalY + 15);
      const tableData = results.map(row => [
        row.month.toString(),
        formatCurrency(row.interest),
        formatCurrency(row.totalInvested),
        formatCurrency(row.totalInterest),
        formatCurrency(row.totalAccumulated)
      ]);
      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Mês', 'Juros', 'Total Investido', 'Total Juros', 'Total Acumulado']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      doc.save(`investsmart-simulacao-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-600">Resultado</h2>
        <button
          onClick={handleExportPDF}
          disabled={isGeneratingPDF}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
        >
          {isGeneratingPDF ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>
      
      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-800 dark:bg-red-900 p-6 rounded-xl text-white shadow-lg transform hover:scale-[1.01] transition-transform">
          <p className="text-xs uppercase tracking-wider font-semibold opacity-80">Valor total final</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalFinal)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm transform hover:scale-[1.01] transition-transform">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Valor total investido</p>
          <p className="text-2xl font-bold mt-1 text-red-700 dark:text-red-500">{formatCurrency(summary.totalInvested)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm transform hover:scale-[1.01] transition-transform">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total em juros</p>
          <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{formatCurrency(summary.totalInterest)}</p>
        </div>
      </div>

      {/* Gráfico de Evolução com fundo branco no modo claro */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 no-print">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h3 className="text-lg font-bold text-black dark:text-white">Gráfico de Evolução</h3>
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
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="totalAccumulated" 
                  name="Total Acumulado" 
                  stroke="#991b1b" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorAcc)" 
                  dot={{ r: 3, strokeWidth: 1, fill: '#991b1b' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalInvested" 
                  name="Valor Investido" 
                  stroke={darkMode ? '#475569' : '#1e293b'} 
                  strokeWidth={3} 
                  fill={darkMode ? '#334155' : '#e2e8f0'} 
                  fillOpacity={0.3} 
                  dot={{ r: 3, strokeWidth: 1, fill: darkMode ? '#475569' : '#1e293b' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
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
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderRadius: '8px', border: 'none' }} />
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
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderRadius: '8px', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="totalInvested" name="Valor Investido" stackId="a" fill={darkMode ? '#334155' : '#1e293b'} />
                    <Bar dataKey="totalInterest" name="Valor em Juros" stackId="a" fill="#991b1b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabela com juros em verde */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 no-print">
          <h3 className="text-lg font-bold text-black dark:text-white">Detalhamento Mensal</h3>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-center">
            <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Mês</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Juros</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Total Investido</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Total Juros</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Total Acumulado</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{row.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-500 font-medium">+{formatCurrency(row.interest)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{formatCurrency(row.totalInvested)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{formatCurrency(row.totalInterest)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(row.totalAccumulated)}</td>
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