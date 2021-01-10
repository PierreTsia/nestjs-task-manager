import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, GetTasksFilterDto, UpdateStatusDto } from './dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user?: User): Promise<Task[]> {
    return await this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(taskId: number, user?: User): Promise<Task> {
    const options = user ? { where: { userId: user.id } } : null;
    const found = await this.taskRepository.findOne(taskId, options);
    if (!found) {
      throw new NotFoundException(`No task found with id ${taskId}`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTaskById(taskId: number, user?: User): Promise<void> {
    const deleteCriteria = user
      ? { id: taskId, userId: user.id }
      : { id: taskId };
    const { affected } = await this.taskRepository.delete(deleteCriteria);
    if (!affected) {
      throw new NotFoundException(`No task found with id ${taskId}`);
    }
  }

  async updateTaskStatus(
    updateStatusDto: UpdateStatusDto,
    user: User,
  ): Promise<Task> {
    const { id, status } = updateStatusDto;
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }
}
