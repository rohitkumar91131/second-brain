import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/journal_service.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:second_brain_flutter/widgets/custom_button.dart';
import 'package:second_brain_flutter/screens/journal_details_page.dart';

class JournalPage extends StatefulWidget {
  final bool isEmbedded;
  final ValueNotifier<int>? refreshSignal;
  const JournalPage({super.key, this.isEmbedded = false, this.refreshSignal});

  @override
  State<JournalPage> createState() => _JournalPageState();
}

class _JournalPageState extends State<JournalPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<dynamic> _entries = [];
  bool _isLoading = true;
  String _selectedMood = 'Good';

  final List<String> _moods = ['Amazing', 'Good', 'Okay', 'Tough', 'Bad'];
  final Map<String, String> _moodEmojis = {
    'Amazing': '🌟',
    'Good': '😊',
    'Okay': '😐',
    'Tough': '😔',
    'Bad': '😢',
  };

  @override
  void initState() {
    super.initState();
    _loadJournalData();
    widget.refreshSignal?.addListener(_loadJournalData);
  }

  @override
  void dispose() {
    widget.refreshSignal?.removeListener(_loadJournalData);
    super.dispose();
  }

  Future<void> _loadJournalData() async {
    setState(() => _isLoading = true);
    final entries = await JournalService.getJournalEntries();
    if (mounted) {
      setState(() {
        _entries = entries;
        _isLoading = false;
      });
    }
  }

  Future<void> _addEntry() async {
    final now = DateTime.now();
    final todayStr = DateFormat('yyyy-MM-dd').format(now);
    
    // Improved search for today's entry
    final existing = _entries.firstWhere((e) {
      final dateStr = e['date']?.toString();
      if (dateStr == null) return false;
      
      try {
        final d = DateTime.parse(dateStr);
        return d.year == now.year && d.month == now.month && d.day == now.day;
      } catch (_) {
        return dateStr.contains(todayStr);
      }
    }, orElse: () => null);
    
    if (existing != null) {
      final id = existing['_id'] ?? existing['id'];
      if (mounted) {
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => JournalDetailsPage(id: id)),
        );
        _loadJournalData();
      }
      return;
    }

    final newEntry = {
      'title': 'Journal - ${DateFormat('MMMM d, yyyy').format(now)}',
      'date': todayStr,
      'mood': _selectedMood,
      'content': [
        {'type': 'heading_2', 'content': 'Morning Reflection'},
        {'type': 'paragraph', 'content': ''},
        {'type': 'heading_2', 'content': 'Gratitude'},
        {'type': 'bulleted_list_item', 'content': ''},
      ],
    };

    final created = await JournalService.addJournalEntry(newEntry);
    if (created != null && mounted) {
      final id = created['_id'] ?? created['id'];
      await Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => JournalDetailsPage(id: id)),
      );
      _loadJournalData();
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget content = Column(
      children: [
        _buildToolbar(),
        Expanded(
          child: Container(
            color: const Color(0xFFFCFAF7),
            child: _isLoading
                ? const Center(
                    child:
                        CircularProgressIndicator(color: AppTheme.notionText))
                : _buildJournalList(),
          ),
        ),
      ],
    );

    if (widget.isEmbedded) return content;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.white,
      drawer: Sidebar(
        onNavigate: (path) => Navigator.pushReplacementNamed(context, path),
        currentPath: '/journal',
        onToggle: () => Navigator.pop(context),
      ),
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) =>
                  Navigator.pushReplacementNamed(context, path),
              currentPath: '/journal',
              onToggle: () {},
            ),
          Expanded(child: content),
        ],
      ),
    );
  }

  Widget _buildToolbar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Personal Diary',
                style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.notionText,
                    letterSpacing: -0.5),
              ),
              const SizedBox(height: 2),
              Text(
                'CHRONOLOGICAL ARCHIVE',
                style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.notionMuted.withOpacity(0.6),
                    letterSpacing: 1.5),
              ),
            ],
          ),
          const Spacer(),
          // Mood Selector
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppTheme.notionHover.withOpacity(0.5),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Row(
              children: _moods.map((mood) {
                bool isSelected = _selectedMood == mood;
                return InkWell(
                  onTap: () => setState(() => _selectedMood = mood),
                  child: Container(
                    width: 32,
                    height: 32,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.white : Colors.transparent,
                      shape: BoxShape.circle,
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2))
                            ]
                          : null,
                    ),
                    child: Text(_moodEmojis[mood] ?? '',
                        style: const TextStyle(fontSize: 16)),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(width: 16),
          CustomButton(
            onPressed: _addEntry,
            icon: LucideIcons.plus,
            text: 'Write Today',
            fontSize: 12,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildJournalList() {
    if (_entries.isEmpty) {
      return Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 60),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.8),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.notionBorder.withOpacity(0.5)),
          ),
          child: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.bookMarked,
                  size: 48, color: AppTheme.notionMuted),
              SizedBox(height: 16),
              Text(
                'Your diary is empty. Start your first entry today.',
                style: TextStyle(
                    color: AppTheme.notionMuted,
                    fontStyle: FontStyle.italic,
                    fontSize: 13),
              ),
            ],
          ),
        ),
      );
    }

    final sortedEntries = List.from(_entries)
      ..sort((a, b) {
        final dateA = DateTime.tryParse(a['date'] ?? '') ?? DateTime(1970);
        final dateB = DateTime.tryParse(b['date'] ?? '') ?? DateTime(1970);
        return dateB.compareTo(dateA);
      });

    return ListView.builder(
      padding: const EdgeInsets.all(32),
      itemCount: sortedEntries.length,
      itemBuilder: (context, index) {
        final entry = sortedEntries[index];
        return _JournalEntryItem(
          id: entry['_id'] ?? entry['id'] ?? '',
          content: entry['content'],
          date: entry['date'],
          mood: entry['mood'],
          moodEmoji: _moodEmojis[entry['mood']] ?? '📝',
          onDelete: () =>
              JournalService.deleteJournalEntry(entry['_id'] ?? entry['id'])
                  .then((_) => _loadJournalData()),
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
      },
    );
  }

  String _getDateLabel(String? dateStr) {
    if (dateStr == null) return 'Unknown Date';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return dateStr;

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final entryDate = DateTime(date.year, date.month, date.day);

    if (entryDate == today) return 'Today';
    if (entryDate == yesterday) return 'Yesterday';
    return DateFormat('EEEE, MMMM d, yyyy').format(date);
  }
}

class _JournalEntryItem extends StatelessWidget {
  final String id;
  final dynamic content;
  final String? date;
  final String? mood;
  final String moodEmoji;
  final VoidCallback onDelete;

  const _JournalEntryItem({
    required this.id,
    this.content,
    this.date,
    this.mood,
    required this.moodEmoji,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    String preview = 'Dear Diary... content awaited.';
    if (content is List) {
      final pBlock = (content as List).firstWhere(
          (b) =>
              b['type'] == 'paragraph' && (b['content']?.isNotEmpty ?? false),
          orElse: () => null);
      if (pBlock != null) {
        preview = AppTheme.safeString(pBlock['content']);
      }
    }
    // Handle plain text if content is just a string (fallback)
    else if (content is String && content.isNotEmpty) {
      preview = content;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Stack effect (bottom layer)
          Positioned(
            bottom: -4,
            right: -4,
            left: 4,
            child: Container(
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F1EF),
                borderRadius: BorderRadius.circular(4),
                border:
                    Border.all(color: AppTheme.notionBorder.withOpacity(0.5)),
              ),
            ),
          ),
          // Main card
          InkWell(
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => JournalDetailsPage(id: id)),
              );
              // Trigger reload when coming back if necessary, 
              // though currently JournalPage reloads via refreshSignal or manual state management
            },
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
                border:
                    Border.all(color: AppTheme.notionBorder.withOpacity(0.5)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFCFAF7),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFF1F1EF)),
                        ),
                        child: Text(moodEmoji,
                            style: const TextStyle(fontSize: 24)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _getDateLabel(date),
                              style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.notionText),
                            ),
                            Text(
                              (mood ?? 'Unknown').toUpperCase(),
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.notionMuted.withOpacity(0.6),
                                  letterSpacing: 1.5),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.trash2,
                            size: 14, color: Colors.redAccent),
                        onPressed: onDelete,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Content Preview with timeline line
                  IntrinsicHeight(
                    child: Row(
                      children: [
                        const SizedBox(width: 24),
                        Container(width: 1, color: const Color(0xFFF1F1EF)),
                        const SizedBox(width: 24),
                        Expanded(
                          child: Text(
                            preview,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF787774),
                              height: 1.6,
                              fontStyle: FontStyle.italic,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      'Read Entry →',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFD3D1CB),
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getDateLabel(String? dateStr) {
    if (dateStr == null) return 'Unknown Date';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return dateStr;

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final entryDate = DateTime(date.year, date.month, date.day);

    if (entryDate == today) return 'Today';
    if (entryDate == yesterday) return 'Yesterday';
    return DateFormat('EEEE, MMMM d').format(date);
  }
}
