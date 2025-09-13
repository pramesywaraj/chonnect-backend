export enum ROOM_SOCKET {
  ROOM_JOIN = 'room_join',
  ROOM_LEAVE = 'room_leave',
  ROOM_LAST_MESSAGE_UPDATE = 'room_last_message_update',
  ROOM_UPDATED = 'room_updated',
}

export enum MESSAGE_SOCKET {
  NEW_MESSAGE = 'new_message',
  MARK_ALL_DELIVERED = 'mark_all_delivered',
}

export enum GENERAL_SOCKET {
  USER_SUBSCRIBE_TO_SERVER = 'user_subscribe_to_server',
  USER_UNSUBSCRIBE_FROM_SERVER = 'user_unsubscribe_from_server',
}
