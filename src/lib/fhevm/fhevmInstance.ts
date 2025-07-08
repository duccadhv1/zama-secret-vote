import { initFhevm, createInstance, FhevmInstance } from 'fhevmjs/bundle';
import {
  NEXT_PUBLIC_ACL_ADDRESS,
  NEXT_PUBLIC_KMS_ADDRESS,
  NEXT_PUBLIC_GATEWAY_URL,
} from '@/config/env';

let fhevmInstance: FhevmInstance | null = null;

export const initializeFhevm = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return; // Skip initialization on server side
  }

  try {
    await initFhevm();
    console.log('FhEVM initialized successfully');
  } catch (error) {
    console.error('Failed to initialize FhEVM:', error);
    throw error;
  }
};

export const createFhevmInstance = async (
  provider: any,
  contractAddress: string
): Promise<FhevmInstance> => {
  if (!contractAddress) {
    throw new Error('Contract address is required');
  }

  if (!NEXT_PUBLIC_ACL_ADDRESS || !NEXT_PUBLIC_KMS_ADDRESS || !NEXT_PUBLIC_GATEWAY_URL) {
    throw new Error('Missing required environment variables for FhEVM');
  }

  try {
    const instance = await createInstance({
      chainId: 8009,
      networkUrl: 'https://devnet.zama.ai',
      gatewayUrl: NEXT_PUBLIC_GATEWAY_URL,
      kmsContractAddress: NEXT_PUBLIC_KMS_ADDRESS,
      aclContractAddress: NEXT_PUBLIC_ACL_ADDRESS,
    });

    fhevmInstance = instance;
    return instance;
  } catch (error) {
    console.error('Failed to create FhEVM instance:', error);
    throw error;
  }
};

export const getFhevmInstance = (): FhevmInstance | null => {
  return fhevmInstance;
};
