import { Test } from '@nestjs/testing';
import { TasksService } from '../../../src/tasks/tasks.service';
import { TaskRepository } from '../../../src/tasks/task.repository';
import { GetTasksFilterDto } from '../../../src/tasks/dto';
import { TaskStatus } from '../../../src/tasks/task-status.enum';
import { Task } from '../../../src/tasks/task.entity';
import { User } from '../../../src/auth/user.entity';
import { NotFoundException } from '@nestjs/common';

const MOCK_USER: User = { username: 'test', id: 1 } as User;
const MOCK_TASKS: Task[] = [
  {
    id: 1,
    title: 'test',
    user: MOCK_USER,
    userId: MOCK_USER.id,
    description: 'test-description',
    status: TaskStatus.IN_PROGRESS,
  } as Task,
];

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();
    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks()', () => {
    [MOCK_USER, undefined].forEach((user) => {
      it(`should get tasks from repository when user is ${
        user ? 'specified' : 'undefined'
      }`, async () => {
        taskRepository.getTasks.mockResolvedValue(MOCK_TASKS);
        expect(taskRepository.getTasks).not.toHaveBeenCalled();
        const filters: GetTasksFilterDto = {
          status: TaskStatus.IN_PROGRESS,
          search: 'test',
        };
        const result = await tasksService.getTasks(filters, user);
        expect(taskRepository.getTasks).toHaveBeenCalledWith(filters, user);
        expect(result).toEqual(MOCK_TASKS);
      });
    });
  });

  describe('createTask()', () => {
    it('should call taskRepository.createTask()', async () => {
      taskRepository.createTask.mockResolvedValue(MOCK_TASKS[0]);
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const result = await tasksService.createTask(
        { title: 'test', description: 'desc' },
        MOCK_USER,
      );
      expect(result).toEqual(MOCK_TASKS[0]);
    });
  });

  describe('getTaskById()', () => {
    it('should call taskRepository.findOne()', async () => {
      taskRepository.findOne.mockResolvedValue(MOCK_TASKS[0]);
      expect(taskRepository.findOne).not.toHaveBeenCalled();
      const result = await tasksService.getTaskById(1, MOCK_USER);
      expect(taskRepository.findOne).toHaveBeenCalledWith(1, {
        where: {
          userId: 1,
        },
      });
      expect(result).toEqual(MOCK_TASKS[0]);
    });
    it('should throw an not found exception if task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      await expect(tasksService.getTaskById(1, MOCK_USER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteTask()', () => {
    const deleteTestCases: [string, number][] = [
      ['call taskRepository.deleteTask', 1],
      ['throw an error when task is not found', 0],
    ];

    test.each(deleteTestCases)('should %s', async (_, affected) => {
      taskRepository.delete.mockImplementation(() => ({ affected }));
      expect(taskRepository.delete).not.toHaveBeenCalled();
      if (affected) {
        await tasksService.deleteTaskById(1, MOCK_USER);
        expect(taskRepository.delete).toHaveBeenCalledWith({
          id: 1,
          userId: MOCK_USER.id,
        });
      } else {
        await expect(tasksService.deleteTaskById(1, MOCK_USER)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });

  describe('updateTaskStatus()', () => {
    it('should update task status', async () => {
      const save = jest.fn().mockResolvedValue(true);
      tasksService.getTaskById = jest
        .fn()
        .mockResolvedValue({ status: TaskStatus.OPEN, id: 1, save });
      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatus(
        {
          id: 1,
          status: TaskStatus.DONE,
        },
        MOCK_USER,
      );
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
