import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, GetTasksFilterDto, UpdateStatusDto } from './dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    return await this.taskRepository.getTasks(filterDto);
  }

  async getTaskById(taskId: number): Promise<Task> {
    const found = await this.taskRepository.findOne(taskId);
    if (!found) {
      throw new NotFoundException(`No task found with id ${taskId}`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto);
  }

  async deleteTaskById(taskId: number): Promise<void> {
    const { affected } = await this.taskRepository.delete(taskId);
    if (!affected) {
      throw new NotFoundException(`No task found with id ${taskId}`);
    }
  }

  async updateTaskStatus(updateStatusDto: UpdateStatusDto): Promise<Task> {
    const { id, status } = updateStatusDto;
    const task = await this.getTaskById(id);
    task.status = status;
    await task.save();
    return task;
  }
}
