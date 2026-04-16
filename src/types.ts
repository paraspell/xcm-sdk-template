import type { TAssetInfo, TChain, TExchangeChain, TSubstrateChain } from "@paraspell/sdk";

export type FormValues = {
  from: TSubstrateChain;
  to: TChain;
  currencyOptionId: string;
  recipient: string;
  amount: string;
  currency: TAssetInfo;
  swapEnabled: boolean;
  currencyTo?: TAssetInfo;
  exchange?: TExchangeChain;
};
