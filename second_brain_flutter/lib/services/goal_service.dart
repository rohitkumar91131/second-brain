import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

class GoalService {
  static Future<List<dynamic>> getGoals() async {
    try {
      final response = await ApiService.get('/goals');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching goals: $e');
      return [];
    }
  }

  static Future<bool> createGoal(Map<String, dynamic> goalData) async {
    try {
      final response = await ApiService.post('/goals', goalData);
      return response.statusCode == 201;
    } catch (e) {
      debugPrint('Error creating goal: $e');
      return false;
    }
  }

  static Future<bool> updateGoal(String id, Map<String, dynamic> updates) async {
    try {
      final response = await ApiService.put('/goals/$id', updates);
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating goal: $e');
      return false;
    }
  }
}
