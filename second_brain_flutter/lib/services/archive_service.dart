import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ArchiveService {
  static const String _storageKey = 'archive';

  static Future<List<dynamic>> getArchive() async {
    final prefs = await SharedPreferences.getInstance();
    final String? archiveJson = prefs.getString(_storageKey);
    if (archiveJson == null) return [];
    return jsonDecode(archiveJson) as List<dynamic>;
  }

  static Future<void> updateArchive(List<dynamic> archive) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonEncode(archive));
  }

  static Future<void> deleteArchiveItem(String id) async {
    final archive = await getArchive();
    final updated = archive.where((item) => item['id'] != id).toList();
    await updateArchive(updated);
  }

  static Future<void> clearArchive() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_storageKey);
  }
}
