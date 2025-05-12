import { createContext, useState, useContext } from 'react';

// 1. Create context
const RefreshContext = createContext();

// 2. Create provider component
export const RefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const refresh = () => setRefreshKey(prev => prev + 1);

  return (
    <RefreshContext.Provider value={{ refreshKey, refresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

// 3. Create custom hook
export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};