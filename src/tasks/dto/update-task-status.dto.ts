import { TaskStatus } from '../task.model';

export class UpdateStatusDto {
  id: string;
  status: TaskStatus;
}
