import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Invoice, Income } from '../types';
import { getDashboardInsights } from '../services/geminiService';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';


interface DashboardProps {
    invoices: Invoice[];
    income: Income[];
}

const COLORS = ['#3E7BFA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899', '#6366F1'];

const Dashboard: React.FC<DashboardProps> = ({ invoices, income }) => {
    const { t, i18n } = useTranslation();
    const [insights, setInsights] = useState('');
    const [isInsightsLoading, setIsInsightsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

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
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
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
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff">{`${formatCurrency(value)}`}</text>
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#A9AABC">
            {`(${(percent * 100).toFixed(2)}%)`}
          </text>
        </g>
      );
    };

    useEffect(() => {
        const fetchInsights = async () => {
            setIsInsightsLoading(true);
            try {
                const result = await getDashboardInsights(invoices, income, t, i18n.language);
                setInsights(result);
            } catch (error) {
                setInsights(t('dashboard.insightsError'));
            } finally {
                setIsInsightsLoading(false);
            }
        };
        fetchInsights();
    }, [invoices, income, t, i18n.language]);

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
                <div className="bg-brand-secondary p-3 border border-brand-accent/50 rounded-md shadow-lg text-sm">
                    <p className="label text-brand-text-secondary font-bold mb-2">{`${label}`}</p>
                    {incomePayload && <p style={{ color: incomePayload.fill }}>{`${t('header.income')}: ${formatCurrency(incomePayload.value)}`}</p>}
                    {expensesPayload && <p style={{ color: expensesPayload.fill }}>{`Expenses: ${formatCurrency(expensesPayload.value)}`}</p>}
                </div>
            );
        }
        return null;
    };
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('dashboard.title')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-brand-secondary p-6 rounded-xl border border-brand-accent/20">
                    <h3 className="text-brand-text-secondary text-lg">{t('dashboard.totalIncome')}</h3>
                    <p className="text-4xl font-bold text-emerald-400">{formatCurrency(stats.totalIncome)}</p>
                </div>
                <div className="bg-brand-secondary p-6 rounded-xl border border-brand-accent/20">
                    <h3 className="text-brand-text-secondary text-lg">{t('dashboard.totalSpent')}</h3>
                    <p className="text-4xl font-bold text-red-400">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <div className="bg-brand-secondary p-6 rounded-xl border border-brand-accent/20">
                    <h3 className="text-brand-text-secondary text-lg">{t('dashboard.netBalance')}</h3>
                    <p className={`text-4xl font-bold ${stats.netBalance >= 0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(stats.netBalance)}</p>
                </div>
                <div className="bg-brand-secondary p-6 rounded-xl border border-brand-accent/20">
                    <h3 className="text-brand-text-secondary text-lg">{t('dashboard.totalInvoices')}</h3>
                    <p className="text-4xl font-bold text-white">{stats.invoiceCount}</p>
                </div>
            </div>

             <div className="bg-brand-secondary p-6 rounded-xl border border-brand-accent/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <LightbulbIcon />
                    {t('dashboard.aiInsights')}
                </h3>
                {isInsightsLoading ? (
                     <div className="flex items-center justify-center h-24">
                        <SpinnerIcon />
                    </div>
                ) : (
                    <div className="text-brand-text-secondary space-y-2 text-sm whitespace-pre-wrap">
                        {insights.split('\n').map((line, index) => <p key={index}>{line}</p>)}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-brand-secondary p-6 rounded-xl border border-brand-accent/20">
                    <h3 className="text-xl font-semibold text-white mb-4">{t('dashboard.cashFlow')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={cashFlowOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F87171" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis dataKey="name" stroke="#A9AABC" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#A9AABC" fontSize={12} tickLine={false} axisLine={false} tickFormatter={yAxisFormatter} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: "14px"}} />
                            <Area type="monotone" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" name={t('header.income')} />
                            <Area type="monotone" dataKey="expenses" stroke="#F87171" fillOpacity={1} fill="url(#colorExpenses)" name={t('header.invoices')} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-brand-secondary p-6 rounded-xl border border-brand-accent/20">
                    <h3 className="text-xl font-semibold text-white mb-4">{t('dashboard.spendingByCategory')}</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        {spendingByCategory.length > 0 ? (
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={spendingByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                >
                                    {spendingByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        ) : (
                            <div className="flex items-center justify-center h-full text-brand-text-secondary text-sm">
                                <p>{t('dashboard.noSpendingData')}</p>
                            </div>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;