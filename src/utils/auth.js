// Auth utility functions
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getUserFromToken = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  const decoded = decodeJWT(token);
  return decoded;
};

export const getUserRole = () => {
  const user = getUserFromToken();
  return user?.role || user?.Role || null;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  try {
    const decoded = decodeJWT(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/auth';
};