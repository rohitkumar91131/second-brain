import 'dart:async';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/journal_service.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';

class JournalDetailsPage extends StatefulWidget {
  final String id;
  const JournalDetailsPage({super.key, required this.id});

  @override
  State<JournalDetailsPage> createState() => _JournalDetailsPageState();
}

class _JournalDetailsPageState extends State<JournalDetailsPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  Map<String, dynamic>? _entry;
  bool _isLoading = true;
  bool _isSaving = false;
  Timer? _saveTimer;
  
  final List<TextEditingController> _contentControllers = [];
  final List<LayerLink> _layerLinks = [];
  OverlayEntry? _overlayEntry;
  int _activeBlockIndex = -1;

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
    _loadEntry();
  }

  @override
  void dispose() {
    _hideSlashMenu();
    _saveTimer?.cancel();
    for (var controller in _contentControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _loadEntry() async {
    setState(() => _isLoading = true);
    final entry = await JournalService.getJournalEntry(widget.id);
    if (mounted) {
      setState(() {
        _entry = entry;
        _isLoading = false;
        if (entry != null) {
          _contentControllers.clear();
          _layerLinks.clear();
          var content = entry['content'];
          
          if (content is! List || content.isEmpty) {
            content = [{'type': 'paragraph', 'content': ''}];
            _entry!['content'] = content;
          }

          if (content is List) {
            for (var block in content) {
              _contentControllers.add(TextEditingController(text: block['content'] ?? ''));
              _layerLinks.add(LayerLink());
            }
          }
        }
      });
    }
  }

  void _onContentChanged(int index) {
    _activeBlockIndex = index;
    final text = _contentControllers[index].text;
    
    if (text.endsWith('/')) {
      _showSlashMenu(index);
    } else {
      _hideSlashMenu();
    }
    
    _saveTimer?.cancel();
    _saveTimer = Timer(const Duration(milliseconds: 1500), _saveEntry);
  }

  void _showSlashMenu(int index) {
    _hideSlashMenu();
    
    _overlayEntry = OverlayEntry(
      builder: (context) => Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onTap: _hideSlashMenu,
              behavior: HitTestBehavior.translucent,
              child: Container(),
            ),
          ),
          Positioned(
            width: 200,
            child: CompositedTransformFollower(
              link: _layerLinks[index],
              showWhenUnlinked: false,
              offset: const Offset(0, 30),
              child: Material(
                elevation: 8,
                borderRadius: BorderRadius.circular(8),
                color: Colors.white,
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.notionBorder),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildMenuItem(LucideIcons.text, 'Text', 'paragraph', index),
                      _buildMenuItem(LucideIcons.heading1, 'Heading 1', 'heading_1', index),
                      _buildMenuItem(LucideIcons.heading2, 'Heading 2', 'heading_2', index),
                      _buildMenuItem(LucideIcons.list, 'Bullet List', 'bulleted_list_item', index),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
  }

  void _hideSlashMenu() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  Widget _buildMenuItem(IconData icon, String label, String type, int index) {
    return InkWell(
      onTap: () => _changeBlockType(index, type),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children: [
            Icon(icon, size: 16, color: AppTheme.notionMuted),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.notionText)),
          ],
        ),
      ),
    );
  }

  void _changeBlockType(int index, String newType) {
    setState(() {
      final controller = _contentControllers[index];
      String text = controller.text;
      if (text.endsWith('/')) {
        text = text.substring(0, text.length - 1);
        controller.text = text;
      }
      
      final content = _entry!['content'] as List;
      content[index]['type'] = newType;
      content[index]['content'] = text;
      
      _hideSlashMenu();
      _saveEntry();
    });
  }

  void _createNewBlock(int afterIndex) {
    setState(() {
      final newBlock = {'type': 'paragraph', 'content': ''};
      final content = _entry!['content'] as List;
      content.insert(afterIndex + 1, newBlock);
      
      _contentControllers.insert(afterIndex + 1, TextEditingController());
      _layerLinks.insert(afterIndex + 1, LayerLink());
      
      _saveEntry();
    });
  }

  Future<void> _saveEntry() async {
    if (_entry == null || _isSaving) return;
    
    setState(() => _isSaving = true);

    final List<dynamic> updatedContent = [];
    final originalContent = _entry!['content'];

    if (originalContent is List) {
      for (int i = 0; i < originalContent.length; i++) {
        final block = Map<String, dynamic>.from(originalContent[i]);
        if (i < _contentControllers.length) {
          block['content'] = _contentControllers[i].text;
        }
        updatedContent.add(block);
      }
    }

    final updates = {
      'mood': _entry!['mood'],
      'content': updatedContent,
    };

    final success = await JournalService.updateJournalEntry(widget.id, updates);
    
    if (mounted) {
      setState(() {
        _isSaving = false;
        if (success) {
          _entry!['content'] = updates['content'];
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator(color: AppTheme.notionText)),
      );
    }

    if (_entry == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: const Center(child: Text('Entry not found')),
      );
    }

    final date = DateTime.tryParse(_entry!['date'] ?? '') ?? DateTime.now();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft, color: AppTheme.notionText, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            const Icon(LucideIcons.book, size: 14, color: AppTheme.notionMuted),
            const SizedBox(width: 8),
            Text(
              'Journal / ${DateFormat('MMM d, yyyy').format(date)}',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppTheme.notionText,
              ),
            ),
          ],
        ),
        actions: [
          Center(
            child: Text(
              _isSaving ? 'SAVING...' : 'SAVED',
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: _isSaving ? AppTheme.notionAccent : AppTheme.notionMuted,
                  letterSpacing: 0.5),
            ),
          ),
          const SizedBox(width: 16),
          IconButton(
            icon: const Icon(LucideIcons.trash2, size: 18, color: Colors.redAccent),
            onPressed: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Delete Entry?'),
                  content: const Text('Are you sure you want to delete this journal entry?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                    TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
                  ],
                ),
              );
              if (confirmed == true) {
                await JournalService.deleteJournalEntry(widget.id);
                if (mounted) Navigator.pop(context);
              }
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date Header
            Text(
              DateFormat('EEEE, MMMM d, yyyy').format(date),
              style: const TextStyle(
                fontSize: 40,
                fontWeight: FontWeight.w800,
                letterSpacing: -1.0,
                color: AppTheme.notionText,
              ),
            ),
            const SizedBox(height: 16),
            
            // Mood Selector in Metadata
            Row(
              children: [
                const Icon(LucideIcons.smile, size: 16, color: AppTheme.notionMuted),
                const SizedBox(width: 8),
                const Text('Feeling', style: TextStyle(fontSize: 14, color: AppTheme.notionMuted)),
                const SizedBox(width: 12),
                _buildMoodBadge(),
              ],
            ),
            
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Divider(color: AppTheme.notionBorder, height: 1),
            ),
            
            // Content blocks
            _buildContent(_entry!['content']),
            
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildMoodBadge() {
    final currentMood = _entry!['mood'] ?? 'Good';
    return InkWell(
      onTap: () {
        showModalBottomSheet(
          context: context,
          backgroundColor: Colors.white,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
          builder: (context) => Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('How are you feeling?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: _moodEmojis.keys.map((mood) {
                    final isSelected = currentMood == mood;
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _entry!['mood'] = mood;
                        });
                        _saveEntry();
                        Navigator.pop(context);
                      },
                      child: Column(
                        children: [
                          Opacity(
                            opacity: isSelected ? 1.0 : 0.4,
                            child: Text(_moodEmojis[mood]!, style: const TextStyle(fontSize: 32)),
                          ),
                          const SizedBox(height: 8),
                          Text(mood, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                        ],
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppTheme.notionHover,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_moodEmojis[currentMood] ?? '✨', style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 6),
            Text(currentMood, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.notionText)),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(dynamic content) {
    if (content == null) return const SizedBox();
    
    if (content is List) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(content.length, (index) {
          if (index >= _contentControllers.length) return const SizedBox();
          
          final block = content[index];
          final type = block['type'] ?? 'paragraph';
          final controller = _contentControllers[index];
          final link = _layerLinks[index];
          
          Widget field;
          switch (type) {
            case 'heading_1':
              field = TextField(
                controller: controller,
                onChanged: (_) => _onContentChanged(index),
                onSubmitted: (_) => _createNewBlock(index),
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.notionText),
                decoration: const InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 8)),
                maxLines: null,
              );
              break;
            case 'heading_2':
              field = TextField(
                controller: controller,
                onChanged: (_) => _onContentChanged(index),
                onSubmitted: (_) => _createNewBlock(index),
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.notionText),
                decoration: const InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 6)),
                maxLines: null,
              );
              break;
            case 'bulleted_list_item':
              field = Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(top: 8, right: 8),
                    child: Text('•', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                  Expanded(
                    child: TextField(
                      controller: controller,
                      onChanged: (_) => _onContentChanged(index),
                      onSubmitted: (_) => _createNewBlock(index),
                      style: const TextStyle(fontSize: 16, height: 1.5, color: AppTheme.notionText),
                      decoration: const InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 4)),
                      maxLines: null,
                    ),
                  ),
                ],
              );
              break;
            case 'paragraph':
            default:
              field = TextField(
                controller: controller,
                onChanged: (_) => _onContentChanged(index),
                onSubmitted: (_) => _createNewBlock(index),
                style: const TextStyle(fontSize: 16, height: 1.5, color: AppTheme.notionText),
                decoration: const InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 4)),
                maxLines: null,
              );
              break;
          }

          return CompositedTransformTarget(
            link: link,
            child: field,
          );
        }),
      );
    }
    
    return Text(content.toString(), style: const TextStyle(fontSize: 16, height: 1.5));
  }
}
