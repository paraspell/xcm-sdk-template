import "./App.css";
import XcmTransfer from "./XcmTransfer";

const App = () => (
  <>
    <div className="header">
      <h1>Vite + React + </h1>
      <a
        href="https://paraspell.github.io/docs/sdk/getting-started.html"
        target="_blank"
        className="logo"
      >
        <img src="/paraspell.png" alt="ParaSpell logo" />
      </a>
    </div>
    <XcmTransfer />
    <p className="read-the-docs">
      Click on the ParaSpell logo to read the docs
    </p>
  </>
);

export default App;
