import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface TaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskChecklistEditorProps {
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
}

export function TaskChecklistEditor({ tasks, onToggleTask }: TaskChecklistEditorProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.cardForeground }]}>Execution Task Checklist</Text>
      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          onPress={() => onToggleTask(task.id)}
          style={[styles.taskRow, { borderColor: colors.border }]}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: task.isCompleted ? colors.primary : colors.mutedForeground,
                backgroundColor: task.isCompleted ? colors.primary : 'transparent',
              },
            ]}
          >
            {task.isCompleted && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text
            style={[
              styles.taskTitle,
              {
                color: task.isCompleted ? colors.mutedForeground : colors.cardForeground,
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              },
            ]}
          >
            {task.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 12,
    flex: 1,
  },
});
