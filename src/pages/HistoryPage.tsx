import React from "react";
import { useNavigate } from "react-router-dom";
import type { Summary } from "../types/types";

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = React.useState<Summary[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("summaries");
    if (saved) {
      setSummaries(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Previous Summaries
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-black text-white rounded-md shadow-sm text-sm font-medium hover:bg-gray-800"
          >
            New Summary
          </button>
        </div>

        <div className="space-y-6">
          {summaries.length > 0 ? (
            summaries.map((summary) => (
              <div
                key={summary.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {summary.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(summary.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">{summary.content}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No summaries yet. Create your first one!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
