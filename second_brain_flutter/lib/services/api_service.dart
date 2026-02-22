import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  // Logic to determine the correct Base URL
  static String get baseUrl {
    return dotenv.env['API_URL'] ?? 'http://localhost:5000/api';
  }

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<http.Response> get(String endpoint) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders();
      debugPrint('API GET: $url');
      return await http.get(url, headers: headers).timeout(const Duration(seconds: 10));
    } catch (e) {
      debugPrint('API GET Error at $endpoint: $e');
      rethrow;
    }
  }

  static Future<http.Response> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders();
      debugPrint('API POST: $url with data: $data');
      return await http.post(
        url,
        headers: headers,
        body: jsonEncode(data),
      ).timeout(const Duration(seconds: 10));
    } catch (e) {
      debugPrint('API POST Error at $endpoint: $e');
      rethrow;
    }
  }

  static Future<http.Response> put(String endpoint, Map<String, dynamic> data) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders();
      debugPrint('API PUT: $url');
      return await http.put(
        url,
        headers: headers,
        body: jsonEncode(data),
      ).timeout(const Duration(seconds: 10));
    } catch (e) {
      debugPrint('API PUT Error at $endpoint: $e');
      rethrow;
    }
  }

  static Future<http.Response> delete(String endpoint) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final headers = await _getHeaders();
      debugPrint('API DELETE: $url');
      return await http.delete(url, headers: headers).timeout(const Duration(seconds: 10));
    } catch (e) {
      debugPrint('API DELETE Error at $endpoint: $e');
      rethrow;
    }
  }
}
