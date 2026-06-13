import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

export type Environment = 'staging' | 'production';

export interface EnvironmentConfig {
  apiKey: string;
  label: string;
}

interface EnvironmentContextType {
  currentEnv: Environment;
  switchEnvironment: (env: Environment) => void;
  environments: Record<Environment, EnvironmentConfig> | null;
  organizationName: string;
  isLoading: boolean;
  isStaging: boolean;
  isProduction: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

const ENV_STORAGE_KEY = 'embedcraft_active_environment';

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEnv, setCurrentEnv] = useState<Environment>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(ENV_STORAGE_KEY) as Environment) || 'production';
    }
    return 'production';
  });
  const [environments, setEnvironments] = useState<Record<Environment, EnvironmentConfig> | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch environment config from backend
  useEffect(() => {
    const fetchEnvConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Ensure apiClient has the token. EnvironmentProvider's useEffect runs before 
        // AuthProvider's useEffect, meaning the token isn't in apiClient yet.
        apiClient.setApiKey(token);

        const data = await apiClient.getEnvironmentConfig();
        
        setOrganizationName(data.organizationName || '');
        setEnvironments(data.environments || null);

        // Set the API key for the current environment
        const envConfig = data.environments?.[currentEnv];
        if (envConfig?.apiKey) {
          // We don't overwrite the JWT auth key - the environment API key is for SDK use
          // The dashboard always uses JWT for its own API calls
        }
      } catch (error) {
        console.error('Failed to fetch environment config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnvConfig();
  }, []);

  const switchEnvironment = useCallback((env: Environment) => {
    setCurrentEnv(env);
    localStorage.setItem(ENV_STORAGE_KEY, env);
    
    // Clear zustand persisted stores to force re-fetch for the new environment
    localStorage.removeItem('nudge-platform-storage');
    localStorage.removeItem('editor-store');
    
    // Reload the page to re-fetch all data
    window.location.reload();
  }, []);

  return (
    <EnvironmentContext.Provider
      value={{
        currentEnv,
        switchEnvironment,
        environments,
        organizationName,
        isLoading,
        isStaging: currentEnv === 'staging',
        isProduction: currentEnv === 'production',
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};
