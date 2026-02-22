import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

class ProjectService {
  static Future<List<dynamic>> getProjects() async {
    try {
      final response = await ApiService.get('/projects');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching projects: $e');
      return [];
    }
  }

  static Future<bool> createProject(Map<String, dynamic> projectData) async {
    try {
      final response = await ApiService.post('/projects', projectData);
      return response.statusCode == 201;
    } catch (e) {
      debugPrint('Error creating project: $e');
      return false;
    }
  }

  static Future<bool> updateProject(String id, Map<String, dynamic> updates) async {
    try {
      final response = await ApiService.put('/projects/$id', updates);
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating project: $e');
      return false;
    }
  }
}
