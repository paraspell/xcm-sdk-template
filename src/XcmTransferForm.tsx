import { useState, useEffect, FormEvent, FC } from "react";
import useCurrencyOptions from "./useCurrencyOptions";
import {
  NODES_WITH_RELAY_CHAINS,
  TNodeWithRelayChains,
  TAsset,
} from "@paraspell/sdk";

export type FormValues = {
  from: TNodeWithRelayChains;
  to: TNodeWithRelayChains;
  currencyOptionId: string;
  address: string;
  amount: string;
  currency?: TAsset;
};

type Props = {
  onSubmit: (values: FormValues) => void;
  loading: boolean;
};

const TransferForm: FC<Props> = ({ onSubmit, loading }) => {
  // Prepare states for the form fields
  const [originNode, setOriginNode] = useState<TNodeWithRelayChains>("Astar");
  const [destinationNode, setDestinationNode] =
    useState<TNodeWithRelayChains>("Moonbeam");
  const [currencyOptionId, setCurrencyOptionId] = useState("");
  const [address, setAddress] = useState(
    "5F5586mfsnM6durWRLptYt3jSUs55KEmahdodQ5tQMr9iY96"
  );
  const [amount, setAmount] = useState("10000000000000000000");

  // Get currency options based on the selected nodes
  const { currencyOptions, currencyMap } = useCurrencyOptions(
    originNode,
    destinationNode
  );

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const transformedValues = {
      from: originNode,
      to: destinationNode,
      currencyOptionId,
      address,
      amount,
      // Get the selected currency based on the currency option id
      currency: currencyMap[currencyOptionId],
    };

    // Pass the submitted form values to the parent component
    onSubmit(transformedValues);
  };

  useEffect(() => {
    // Set default currency option if available
    if (currencyOptions.length > 0) {
      setCurrencyOptionId(currencyOptions[0].value);
    }
  }, [currencyOptions]);

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Origin node
        <select
          value={originNode}
          onChange={(e) =>
            setOriginNode(e.target.value as TNodeWithRelayChains)
          }
          required
        >
          {NODES_WITH_RELAY_CHAINS.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </label>

      <label>
        Destination node
        <select
          value={destinationNode}
          onChange={(e) =>
            setDestinationNode(e.target.value as TNodeWithRelayChains)
          }
          required
        >
          {NODES_WITH_RELAY_CHAINS.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </label>

      <label>
        Currency
        <select
          value={currencyOptionId}
          onChange={(e) => setCurrencyOptionId(e.target.value)}
          required
        >
          {currencyOptions.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Recipient address
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </label>

      <label>
        Amount
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit transaction"}
      </button>
    </form>
  );
};

export default TransferForm;
