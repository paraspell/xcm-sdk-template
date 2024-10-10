import { useState, FC } from "react";
import TransferForm from "./XcmTransferForm";
import { Builder, isRelayChain, TNode } from "@paraspell/sdk";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import type { FormValues } from "./XcmTransferForm";
import type { Signer } from "@polkadot/api/types";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

const XcmTransfer: FC = () => {
  const [errorVisible, setErrorVisible] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();

  const initAccounts = async () => {
    // Enable the wallet extension
    const allInjected = await web3Enable("ParaSpellXcmSdk");

    if (!allInjected) {
      alert("No wallet extension found, install it to connect");
      throw Error("No Wallet Extension Found!");
    }

    // Get all accounts
    const allAccounts = await web3Accounts();

    if (allAccounts.length === 0) {
      alert("No accounts found, create or import an account to connect");
      throw Error("No Accounts Found!");
    }

    // Save accounts to state
    setAccounts(allAccounts);

    // Set the first account as selected
    setSelectedAccount(allAccounts[0]);
  };

  // Determine if id or symbol should be passed to the SDK
  const determineCurrency = ({ currency }: FormValues) => {
    if (!currency) throw new Error("Currency is required");
    // If the currency has an assetId, use it, otherwise use the symbol
    return currency.assetId
      ? { id: currency.assetId }
      : { symbol: currency.symbol || "" };
  };

  // Create a transfer transaction using the ParaSpell SDK
  const createTransferTx = (values: FormValues) => {
    const { from, to, amount, address } = values;
    if (!isRelayChain(from) && !isRelayChain(to)) {
      // If both nodes are not relay chains, create a ParaToPara transfer
      return Builder()
        .from(from as TNode)
        .to(to as TNode)
        .currency(determineCurrency(values))
        .amount(amount)
        .address(address)
        .build();
    } else if (isRelayChain(to)) {
      // If the destination node is a relay chain, create a ParaToRelay transfer
      return Builder()
        .from(from as TNode)
        .amount(amount)
        .address(address)
        .build();
    } else {
      // If the origin node is a relay chain, create a RelayToPara transfer
      return Builder()
        .to(to as TNode)
        .amount(amount)
        .address(address)
        .build();
    }
  };

  const submitUsingSdk = async (
    formValues: FormValues,
    injectorAddress: string,
    signer: Signer
  ) => {
    // Create the transfer transaction
    const tx = await createTransferTx(formValues);
    // Sign and submit the transaction
    await tx.signAndSend(injectorAddress, { signer });
  };

  const onSubmit = async (formValues: FormValues) => {
    if (!selectedAccount) {
      alert("No account selected, connect wallet first");
      return;
    }

    setLoading(true);

    // Get the injector for the selected account
    const injector = await web3FromAddress(selectedAccount.address);

    try {
      // Create the transaction using the SDK and submit it
      await submitUsingSdk(
        formValues,
        selectedAccount.address,
        injector.signer
      );
      alert("Transaction was successful!");
    } catch (e) {
      // Handle errors
      setError(e as Error);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="formHeader">
        {accounts.length > 0 ? (
          <div>
            <div>
              <h4>Connected to:</h4>
            </div>
            <select
              style={{}}
              value={selectedAccount?.address}
              onChange={(e) =>
                setSelectedAccount(
                  accounts.find((acc) => acc.address === e.target.value)
                )
              }
            >
              {accounts.map((acc) => (
                <option key={acc.address} value={acc.address}>
                  {acc.meta.name} - {acc.address}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <button onClick={initAccounts}>Connect Wallet</button>
        )}
      </div>
      <TransferForm onSubmit={onSubmit} loading={loading} />
      <div>{errorVisible && <p>{error?.message}</p>}</div>
    </div>
  );
};

export default XcmTransfer;
