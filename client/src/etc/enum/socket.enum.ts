export enum OnSocketEnum {
    CONNECT="connect",
    DISCONNECT="disconnect",
    CONNECT_ERROR="connect_error"
}
// export enum EmitSocketEnum {
//     CONNECT="connect",
//     DISCONNECT="disconnect",
//     CONNECT_ERROR="connect_error"
// }

export enum OnSocketUserEnum {
    USER_ONLINE="user-online",
    USER_OFFLINE="user-offline",
    LOAD_OTHER_USER_STATUS = "load-other-user-status"
}

// export enum EmitSocketUserEnum {

// }

export enum OnSocketMessangerEnum {
    LOAD_MESSAGES = "load-messages",
    MESSAGE_RECIEVE = "message-recieve",
    CHAT_JOINED = "chat-joined",
    RECEIVER_STATUS_UPDATED = "receiver-status-updated",
    SENDER_STATUS_UPDATED = "sender-status-updated",
    CHAT_HISTORY_UPDATE = "chat-list-update",
    PROFILE_UPDATE = "profile-update",
    NOTEFICATION_RECIEVED="notification-recieved"
}

export enum EmitSocketMessangerEnum {
    JOIN_CHAT = "join-chat",
    SEND_MESSAGE = "send-message",
    RECEIVER_STATUS_UPDATE = "receiver-status-update",
    SENDER_STATUS_UPDATE = "sender-status-update", 
}

// export enum NotificationTypes {
//     MESSEAGE_RECEIVE,
//     FRIEND_REQUEST_SENDED,
//     FRIEND_REQUEST_CANCELED,
//     UNREAD_MESSAGES
// }

export enum OnSocketNotificationEnum {
    NOTIFICATION_RECEIVE="notification-receive"
}
// export enum OnSocketNotificationEnum {
//     NOTIFICATION_RECIEVED="notification-recieved"
// }

export enum EmitSocketNotificationEnum {
    NOTIFICATION_SEND="notification-send"
}