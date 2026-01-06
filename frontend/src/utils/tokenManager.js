export const clearExpiredToken = () => {
  const tokenData = localStorage.getItem("tokenData");
  if (tokenData) {
    try {
      const { timestamp } = JSON.parse(tokenData);
      const now = Date.now();
      const hoursPassed = (now - timestamp) / (1000 * 60 * 60);
      
      if (hoursPassed > 24) {
        localStorage.clear();
        return true;
      }
    } catch (error) {
      localStorage.clear();
      return true;
    }
  }
  return false;
};

export const refreshTokenIfNeeded = async () => {
  return true;
};