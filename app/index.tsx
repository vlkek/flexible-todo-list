import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTodoStore } from '../store/todoStore';
import { setupNotifications } from '../utils/notifications';

export default function App() {
  const [text, setText] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>();
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodoStore();

  useEffect(() => {
    setupNotifications();
  }, []);

  const handleAddTodo = async () => {
    await addTodo(text, scheduledTime);
    setText('');
    setScheduledTime(undefined);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setScheduledTime(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Мой список задач</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Добавить новую задачу"
          placeholderTextColor="#666"
        />
        <TouchableOpacity 
          style={[styles.timeButton, scheduledTime && styles.timeButtonActive]} 
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.timeButtonText}>
            {scheduledTime ? format(scheduledTime, 'HH:mm', { locale: ru }) : '⏰'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={scheduledTime || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity
              style={styles.todoText}
              onPress={() => toggleTodo(item.id)}
            >
              <Text
                style={[
                  styles.todoTextContent,
                  item.completed && styles.completedTodo,
                ]}
              >
                {item.text}
              </Text>
              {item.scheduledTime && (
                <Text style={styles.scheduledTime}>
                  {format(new Date(item.scheduledTime), 'HH:mm', { locale: ru })}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTodo(item.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeButton: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  timeButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeButtonText: {
    fontSize: 20,
    color: '#333',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  todoText: {
    flex: 1,
  },
  todoTextContent: {
    fontSize: 16,
    color: '#333',
  },
  scheduledTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 