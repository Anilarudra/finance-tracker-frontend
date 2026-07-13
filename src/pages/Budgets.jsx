import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import BudgetForm from '../components/BudgetForm';
import { Plus, Edit2, Trash2, PieChart, Info, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext'

const Budgets = () => {
  const getCurrentMonthString = () => {
    return new Date().toISOString().slice(0, 7); // Returns YYYY-MM
  };

  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetsData, transactionsData] = await Promise.all([
        api.getBudgets(user.userId),
        api.getTransactions(user.userId)
      ]);
      setBudgets(budgetsData || []);
      setTransactions(transactionsData || []);
    } catch (err) {
      setError('Failed to load budget portfolios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingBudget) {
        await api.updateBudget(
          user.userId,
          editingBudget.category,
          formData
        );
      } else {
        await api.createBudget(user.userId, formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Saving budget configuration failed.');
    }
  };

  const handleDeleteBudget = async (category) => {
  if (!window.confirm("Are you sure you want to delete this budget?")) {
    return;
  }

  try {
    await api.deleteBudget(user.userId, category);
    fetchData();
  } catch (err) {
    console.error(err);
    setError("Failed to delete budget.");
  }
};

  // Computations
  const getCategorySpending = (category) => {
    return transactions
      .filter(tx => tx.type === 'EXPENSE' &&
        tx.category === category &&
        tx.date &&
        tx.date.startsWith(selectedMonth))
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const filteredBudgets = budgets.filter(b => (b.month || selectedMonth) === selectedMonth);

  const getProgressStyles = (spent, limit) => {
    const ratio = limit > 0 ? spent / limit : 0;
    const percentage = Math.min(Math.round(ratio * 100), 100);

    let color = 'var(--success)';
    if (ratio >= 1.0) {
      color = 'var(--danger)';
    } else if (ratio >= 0.8) {
      color = 'var(--warning)';
    }

    return { percentage, color, ratio };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Budget Analytics...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="chart-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Category Budgets</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Establish spend limits and get immediate overage warnings</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Month Navigator */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-control"
            style={{ width: '160px', padding: '0.6rem 0.8rem' }}
            title="Inspect monthly cycles"
          />
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            Set Budget
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Helper Card */}
      <div className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        margin: '1.5rem 0',
        background: 'rgba(255,255,255,0.02)',
        padding: '1rem',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <span>Budgets keep you financially discipline. Set targets for rent, food, groceries, etc. System displays yellow alerts above 80% and red triggers past 100% of limits. Selected Billing Cycle: <strong>{new Date(selectedMonth + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong></span>
      </div>

      {filteredBudgets.length > 0 ? (
        <div className="cards-grid">
          {filteredBudgets.map(b => {
            const spent = getCategorySpending(b.category);
            const limitAmount = b.limit_amount ?? b.limitAmount ?? 0;
            const { percentage, color, ratio } = getProgressStyles(spent, limitAmount);
            const isOver = ratio >= 1.0;
            const isClose = ratio >= 0.8 && ratio < 1.0;

            return (
              <div key={b.id} className="glass-panel card-item" style={{
                height: 'auto',
                minHeight: '200px',
                borderColor: isOver ? 'rgba(244, 63, 94, 0.25)' : isClose ? 'rgba(245, 158, 11, 0.25)' : 'var(--border-color)',
                background: isOver ? 'rgba(244, 63, 94, 0.03)' : isClose ? 'rgba(245, 158, 11, 0.03)' : 'var(--bg-card)'
              }}>
                <div className="card-header-row" style={{ marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {b.category}
                      {isOver && <ShieldAlert size={18} style={{ color: 'var(--danger)' }} />}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Month Target: {b.month || selectedMonth}</span>
                  </div>

                  <div className="card-actions">
                    <button className="btn-icon" onClick={() => handleOpenEditModal(b)} title="Edit limit">
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDeleteBudget(b.category)}
                      style={{ color: 'var(--danger)' }}
                      title="Delete Budget"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="budget-progress-container">
                  <div className="budget-labels">
                    <span style={{ color: 'var(--text-secondary)' }}>Spent: <strong style={{ color: spent > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>${spent.toFixed(2)}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>Limit: <strong style={{ color: 'var(--text-primary)' }}>${limitAmount.toFixed(2)}</strong></span>
                  </div>

                  <div className="progress-bar-bg" style={{ marginBottom: '0.75rem' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem' }}>
                    <span style={{ color: color, fontWeight: 700 }}>{percentage}% Utilized</span>
                    {isOver ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Over Budget by ${(spent - limitAmount).toFixed(2)}!</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Remaining: ${(limitAmount - spent).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <PieChart size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Budgets Set For This Cycle</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Create category limits for the billing cycle to inspect your progress warnings.</p>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            Create Category Budget
          </button>
        </div>
      )}

      {/* Forms trigger popup */}
      <BudgetForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingBudget}
      />
    </div>
  );
};

export default Budgets;
