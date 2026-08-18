const API_BASE_URL ='https://finance-tracker-backend-lxv5.onrender.com/api';

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


  deleteAccount :async(userId,accountId) =>{

    return request(`/users/${userId}/deleteaccount/${accountId}`,
      {
        method:"DELETE",
      }
    );
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

  // User Profile

  changePassword: async (userId, passwordData) => {
    return request(`/users/${userId}/changepassword`, {
      method: "PUT",
      body: JSON.stringify(passwordData)
    });
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

    // Handle errors
    if (!response.ok) {
        let errorMessage = "Something went wrong";

        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } else {
            errorMessage = await response.text();
        }

        throw new Error(errorMessage);
    }

    // Read successful response
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};