import 'package:flutter/material.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';

class FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final bool isHovered;

  const FeatureCard({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    this.isHovered = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.notionBorder),
        boxShadow: isHovered
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                )
              ]
            : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.notionSidebar,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppTheme.notionText, size: 24),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: const TextStyle(color: AppTheme.notionMuted, height: 1.5),
          ),
        ],
      ),
    );
  }
}
