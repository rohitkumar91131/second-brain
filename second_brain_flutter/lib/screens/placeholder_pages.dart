import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';

class PlaceholderPage extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final String path;

  const PlaceholderPage({
    super.key,
    required this.title,
    required this.icon,
    required this.color,
    required this.path,
  });

  @override
  Widget build(BuildContext context) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: Colors.white,
      drawer: Sidebar(
        onNavigate: (path) => Navigator.pushReplacementNamed(context, path),
        currentPath: path,
        onToggle: () => Navigator.pop(context),
      ),
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) => Navigator.pushReplacementNamed(context, path),
              currentPath: path,
              onToggle: () {},
            ),
          Expanded(
            child: Column(
              children: [
                _buildHeader(context, scaffoldKey),
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(icon, size: 64, color: color.withOpacity(0.5)),
                        const SizedBox(height: 16),
                        Text(
                          '$title is under construction',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.notionMuted),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, GlobalKey<ScaffoldState> scaffoldKey) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          if (MediaQuery.of(context).size.width < 800)
            IconButton(
              icon: const Icon(LucideIcons.menu, size: 20),
              onPressed: () => scaffoldKey.currentState?.openDrawer(),
            ),
          Icon(icon, size: 24, color: color),
          const SizedBox(width: 12),
          Text(
            title,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: -0.5),
          ),
        ],
      ),
    );
  }
}

class GoalsPage extends StatelessWidget {
  const GoalsPage({super.key});
  @override
  Widget build(BuildContext context) => const PlaceholderPage(title: 'Goals', icon: LucideIcons.target, color: Colors.orange, path: '/goals');
}

class NotesPage extends StatelessWidget {
  const NotesPage({super.key});
  @override
  Widget build(BuildContext context) => const PlaceholderPage(title: 'Notes', icon: LucideIcons.fileText, color: Colors.green, path: '/notes');
}

class JournalPage extends StatelessWidget {
  const JournalPage({super.key});
  @override
  Widget build(BuildContext context) => const PlaceholderPage(title: 'Journal', icon: LucideIcons.bookMarked, color: Colors.indigo, path: '/journal');
}

class ResourcesPage extends StatelessWidget {
  const ResourcesPage({super.key});
  @override
  Widget build(BuildContext context) => const PlaceholderPage(title: 'Resources', icon: LucideIcons.bookOpen, color: Colors.teal, path: '/resources');
}

class AreasPage extends StatelessWidget {
  const AreasPage({super.key});
  @override
  Widget build(BuildContext context) => const PlaceholderPage(title: 'Areas', icon: LucideIcons.map, color: Colors.cyan, path: '/areas');
}

class ArchivePage extends StatelessWidget {
  const ArchivePage({super.key});
  @override
  Widget build(BuildContext context) => const PlaceholderPage(title: 'Archive', icon: LucideIcons.archive, color: Colors.brown, path: '/archive');
}
