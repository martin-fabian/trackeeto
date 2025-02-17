export interface TaskResponse {
  id: number;
  projectId: number;
  name: string;
  duration: number;
  startDateTime?: Date;
  endDateTime?: Date;
}
