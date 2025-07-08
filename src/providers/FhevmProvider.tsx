import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import {
  createFhevmInstance,
  getFhevmStatus,
  init,
  FhevmStatus,
} from "@/lib/fhevm/fhevmjs";
import { useWallet } from "@/hooks/wallet/useWallet";

interface FhevmContextType {
  isInitialized: boolean;
  instanceStatus: FhevmStatus;
}

export const FhevmContext = createContext<FhevmContextType | undefined>(
  undefined
);

export function FhevmProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [instanceStatus, setInstanceStatus] =
    useState<FhevmStatus>("uninitialized");
  const { isConnected, isSepoliaChain } = useWallet();

  // Handle initial FHEVM library initialization
  useEffect(() => {
    if (window.fhevmjsInitialized) return;
    window.fhevmjsInitialized = true;

    init()
      .then(() => setIsInitialized(true))
      .catch((e) => {
        console.error("Failed to initialize FHEVM:", e);
        setIsInitialized(false);
      });
  }, []); // Only run once on mount

  // Handle instance creation/cleanup based on wallet state
  useEffect(() => {
    if (!isInitialized) return;

    // For development with simplified contract, we can skip FHEVM instance creation
    // Only create FHEVM instance if on Sepolia and using encrypted features
    if (isConnected && isSepoliaChain) {
      createFhevmInstance()
        .then(() => setInstanceStatus(getFhevmStatus()))
        .catch((error) => {
          console.error("Failed to create FHEVM instance:", error);
          setInstanceStatus("error");
        });
    } else if (isConnected) {
      // For local development (Hardhat), set as ready without FHEVM
      setInstanceStatus("ready");
    }

    return () => {
      // Cleanup previous instance if necessary
      setInstanceStatus("uninitialized");
    };
  }, [isInitialized, isConnected, isSepoliaChain]);

  const contextValue = useMemo(
    () => ({
      isInitialized,
      instanceStatus,
    }),
    [isInitialized, instanceStatus]
  );

  return (
    <FhevmContext.Provider value={contextValue}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevm() {
  const context = useContext(FhevmContext);
  if (context === undefined) {
    throw new Error("useFhevm must be used within a FhevmProvider");
  }
  return context;
}
