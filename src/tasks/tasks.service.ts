import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskDto, GetTasksFilterDto, UpdateStatusDto } from './dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(taskId: string): Task {
    const found = this.tasks.find(({ id }) => id === taskId);
    if (!found) {
      throw new NotFoundException(`No task found with id ${taskId}`);
    }
    return found;
  }

  filterTasks(taskFilterDto: GetTasksFilterDto): Task[] {
    const { search, status } = taskFilterDto;
    let tasks = this.getAllTasks();
    if (status) {
      tasks = tasks.filter((t) => t.status === status);
    }
    if (search) {
      tasks = tasks.filter(({ description, title }) =>
        [...description, ...title].includes(search),
      );
    }
    return tasks;
  }

  deleteTaskById(taskId: string): void {
    const found = this.getTaskById(taskId);
    this.tasks = this.tasks.filter(({ id }) => id !== found.id);
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuidv4(),
      title,
      description,
      status: TaskStatus.OPEN,
    };
    this.tasks.push(task);
    return task;
  }

  updateTaskStatus(updateStatusDto: UpdateStatusDto): Task {
    const { id, status } = updateStatusDto;
    const task = this.getTaskById(id);
    task.status = status;
    return task;
  }
}
