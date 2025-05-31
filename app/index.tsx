import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Todo, useTodoStore } from '../store/todoStore';
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
    const success = addTodo(text, scheduledTime);
    if (success) {
      setText('');
      setScheduledTime(undefined);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setScheduledTime(selectedDate);
    }
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <TouchableOpacity
      style={[styles.card, item.completed && styles.cardCompleted]}
      onPress={() => toggleTodo(item.id)}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.text, item.completed && styles.textCompleted]} numberOfLines={1}>
          {item.text}
        </Text>
        {item.scheduledTime && (
          <Text style={styles.timeInList}>
            {format(new Date(item.scheduledTime), 'HH:mm', { locale: ru })}
          </Text>
        )}
      </View>
      {item.completed ? (
        <Ionicons name="checkmark-circle" size={28} color="#4dd599" />
      ) : (
        <Ionicons name="ellipse-outline" size={28} color="#e0e0e0" />
      )}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation && e.stopPropagation();
          deleteTodo(item.id);
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#6ec6ff', '#2196f3']}
      style={[styles.gradient, { paddingBottom: Platform.OS === 'ios' ? 34 : 0 }]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Ionicons name="apps" size={28} color="#90caf9" style={{ marginRight: 8 }} />
          <Text style={styles.title}>All Tasks</Text>
        </View>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderTodoItem}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.inputPanelBottom}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Create new task"
            placeholderTextColor="#b3e5fc"
          />
          <TouchableOpacity
            style={[styles.timeButton, scheduledTime && styles.timeButtonActive]}
            onPress={() => setShowTimePicker(true)}
          >
            {scheduledTime ? (
              <Text style={styles.timeButtonText}>
                {format(scheduledTime, 'HH:mm', { locale: ru })}
              </Text>
            ) : (
              <Ionicons name="alarm-outline" size={28} color="#2196f3" />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.fabGreen} onPress={handleAddTodo} activeOpacity={0.85}>
          <Ionicons name="add" size={40} color="#fff" />
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={scheduledTime || new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222',
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  cardCompleted: {
    opacity: 0.5,
  },
  text: {
    flex: 1,
    fontSize: 18,
    color: '#222',
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  inputPanel: {
    display: 'none',
  },
  inputPanelNew: {
    display: 'none',
  },
  inputPanelBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  input: {
    flex: 1,
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 17,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  timeButton: {
    minWidth: 54,
    height: 54,
    backgroundColor: '#e3f2fd',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  timeButtonActive: {
    backgroundColor: '#4da6ff',
  },
  timeButtonText: {
    fontSize: 22,
    color: '#2196f3',
  },
  fabGreen: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#4dd599',
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
    borderWidth: 4,
    borderColor: '#fff',
  },
  timeInList: {
    fontSize: 13,
    color: '#90caf9',
    marginTop: 2,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
});
