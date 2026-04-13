export type ApiUser = {
  uid: string;
  name?: string;
  email?: string;
  photoUrl?: string;
  status?: string;
  activeOn?: string;
  isGroup?: boolean | any;
  groupName?: string;
};
export interface State {
  user: {
    uid: string;
    users: Record<string, ApiUser>;
    currentUserId: string;
    isAuthenticated: boolean;
    currentUser: {
      uid: string;
      name: string;
    };
    authChecked: boolean;
    status: string;
    error: string;
  };
  chat: {
    lastMessage: any;
    unRead: any;
    chatId: string;
    chats: {
      chatId: string;
      participants: string[];
      isGroup?: boolean;
      name?: string;
      lastMessage?: {
        text?: string;
        time?: string;
      };
      unRead: Record<string, number>;
    }[];
    chatStatus: string;
    chatError: string;
    participants: string[];
  };
  messages: {
    id: null | undefined;
    text: string;
    time: string | number | Date;
    status: string;
    messages: {
      chatId?: string;
      messageId?: string;
      senderId?: string;
      status?: string;
      text?: string;
      time?: string;
    }[];
    messageStatus: string;
    messageError: string;
  };
}



export type Chat = {
  chatId: string;
  participants: string[];
  isGroup?: boolean | undefined;
  name?: string;
  lastMessage?: {
    text?: string;
    time?: string;
  };
  unRead: Record<string, number>;
};