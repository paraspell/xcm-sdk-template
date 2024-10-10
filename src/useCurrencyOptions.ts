import type { TAsset, TNodeWithRelayChains } from "@paraspell/sdk";
import { getSupportedAssets } from "@paraspell/sdk";
import { useMemo } from "react";

// Custom hook to get currency options based on the selected nodes
// This way we can directly get the supported assets for the selected nodes
const useCurrencyOptions = (
  from: TNodeWithRelayChains,
  to: TNodeWithRelayChains
) => {
  // Get supported assets for the selected nodes using the SDK
  const supportedAssets = useMemo(
    () => getSupportedAssets(from, to),
    [from, to]
  );

  // Create a map of supported assets for easy access
  const currencyMap = useMemo(
    () =>
      supportedAssets.reduce((map: Record<string, TAsset>, asset) => {
        const key = `${asset.symbol ?? "NO_SYMBOL"}-${
          asset.assetId ?? "NO_ID"
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
          currencyMap[key].assetId ?? "Native"
        }`,
      })),
    [currencyMap]
  );

  return { currencyOptions, currencyMap };
};

export default useCurrencyOptions;
