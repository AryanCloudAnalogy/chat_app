let socket: WebSocket | null = null;
let currentUserId: string | null = null;

export const socketMiddleware =
  (store: any) => (next: any) => (action: any) => {
    authSocketMiddleware(store)(next)(action);

    if (action.type === "socket/connect") {
      socket = new WebSocket(action.payload);

      socket.onopen = () => {
        if (currentUserId) {
          socket?.send(
            JSON.stringify({ type: "REGISTER", userId: currentUserId }),
          );
        }
      };

      socket.onclose = () => console.log("Socket Disconnected");

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "NEW_MESSAGE") {
            store.dispatch({
              type: "messages/addMessage",
              payload: data.message,
            });
          }
        } catch (error) {
          console.error("Error parsing socket message:", error);
        }
      };
    }

    if (
      action.type === "socket/send" &&
      socket?.readyState === WebSocket.OPEN
    ) {
      socket.send(JSON.stringify(action.payload));
    }

    return next(action);
  };

export const authSocketMiddleware =
  (store: any) => (next: any) => (action: any) => {
    if (action.type === "user/fetchUser/fulfilled") {
      const { isAuthenticated, currentUserId: uid } = store.getState().user;
      if (isAuthenticated && !socket) {
        currentUserId = uid;
        store.dispatch({
          type: "socket/connect",
          payload: `${window.location.protocol}//${window.location.host}/api/ws`,
        });
      }
    }

    if (action.type === "user/logout") {
      socket?.close();
      socket = null;
      currentUserId = null;
    }

    return next(action);
  };
