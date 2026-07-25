import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AccountForm = ({ isOpen, onClose, onSubmit, initialData }) => {

  const [formData, setFormData] = useState({
    account_number: '',
    bank_name: '',
    balance: ''
  
  });

  const [error, setError] = useState('');


  const normalizeAccountData = (data = {}) => ({

    account_number:
      data.accountNumber ||
      data.account_number ||
      '',

    bank_name:
      data.bankName ||
      data.bank_name ||
      '',

    balance:
      data.balance !== undefined
        ? String(data.balance)
        : '',
  });



  useEffect(() => {

    if (initialData) {

      setFormData(normalizeAccountData(initialData));

    }
    else {

      setFormData({
        account_number: '',
        bank_name: '',
        balance: ''
        
      });

    }

  }, [initialData, isOpen]);




  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };




  const handleSubmit = (e) => {

    e.preventDefault();

    setError('');



    if (formData.account_number.trim() === '') {

      setError("Account number is required");
      return;

    }



    if (formData.bank_name.trim() === '') {

      setError("Bank name is required");
      return;

    }



    if (formData.balance === '' || isNaN(formData.balance)) {

      setError("Enter valid balance");
      return;

    }



    const accountData = {

      // IMPORTANT: match Spring Entity fields

      accountNumber:
        formData.account_number.trim(),

      bankName:
        formData.bank_name.trim(),

      balance:
        Number(formData.balance)

    
    };


    console.log("Sending Account Data:", accountData);


    onSubmit(accountData);


  };




  if (!isOpen)
    return null;



  return (

    <div className="modal-overlay">

      <div className="modal-content glass-panel">


        <div className="modal-header">

          <h3>
            {initialData ? "Edit Account" : "Add Account"}
          </h3>


          <button
            type="button"
            onClick={onClose}
          >

            <X size={20} />

          </button>


        </div>

        <form onSubmit={handleSubmit}>


          {
            error &&
            <div className="alert alert-error">
              {error}
            </div>
          }



          <div className="field-group">

            <label>
              Account Number
            </label>


            <input

              type="text"

              name="account_number"

              value={formData.account_number}

              onChange={handleChange}

              className="form-control"

              autoComplete='off'

            />

          </div>




          <div className="field-group">

            <label>
              Bank Name
            </label>


            <input

              type="text"

              name="bank_name"

              value={formData.bank_name}

              onChange={handleChange}

              className="form-control"

              autoComplete='off'

            />

          </div>




          <div className="field-group">

            <label>
              Balance
            </label>


            <input

              type="number"

              name="balance"

              value={formData.balance}

              onChange={handleChange}

              className="form-control"

            />

          </div>



          <div className="modal-footer">


            <button

              type="button"

              onClick={onClose}

              className="btn btn-secondary"

            >

              Cancel

            </button>



            <button

              type="submit"

              className="btn btn-primary"

            >

              {
                initialData ?
                  "Update Account" :
                  "Create Account"
              }

            </button>



          </div>



        </form>



      </div>


    </div>

  );

};


export default AccountForm;