import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

class NoteService {
  static Future<Map<String, dynamic>?> getNote(String id) async {
    try {
      final response = await ApiService.get('/notes/$id');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      debugPrint('Error fetching note: $e');
      return null;
    }
  }

  static Future<List<dynamic>> getNotes() async {
    try {
      final response = await ApiService.get('/notes');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching notes: $e');
      return [];
    }
  }

  static Future<bool> createNote(Map<String, dynamic> noteData) async {
    try {
      final response = await ApiService.post('/notes', noteData);
      return response.statusCode == 201;
    } catch (e) {
      debugPrint('Error creating note: $e');
      return false;
    }
  }

  static Future<bool> updateNote(String id, Map<String, dynamic> updates) async {
    try {
      final response = await ApiService.put('/notes/$id', updates);
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating note: $e');
      return false;
    }
  }

  static Future<bool> deleteNote(String id) async {
    try {
      final response = await ApiService.delete('/notes/$id');
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error deleting note: $e');
      return false;
    }
  }
}
