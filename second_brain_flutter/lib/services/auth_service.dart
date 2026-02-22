import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthResult {
  final bool success;
  final String message;
  AuthResult(this.success, this.message);
}

class AuthService {
  static Future<AuthResult> login(String email, String password) async {
    try {
      final response = await ApiService.post('/auth/login', {
        'email': email,
        'password': password,
      });

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        final token = data['token'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('user', jsonEncode(data));
        return AuthResult(true, 'Login successful');
      }
      return AuthResult(false, data['error'] ?? 'Login failed');
    } catch (e) {
      debugPrint('Login error: $e');
      return AuthResult(false, 'Connection error. Please check your internet.');
    }
  }

  static Future<AuthResult> register(String name, String email, String password) async {
    try {
      final response = await ApiService.post('/auth/register', {
        'name': name,
        'email': email,
        'password': password,
      });

      final data = jsonDecode(response.body);
      if (response.statusCode == 201 || response.statusCode == 200) {
        final token = data['token'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('user', jsonEncode(data));
        return AuthResult(true, data['message'] ?? 'Account created');
      }
      
      String message = data['error'] ?? 'Registration failed';
      if (data['details'] != null && data['details'] is List) {
        message = (data['details'] as List).map((d) => d['message']).join(', ');
      }
      return AuthResult(false, message);
    } catch (e) {
      debugPrint('Register error: $e');
      return AuthResult(false, 'Connection error. Please check your internet.');
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('token');
  }

  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');
    if (userStr != null) {
      return jsonDecode(userStr);
    }
    return null;
  }
}
