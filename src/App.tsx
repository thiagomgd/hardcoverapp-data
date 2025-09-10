import { useState } from "react";
import "./App.css";
import CsvUploader from "./components/CsvUploader";
import BookDataDisplay from "./components/BookDataDisplay";
import type { CsvUploadResult } from "./types";

function App() {
  const [uploadedData, setUploadedData] = useState<CsvUploadResult | null>(
    null,
  );

  const handleDataLoaded = (result: CsvUploadResult) => {
    setUploadedData(result);
  };

  const handleReset = () => {
    setUploadedData(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Hardcover Data Viewer</h1>
        <p>
          Upload your Hardcover CSV export to view and analyze your book
          collection
        </p>
      </header>

      <main className="app-main">
        {!uploadedData ? (
          <CsvUploader onDataLoaded={handleDataLoaded} />
        ) : (
          <div className="data-view">
            <div className="data-header">
              <h2>Your Book Collection</h2>
              <button onClick={handleReset} className="reset-button">
                Upload New File
              </button>
            </div>
            <BookDataDisplay data={uploadedData} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
