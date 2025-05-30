import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { create } from 'zustand';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  scheduledTime?: Date;
  notificationId?: string;
}

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string, scheduledTime?: Date) => Promise<void>;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => Promise<void>;
  scheduleNotification: (todo: Todo) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  
  addTodo: async (text: string, scheduledTime?: Date) => {
    if (text.trim().length === 0) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      scheduledTime,
    };

    if (scheduledTime) {
      newTodo.notificationId = await get().scheduleNotification(newTodo);
    }
    
    set((state) => ({
      todos: [...state.todos, newTodo],
    }));
  },

  toggleTodo: (id: string) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  },

  deleteTodo: async (id: string) => {
    const todo = get().todos.find(t => t.id === id);
    if (todo?.notificationId) {
      await get().cancelNotification(todo.notificationId);
    }
    
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    }));
  },

  scheduleNotification: async (todo: Todo) => {
    if (!todo.scheduledTime) return '';

    const trigger = new Date(todo.scheduledTime);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Напоминание о задаче',
        body: todo.text,
        data: { todoId: todo.id },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.CALENDAR,
        year: trigger.getFullYear(),
        month: trigger.getMonth(),
        day: trigger.getDate(),
        hour: trigger.getHours(),
      },
    });

    return notificationId;
  },

  cancelNotification: async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },
})); 