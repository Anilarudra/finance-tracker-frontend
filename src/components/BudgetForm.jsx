import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {useAuth} from '../context/AuthContext'

const EXPENSE_CATEGORIES = [
  'Groceries', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Food', 'Healthcare', 'Insurance', 'Other Expense'
];


const BudgetForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    category: EXPENSE_CATEGORIES[0],
    limit_amount: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || EXPENSE_CATEGORIES[0],
        limit_amount: initialData.limit_amount !== undefined ? String(initialData.limit_amount) : (initialData.limitAmount !== undefined ? String(initialData.limitAmount) : '')
      });
    } else {
      setFormData({
        category: EXPENSE_CATEGORIES[0],
        limit_amount: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.category) {
        setError('Please select a category.');
        return;
    }

    if (
        formData.limit_amount === '' ||
        isNaN(Number(formData.limit_amount)) ||
        Number(formData.limit_amount) <= 0
    ) {
        setError('Please enter a valid limit greater than zero.');
        return;
    }

    const budgetData = {
        category: formData.category,
        limitAmount: Number(formData.limit_amount)
    };

    console.log("Sending Budget:", budgetData);

    onSubmit(budgetData);
};

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h3>{initialData ? 'Edit Category Budget' : 'Configure New Budget'}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field-group">
            <label htmlFor="budgetCategory">Spending Category</label>
            <select
              id="budgetCategory"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-control"
              required
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="budgetLimit">Monthly Limit ($)</label>
            <input
              type="number"
              step="0.01"
              id="budgetLimit"
              name="limit_amount"
              value={formData.limit_amount}
              onChange={handleChange}
              className="form-control"
              placeholder="0.00"
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Save Budget' : 'Establish Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
