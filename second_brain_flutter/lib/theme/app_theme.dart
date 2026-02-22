import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color notionBg = Color(0xFFFFFFFF);
  static const Color notionSidebar = Color(0xFFF7F7F5);
  static const Color notionHover = Color(0xFFEFEFEF);
  static const Color notionBorder = Color(0xFFE3E2DE);
  static const Color notionText = Color(0xFF37352F);
  static const Color notionMuted = Color(0xFF9B9A97);
  static const Color notionAccent = Color(0xFF2EAADC);

  // Gradient Colors
  static const List<Color> sexyGradient = [
    Color(0xFF37352F),
    Color(0xFF2F2D28),
  ];

  static const List<Color> accentGradient = [
    Color(0xFF2EAADC),
    Color(0xFF0B6E99),
  ];

  // Status Colors
  static const Color statusNotStartedBg = Color(0xFFF1F1EF);
  static const Color statusNotStartedText = Color(0xFF787774);
  static const Color statusInProgressBg = Color(0xFFDBEAFE);
  static const Color statusInProgressText = Color(0xFF1D4ED8);
  static const Color statusDoneBg = Color(0xFFDCFCE7);
  static const Color statusDoneText = Color(0xFF166534);
  static const Color statusBlockedBg = Color(0xFFFEE2E2);
  static const Color statusBlockedText = Color(0xFF991B1B);
  static const Color statusOnHoldBg = Color(0xFFFEF3C7);
  static const Color statusOnHoldText = Color(0xFF92400E);

  // Priority Colors
  static const Color priorityHighBg = Color(0xFFFEE2E2);
  static const Color priorityHighText = Color(0xFF991B1B);
  static const Color priorityMediumBg = Color(0xFFFEF3C7);
  static const Color priorityMediumText = Color(0xFF92400E);
  static const Color priorityLowBg = Color(0xFFF1F1EF);
  static const Color priorityLowText = Color(0xFF787774);

  static String safeString(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback;
    if (value is String) return value.isEmpty ? fallback : value;
    if (value is List) {
      if (value.isEmpty) return fallback;
      final joined = value.map((item) {
        if (item is Map) {
          return item['plain_text'] ?? item['text'] ?? item['content'] ?? item.toString();
        }
        return item.toString();
      }).join('');
      return joined.isEmpty ? fallback : joined;
    }
    final str = value.toString();
    return str.isEmpty ? fallback : str;
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: notionBg,
      colorScheme: ColorScheme.fromSeed(
        seedColor: notionText,
        background: notionBg,
        surface: notionBg,
        onSurface: notionText,
        primary: notionText,
        secondary: notionMuted,
      ),
      textTheme: GoogleFonts.interTextTheme().apply(
        bodyColor: notionText,
        displayColor: notionText,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: notionText,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: notionText,
          side: const BorderSide(color: notionBorder),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: notionBg,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: notionText),
        titleTextStyle: TextStyle(
          color: notionText,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
