import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  filterType: 'bodyPart' | 'target' | 'equipment' | null;
  selectedFilter: string | null;
  handleFilterSelect: (type: 'bodyPart' | 'target' | 'equipment', value: string) => void;
  clearFilters: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [filterType, setFilterType] = useState<'bodyPart' | 'target' | 'equipment' | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handleFilterSelect = (type: 'bodyPart' | 'target' | 'equipment', value: string) => {
    setFilterType(type);
    setSelectedFilter(value);
  };

  const clearFilters = () => {
    setFilterType(null);
    setSelectedFilter(null);
  };

  return (
    <AppContext.Provider value={{ filterType, selectedFilter, handleFilterSelect, clearFilters }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
