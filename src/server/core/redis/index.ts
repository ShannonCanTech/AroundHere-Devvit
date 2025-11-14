// Chat metadata operations
export {
  createChat,
  getChat,
  updateChatLastMessage,
  deleteChat,
  addParticipant,
  removeParticipant,
  isParticipant,
} from './chat';

// Message storage operations
export {
  storeMessage,
  getMessages,
  getMessage,
  editMessage,
  deleteMessage,
  getLastMessage,
  deleteAllMessages,
  deleteOldMessages,
} from './message';

// User chat index operations
export {
  addChatToUser,
  removeChatFromUser,
  getUserChatIds,
  userHasChat,
  getUserChatCount,
} from './userChatIndex';
