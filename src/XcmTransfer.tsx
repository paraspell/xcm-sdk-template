import { useState, FC } from "react";
import TransferForm from "./XcmTransferForm";
import { Builder, isForeignAsset } from "@paraspell/sdk";
import type { FormValues } from "./XcmTransferForm";
import {
  connectInjectedExtension,
  getInjectedExtensions,
  InjectedExtension,
  InjectedPolkadotAccount,
  PolkadotSigner,
} from "polkadot-api/pjs-signer";

const XcmTransfer: FC = () => {
  const [errorVisible, setErrorVisible] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [extensions, setExtensions] = useState<string[]>([]);
  const [selectedExtension, setSelectedExtension] =
    useState<InjectedExtension | null>();
  const [accounts, setAccounts] = useState<InjectedPolkadotAccount[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedPolkadotAccount>();

  const initAccounts = async () => {
    // Get extensions
    const extensions = getInjectedExtensions();

    if (extensions.length === 0) {
      alert("No wallet extension found, install it to connect");
      throw Error("No Wallet Extension Found!");
    }

    // Save extensions to state
    setExtensions(extensions);
  };

  // Determine if id or symbol should be passed to the SDK
  const determineCurrency = ({ currency, amount }: FormValues) => {
    if (!currency) throw new Error("Currency is required");
    // If the currency has an assetId, use it, otherwise use the symbol
    return isForeignAsset(currency) && currency.assetId
      ? { id: currency.assetId, amount }
      : { symbol: currency.symbol || "", amount };
  };

  const submitUsingSdk = async (
    formValues: FormValues,
    signer: PolkadotSigner
  ) => {
    const { from, to, address } = formValues;

    // Create a transfer transaction using the ParaSpell SDK
    const tx = await Builder()
      .from(from)
      .to(to)
      .currency(determineCurrency(formValues))
      .address(address)
      .build();

    // Sign and submit the transaction
    await tx.signAndSubmit(signer);
  };

  const onSubmit = async (formValues: FormValues) => {
    if (!selectedAccount || !selectedExtension) {
      alert("No account selected, connect wallet first");
      return;
    }

    setLoading(true);

    // Get the signer for the selected account
    const signer = selectedAccount.polkadotSigner;

    try {
      // Create the transaction using the SDK and submit it
      await submitUsingSdk(formValues, signer);
      alert("Transaction was successful!");
    } catch (e) {
      // Handle errors
      setError(e as Error);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onExtensionSelect = async (name: string) => {
    const injectedExtension = await connectInjectedExtension(name);
    setSelectedExtension(injectedExtension);

    const accounts = injectedExtension.getAccounts();
    setAccounts(accounts);
    setSelectedAccount(accounts[0]);
  };

  return (
    <div>
      <div className="formHeader">
        {extensions.length > 0 ? (
          <div>
            <h4>Select extension:</h4>
            <select
              defaultValue=""
              value={selectedExtension?.name}
              onChange={(e) => onExtensionSelect(e.target.value)}
            >
              <option disabled value="">
                -- select an option --
              </option>
              {extensions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <button onClick={initAccounts}>Connect Wallet</button>
        )}
        {accounts.length > 0 && (
          <div>
            <div>
              <h4>Select account:</h4>
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
              {accounts.map(({ name, address }) => (
                <option key={address} value={address}>
                  {name} - {address}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <TransferForm onSubmit={onSubmit} loading={loading} />
      <div>{errorVisible && <p>{error?.message}</p>}</div>
    </div>
  );
};

export default XcmTransfer;
