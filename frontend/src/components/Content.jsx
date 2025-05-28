import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./Content.css";

const Content = () => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [objective, setObjective] = useState("");
  const [video, setVideo] = useState(null);
  const [query, setQuery] = useState("");

  // Bot Feature States
  const [showAskBotButton, setShowAskBotButton] = useState(false);
  const [showTranslateButton, setShowTranslateButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showBotPopup, setShowBotPopup] = useState(false);
  const [botInput, setBotInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);

  const selectedTopic = localStorage.getItem("title");
  const name = localStorage.getItem("name");
  const apiKey = "AIzaSyDgJ2xbAKJeQo5GUful3RO17Zv9q5tXZR4";

  useEffect(() => {
    const fetchContentData = async () => {
      if (!selectedTopic || !name) {
        setError("Missing required data: title or name");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const objResponse = await axios.get(`http://localhost:5000/getObj`, {
          params: { name },
        });

        const fetchedObjective = objResponse.data.objective;
        localStorage.setItem("objective", fetchedObjective);
        setObjective(fetchedObjective);

        const contentResponse = await axios.post(
          "http://localhost:5000/generate-content",
          {
            selectedTopic,
            objective: fetchedObjective,
          }
        );

        setContent(contentResponse.data.content);

        // Automatically trigger YouTube search based on the title (selectedTopic)
        setQuery(selectedTopic);
        await fetchVideo(selectedTopic);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.error || "Failed to fetch content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentData();
  }, [selectedTopic, name]);

  const fetchVideo = async (topic) => {
    try {
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          topic
        )}&type=video&maxResults=1&key=${apiKey}`
      );
  
      if (!searchResponse.ok) {
        throw new Error(`HTTP error! status: ${searchResponse.status}`);
      }
  
      const searchData = await searchResponse.json();
  
      if (searchData.items.length === 0) {
        console.log("No video found");
        setVideo(null);
        return;
      }
  
      const videoId = searchData.items[0].id.videoId;
  
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
      );
  
      if (!videoResponse.ok) {
        throw new Error(`HTTP error! status: ${videoResponse.status}`);
      }
  
      const videoData = await videoResponse.json();
  
      if (videoData.items.length > 0) {
        setVideo(videoData.items[0]);
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      setError("Failed to fetch YouTube video. Please check your API key and quota.");
    }
  };

  // Detect text selection
  const handleTextSelection = () => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      const selectionRange = window.getSelection().getRangeAt(0);
      const rect = selectionRange.getBoundingClientRect();

      setSelectedText(selection);
      setShowAskBotButton(true);
      setShowTranslateButton(true); // Show Translate button
      setButtonPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX,
      });
    } else {
      setShowAskBotButton(false);
      setShowTranslateButton(false); // Hide Translate button
      setShowBotPopup(false);
      setShowLanguageOptions(false); // Hide language options
    }
  };

  // Handle Ask Bot button click
  const handleAskBotClick = () => {
    setShowAskBotButton(false);
    setShowTranslateButton(false); // Hide Translate button
    setShowBotPopup(true);
    setBotInput(selectedText); // Pre-fill with selected text
  };

  // Handle Translate button click
  const handleTranslateClick = async (language) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/translate", {
        text: selectedText,
        language: language,
      });
      const translatedText = response.data.translation || "Translation failed.";

      // Open the Ask Bot UI directly
      setShowBotPopup(true);
      setShowAskBotButton(false);
      setShowTranslateButton(false);

      // Add the translated text to the chat history
      setChatHistory((prevChat) => [
        ...prevChat,
        { sender: "user", message: selectedText },
        { sender: "ai", message: translatedText }, // Only the translated text
      ]);

      setShowLanguageOptions(false); // Hide language options after selection
    } catch (error) {
      console.error("Translation Error: ", error);
      setChatHistory((prevChat) => [
        ...prevChat,
        { sender: "ai", message: "Error: Unable to translate text." },
      ]);
    }
  };

  // Handle closing the chatbot UI
  const handleCloseBotPopup = () => {
    setShowBotPopup(false);
    setBotInput("");
    setShowAskBotButton(true);
    setShowTranslateButton(true); // Show Translate button again
  };

  // Submit query to the backend and update chat history
  const handleSubmit = async () => {
    if (botInput.trim() === "") return;

    const userQuery = botInput;

    try {
      const response = await axios.post("http://127.0.0.1:5000/explain", {
        text: botInput,
      });
      const aiResponse = response.data.explanation || "No response available.";
      console.log(aiResponse);

      // Update chat history
      setChatHistory((prevChat) => [
        ...prevChat,
        { sender: "user", message: userQuery },
        { sender: "ai", message: aiResponse },
      ]);

      setBotInput(""); // Clear the input field
    } catch (error) {
      console.error("Error: ", error);
      setChatHistory((prevChat) => [
        ...prevChat,
        {
          sender: "ai",
          message:
            "Error: Unable to fetch explanation. " +
            (error.response?.data?.error || error.message),
        },
      ]);
    }
  };

  // Add listener for text selection
  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="content-container">
      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Generating content...</span>
        </div>
      ) : (
        <>
          <div className="objective-section">
            <h3>Learning Objective:</h3>
            <p>{objective}</p>
          </div>

          <div
            className="content-section"
            style={{ marginTop: "900px" }}
            onMouseUp={handleTextSelection}
          >
            <ReactMarkdown>{content || "No content available"}</ReactMarkdown>
          </div>

          {/* Ask Bot Button */}
          {showAskBotButton && !showBotPopup && (
            <button
              className="ask-bot-button"
              style={{
                top: `${buttonPosition.top}px`,
                left: `${buttonPosition.left}px`,
              }}
              onClick={handleAskBotClick}
            >
              Ask Bot
            </button>
          )}

          {/* Translate Button */}
          {showTranslateButton && !showBotPopup && (
            <div
              className="translate-buttons"
              style={{
                top: `${buttonPosition.top}px`,
                left: `${buttonPosition.left + 80}px`, // Position next to Ask Bot button
              }}
            >
              <button onClick={() => setShowLanguageOptions(!showLanguageOptions)}>
                Translate
              </button>
              {showLanguageOptions && (
                <div className="language-options">
                  <button onClick={() => handleTranslateClick("Tamil")}>Tamil</button>
                  <button onClick={() => handleTranslateClick("Hindi")}>Hindi</button>
                  <button onClick={() => handleTranslateClick("Kannada")}>Kannada</button>
                  <button onClick={() => handleTranslateClick("Telugu")}>Telugu</button>
                  <button onClick={() => handleTranslateClick("Malayalam")}>Malayalam</button>
                </div>
              )}
            </div>
          )}

          {/* Bot Popup */}
          {showBotPopup && (
            <div
              className="bot-popup noprint"
              style={{
                top: `${buttonPosition.top}px`,
                left: `${buttonPosition.left}px`,
              }}
            >
              <div className="chat-history noprint">
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={`chat-message ${
                      chat.sender === "user" ? "user-message" : "ai-message"
                    }`}
                  >
                    <ReactMarkdown>{chat.message}</ReactMarkdown>
                  </div>
                ))}
              </div>
              <textarea
                className="bot-popup-textarea noprint"
                rows="3"
                value={botInput}
                onChange={(e) => setBotInput(e.target.value)}
                placeholder="Enter your query..."
              ></textarea>
              <button className="bot-popup-submit" onClick={handleSubmit}>
                Enter
              </button>
              <button className="bot-popup-close" onClick={handleCloseBotPopup}>
                Close
              </button>
            </div>
          )}

          <h2 className="noprint">YouTube Video</h2>
          {video ? (
            <div className="noprint">
              <h3>{video.snippet.title}</h3>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${video.id}`}
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <p className="noprint">No relevant video found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Content;