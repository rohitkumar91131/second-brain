import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';

class Sidebar extends StatelessWidget {
  final Function(String) onNavigate;
  final String? currentPath;
  final VoidCallback? onClose;
  final bool isCollapsed;
  final VoidCallback onToggle;

  const Sidebar({
    super.key,
    required this.onNavigate,
    this.currentPath,
    this.onClose,
    this.isCollapsed = false,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    // Exact widths from web: w-14 (56px) / w-56 (224px)
    final double width = isCollapsed ? 56 : 240;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: width,
      decoration: const BoxDecoration(
        color: AppTheme.notionSidebar,
        border: Border(right: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            height: 48,
            padding: EdgeInsets.symmetric(horizontal: isCollapsed ? 0 : 12),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
            ),
            child: Row(
              mainAxisAlignment: isCollapsed
                  ? MainAxisAlignment.center
                  : MainAxisAlignment.spaceBetween,
              children: [
                if (!isCollapsed) ...[
                  const Icon(LucideIcons.brain,
                      color: AppTheme.notionAccent, size: 18),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Second Brain',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.notionText,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ],
                IconButton(
                  icon: Icon(
                      isCollapsed
                          ? LucideIcons.chevronRight
                          : LucideIcons.chevronLeft,
                      size: 16,
                      color: AppTheme.notionMuted),
                  onPressed: onToggle,
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  hoverColor: AppTheme.notionHover,
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Navigation Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              children: [
                _SidebarItem(
                  icon: LucideIcons.layoutDashboard,
                  label: 'Overview',
                  isActive: currentPath == '/dashboard',
                  onTap: () => onNavigate('/dashboard'),
                  isCollapsed: isCollapsed,
                ),
                _SidebarItem(
                  icon: LucideIcons.checkSquare,
                  label: 'Tasks',
                  isActive: currentPath == '/tasks',
                  onTap: () => onNavigate('/tasks'),
                  isCollapsed: isCollapsed,
                ),
                _SidebarItem(
                  icon: LucideIcons.folderOpen,
                  label: 'Projects',
                  isActive: currentPath == '/projects',
                  onTap: () => onNavigate('/projects'),
                  isCollapsed: isCollapsed,
                ),
                _SidebarItem(
                  icon: LucideIcons.target,
                  label: 'Goals',
                  isActive: currentPath == '/goals',
                  onTap: () => onNavigate('/goals'),
                  isCollapsed: isCollapsed,
                ),
                _SidebarItem(
                  icon: LucideIcons.map,
                  label: 'Areas',
                  isActive: currentPath == '/areas',
                  onTap: () => onNavigate('/areas'),
                  isCollapsed: isCollapsed,
                ),
                _SidebarItem(
                  icon: LucideIcons.bookOpen,
                  label: 'Resources',
                  isActive: currentPath == '/resources',
                  onTap: () => onNavigate('/resources'),
                  isCollapsed: isCollapsed,
                ),
                _SidebarItem(
                  icon: LucideIcons.fileText,
                  label: 'Notes',
                  isActive: currentPath == '/notes',
                  onTap: () => onNavigate('/notes'),
                  isCollapsed: isCollapsed,
                ),
                _SidebarItem(
                  icon: LucideIcons.bookMarked,
                  label: 'Journal',
                  isActive: currentPath == '/journal',
                  onTap: () => onNavigate('/journal'),
                  isCollapsed: isCollapsed,
                ),
                _SidebarItem(
                  icon: LucideIcons.archive,
                  label: 'Archive',
                  isActive: currentPath == '/archive',
                  onTap: () => onNavigate('/archive'),
                  isCollapsed: isCollapsed,
                ),
              ],
            ),
          ),

          // User Footer
          _buildUserFooter(context),
        ],
      ),
    );
  }

  Widget _buildUserFooter(BuildContext context) {
    if (isCollapsed) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppTheme.notionBorder)),
        ),
        child: IconButton(
          icon: const Icon(LucideIcons.logOut,
              size: 14, color: AppTheme.notionMuted),
          onPressed: () => onNavigate('/login'),
          hoverColor: Colors.red.withOpacity(0.05),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: const BoxDecoration(
              color: AppTheme.notionText,
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Icon(LucideIcons.user, size: 13, color: Colors.white),
            ),
          ),
          const SizedBox(width: 8),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'John Doe',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.notionText),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'john@example.com',
                  style: TextStyle(fontSize: 10, color: AppTheme.notionMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.logOut,
                size: 13, color: AppTheme.notionMuted),
            onPressed: () => onNavigate('/login'),
            visualDensity: VisualDensity.compact,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            hoverColor: Colors.red.withOpacity(0.05),
          ),
        ],
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback? onTap;
  final Color? color;
  final bool isCollapsed;

  const _SidebarItem({
    required this.icon,
    required this.label,
    this.isActive = false,
    this.onTap,
    this.color,
    this.isCollapsed = false,
  });

  @override
  Widget build(BuildContext context) {
    final textColor =
        color ?? (isActive ? AppTheme.notionText : const Color(0xFF787774));

    Widget item = InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.notionHover : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          mainAxisAlignment:
              isCollapsed ? MainAxisAlignment.center : MainAxisAlignment.start,
          children: [
            Icon(icon, size: 16, color: textColor),
            if (!isCollapsed) ...[
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                    color: textColor,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );

    if (isCollapsed) {
      return Tooltip(
        message: label,
        preferBelow: false,
        child: item,
      );
    }

    return item;
  }
}
