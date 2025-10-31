import type { TAssetInfo, TChain } from "@paraspell/sdk";
import { getSupportedAssets } from "@paraspell/sdk";
import { useMemo } from "react";

// Custom hook to get currency options based on the selected chains
// This way we can directly get the supported assets for the selected chains
const useCurrencyOptions = (from: TChain, to: TChain) => {
  // Get supported assets for the selected chains using the SDK
  const supportedAssets = useMemo(
    () => getSupportedAssets(from, to),
    [from, to]
  );

  // Create a map of supported assets for easy access
  const currencyMap = useMemo(
    () =>
      supportedAssets.reduce((map: Record<string, TAssetInfo>, asset) => {
        const key = `${asset.symbol ?? "NO_SYMBOL"}-${
          ("assetId" in asset
            ? asset.assetId
            : JSON.stringify(asset?.location)) ?? "NO_ID"
        }`;
        map[key] = asset;
        return map;
      }, {}),
    [supportedAssets]
  );

  // Create options for the currency select dropdown
  const currencyOptions = useMemo(
    () =>
      Object.keys(currencyMap).map((key) => ({
        value: key,
        label: `${currencyMap[key].symbol} - ${
          ("assetId" in currencyMap[key]
            ? currencyMap[key].assetId
            : "Location") ?? "Native"
        }`,
      })),
    [currencyMap]
  );

  return { currencyOptions, currencyMap };
};

export default useCurrencyOptions;
