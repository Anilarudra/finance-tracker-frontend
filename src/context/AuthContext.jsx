import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, setToken, getToken } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = getToken();
    const mockUser = localStorage.getItem('ft_current_user');
    
    if (token) {
      if (mockUser) {
        setUser(JSON.parse(mockUser));
      } else {
        // Fallback or real user decoding
        setUser({
    userId: 1,
    email: 'User'
});
      }
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {

    setError(null);
    setLoading(true);

    try {

        const response = await api.login(email, password);

        console.log("Backend login response:", response);


        const userData = {

            userId: response.userId,
            email: response.email ,
            token: response.token 

        };


        if(response.token){
            setToken(response.token);
        }


        localStorage.setItem(
            "ft_current_user",
            JSON.stringify(userData)
        );


        setUser(userData);
        setIsAuthenticated(true);

        setLoading(false);

        return true;


    } catch(err){

        console.log("Login error:", err);

        setError(err.message || "Login failed");

        setLoading(false);

        throw err;
    }
};

  const signup = async (name, email, password) => {

    setError(null);
    setLoading(true);

    try {


        const response = await api.registerUser({

            name: name,

            email: email,

            password: password

        });


        setLoading(false);

        return response;


    }
    catch(err){

        setError(
            err.message || "Signup failed"
        );

        setLoading(false);

        throw err;

    }

};
  const logout = () => {
    setToken('');
    localStorage.removeItem('ft_current_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        signup,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
