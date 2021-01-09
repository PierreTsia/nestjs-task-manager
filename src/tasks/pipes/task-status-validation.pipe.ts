import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task.model';

export class TaskStatusValidationPipe implements PipeTransform {
  readonly ALLOWED_STATUSES = [
    TaskStatus.DONE,
    TaskStatus.IN_PROGRESS,
    TaskStatus.OPEN,
  ];
  transform(value: any): any {
    value = value.toUpperCase();
    if (!this.isAllowedStatus(value)) {
      throw new BadRequestException(`${value} is not a valid status`);
    }
    return value;
  }

  private isAllowedStatus(status: any) {
    return this.ALLOWED_STATUSES.includes(status);
  }
}
