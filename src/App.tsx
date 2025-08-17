import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileUploadPage from "./pages/FileUploadPage";
import PromptPage from "./pages/PromptPage";
import HistoryPage from "./pages/HistoryPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileUploadPage />} />
        <Route path="/prompt" element={<PromptPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
};

export default App;
