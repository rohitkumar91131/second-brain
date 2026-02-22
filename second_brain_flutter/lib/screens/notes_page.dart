import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/note_service.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:second_brain_flutter/widgets/custom_button.dart';
import 'package:second_brain_flutter/widgets/quick_add_modal.dart';
import 'package:second_brain_flutter/screens/note_details_page.dart';

class NotesPage extends StatefulWidget {
  final bool isEmbedded;
  final ValueNotifier<int>? refreshSignal;
  const NotesPage({super.key, this.isEmbedded = false, this.refreshSignal});

  @override
  State<NotesPage> createState() => _NotesPageState();
}

class _NotesPageState extends State<NotesPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<dynamic> _notes = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _view = 'board'; // 'board' (grid), 'list', 'table'

  @override
  void initState() {
    super.initState();
    _loadNotes();
    widget.refreshSignal?.addListener(_loadNotes);
  }

  @override
  void dispose() {
    widget.refreshSignal?.removeListener(_loadNotes);
    super.dispose();
  }

  Future<void> _loadNotes() async {
    setState(() => _isLoading = true);
    final notes = await NoteService.getNotes();
    if (mounted) {
      setState(() {
        _notes = notes;
        _isLoading = false;
      });
    }
  }

  List<dynamic> get _filteredNotes {
    if (_searchQuery.isEmpty) return _notes;
    final query = _searchQuery.toLowerCase();
    return _notes.where((n) {
      final title = (n['title'] ?? '').toLowerCase();
      final tags = (n['tags'] as List?)
              ?.map((t) => t.toString().toLowerCase())
              .toList() ??
          [];
      // Check content blocks for matches if content is a list
      bool contentMatch = false;
      if (n['content'] is List) {
        contentMatch = (n['content'] as List).any((block) =>
            (block['content'] ?? '').toString().toLowerCase().contains(query));
      } else {
        contentMatch =
            (n['content'] ?? '').toString().toLowerCase().contains(query);
      }

      return title.contains(query) ||
          tags.any((t) => t.contains(query)) ||
          contentMatch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    Widget content = Column(
      children: [
        _buildHeader(context),
        _buildToolbar(),
        Expanded(
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: AppTheme.notionText))
              : _buildCurrentView(),
        ),
      ],
    );

    if (widget.isEmbedded) return content;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.white,
      drawer: Sidebar(
        onNavigate: (path) => Navigator.pushReplacementNamed(context, path),
        currentPath: '/notes',
        onToggle: () => Navigator.pop(context),
      ),
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) =>
                  Navigator.pushReplacementNamed(context, path),
              currentPath: '/notes',
              onToggle: () {},
            ),
          Expanded(child: content),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: const Row(
        children: [
          Icon(LucideIcons.fileText, size: 24, color: Colors.green),
          SizedBox(width: 12),
          Text(
            'Notes',
            style: TextStyle(
                fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: -0.5),
          ),
        ],
      ),
    );
  }

  Widget _buildToolbar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Row(
        children: [
          // View Switcher
          Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: AppTheme.notionHover,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              children: [
                _buildViewIcon(LucideIcons.layoutGrid, 'board'),
                _buildViewIcon(LucideIcons.list, 'list'),
                _buildViewIcon(LucideIcons.table, 'table'),
              ],
            ),
          ),
          const SizedBox(width: 16),
          // Search Bar
          Expanded(
            child: Container(
              height: 32,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppTheme.notionHover,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.search,
                      size: 14, color: AppTheme.notionMuted),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      onChanged: (value) =>
                          setState(() => _searchQuery = value),
                      style: const TextStyle(fontSize: 13),
                      decoration: const InputDecoration(
                        hintText: 'Search notes...',
                        hintStyle: TextStyle(
                            fontSize: 13, color: AppTheme.notionMuted),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          CustomButton(
            onPressed: () async {
              final result = await showDialog(
                context: context,
                builder: (context) => const QuickAddModal(defaultType: 'note'),
              );
              if (result == true) _loadNotes();
            },
            icon: LucideIcons.plus,
            text: 'New Note',
            fontSize: 12,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
        ],
      ),
    );
  }

  Widget _buildViewIcon(IconData icon, String view) {
    bool isSelected = _view == view;
    return InkWell(
      onTap: () => setState(() => _view = view),
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 2,
                      offset: const Offset(0, 1))
                ]
              : null,
        ),
        child: Icon(icon,
            size: 14,
            color: isSelected ? AppTheme.notionText : AppTheme.notionMuted),
      ),
    );
  }

  Widget _buildCurrentView() {
    final notes = _filteredNotes;
    if (notes.isEmpty && !_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.fileText,
                size: 48, color: AppTheme.notionMuted.withOpacity(0.3)),
            const SizedBox(height: 16),
            const Text(
              'No notes found',
              style: TextStyle(
                  color: AppTheme.notionMuted, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      );
    }

    switch (_view) {
      case 'list':
        return _buildNoteListView(notes);
      case 'table':
        return _buildNoteTableView(notes);
      case 'board':
      default:
        return _buildNoteGridView(notes);
    }
  }

  Widget _buildNoteGridView(List<dynamic> notes) {
    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width > 1200
            ? 3
            : (MediaQuery.of(context).size.width > 800 ? 2 : 1),
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        mainAxisExtent: 200,
      ),
      itemCount: notes.length,
      itemBuilder: (context, index) {
        final note = notes[index];
        return _NoteCard(
          id: AppTheme.safeString(note['_id']),
          title: AppTheme.safeString(note['title'] ?? 'Untitled'),
          content: AppTheme.safeString(note['content']),
          updatedAt: AppTheme.safeString(note['updatedAt']),
          tags: (note['tags'] as List?)?.cast<String>(),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => NoteDetailsPage(id: note['_id']),
            ),
          ),
          onDelete: () =>
              NoteService.deleteNote(note['_id']).then((_) => _loadNotes()),
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
      },
    );
  }

  Widget _buildNoteListView(List<dynamic> notes) {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: notes.length,
      itemBuilder: (context, index) {
        final note = notes[index];
        return ListTile(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => NoteDetailsPage(id: note['_id']),
            ),
          ),
          leading:
              const Icon(LucideIcons.fileText, color: AppTheme.notionMuted),
          title: Text(AppTheme.safeString(note['title'] ?? 'Untitled'),
              style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text(DateFormat('MMM d').format(
              DateTime.tryParse(AppTheme.safeString(note['updatedAt'])) ??
                  DateTime.now())),
          trailing: IconButton(
            icon: const Icon(LucideIcons.trash2,
                size: 16, color: Colors.redAccent),
            onPressed: () =>
                NoteService.deleteNote(note['_id']).then((_) => _loadNotes()),
          ),
        ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.05, end: 0);
      },
    );
  }

  Widget _buildNoteTableView(List<dynamic> notes) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTableHeader(),
            ...notes.map((n) => _buildTableRow(n)),
            _buildTableFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppTheme.notionBorder))),
      child: const Row(
        children: [
          _TableCell(text: 'Title', width: 300, isHeader: true),
          _TableCell(text: 'Tags', width: 200, isHeader: true),
          _TableCell(text: 'Updated', width: 150, isHeader: true),
        ],
      ),
    );
  }

  Widget _buildTableRow(dynamic note) {
    final tags = (note['tags'] as List?)?.cast<String>() ?? [];
    return InkWell(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => NoteDetailsPage(id: note['_id']),
        ),
      ),
      child: Container(
        decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: AppTheme.notionBorder))),
        child: Row(
          children: [
            _TableCell(text: note['title'] ?? '', width: 300),
            _TableCell(
              width: 200,
              child: Wrap(
                spacing: 4,
                children: tags
                    .take(2)
                    .map((t) => Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 4, vertical: 2),
                          decoration: BoxDecoration(
                              color: AppTheme.notionHover,
                              borderRadius: BorderRadius.circular(4)),
                          child: Text(t,
                              style: const TextStyle(
                                  fontSize: 10, color: AppTheme.notionMuted)),
                        ))
                    .toList(),
              ),
            ),
            _TableCell(
                text: DateFormat('MMM d, yyyy').format(
                    DateTime.tryParse(note['updatedAt'] ?? '') ?? DateTime.now()),
                width: 150),
          ],
        ),
      ),
    );
  }

  Widget _buildTableFooter() {
    return InkWell(
      onTap: () {},
      child: const Padding(
        padding: EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        child: Row(
          children: [
            Icon(LucideIcons.plus, size: 14, color: AppTheme.notionMuted),
            SizedBox(width: 8),
            Text('New Note',
                style: TextStyle(fontSize: 13, color: AppTheme.notionMuted)),
          ],
        ),
      ),
    );
  }
}

class _NoteCard extends StatelessWidget {
  final String id;
  final String title;
  final dynamic content;
  final String? updatedAt;
  final List<String>? tags;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _NoteCard({
    required this.id,
    required this.title,
    this.content,
    this.updatedAt,
    this.tags,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    String preview = '';
    if (content is List) {
      final pBlock = (content as List).firstWhere(
          (b) =>
              b['type'] == 'paragraph' && (b['content']?.isNotEmpty ?? false),
          orElse: () => null);
      if (pBlock != null) {
        preview = pBlock['content'] ?? '';
      }
    } else if (content is String) {
      preview = content;
    }

    String dateStr = 'Recently';
    if (updatedAt != null) {
      final date = DateTime.tryParse(updatedAt!);
      if (date != null) {
        dateStr = DateFormat('MMM d').format(date);
      }
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.notionBorder),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 4,
              offset: const Offset(0, 1))
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.notionText,
                          letterSpacing: -0.3),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.trash2,
                        size: 12, color: Colors.redAccent),
                    onPressed: onDelete,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (preview.isNotEmpty)
                Expanded(
                  child: Text(
                    preview,
                    style: const TextStyle(
                        fontSize: 12, color: AppTheme.notionMuted, height: 1.5),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                )
              else
                const Spacer(),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Wrap(
                      spacing: 4,
                      children: (tags ?? [])
                          .take(2)
                          .map((t) => Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                    color: AppTheme.notionHover,
                                    borderRadius: BorderRadius.circular(4)),
                                child: Text(t,
                                    style: const TextStyle(
                                        fontSize: 9,
                                        color: AppTheme.notionMuted,
                                        fontWeight: FontWeight.w500)),
                              ))
                          .toList(),
                    ),
                  ),
                  Text(dateStr,
                      style: const TextStyle(
                          fontSize: 10, color: AppTheme.notionMuted)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TableCell extends StatelessWidget {
  final String? text;
  final Widget? child;
  final double width;
  final bool isHeader;

  const _TableCell(
      {this.text, this.child, required this.width, this.isHeader = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(
          border: Border(right: BorderSide(color: AppTheme.notionBorder))),
      alignment: Alignment.centerLeft,
      child: child ??
          Text(
            text ?? '',
            style: TextStyle(
              fontSize: 13,
              fontWeight: isHeader ? FontWeight.w600 : FontWeight.normal,
              color: isHeader ? AppTheme.notionMuted : AppTheme.notionText,
            ),
            overflow: TextOverflow.ellipsis,
          ),
    );
  }
}
