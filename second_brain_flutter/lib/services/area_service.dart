import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AreaService {
  static const String _storageKey = 'sbt_areas';

  static final List<Map<String, dynamic>> _defaultAreas = [
    { 'id': 'area-1', 'title': 'Learning & Growth', 'icon': '📚', 'description': 'Books, courses, skills', 'color': '#2eaadc' },
    { 'id': 'area-2', 'title': 'Health & Fitness', 'icon': '💪', 'description': 'Exercise, nutrition, sleep', 'color': '#0f7b6c' },
    { 'id': 'area-3', 'title': 'Career & Work', 'icon': '💼', 'description': 'Professional development', 'color': '#6940a5' },
    { 'id': 'area-4', 'title': 'Finance', 'icon': '💰', 'description': 'Savings, investments, budget', 'color': '#d9730d' },
    { 'id': 'area-5', 'title': 'Relationships', 'icon': '❤️', 'description': 'Family, friends, community', 'color': '#e03e3e' },
    { 'id': 'area-6', 'title': 'Creativity', 'icon': '🎨', 'description': 'Art, writing, music', 'color': '#0b6e99' },
  ];

  static Future<List<dynamic>> getAreas() async {
    final prefs = await SharedPreferences.getInstance();
    final String? areasStr = prefs.getString(_storageKey);
    if (areasStr == null) {
      await saveAreas(_defaultAreas);
      return _defaultAreas;
    }
    return jsonDecode(areasStr);
  }

  static Future<void> saveAreas(List<dynamic> areas) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonEncode(areas));
  }

  static Future<void> addArea(Map<String, dynamic> area) async {
    final areas = await getAreas();
    areas.insert(0, area);
    await saveAreas(areas);
  }

  static Future<void> updateArea(String id, Map<String, dynamic> updates) async {
    final areas = await getAreas();
    final index = areas.indexWhere((a) => a['id'] == id);
    if (index != -1) {
      areas[index] = { ...areas[index], ...updates };
      await saveAreas(areas);
    }
  }

  static Future<void> deleteArea(String id) async {
    final areas = await getAreas();
    areas.removeWhere((a) => a['id'] == id);
    await saveAreas(areas);
  }
}
