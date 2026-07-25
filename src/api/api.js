const API_BASE_URL ='https://finance-tracker-backend-2tw2.onrender.com/api';

export const setToken = (token) => {
    localStorage.setItem("token", token);
};


export const getToken = () => {
    return localStorage.getItem("token");
};

export const api = {


  registerUser: async (userData) => {

    return request('/users/register', {

        method:"POST",

        body:JSON.stringify(userData)

    });

},


  login: async (email, password) => {

    return request('/users/login', {
      method: "POST",
      body: JSON.stringify({
        email,
        password
      })
    });

  },



  // Accounts

  createAccount: async (userId, accountData) => {

    return request(`/users/${userId}/addaccount`,
      {
        method: "POST",
        body: JSON.stringify(accountData)
      });

  },


  getAccounts: async (userId) => {

    return request(`/users/${userId}/getaccounts`);

  },



  // Transactions

  createTransaction: async (userId, data) => {

    return request(`/transactions/${userId}/add`,
      {
        method: "POST",
        body: JSON.stringify(data)
      });

  },


  updateTransaction: async (id, data) => {

    return request(`/transactions/${id}/update`,
      {
        method: "PUT",
        body: JSON.stringify(data)
      });

  },


  deleteTransaction: async (id) => {

    return request(`/transactions/${id}/delete`,
      {
        method: "DELETE"
      });

  },

 // Get all transactions of user

getTransactions: async (userId) => {

    return request(`/transactions/${userId}`, {
        method: "GET"
    });

},

  // Budgets

  createBudget: async (userId, data) => {

    return request(`/budgets/${userId}/add`,
      {
        method: "POST",
        body: JSON.stringify(data)
      });

  },


  updateBudget: async (userId, category, data) => {

    return request(
      `/budgets/${userId}/${category}/setlimit`,
      {
        method: "PATCH",
        body: JSON.stringify(data)
      }
    );

  },

  getBudgets: async(userId)=>{

     return request(
      `/budgets/${userId}`,{
        method: "GET"
      }
     )
  },

  deleteBudget: async (userId, category) => {
  return request(
    `/budgets/${userId}/${encodeURIComponent(category)}/delete`,
    {
      method: "DELETE"
    }
  );
},
  
};
const request = async (endpoint, options = {}) => {

    const token = localStorage.getItem("token");

    const response = await fetch(API_BASE_URL + endpoint, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        }
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    // Read response as text first
    const text = await response.text();

    // No response body
    if (!text) {
        return null;
    }

    // If it's JSON, parse it
    try {
        return JSON.parse(text);
    } catch {
        // Otherwise return plain text
        return text;
    }
};