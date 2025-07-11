import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain, setFetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const [joinedCommunities, setJoinedCommunities] = useState([]); // ✅ Track joined communities

  // ✅ Memoized function to prevent unnecessary re-renders
  const fetchChats = useCallback(async () => {
    if (!user) {
      console.error("User is not available.");
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      if (!storedUser || !storedUser.token) {
        console.error("User token is missing.");
        return;
      }

      console.log("Fetching chats with token:", storedUser.token);

      const config = {
        headers: {
          Authorization: `Bearer ${storedUser.token}`, // ✅ Fix headers format
        },
      };

      const { data } = await axios.get(
        "http://localhost:5000/api/chat",
        config
      );

      console.log("Chats fetched successfully:", data);
      setChats(data);

      // ✅ Extract joined community IDs
      const joinedIds = data
        .filter((chat) => chat.isGroupChat)
        .map((chat) => chat._id);
      setJoinedCommunities(joinedIds);
    } catch (error) {
      console.error(
        "Error fetching chats:",
        error.response?.data || error.message
      );
    }
  }, [setChats, user]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(storedUser);
    if (storedUser) fetchChats();
  }, [fetchAgain, user]);

  // ✅ Generic function to join a community
  const handleJoinCommunity = async (communityChatId) => {
    if (!user || !user._id) {
      console.error("User is not authenticated or missing _id.");
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.put(
        "http://localhost:5000/api/chat/groupadd",
        { chatId: communityChatId, userId: user._id },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
      alert("You have joined the Community group!");

      // ✅ Update joined communities
      setJoinedCommunities((prev) => [...prev, communityChatId]);

      fetchChats();
    } catch (error) {
      console.error(
        "Error joining community:",
        error.response?.data || error.message
      );
      setLoading(false);
    }
  };

  return (
    <div className="my-chats-container">
      <div className="header">
        <p className="community">Join Our Communities...</p>

        {/* ✅ Join KrishiBazaar */}
        <button
          onClick={() => handleJoinCommunity("67de72375081c052e17e3ae5")}
          disabled={
            loading || joinedCommunities.includes("67de72375081c052e17e3ae5")
          }
          className="join-community-btn"
        >
          {loading
            ? "Joining..."
            : joinedCommunities.includes("67de72375081c052e17e3ae5")
            ? "Joined ✅"
            : "Join Community of Onion Farmers"}
        </button>

        {/* ✅ Join BeemaKisan */}
        <button
          onClick={() => handleJoinCommunity("67dd8c3cad006f671eba59e0")}
          disabled={
            loading || joinedCommunities.includes("67dd8c3cad006f671eba59e0")
          }
          className="join-community-btn"
        >
          {loading
            ? "Joining..."
            : joinedCommunities.includes("67dd8c3cad006f671eba59e0")
            ? "Joined ✅"
            : "Join Community of Wheat Farmers"}
        </button>

        {/* ✅ Join HariyaliSchemes */}
        <button
          onClick={() => handleJoinCommunity("67dbcf422d2fffaca9261829")}
          disabled={
            loading || joinedCommunities.includes("67dbcf422d2fffaca9261829")
          }
          className="join-community-btn"
        >
          {loading
            ? "Joining..."
            : joinedCommunities.includes("67dbcf422d2fffaca9261829")
            ? "Joined ✅"
            : "Join Community of Sugarcane Farmers"}
        </button>
      </div>
      <div className="chat-list">
        {chats ? (
          <div className="chat-items">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className={`chat-item ${
                  selectedChat === chat ? "selected" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <p className="chat-title">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </p>
                {chat.latestMessage && (
                  <p className="chat-message">
                    <b>{chat.latestMessage.sender.name}:</b>{" "}
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ChatLoading />
        )}
      </div>
      ;
      <style>{`
        .my-chats-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          background: white;
          width: 300px;
          max-width: 600px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
          .community{
          text-align: center;

           font-weight: bold;
           font-size: 1.3rem;
           margin-bottom: 1.20rem;
          }
        .header {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-bottom: 10px;
          gap : 10px;
        }
        .join-community-btn {
          background:rgb(85, 173, 88);
          color: white;
          padding: 10px;
          border: none;
          cursor: pointer;
          width: 100%;
          border-radius: 5px;
          transition: 0.3s;
        }
        .join-community-btn:hover {
          background:rgb(38, 64, 44);
        }
        .join-community-btn:disabled {
          background: gray;
          cursor: not-allowed;
        }
        .chat-list {
          display: flex;
          flex-direction: column;
          background: #f8f8f8;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          overflow-y: auto;
          padding: 10px;
        }
        .chat-items {
          display: flex;
          flex-direction: column;
        }
        .chat-item {
          padding: 10px;
          background: #e8e8e8;
          color: black;
          border-radius: 5px;
          margin-bottom: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .chat-item.selected {
          background: #38b2ac;
          color: white;
        }
        .chat-item:hover {
          background: #d1d1d1;
        }
        .chat-title {
          font-size: 16px;
          font-weight: bold;
        }
        .chat-message {
          font-size: 12px;
          color: gray;
        }
      `}</style>
    </div>
  );
};

export default MyChats;
