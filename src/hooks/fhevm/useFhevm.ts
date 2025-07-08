'use client';

import { useState, useEffect, useCallback } from 'react';
import { FhevmInstance } from 'fhevmjs/bundle';
import { useAccount, useWalletClient } from 'wagmi';
import { initializeFhevm, createFhevmInstance, getFhevmInstance } from '@/lib/fhevm/fhevmInstance';

interface UseFhevmReturn {
  instance: FhevmInstance | null;
  isLoading: boolean;
  error: string | null;
  initFhevm: () => Promise<void>;
  createInstance: (contractAddress: string) => Promise<FhevmInstance | null>;
  encrypt: (value: number, contractAddress: string, userAddress: string) => Promise<{ handles: Uint8Array[]; inputProof: Uint8Array } | null>;
}

export const useFhevm = (): UseFhevmReturn => {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const initFhevm = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await initializeFhevm();
      console.log('FhEVM initialized');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize FhEVM';
      setError(errorMessage);
      console.error('FhEVM initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createInstance = useCallback(async (contractAddress: string): Promise<FhevmInstance | null> => {
    if (!isConnected || !walletClient) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fhevmInstance = await createFhevmInstance(walletClient, contractAddress);
      setInstance(fhevmInstance);
      return fhevmInstance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create FhEVM instance';
      setError(errorMessage);
      console.error('FhEVM instance creation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletClient]);

  const encrypt = useCallback(async (
    value: number,
    contractAddress: string,
    userAddress: string
  ): Promise<{ handles: Uint8Array[]; inputProof: Uint8Array } | null> => {
    const currentInstance = instance ?? getFhevmInstance();
    
    if (!currentInstance) {
      setError('FhEVM instance not available');
      return null;
    }

    try {
      // Create encrypted input for the value (as euint8 for choices 0-3)
      const encryptedInput = await currentInstance
        .createEncryptedInput(contractAddress, userAddress)
        .add8(value)
        .encrypt();
      
      return encryptedInput;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Encryption failed';
      setError(errorMessage);
      console.error('Encryption error:', err);
      return null;
    }
  }, [instance]);

  // Initialize FhEVM on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initFhevm();
    }
  }, [initFhevm]);

  return {
    instance,
    isLoading,
    error,
    initFhevm,
    createInstance,
    encrypt,
  };
};
