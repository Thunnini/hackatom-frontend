import { WalletProvider } from "@node-a-team/cosmosjs/dist/core/walletProvider";

export default interface SignIn {
  getWalletProvider(): WalletProvider;
}
