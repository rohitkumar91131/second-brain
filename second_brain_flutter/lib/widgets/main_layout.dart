import 'package:flutter/material.dart';
import 'package:second_brain_flutter/screens/dashboard_page.dart';
import 'package:second_brain_flutter/screens/tasks_page.dart';
import 'package:second_brain_flutter/screens/projects_page.dart';
import 'package:second_brain_flutter/screens/goals_page.dart';
import 'package:second_brain_flutter/screens/notes_page.dart';
import 'package:second_brain_flutter/screens/journal_page.dart';
import 'package:second_brain_flutter/screens/resources_page.dart';
import 'package:second_brain_flutter/screens/areas_page.dart';
import 'package:second_brain_flutter/screens/archive_page.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';
import 'package:second_brain_flutter/widgets/quick_add_modal.dart';
import 'package:second_brain_flutter/widgets/custom_button.dart';
import 'package:second_brain_flutter/widgets/global_search_modal.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';

class MainLayout extends StatefulWidget {
  final String initialPath;
  const MainLayout({super.key, this.initialPath = '/dashboard'});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  late String _currentPath;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool _isSidebarCollapsed = false;
  int _selectedIndex = 0;
  final ValueNotifier<int> _refreshSignal = ValueNotifier<int>(0);

  // List of paths and their corresponding indices for IndexedStack
  final List<String> _paths = [
    '/dashboard',
    '/tasks',
    '/projects',
    '/goals',
    '/areas',
    '/resources',
    '/notes',
    '/journal',
    '/archive',
  ];

  @override
  void initState() {
    super.initState();
    _currentPath = widget.initialPath;
    _selectedIndex = _paths.indexOf(_currentPath);
    if (_selectedIndex == -1) _selectedIndex = 0;
  }

  void _onQuickAdd() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => const QuickAddModal(),
    );

    if (result == true && mounted) {
      _refreshSignal.value++;
    }
  }

  void _onSearch() {
    showDialog(
      context: context,
      builder: (context) => GlobalSearchModal(onNavigate: _onNavigate),
    );
  }

  Widget _getContent() {
    switch (_currentPath) {
      case '/dashboard':
        return const DashboardPage(isEmbedded: true);
      case '/tasks':
        return const TasksPage(isEmbedded: true);
      case '/projects':
        return const ProjectsPage(isEmbedded: true);
      case '/goals':
        return const GoalsPage(isEmbedded: true);
      case '/notes':
        return const NotesPage(isEmbedded: true);
      case '/journal':
        return const JournalPage(isEmbedded: true);
      case '/resources':
        return const ResourcesPage(isEmbedded: true);
      case '/areas':
        return const AreasPage(isEmbedded: true);
      case '/archive':
        return const ArchivePage(isEmbedded: true);
      default:
        return const DashboardPage(isEmbedded: true);
    }
  }

  void _onNavigate(String path) {
    if (path == '/login') {
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    // Check if drawer is open and close it
    if (_scaffoldKey.currentState?.isDrawerOpen ?? false) {
      _scaffoldKey.currentState?.closeDrawer();
    }

    final index = _paths.indexOf(path);
    if (index != -1) {
      setState(() {
        _currentPath = path;
        _selectedIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width >= 800;

    return Shortcuts(
      shortcuts: {
        LogicalKeySet(LogicalKeyboardKey.control, LogicalKeyboardKey.keyK):
            const SearchIntent(),
        LogicalKeySet(LogicalKeyboardKey.meta, LogicalKeyboardKey.keyK):
            const SearchIntent(),
      },
      child: Actions(
        actions: {
          SearchIntent:
              CallbackAction<SearchIntent>(onInvoke: (intent) => _onSearch()),
        },
        child: Scaffold(
          key: _scaffoldKey,
          backgroundColor: Colors.white,
          drawer: !isDesktop
              ? Sidebar(
                  onNavigate: _onNavigate,
                  currentPath: _currentPath,
                  onClose: () => Navigator.pop(context),
                  onToggle: () => Navigator.pop(context),
                )
              : null,
          body: Row(
            children: [
              if (isDesktop)
                Sidebar(
                  onNavigate: _onNavigate,
                  currentPath: _currentPath,
                  isCollapsed: _isSidebarCollapsed,
                  onToggle: () => setState(
                      () => _isSidebarCollapsed = !_isSidebarCollapsed),
                ),
              Expanded(
                child: Column(
                  children: [
                    // Global Header (Top Navbar)
                    Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        border: Border(
                          bottom: BorderSide(color: AppTheme.notionBorder, width: 0.5),
                        ),
                      ),
                      child: Row(
                        children: [
                          // Breadcrumb / Title
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _currentPath == '/dashboard'
                                    ? 'Overview'
                                    : _currentPath.substring(1)[0].toUpperCase() + _currentPath.substring(2),
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: AppTheme.notionText,
                                ),
                              ),
                            ],
                          ),
                          
                          const Spacer(),
                          
                          // Search & Actions Box (Aligned to Right)
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Search Input Style
                              InkWell(
                                onTap: _onSearch,
                                borderRadius: BorderRadius.circular(4),
                                child: Container(
                                  width: 200,
                                  height: 28,
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  decoration: BoxDecoration(
                                    color: AppTheme.notionHover.withOpacity(0.5),
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: AppTheme.notionBorder.withOpacity(0.3)),
                                  ),
                                  child: const Row(
                                    children: [
                                      Icon(LucideIcons.search, size: 13, color: AppTheme.notionMuted),
                                      SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          'Search...',
                                          style: TextStyle(fontSize: 12, color: AppTheme.notionMuted),
                                        ),
                                      ),
                                      Text('⌘K', style: TextStyle(fontSize: 10, color: AppTheme.notionMuted)),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              // New Button
                              CustomButton(
                                onPressed: _onQuickAdd,
                                icon: LucideIcons.plus,
                                text: 'New',
                                fontSize: 12,
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: IndexedStack(
                        index: _selectedIndex,
                        children: [
                          DashboardPage(
                            key: const ValueKey('dashboard'),
                            isEmbedded: true,
                            refreshSignal: _refreshSignal,
                          ),
                          TasksPage(
                            key: const ValueKey('tasks'),
                            isEmbedded: true,
                            refreshSignal: _refreshSignal,
                          ),
                          ProjectsPage(
                            key: const ValueKey('projects'),
                            isEmbedded: true,
                            refreshSignal: _refreshSignal,
                          ),
                          GoalsPage(
                            key: const ValueKey('goals'),
                            isEmbedded: true,
                            refreshSignal: _refreshSignal,
                          ),
                          AreasPage(
                            key: const ValueKey('areas'),
                            isEmbedded: true,
                            refreshSignal: _refreshSignal,
                          ),
                          ResourcesPage(
                            key: const ValueKey('resources'),
                            isEmbedded: true,
                            refreshSignal: _refreshSignal,
                          ),
                          NotesPage(
                            key: const ValueKey('notes'),
                            isEmbedded: true,
                            refreshSignal: _refreshSignal,
                          ),
                          JournalPage(
                            key: const ValueKey('journal'),
                            isEmbedded: true,
                            refreshSignal: _refreshSignal,
                          ),
                          ArchivePage(
                            key: const ValueKey('archive'),
                            isEmbedded: true,
                            refreshSignal: _refreshSignal,
                          ),
                        ]
                            .asMap()
                            .entries
                            .map((entry) => entry.value
                                .animate(key: ValueKey('anim_${entry.key}'))
                                .fadeIn(duration: 400.ms, curve: Curves.easeOut)
                                .slideY(
                                    begin: 0.05,
                                    end: 0,
                                    duration: 400.ms,
                                    curve: Curves.easeOutQuart))
                            .toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SearchIntent extends Intent {
  const SearchIntent();
}
