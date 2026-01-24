import React from 'react';

interface Props {
  darkMode: boolean;
}

const InfoSection: React.FC<Props> = ({ darkMode }) => {
  return (
    <div className="mt-12 bg-white dark:bg-slate-900/50 p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-12 transition-all shadow-sm">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-extrabold text-black dark:text-white mb-6 tracking-tight">O Segredo do Patrimônio: Juros Compostos</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg text-justify md:text-left">
          Imagine uma bola de neve descendo uma montanha. Quanto mais ela rola, mais neve ela acumula e mais rápida ela se torna. 
          Este é o efeito dos juros compostos: seus rendimentos geram novos rendimentos, criando um crescimento exponencial ao longo do tempo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-red-200 dark:hover:border-red-900/40 transition-all">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-700 dark:text-red-500 font-bold text-xl">1</div>
          <h3 className="font-bold text-lg text-black dark:text-white">Janela de Tempo</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            O tempo é o maior aliado do investidor. Começar cedo permite que a curva exponencial atinja seu ponto de maior aceleração antes.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xl">2</div>
          <h3 className="font-bold text-lg text-black dark:text-white">Aportes Recorrentes</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            A consistência nos aportes mensais alimenta a base de cálculo dos juros, potencializando os ganhos mesmo em períodos de taxas menores.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-800 dark:hover:border-slate-500 transition-all">
          <div className="w-12 h-12 bg-slate-800 dark:bg-slate-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">3</div>
          <h3 className="font-bold text-lg text-black dark:text-white">Taxa Real</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Pequenas diferenças na rentabilidade anual podem significar milhares de reais em diferença no longo prazo. Fique atento aos custos e impostos.
          </p>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-100 dark:border-red-900/20 italic text-red-700 dark:text-red-400 text-base text-center font-medium shadow-inner">
        "O tempo é o único recurso que você não pode recuperar. Invista-o sabiamente junto com o seu capital para garantir sua liberdade futura."
      </div>
    </div>
  );
};

export default InfoSection;