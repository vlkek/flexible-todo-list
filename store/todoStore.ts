import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Alert } from 'react-native';
import { create } from 'zustand';

// Настройка уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  scheduledTime?: Date;
  notificationId?: string;
}

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string, scheduledTime?: Date) => boolean;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => Promise<void>;
  scheduleNotification: (todo: Todo) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  
  addTodo: (text: string, scheduledTime?: Date) => {
    const errors: string[] = [];
    
    if (text.trim().length === 0) {
      errors.push('Введите текст задачи');
    }

    if (!scheduledTime) {
      errors.push('Укажите время выполнения задачи');
    }

    if (errors.length > 0) {
      Alert.alert('Заполните все поля', errors.join('\n'));
      return false;
    }
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      scheduledTime,
    };

    get().scheduleNotification(newTodo).then(notificationId => {
      newTodo.notificationId = notificationId;
      set((state) => ({
        todos: [...state.todos, newTodo],
      }));
    });

    return true;
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
    const now = new Date();

    if (trigger.getTime() <= now.getTime()) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Напоминание о задаче',
          body: todo.text,
          data: { todoId: todo.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      return notificationId;
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Напоминание о задаче',
        body: todo.text,
        data: { todoId: todo.id },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.CALENDAR,
        year: trigger.getFullYear(),
        month: trigger.getMonth() + 1,
        day: trigger.getDate(),
        hour: trigger.getHours(),
        minute: trigger.getMinutes(),
      },
    });

    return notificationId;
  },

  cancelNotification: async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },
})); 