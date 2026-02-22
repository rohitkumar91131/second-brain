import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

class ResourceService {
  static Future<List<dynamic>> getResources() async {
    try {
      final response = await ApiService.get('/resources');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching resources: $e');
      return [];
    }
  }

  static Future<bool> createResource(Map<String, dynamic> resourceData) async {
    try {
      final response = await ApiService.post('/resources', resourceData);
      return response.statusCode == 201;
    } catch (e) {
      debugPrint('Error creating resource: $e');
      return false;
    }
  }

  static Future<bool> updateResource(String id, Map<String, dynamic> updates) async {
    try {
      final response = await ApiService.put('/resources/$id', updates);
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating resource: $e');
      return false;
    }
  }

  static Future<bool> deleteResource(String id) async {
    try {
      final response = await ApiService.delete('/resources/$id');
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error deleting resource: $e');
      return false;
    }
  }
}
