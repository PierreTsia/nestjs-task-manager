import { TaskStatus } from '../task-status.enum';
import { IsEnum, IsNumber } from 'class-validator';

export class UpdateStatusDto {
  @IsNumber()
  id: number;

  @IsEnum(TaskStatus)
  status: TaskStatus;
}
