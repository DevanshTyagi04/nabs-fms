import { WorkTask, Appointment, LinkedEntity, ExecutionProgress } from './types';

export class TaskEngine {
  static calculateProgress(tasks: WorkTask[]): ExecutionProgress {
    if (!tasks || tasks.length === 0) {
      return { totalTasks: 0, completedTasks: 0, percentage: 100, isComplete: true };
    }
    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const percentage = Math.round((completedTasks / tasks.length) * 100);
    return {
      totalTasks: tasks.length,
      completedTasks,
      percentage,
      isComplete: completedTasks === tasks.length,
    };
  }
}

export class SchedulingEngine {
  static formatAppointment(appointment?: Appointment): string {
    if (!appointment || !appointment.startDate) return 'Unscheduled';
    const start = new Date(appointment.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const end = appointment.endDate
      ? new Date(appointment.endDate).toLocaleTimeString([], { timeStyle: 'short' })
      : '';
    return `${start}${end ? ` - ${end}` : ''} ${appointment.technicianName ? `(${appointment.technicianName})` : ''}`;
  }
}

export class CompletionEngine {
  static validateCanComplete(tasks: WorkTask[]): { canComplete: boolean; error?: string } {
    const progress = TaskEngine.calculateProgress(tasks);
    if (!progress.isComplete) {
      return {
        canComplete: false,
        error: `Cannot complete work order. ${progress.totalTasks - progress.completedTasks} checklist tasks remain uncompleted.`,
      };
    }
    return { canComplete: true };
  }
}

export class LinkedEntityRegistry {
  private static registry: Map<string, LinkedEntity> = new Map();

  static register(entity: LinkedEntity) {
    this.registry.set(entity.id, entity);
  }

  static get(id: string): LinkedEntity | undefined {
    return this.registry.get(id);
  }
}

export class ExecutionEngine {
  static evaluate(tasks: WorkTask[], appointment?: Appointment) {
    const progress = TaskEngine.calculateProgress(tasks);
    const scheduleLabel = SchedulingEngine.formatAppointment(appointment);
    const completionValidation = CompletionEngine.validateCanComplete(tasks);

    return {
      progress,
      scheduleLabel,
      canComplete: completionValidation.canComplete,
      completionError: completionValidation.error,
    };
  }
}
