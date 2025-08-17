import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { PromptSettings } from "../types/types";
import { useSummaryGenerator } from "../hooks/useSummaryGenerator";

const PromptPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);
  //   const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedSummary, setEditedSummary] = React.useState("");
  const [settings, setSettings] = React.useState<PromptSettings>({
    temperature: 0.7,
    maxTokens: 1000,
    customPrompt: "Summarize the following meeting transcript:",
    toneStyle: "professional",
    outputFormat: "paragraphs",
    language: "english",
    summaryLength: "medium",
    includeActionItems: true,
    includeDatetime: true,
    includeParticipants: true,
  });

  const {
    summary: output,
    isLoading: loading,
    generateSummary: handleGenerate,
    error: generationError,
  } = useSummaryGenerator({
    delay: 1000, // 1 second delay
    onError: (error) => {
      console.error("Error generating summary:", error);
    },
  });

  // Handle settings changes with debouncing
  const handleSettingChange = React.useCallback(
    (newSettings: PromptSettings) => {
      setSettings(newSettings);
      if (location.state?.text) {
        handleGenerate(location.state.text, newSettings);
      }
    },
    [location.state?.text, handleGenerate]
  );

  const handleSave = () => {
    const summary = {
      id: Date.now().toString(),
      title: "Meeting Summary",
      content: isEditing ? editedSummary : output,
      timestamp: new Date().toISOString(),
      originalText: location.state?.text || "",
    };

    const existingSummaries = JSON.parse(
      localStorage.getItem("summaries") || "[]"
    );
    localStorage.setItem(
      "summaries",
      JSON.stringify([...existingSummaries, summary])
    );
    navigate("/history");
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleEmailOpen = () => {
    const subject = encodeURIComponent("Meeting Summary");
    const body = encodeURIComponent(isEditing ? editedSummary : output || "");
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  React.useEffect(() => {
    if (location.state?.text) {
      handleGenerate(location.state.text, settings);
    }
  }, [location.state?.text, handleGenerate, settings]);

  React.useEffect(() => {
    if (output) {
      setEditedSummary(output);
    }
  }, [output]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="w-[80%] mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Generate Summary
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Settings */}
          <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 gap-6">
              {/* Style Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone Style
                </label>
                <select
                  value={settings.toneStyle}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      toneStyle: e.target.value as
                        | "professional"
                        | "casual"
                        | "technical",
                    }))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <select
                  value={settings.outputFormat}
                  onChange={(e) =>
                    handleSettingChange({
                      ...settings,
                      outputFormat: e.target.value as
                        | "paragraphs"
                        | "bullets"
                        | "numbered",
                    })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="paragraphs">Paragraphs</option>
                  <option value="bullets">Bullet Points</option>
                  <option value="numbered">Numbered List</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      language: e.target.value as
                        | "english"
                        | "spanish"
                        | "french"
                        | "german",
                    }))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary Length
                </label>
                <select
                  value={settings.summaryLength}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      summaryLength: e.target.value as
                        | "short"
                        | "medium"
                        | "long",
                    }))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Temperature (Creativity)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) =>
                      handleSettingChange({
                        ...settings,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500 w-12">
                    {settings.temperature}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxTokens: parseInt(e.target.value),
                    }))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="actionItems"
                    checked={settings.includeActionItems}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        includeActionItems: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-black rounded border-gray-300"
                  />
                  <label
                    htmlFor="actionItems"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Include Action Items
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="datetime"
                    checked={settings.includeDatetime}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        includeDatetime: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-black rounded border-gray-300"
                  />
                  <label
                    htmlFor="datetime"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Include Date/Time
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="participants"
                    checked={settings.includeParticipants}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        includeParticipants: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-black rounded border-gray-300"
                  />
                  <label
                    htmlFor="participants"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Include Participants
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Modify Default Prompt
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="bg-gray-50 p-6 rounded-lg flex flex-col h-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Generated Summary
            </h2>
            <div className="flex-1 min-h-[400px] relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
              ) : output ? (
                <div className="flex flex-col h-full">
                  <div className="prose max-w-none flex-1 mb-4">
                    {isEditing ? (
                      <textarea
                        value={editedSummary}
                        onChange={(e) => setEditedSummary(e.target.value)}
                        className="w-full h-full min-h-[300px] p-4 border rounded-md"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">{output}</div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-md shadow-sm text-sm font-medium hover:bg-gray-800"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditedSummary(output);
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50"
                          >
                            Edit Summary
                          </button>
                          <button
                            onClick={handleSave}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-md shadow-sm text-sm font-medium hover:bg-gray-800"
                          >
                            Save
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleEmailOpen}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                      >
                        Send by Email
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <button
                    onClick={() => {
                      if (location.state?.text) {
                        handleGenerate(location.state.text, settings);
                      }
                    }}
                    className="px-6 py-3 bg-black text-white rounded-md shadow-sm text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Generate Summary
                  </button>
                </div>
              )}
            </div>
            {generationError && (
              <div className="pt-4 text-red-600 text-sm">
                {generationError.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Prompt Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Modify Default Prompt
            </h3>
            <textarea
              value={settings.customPrompt}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  customPrompt: e.target.value,
                }))
              }
              className="w-full h-32 p-2 border rounded-md"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptPage;
