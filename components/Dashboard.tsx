
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, Bar, BarChart, CartesianGrid, Cell, Legend, Pie as RechartsPie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useData } from '../contexts/DataContext';
import ManualInvoiceModal from './ManualInvoiceModal';
import SettingsModal from './SettingsModal';
import { PlusIcon } from './icons/PlusIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ChartIcon } from './icons/ChartIcon';
import { IncomeIcon } from './icons/IncomeIcon';
import { InvoicesIcon } from './icons/InvoicesIcon';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899', '#6366F1'];

const Pie = RechartsPie as any;

const Dashboard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { invoices, income, exportData, addInvoice, updateInvoice } = useData();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const formatCurrency = useMemo(() => (value: number) => {
        return new Intl.NumberFormat(i18n.language, { 
            style: 'decimal', 
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }, [i18n.language]);

    const yAxisFormatter = useMemo(() => (value: number) => {
        return new Intl.NumberFormat(i18n.language, { notation: 'compact', compactDisplay: 'short' }).format(value);
    }, [i18n.language]);
    
    const renderActiveShape = (props: any) => {
      const RADIAN = Math.PI / 180;
      const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
      const sin = Math.sin(-RADIAN * midAngle);
      const cos = Math.cos(-RADIAN * midAngle);
      const sx = cx + (outerRadius + 10) * cos;
      const sy = cy + (outerRadius + 10) * sin;
      const mx = cx + (outerRadius + 30) * cos;
      const my = cy + (outerRadius + 30) * sin;
      const ex = mx + (cos >= 0 ? 1 : -1) * 22;
      const ey = my;
      const textAnchor = cos >= 0 ? 'start' : 'end';

      return (
        <g>
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg fill-white">
            {payload.name}
          </text>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
          />
          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" className="font-mono font-bold text-lg">{`${formatCurrency(value)}`}</text>
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#94A3B8" className="text-sm">
            {`(${(percent * 100).toFixed(2)}%)`}
          </text>
        </g>
      );
    };

    const stats = useMemo(() => {
        const totalSpent = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
        const netBalance = totalIncome - totalSpent;
        const invoiceCount = invoices.length;
        return { totalSpent, totalIncome, netBalance, invoiceCount };
    }, [invoices, income]);

    const spendingByCategory = useMemo(() => {
        const categoryData: { [key: string]: number } = {};
        invoices.forEach(inv => {
            const category = inv.category || t('expenseCategories.other');
            categoryData[category] = (categoryData[category] || 0) + inv.total;
        });
        return Object.entries(categoryData)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [invoices, t]);

    const cashFlowOverTime = useMemo(() => {
        const monthData: { [key: string]: { income: number, expenses: number } } = {};
        const locale = i18n.language;
        
        invoices.forEach(inv => {
            const month = new Date(inv.date).toLocaleString(locale, { month: 'short', year: '2-digit' });
            if (!monthData[month]) monthData[month] = { income: 0, expenses: 0 };
            monthData[month].expenses += inv.total;
        });

        income.forEach(inc => {
            const month = new Date(inc.date).toLocaleString(locale, { month: 'short', year: '2-digit' });
            if (!monthData[month]) monthData[month] = { income: 0, expenses: 0 };
            monthData[month].income += inc.amount;
        });
        
        const sortedMonths = Object.keys(monthData).sort((a,b) => new Date(`1 ${a}`).getTime() - new Date(`1 ${b}`).getTime());
        return sortedMonths.map(month => ({ name: month, ...monthData[month] }));
    }, [invoices, income, i18n.language]);
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const incomePayload = payload.find(p => p.dataKey === 'income');
            const expensesPayload = payload.find(p => p.dataKey === 'expenses');
            return (
                <div className="bg-brand-secondary/90 backdrop-blur-md p-4 border border-brand-border rounded-xl shadow-xl text-sm">
                    <p className="label text-white font-bold mb-2 border-b border-white/10 pb-1">{`${label}`}</p>
                    {incomePayload && <p className="text-emerald-400 flex justify-between gap-4"><span>{t('header.income')}:</span> <span className="font-mono font-bold">{formatCurrency(incomePayload.value)}</span></p>}
                    {expensesPayload && <p className="text-red-400 flex justify-between gap-4"><span>Expenses:</span> <span className="font-mono font-bold">{formatCurrency(expensesPayload.value)}</span></p>}
                </div>
            );
        }
        return null;
    };

    const StatCard = ({ title, value, colorClass, icon, trend }: any) => (
        <div className="group relative overflow-hidden bg-brand-surface backdrop-blur-md border border-brand-border rounded-2xl p-6 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:bg-brand-accent/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20 text-white`}>
                    {React.cloneElement(icon, { className: "h-6 w-6" })}
                 </div>
            </div>
            <h3 className="text-brand-text-secondary text-sm font-medium uppercase tracking-wide mb-1">{title}</h3>
            <p className={`text-3xl font-black tracking-tight ${colorClass.replace('bg-', 'text-')}`}>{value}</p>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-text-secondary tracking-tight">{t('dashboard.title')}</h1>
                    <p className="text-brand-text-secondary text-sm mt-1">Overview of your financial health</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 hover:-translate-y-0.5"
                    >
                        <PlusIcon />
                        <span>{t('invoices.newInvoice')}</span>
                    </button>

                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary/80 border border-brand-border text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                        title="Export to CSV"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    <button
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="bg-brand-secondary hover:bg-brand-secondary/80 border border-brand-border text-white p-2.5 rounded-xl transition-colors"
                        title={t('settings.title')}
                    >
                        <SettingsIcon />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title={t('dashboard.totalIncome')} 
                    value={formatCurrency(stats.totalIncome)} 
                    colorClass="bg-emerald-500 text-emerald-400"
                    icon={<IncomeIcon />}
                />
                <StatCard 
                    title={t('dashboard.totalSpent')} 
                    value={formatCurrency(stats.totalSpent)} 
                    colorClass="bg-red-500 text-red-400" 
                    icon={<InvoicesIcon />}
                />
                <StatCard 
                    title={t('dashboard.netBalance')} 
                    value={formatCurrency(stats.netBalance)} 
                    colorClass={stats.netBalance >= 0 ? 'bg-brand-accent text-brand-accent' : 'bg-red-500 text-red-400'}
                    icon={<ChartIcon />}
                />
                 <StatCard 
                    title={t('dashboard.totalInvoices')} 
                    value={stats.invoiceCount} 
                    colorClass="bg-purple-500 text-purple-400" 
                    icon={<InvoicesIcon />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-brand-surface backdrop-blur-md border border-brand-border p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-brand-accent rounded-full"></span>
                        {t('dashboard.cashFlow')}
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={cashFlowOverTime} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={yAxisFormatter} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{paddingTop: '20px'}} iconType="circle" />
                            <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name={t('header.income')} />
                            <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" name={t('header.invoices')} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-brand-surface backdrop-blur-md border border-brand-border p-6 rounded-2xl shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                        {t('dashboard.spendingByCategory')}
                    </h3>
                     <div className="flex-grow min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {spendingByCategory.length > 0 ? (
                                <PieChart>
                                    <Pie
                                        activeIndex={activeIndex}
                                        activeShape={renderActiveShape}
                                        data={spendingByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        onMouseEnter={(_, index) => setActiveIndex(index)}
                                        stroke="none"
                                    >
                                        {spendingByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary">
                                    <div className="bg-white/5 p-4 rounded-full mb-3">
                                        <ChartIcon />
                                    </div>
                                    <p className="text-sm">{t('dashboard.noSpendingData')}</p>
                                </div>
                            )}
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>

            <ManualInvoiceModal 
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
                onAddInvoice={addInvoice}
                onUpdateInvoice={updateInvoice}
                invoiceToEdit={null}
            />
            <SettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;
