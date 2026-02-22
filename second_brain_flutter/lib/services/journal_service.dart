import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

class JournalService {
  static Future<Map<String, dynamic>?> getJournalEntry(String id) async {
    try {
      final response = await ApiService.get('/journal/$id');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      debugPrint('Error fetching journal entry: $e');
      return null;
    }
  }

  static Future<List<dynamic>> getJournalEntries() async {
    try {
      final response = await ApiService.get('/journal');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching journal entries: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>?> createJournalEntry(Map<String, dynamic> entryData) async {
    try {
      final response = await ApiService.post('/journal', entryData);
      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      debugPrint('Error creating journal entry: $e');
      return null;
    }
  }

  static Future<Map<String, dynamic>?> addJournalEntry(Map<String, dynamic> entryData) => createJournalEntry(entryData);

  static Future<bool> updateJournalEntry(String id, Map<String, dynamic> updates) async {
    try {
      final response = await ApiService.put('/journal/$id', updates);
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating journal entry: $e');
      return false;
    }
  }

  static Future<bool> deleteJournalEntry(String id) async {
    try {
      final response = await ApiService.delete('/journal/$id');
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error deleting journal entry: $e');
      return false;
    }
  }
}
