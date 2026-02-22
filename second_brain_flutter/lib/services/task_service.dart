import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

class TaskService {
  static Future<List<dynamic>> getTasks() async {
    try {
      final response = await ApiService.get('/tasks');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      print('Error fetching tasks: $e');
      return [];
    }
  }

  static Future<bool> createTask(Map<String, dynamic> taskData) async {
    try {
      final response = await ApiService.post('/tasks', taskData);
      return response.statusCode == 201;
    } catch (e) {
      debugPrint('Error creating task: $e');
      return false;
    }
  }

  static Future<bool> updateTask(String id, Map<String, dynamic> updates) async {
    try {
      final response = await ApiService.put('/tasks/$id', updates);
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating task: $e');
      return false;
    }
  }

  static Future<bool> deleteTask(String id) async {
    try {
      final response = await ApiService.delete('/tasks/$id');
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error deleting task: $e');
      return false;
    }
  }
}
