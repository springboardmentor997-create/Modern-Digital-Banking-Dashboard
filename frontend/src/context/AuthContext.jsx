import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, signup as signupApi } from "../api/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (data) => {
    try {
      console.log('AuthContext: Calling login API...');
      const response = await loginApi(data);
      console.log('AuthContext: Login API response:', response);
      console.log('AuthContext: access_token exists?', !!response?.access_token);
      console.log('AuthContext: user exists?', !!response?.user);
      
      if (response?.access_token) {
        console.log('AuthContext: Saving token and user to localStorage');
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setToken(response.access_token);
        setUser(response.user);
        console.log('AuthContext: Login successful, returning true');
        return true; 
      }
      console.log('AuthContext: No access_token in response, returning false');
      return false;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      const response = await signupApi(data);
      if (response?.access_token) {
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setToken(response.access_token);
        setUser(response.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContext;