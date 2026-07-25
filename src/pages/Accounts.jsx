import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import AccountForm from '../components/AccountForm';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, ShieldCheck, Landmark } from 'lucide-react';

const Accounts = () => {

  const { user } = useAuth();   // <-- Get logged-in user

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);


  useEffect(() => {

    if (user) {
      fetchAccounts();
    }

  }, [user]);


  const fetchAccounts = async () => {

    setLoading(true);

    try {

      const data = await api.getAccounts(user.userId);

      setAccounts(data || []);

    } catch (err) {

      setError('Failed to fetch accounts data.');

    } finally {

      setLoading(false);

    }
  };


  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };


  const handleOpenEditModal = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };


  const handleFormSubmit = async (formData) => {

    try {


      if (editingAccount) {

        await api.updateAccount(
          editingAccount.id,
          formData
        );


      } else {


        await api.createAccount(
          user.userId,
          formData
        );


      }


      setIsModalOpen(false);

      fetchAccounts();


    } catch (err) {

      setError(
        err.message || "Operation failed."
      );

    }

  };


  const handleDeleteAccount = async (id) => {

    if (window.confirm(
      "Are you sure you want to delete this account?"
    )) {

      try {

        await api.deleteAccount(user.userId,id);

        fetchAccounts();

      } catch (err) {

        setError(
          err.message || "Failed to delete account."
        );

      }

    }

  };


  const totalBalance = accounts.reduce(
    (sum, a) => sum + a.balance,
    0
  );


  if (loading) {

    return (
      <div>
        Loading Accounts Statement...
      </div>
    );

  }


  return (

    <div className="page-container">

      <div className="chart-header">

        <div>

          <h1>
            Account Portfolios
          </h1>

        </div>


        <button
          className="btn btn-primary"
          onClick={handleOpenAddModal}
        >

          <Plus size={18} />
          Add Account

        </button>

      </div>


      {error &&
        <div className="alert alert-error">
          {error}
        </div>
      }


      <div className="glass-panel">

        <Landmark size={28} />
        <br />
        <h2>
          Total Bank Balance : {totalBalance.toLocaleString()}
        </h2>

      </div>



      {accounts.length > 0 ? (

        <div className="cards-grid">

          {accounts.map(acc => (

            <div
              key={acc.id}
              className="glass-panel card-item"
            >

              <h3>
                Bank Name : {acc.bankName}
              </h3>
              <br>
              </br>
              <p>
                Account Number : {acc.accountNumber}
              </p>
              <br>
              </br>
              
              <p>
                  Account Type : {acc.status}
              </p>
              <br />

              <h2>
                Balance : {acc.balance}
              </h2>


              <button
                onClick={() => handleDeleteAccount(acc.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  marginTop: "12px",
                  width: "100%",
                  transition: "0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#b91c1c"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
              >
                <Trash2 size={18} />
                Delete Account
              </button>


            </div>

          ))}


        </div>

      ) : (


        <div className="glass-panel" style={{ marginTop: "24px", textAlign: "center" }}>

          <h3>
            No Accounts Configured
          </h3>
        </div>

      )}


      <AccountForm

        isOpen={isModalOpen}

        onClose={() => {
          setIsModalOpen(false)
        }}

        onSubmit={handleFormSubmit}

        initialData={editingAccount}

      />


    </div>

  );

};


export default Accounts;