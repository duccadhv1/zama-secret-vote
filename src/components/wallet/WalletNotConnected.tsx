import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/wallet/useWallet";
import Image from "next/image";
import NetworkSetup from "./NetworkSetup";

const WalletNotConnected = () => {
  const { isConnected, openConnectModal } = useWallet();

  const handleConnect = () => {
    if (!isConnected && openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center mt-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex flex-col items-center justify-center p-12 bg-muted max-w-md mx-auto"
      >
        <Image
          src="/assets/wallet.png"
          alt="Wallet"
          width={48}
          height={48}
          className="h-12 w-12 text-muted-foreground mb-4"
        />
        <h2 className="text-xl font-medium mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Connect your wallet to participate in confidential voting.
        </p>
        <Button size="lg" className="mt-2" onClick={handleConnect}>
          Connect Wallet
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <NetworkSetup />
      </motion.div>
    </div>
  );
};

export default WalletNotConnected;
