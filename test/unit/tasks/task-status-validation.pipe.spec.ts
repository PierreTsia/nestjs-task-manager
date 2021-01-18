import { TaskStatusValidationPipe } from '../../../src/tasks/pipes/task-status-validation.pipe';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

describe('Pipe: Task Status Validation', () => {
  let taskStatusValidationPipe;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TaskStatusValidationPipe],
    }).compile();

    taskStatusValidationPipe = await moduleRef.get<TaskStatusValidationPipe>(
      TaskStatusValidationPipe,
    );
  });

  const validationCases: [string, boolean][] = [
    ['done', true],
    ['unknown', false],
    ['IN_PROGRESS', true],
    [undefined, false],
    [null, false],
    ['open', true],
  ];

  validationCases.forEach(([status, shouldValidate]) => {
    it(`should ${
      shouldValidate ? '' : 'not'
    } validate ${status} as a valid status`, async () => {
      if (shouldValidate) {
        const result = await taskStatusValidationPipe.transform(status);

        expect(result).toEqual(status.toUpperCase());
      } else {
        await expect(
          taskStatusValidationPipe.transform(status),
        ).rejects.toThrow(BadRequestException);
      }
    });
  });
});
