

export const getToken = () => {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    
    sessionStorage.setItem('token', token);
  } catch (error) {
    console.error("Error:", error);
  }
};

export const removeToken = () => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  } catch (error) {
    console.error("Error:", error);
  }
};
