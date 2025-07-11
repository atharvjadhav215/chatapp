import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { useState } from "react";
import axios from "axios";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default to English

  // Function to handle translation
  const translateMessage = async (messageId, text) => {
    try {
      const { data } = await axios.post("http://localhost:5000/api/translate", {
        text,
        targetLanguage: selectedLanguage, // Use selected language
      });

      // ✅ Store translated message in state
      setTranslatedMessages((prev) => ({
        ...prev,
        [messageId]: data.translatedText,
      }));
    } catch (error) {
      console.error(
        "Translation Error:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <>
      {/* Language Selection Dropdown */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontWeight: "bold" }}>Select Language: </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{
            marginLeft: "10px",
            padding: "5px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          <option value="en">English</option>
          <option value="as">Assamese</option>
          <option value="bn">Bengali</option>
          <option value="bho">Bhojpuri</option>
          <option value="brx">Bodo</option>
          <option value="doi">Dogri</option>
          <option value="gu">Gujarati</option>
          <option value="hi">Hindi</option>
          <option value="kn">Kannada</option>
          <option value="ks">Kashmiri</option>
          <option value="kok">Konkani</option>
          <option value="mai">Maithili</option>
          <option value="ml">Malayalam</option>
          <option value="mr">Marathi</option>
          <option value="mni">Manipuri</option>
          <option value="ne">Nepali</option>
          <option value="or">Odia</option>
          <option value="pa">Punjabi</option>
          <option value="sa">Sanskrit</option>
          <option value="sat">Santali</option>
          <option value="sd">Sindhi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="ur">Urdu</option>
        </select>
      </div>

      {/* Scrollable Chat Messages */}
      <ScrollableFeed>
        {messages &&
          messages.map((m, i) => (
            <div style={{ display: "flex", alignItems: "center" }} key={m._id}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip
                  label={m.sender.name}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <span
                style={{
                  backgroundColor:
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0",
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "10px 15px",
                  maxWidth: "75%",
                  fontSize: "16px",
                  wordBreak: "break-word",
                }}
              >
                {translatedMessages[m._id] || m.content}
              </span>

              {/* Translate Button */}
              <button
                onClick={() => translateMessage(m._id, m.content)}
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  fontSize: "18px",
                }}
              >
                🌍
              </button>
            </div>
          ))}
      </ScrollableFeed>
    </>
  );
};

export default ScrollableChat;
