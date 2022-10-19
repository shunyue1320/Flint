export interface ClassroomReplayEventData {
  "new-message": {
    type: "notice" | "ban" | "room-message" | "user-guide";
  };
}
