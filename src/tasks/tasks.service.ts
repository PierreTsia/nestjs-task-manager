import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskDto, GetTasksFilterDto, UpdateStatusDto } from './dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  filterTasks(taskFilterDto: GetTasksFilterDto): Task[] {
    const { search, status } = taskFilterDto;
    let tasks = this.getAllTasks();
    if (status) {
      tasks = tasks.filter((t) => t.status === status);
    }
    if (search) {
      tasks = tasks.filter(
        (t) => t.description.includes(search) || t.title.includes(search),
      );
    }
    return tasks;
  }

  getTaskById(taskId: string): Task {
    return this.tasks.find(({ id }) => id === taskId);
  }

  deleteTaskById(taskId: string): void {
    this.tasks = this.tasks.filter(({ id }) => id !== taskId);
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
