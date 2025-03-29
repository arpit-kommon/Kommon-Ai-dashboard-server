import notificationServiceApi from './notificationServiceApi.js';

class SchedulerService {
    constructor() {
        this.tasks = [];
        this.customCallback = null;
    }

    async scheduledFunction(currentTime, userId) {
        console.log(`Scheduled function called at: ${currentTime.toISOString()} for user: ${userId}`);
        const result = await notificationServiceApi(currentTime, userId); // Removed arguments as they weren’t used originally

        if (this.customCallback) {
            const customResult = await this.customCallback(currentTime, userId);
            return {
                ...result,
                ...customResult,
                executedAt: currentTime
            };
        }
        return result;
    }

    setCustomCallback(callback) {
        this.customCallback = callback;
    }

    start() {
        console.log('SchedulerService initialized...');
    }

    async scheduleTask(executionTime, userId, existingId = null) {
        const task = {
            id: existingId !== null ? existingId : this.tasks.length + 1,
            userId,
            executionTime: new Date(executionTime),
            isExecuted: false,
            createdAt: new Date(),
            executedAt: null,
            lastRunTime: null
        };

        if (existingId !== null) {
            const taskIndex = this.tasks.findIndex(t => t.id === existingId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = task;
            } else {
                this.tasks.push(task);
            }
        } else {
            this.tasks.push(task);
        }
        console.log(`Task ${task.id} scheduled for user ${task.userId} at ${task.executionTime.toISOString()}`);
        return task.id;
    }

    clearTasks() {
        this.tasks = [];
        console.log('All scheduled tasks cleared');
    }

    getTasks() {
        return this.tasks;
    }
}

export default SchedulerService;