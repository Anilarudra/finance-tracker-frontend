import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Landmark, Sparkles, AlertTriangle, AlertCircle, ShoppingBag 
} from 'lucide-react';

import {useAuth} from '../context/AuthContext'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#a855f7'];

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    if (user?.userId) {
        fetchDashboardData();
    }
   }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.userId) return;

    try {
        setLoading(true);


        const [accounts, transactions, budgets] = await Promise.all([
            api.getAccounts(user.userId),
            api.getTransactions(user.userId),
            api.getBudgets(user.userId)
        ]);

        setAccounts(accounts || []);
        setTransactions(transactions || []);
        setBudgets(budgets || []);

        setError("");

    } catch (err) {
        console.error(err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
  // Computations
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getMonthlyTotals = () => {
    const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    let income = 0;
    let expense = 0;

    transactions.forEach(tx => {
      // Check if transaction is in the current month
      if (tx.date && tx.date.startsWith(currentMonthStr)) {
        if (tx.type === 'INCOME') {
          income += tx.amount;
        } else if (tx.type === 'EXPENSE') {
          expense += tx.amount;
        }
      }
    });

    return { income, expense };
  };

  const { income: monthlyIncome, expense: monthlyExpense } = getMonthlyTotals();

  // Category analysis for Pie Chart
  const getCategoryChartData = () => {
    const categoryMap = {};
    let totalExps = 0;

    transactions.forEach(tx => {
      if (tx.type === 'EXPENSE') {
        const cat = tx.category || 'Other Expense';
        categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
        totalExps += tx.amount;
      }
    });

    return Object.keys(categoryMap).map(name => ({
      name,
      value: parseFloat(categoryMap[name].toFixed(2)),
      percentage: totalExps > 0 ? ((categoryMap[name] / totalExps) * 100).toFixed(1) : 0
    }));
  };

  const categoryChartData = getCategoryChartData();

  // Historical Balance Flow chart (Last 7 transactions or last days)
  const getFlowChartData = () => {
    // Collect daily totals for the current month
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const dailyData = {};

    // Sort ascending by date
    [...transactions]
      .filter(tx => tx.date && tx.date.startsWith(currentMonthStr))
      .reverse()
      .forEach(tx => {
        const dateStr = tx.date.split('T')[0];
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = { date: dateStr, Income: 0, Expense: 0 };
        }
        if (tx.type === 'INCOME') {
          dailyData[dateStr].Income += tx.amount;
        } else {
          dailyData[dateStr].Expense += tx.amount;
        }
      });

    const sortedData = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Format dates for display
    return sortedData.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      Income: parseFloat(d.Income.toFixed(2)),
      Expense: parseFloat(d.Expense.toFixed(2))
    }));
  };

  const flowChartData = getFlowChartData();

  // Budget progress warnings check
  const checkBudgetAlerts = () => {
    const alerts = [];
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    
    // Compute current spending per category
    const categorySpending = {};
    transactions.forEach(tx => {
      if (tx.type === 'EXPENSE' && tx.date && tx.date.startsWith(currentMonthStr)) {
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
      }
    });

    budgets.forEach(b => {
      if ((b.month || currentMonthStr) === currentMonthStr) {
        const limitAmount = b.limit_amount ?? b.limitAmount ?? 0;
        const spent = categorySpending[b.category] || 0;
        const ratio = limitAmount > 0 ? spent / limitAmount : 0;
        
        if (ratio >= 1.0) {
          alerts.push({
            type: 'over',
            category: b.category,
            limit: limitAmount,
            spent: spent,
            message: `CRITICAL: You have exceeded your $${limitAmount} budget for ${b.category}! (Spent: $${spent.toFixed(2)})`
          });
        } else if (ratio >= 0.8) {
          alerts.push({
            type: 'warning',
            category: b.category,
            limit: limitAmount,
            spent: spent,
            message: `WARNING: You've utilized ${Math.round(ratio * 100)}% of your $${limitAmount} budget for ${b.category}. (Spent: $${spent.toFixed(2)})`
          });
        }
      }
    });

    return alerts;
  };

  const budgetAlerts = checkBudgetAlerts();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Dashboard Analysis...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="chart-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Financial Control</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track accounts, transactions, and budgets at a glance</p>
        </div>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Refresh Analytics
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Widgets */}
      <div className="dashboard-grid">
        <div className="stats-row">
          {/* Net Wealth */}
          <div className="stat-card glass-panel">
            <div className="stat-icon primary">
              <Landmark size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Net Wealth</span>
              <span className="stat-value" style={{ color: totalBalance >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Current Month Income */}
          <div className="stat-card glass-panel">
            <div className="stat-icon success">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Monthly Income</span>
              <span className="stat-value" style={{ color: 'var(--success)' }}>
                +${monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Current Month Expense */}
          <div className="stat-card glass-panel">
            <div className="stat-icon danger">
              <TrendingDown size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Monthly Savings Outflow</span>
              <span className="stat-value" style={{ color: 'var(--danger)' }}>
                -${monthlyExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Active Budgets count */}
          <div className="stat-card glass-panel">
            <div className="stat-icon warning">
              <Sparkles size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Active Budgets</span>
              <span className="stat-value" style={{ color: 'var(--warning)' }}>
                {budgets.length} Categories
              </span>
            </div>
          </div>
        </div>

        {/* Budget Alert Panel */}
        {budgetAlerts.length > 0 && (
          <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {budgetAlerts.map((alert, index) => (
              <div key={index} className={`budget-alert-box ${alert.type === 'over' ? 'over' : ''}`}>
                {alert.type === 'over' ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
                <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cash Flow Line Chart */}
        <div className="chart-container-large glass-panel">
          <div className="chart-header" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Cash Flow Trend (Current Month)</h3>
          </div>
          <div style={{ flexGrow: 1, minHeight: 0 }}>
            {flowChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="95%">
                <AreaChart data={flowChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)'
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No transaction history found for the current month.</p>
              </div>
            )}
          </div>
        </div>

        {/* Expenses grouping Pie Chart */}
        <div className="chart-container-small glass-panel">
          <div className="chart-header" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Expenses by Category</h3>
          </div>
          <div style={{ flexGrow: 1, minHeight: 0, position: 'relative' }}>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="95%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: 'var(--radius-sm)'
                    }} 
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: 10, bottom: -10 }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '0.5rem' }}>
                <ShoppingBag size={32} style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>No expenses reported yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
