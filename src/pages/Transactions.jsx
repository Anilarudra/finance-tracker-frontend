import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import TransactionForm from '../components/TransactionForm';
import { Plus, Edit2, Trash2, Search, Filter, Download, FileText, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TRANSACTION_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Savings Interest', 'Refunds', 'Groceries', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Food', 'Healthcare', 'Insurance', 'Other Income', 'Other Expense'];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth()

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterAccount, setFilterAccount] = useState('ALL');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Modal open status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.userId) return;

    setLoading(true);

    try {
      const [txs, accs] = await Promise.all([
        api.getTransactions(user.userId),
        api.getAccounts(user.userId)
      ]);

      setTransactions(txs || []);
      setAccounts(accs || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Delete this transaction permanently? The associated account balance will adjust automatically.')) {
      try {
        await api.deleteTransaction(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete transaction.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, formData);
      } else {
        await api.createTransaction(user.userId, formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    }
  };

  // Helper selectors
  const getAccountName = (accountId) => {
    const account = accounts.find(
      a => Number(a.id) === Number(accountId)
    );

    return account ? account.bankName : "Unknown Account";
  };

  const getAccountType = (accountId) => {

    const account2 = accounts.find(
      a => Number(a.id) === Number(accountId)
    );

    return account2 ? account2.status : "Unknown";
  }

  // Apply filters
  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      const noteText = tx.note || tx.description || '';
      const matchesSearch = noteText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'ALL' || tx.type === filterType;
      const matchesCategory = filterCategory === 'ALL' || tx.category === filterCategory;
      const matchesAccount =
        filterAccount === 'ALL' ||
        Number(tx.account?.id) === Number(filterAccount);

      let matchesStartDate = true;
      if (filterStartDate) {
        const txDate = new Date(tx.date);
        const startDate = new Date(filterStartDate);

        txDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        matchesStartDate = txDate >= startDate;
      }

      let matchesEndDate = true;
      if (filterEndDate) {
        const txDate = new Date(tx.date);
        const endDate = new Date(filterEndDate);

        txDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        matchesEndDate = txDate <= endDate;
      }

      return matchesSearch && matchesType && matchesCategory && matchesAccount && matchesStartDate && matchesEndDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // EXPORT CSV UTILITY
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount ($)', 'Source Account'];
    const csvRows = [headers.join(',')];

    filteredTransactions.forEach(t => {
      const row = [
        t.date,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.type,
        t.category,
        t.amount.toFixed(2),
        `"${getAccountName(t.account?.id).replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinanceFlow_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT PDF PRINT SHEET UTILITY
  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      alert("No transaction records to print.");
      return;
    }
    const printWindow = window.open('', '_blank');

    // Sort transactions chronologically for statement
    const sortedTxs = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    const tableRows = sortedTxs.map(t => `
      <tr>
        <td>${t.date}</td>
        <td>${t.description || '-'}</td>
        <td><span class="badge ${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}">${t.type}</span></td>
        <td>${t.category}</td>
        <td style="text-align: right; font-weight: bold; color: ${t.type === 'INCOME' ? '#10b981' : '#f43f5e'}">
          ${t.type === 'INCOME' ? '+' : '-'}$${t.amount.toFixed(2)}
        </td>
        <td>${getAccountName(t.accountId)}</td>
      </tr>
    `).join('');

    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const totalIncome = sortedTxs.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = sortedTxs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpense;

    printWindow.document.write(`
      <html>
        <head>
          <title>FinanceFlow Ledger Statement</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; padding: 40px; margin: 0; line-height: 1.5; }
            .header-table { width: 100%; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 26px; font-weight: 800; color: #4f46e5; letter-spacing: -0.025em; }
            .subtitle { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; margin-top: 5px; }
            .summary-grid { display: table; width: 100%; margin-bottom: 30px; border-collapse: separate; border-spacing: 15px 0; margin-left: -15px; margin-right: -15px; }
            .summary-cell { display: table-cell; background: #f9fafb; border-radius: 8px; padding: 18px; border: 1px solid #e5e7eb; width: 33%; }
            .cell-label { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
            .cell-value { font-size: 20px; font-weight: 800; margin-top: 5px; }
            table.history { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f3f4f6; color: #374151; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 700; border-bottom: 2px solid #e5e7eb; }
            td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12.5px; color: #4b5563; }
            tr:nth-child(even) td { background-color: #f9fafb; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
            .badge-income { background-color: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
            .badge-expense { background-color: rgba(244,63,94,0.1); color: #f43f5e; border: 1px solid rgba(244,63,94,0.2); }
            .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="title">FINANCEFLOW STATEMENT</div>
                <div class="subtitle">Secure Accountant ledger audit log</div>
              </td>
              <td style="text-align: right; font-size: 13px; color: #6b7280;">
                <div>Statement Date: <strong>${today}</strong></div>
                <div>Record Output Count: <strong>${sortedTxs.length} items</strong></div>
              </td>
            </tr>
          </table>

          <div class="summary-grid">
            <div class="summary-cell">
              <div class="cell-label">Total Inflow (Income)</div>
              <div class="cell-value" style="color: #10b981;">+$${totalIncome.toFixed(2)}</div>
            </div>
            <div class="summary-cell">
              <div class="cell-label">Total Outflow (Expenses)</div>
              <div class="cell-value" style="color: #f43f5e;">-$${totalExpense.toFixed(2)}</div>
            </div>
            <div class="summary-cell">
              <div class="cell-label">Net Surplus (Savings)</div>
              <div class="cell-value" style="color: ${netSavings >= 0 ? '#4f46e5' : '#f43f5e'};">
                ${netSavings >= 0 ? '+' : ''}$${netSavings.toFixed(2)}
              </div>
            </div>
          </div>

          <h3 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #111827; margin: 0 0 10px;">Transaction Line History</h3>
          <table class="history">
            <thead>
              <tr>
                <th style="width: 15%;">Date</th>
                <th style="width: 30%;">Description</th>
                <th style="width: 12%;">Type</th>
                <th style="width: 15%;">Category</th>
                <th style="width: 13%; text-align: right;">Amount</th>
                <th style="width: 15%;">Account</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            <p>This is a system generated document from FinanceFlow personal tracking database. Confidential Audit Document.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading ledger statement lines...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="chart-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Ledger Statements</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track, audit, edit, and export your transaction ledger rows</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={exportToCSV} title="Export CSV Sheet">
            <Download size={18} />
            CSV
          </button>
          <button className="btn btn-secondary" onClick={exportToPDF} title="Print statement details to PDF">
            <FileText size={18} />
            PDF Report
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal} disabled={accounts.length === 0}>
            <Plus size={18} />
            Log Transaction
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Dynamic Filters Bar */}
      <div className="glass-panel filters-bar" style={{ margin: '1.5rem 0' }}>
        <div className="filters-group" style={{ flexGrow: 1 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: '180px' }}>
            <input
              type="text"
              placeholder="Search description..."
              className="form-control"
              style={{ paddingLeft: '2.25rem', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-control"
            style={{ minWidth: '120px' }}
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Incomes</option>
            <option value="EXPENSE">Expenses</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-control"
            style={{ minWidth: '150px' }}
          >
            <option value="ALL">All Categories</option>
            {TRANSACTION_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="form-control"
            style={{ minWidth: '160px' }}
          >
            <option value="ALL">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.bankName}</option>
            ))}
          </select>
        </div>

        <div className="filters-group">
          <input
            type="date"
            placeholder="Start"
            className="form-control"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            title="Start date filter"
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            placeholder="End"
            className="form-control"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            title="End date filter"
          />
        </div>
      </div>

      {filteredTransactions.length > 0 ? (
        <div className="glass-panel table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Category</th>
                <th>Bank Account</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(tx.date).toLocaleDateString("en-GB")}</td>
                  <td>{tx.note || tx.note || tx.description || '-'}</td>
                  <td>
                    <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>{tx.category}</td>
                  <td>{getAccountName(tx.account?.id)}</td>
                  <td style={{
                    textAlign: 'right',
                    fontWeight: 700,
                    color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--danger)',
                    fontFamily: 'var(--font-family-heading)'
                  }}>
                    {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>

                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                      <button className="btn-icon" onClick={() => handleOpenEditModal(tx)} title="Edit details">
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDeleteTransaction(tx.id)}
                        style={{ color: 'var(--danger)' }}
                        title="Delete record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <ArrowUpDown size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Transactions Logged</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No ledger rows match your filters. Register accounts and log spending transactions to audit details.</p>
        </div>
      )}

      {/* Forms trigger popup */}
      <TransactionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        accounts={accounts}
        initialData={editingTransaction}
      />
    </div>
  );
};

export default Transactions;
