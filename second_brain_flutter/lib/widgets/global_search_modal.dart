import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/task_service.dart';
import 'package:second_brain_flutter/services/note_service.dart';
import 'package:second_brain_flutter/services/project_service.dart';
import 'package:second_brain_flutter/services/goal_service.dart';
import 'package:second_brain_flutter/services/journal_service.dart';
import 'package:second_brain_flutter/services/resource_service.dart';

class GlobalSearchModal extends StatefulWidget {
  final Function(String) onNavigate;
  const GlobalSearchModal({super.key, required this.onNavigate});

  @override
  State<GlobalSearchModal> createState() => _GlobalSearchModalState();
}

class _GlobalSearchModalState extends State<GlobalSearchModal> {
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  List<SearchItem> _allItems = [];
  List<SearchItem> _filteredItems = [];
  bool _isLoading = true;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadIndex();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _loadIndex() async {
    setState(() => _isLoading = true);
    try {
      final data = await Future.wait([
        TaskService.getTasks(),
        NoteService.getNotes(),
        ProjectService.getProjects(),
        GoalService.getGoals(),
        JournalService.getJournalEntries(),
        ResourceService.getResources(),
      ]);

      final List<SearchItem> items = [];

      // Index Tasks
      for (var t in data[0]) {
        items.add(SearchItem(
            id: t['id'],
            type: 'task',
            title: t['title'],
            sub: t['status'],
            tags: List<String>.from(t['tags'] ?? [])));
      }
      // Index Notes
      for (var n in data[1]) {
        items.add(SearchItem(
            id: n['id'],
            type: 'note',
            title: n['title'],
            sub: (n['tags'] as List?)?.join(', '),
            tags: List<String>.from(n['tags'] ?? [])));
      }
      // Index Projects
      for (var p in data[2]) {
        items.add(SearchItem(
            id: p['id'],
            type: 'project',
            title: p['title'],
            sub: p['status'],
            tags: List<String>.from(p['tags'] ?? [])));
      }
      // Index Goals
      for (var g in data[3]) {
        items.add(SearchItem(
            id: g['id'],
            type: 'goal',
            title: g['title'],
            sub: g['status'],
            tags: List<String>.from(g['tags'] ?? [])));
      }
      // Index Journal
      for (var j in data[4]) {
        items.add(SearchItem(
            id: j['id'],
            type: 'journal',
            title: j['title'],
            sub: j['mood'],
            tags: []));
      }
      // Index Resources
      for (var r in data[5]) {
        items.add(SearchItem(
            id: r['id'],
            type: 'resource',
            title: r['title'],
            sub: r['type'],
            tags: List<String>.from(r['tags'] ?? [])));
      }

      if (mounted) {
        setState(() {
          _allItems = items;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase().trim();
    if (query.isEmpty) {
      setState(() {
        _filteredItems = [];
        _selectedIndex = 0;
      });
      return;
    }

    final results = _allItems.where((item) {
      return item.title.toLowerCase().contains(query) ||
          (item.sub?.toLowerCase().contains(query) ?? false) ||
          item.tags.any((t) => t.toLowerCase().contains(query));
    }).toList();

    setState(() {
      _filteredItems = results.take(20).toList();
      _selectedIndex = 0;
    });
  }

  void _handleNavigate(SearchItem item) {
    String path = '/dashboard';
    if (item.type == 'task') path = '/tasks';
    if (item.type == 'project') path = '/projects';
    if (item.type == 'goal') path = '/goals';
    if (item.type == 'note')
      path =
          '/notes'; // Note detail not yet implemented in shell, but this highlights correctly
    if (item.type == 'journal') path = '/journal';
    if (item.type == 'resource') path = '/resources';

    Navigator.pop(context);
    widget.onNavigate(path);
  }

  // Type metadata
  static final Map<String, dynamic> _meta = {
    'task': {
      'label': 'Tasks',
      'icon': LucideIcons.checkSquare,
      'color': const Color(0xFF2EAADC)
    },
    'project': {
      'label': 'Projects',
      'icon': LucideIcons.folderOpen,
      'color': const Color(0xFF0F7B6C)
    },
    'goal': {
      'label': 'Goals',
      'icon': LucideIcons.target,
      'color': const Color(0xFFD9730D)
    },
    'note': {
      'label': 'Notes',
      'icon': LucideIcons.fileText,
      'color': const Color(0xFF6940A5)
    },
    'journal': {
      'label': 'Journal',
      'icon': LucideIcons.bookMarked,
      'color': const Color(0xFFE03E3E)
    },
    'resource': {
      'label': 'Resources',
      'icon': LucideIcons.bookOpen,
      'color': const Color(0xFF0B6E99)
    },
  };

  @override
  Widget build(BuildContext context) {
    return Dialog(
      alignment: Alignment.topCenter,
      insetPadding: EdgeInsets.only(
          top: MediaQuery.of(context).size.height * 0.15, left: 16, right: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 600,
        constraints:
            BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 40,
                offset: const Offset(0, 20))
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Input Row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: const BoxDecoration(
                border:
                    Border(bottom: BorderSide(color: AppTheme.notionBorder)),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.search,
                      size: 16, color: AppTheme.notionMuted),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      focusNode: _focusNode,
                      autofocus: true,
                      decoration: const InputDecoration(
                        hintText: 'Search tasks, notes, projects, goals...',
                        hintStyle: TextStyle(
                            color: AppTheme.notionMuted, fontSize: 14),
                        border: InputBorder.none,
                      ),
                      style: const TextStyle(
                          fontSize: 14, color: AppTheme.notionText),
                    ),
                  ),
                  if (_searchController.text.isNotEmpty)
                    IconButton(
                      icon: const Icon(LucideIcons.x,
                          size: 14, color: AppTheme.notionMuted),
                      onPressed: () => _searchController.clear(),
                    ),
                  const Text('ESC',
                      style: TextStyle(
                          fontSize: 10,
                          color: AppTheme.notionMuted,
                          fontWeight: FontWeight.bold)),
                ],
              ),
            ),

            // Results Area
            Flexible(
              child: _isLoading
                  ? const Padding(
                      padding: EdgeInsets.all(40),
                      child: Center(
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppTheme.notionMuted)),
                    )
                  : _searchController.text.isEmpty
                      ? const Padding(
                          padding: EdgeInsets.all(40),
                          child: Text(
                              'Start typing to search across all your data',
                              style: TextStyle(
                                  color: AppTheme.notionMuted, fontSize: 12)),
                        )
                      : _filteredItems.isEmpty
                          ? Padding(
                              padding: const EdgeInsets.all(40),
                              child: Text(
                                  'No results for "${_searchController.text}"',
                                  style: const TextStyle(
                                      color: AppTheme.notionMuted,
                                      fontSize: 12)),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              itemCount: _filteredItems.length,
                              itemBuilder: (context, index) {
                                final item = _filteredItems[index];
                                final meta = _meta[item.type];
                                final bool isFirstOfType = index == 0 ||
                                    _filteredItems[index - 1].type != item.type;

                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (isFirstOfType)
                                      Padding(
                                        padding: const EdgeInsets.only(
                                            left: 16, top: 12, bottom: 4),
                                        child: Row(
                                          children: [
                                            Icon(meta['icon'] as IconData,
                                                size: 11,
                                                color: meta['color'] as Color),
                                            const SizedBox(width: 8),
                                            Text(
                                              (meta['label'] as String)
                                                  .toUpperCase(),
                                              style: const TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                  color: AppTheme.notionMuted,
                                                  letterSpacing: 1),
                                            ),
                                          ],
                                        ),
                                      ),
                                    _buildResultItem(item, meta, index),
                                  ],
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultItem(
      SearchItem item, Map<String, dynamic> meta, int index) {
    return InkWell(
      onTap: () => _handleNavigate(item),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                  color: meta['color'] as Color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: const TextStyle(
                        fontSize: 14,
                        color: AppTheme.notionText,
                        fontWeight: FontWeight.w500),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (item.sub != null && item.sub!.isNotEmpty)
                    Text(
                      item.sub!,
                      style: const TextStyle(
                          fontSize: 12, color: AppTheme.notionMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SearchItem {
  final String id;
  final String type;
  final String title;
  final String? sub;
  final List<String> tags;

  SearchItem(
      {required this.id,
      required this.type,
      required this.title,
      this.sub,
      required this.tags});
}
