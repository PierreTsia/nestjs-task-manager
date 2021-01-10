import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto, GetTasksFilterDto } from './dto';
import { User } from '../auth/user.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = new Task();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;
    try {
      await task.save();
      delete task.user;
      return task;
    } catch (error: any) {
      this.logger.error(
        `Error for user ${user.username} saving task. Data: ${JSON.stringify(
          createTaskDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTasks(filterDto: GetTasksFilterDto, user?: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');
    if (user) {
      query.where('task.userId =:userId', { userId: user.id });
    }
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }
    try {
      return await query.getMany();
    } catch (error: any) {
      this.logger.error(
        `Failed to get task for user ${
          user.username
        }. Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
