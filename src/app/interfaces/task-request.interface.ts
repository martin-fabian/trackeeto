export interface TaskRequest {
  id?: number;
  projectId: number;
  name: string;
  duration: number;
  startDateTime?: Date;
  endDateTime?: Date;
}
