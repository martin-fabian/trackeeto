export interface ProjectRequest {
  id?: number;
  name: string;
  duration: number;
  startDateTime?: Date;
  endDateTime?: Date;
}
