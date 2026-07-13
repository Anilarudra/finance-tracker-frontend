import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TRANSACTION_CATEGORIES = {
  INCOME: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Savings Interest', 'Refunds', 'Other Income'],
  EXPENSE: ['Groceries', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Food', 'Healthcare', 'Insurance', 'Other Expense']
};

const TransactionForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'EXPENSE',
        amount: initialData.amount !== undefined ? String(initialData.amount) : '',
        category: initialData.category || '',
        date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        note: initialData.note || initialData.description || ''
      });
    } else {
      setFormData({
        type: 'EXPENSE',
        amount: '',
        category: TRANSACTION_CATEGORIES.EXPENSE[0],
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
    }
  }, [initialData, isOpen]);

  const handleTypeChange = (newType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      category: TRANSACTION_CATEGORIES[newType][0]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.amount === '' || isNaN(Number(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setError('Please input a valid numeric amount greater than zero.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }
    if (!formData.date) {
      setError('Please select a transaction date.');
      return;
    }

    onSubmit({
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      note: formData.note.trim()
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h3>{initialData ? 'Edit Transaction' : 'Record Transaction'}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field-group" style={{ marginBottom: '1.5rem' }}>
            <label>Transaction Type</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                className={`btn ${formData.type === 'EXPENSE' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => handleTypeChange('EXPENSE')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`btn ${formData.type === 'INCOME' ? 'btn-success' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => handleTypeChange('INCOME')}
              >
                Income
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field-group">
              <label htmlFor="txAmount">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                id="txAmount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="form-control"
                placeholder="0.00"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="txDate">Date</label>
              <input
                type="date"
                id="txDate"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="txCategory">Category</label>
            <select
              id="txCategory"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-control"
              required
            >
              {TRANSACTION_CATEGORIES[formData.type].map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="txNote">Note (Optional)</label>
            <input
              type="text"
              id="txNote"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g. Weekly grocery checkouts, salary credit"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Save Transaction' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
