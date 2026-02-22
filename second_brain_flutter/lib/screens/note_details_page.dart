import 'dart:async';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/note_service.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';

class NoteDetailsPage extends StatefulWidget {
  final String id;
  const NoteDetailsPage({super.key, required this.id});

  @override
  State<NoteDetailsPage> createState() => _NoteDetailsPageState();
}

class _NoteDetailsPageState extends State<NoteDetailsPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  Map<String, dynamic>? _note;
  bool _isLoading = true;
  bool _isSaving = false;
  Timer? _saveTimer;
  final TextEditingController _titleController = TextEditingController();
  final List<TextEditingController> _contentControllers = [];
  final List<LayerLink> _layerLinks = [];
  OverlayEntry? _overlayEntry;
  int _activeBlockIndex = -1;

  @override
  void initState() {
    super.initState();
    _loadNote();
  }

  @override
  void dispose() {
    _hideSlashMenu();
    _saveTimer?.cancel();
    _titleController.dispose();
    for (var controller in _contentControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _loadNote() async {
    setState(() => _isLoading = true);
    final note = await NoteService.getNote(widget.id);
    if (mounted) {
      setState(() {
        _note = note;
        _isLoading = false;
        if (note != null) {
          _titleController.text = note['title'] ?? '';
          
          _contentControllers.clear();
          _layerLinks.clear();
          var content = note['content'];
          
          // Ensure at least one paragraph block if empty
          if (content is! List || content.isEmpty) {
            content = [{'type': 'paragraph', 'content': ''}];
            _note!['content'] = content;
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
    _saveTimer = Timer(const Duration(milliseconds: 1500), _saveNote);
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
                      _buildMenuItem(LucideIcons.link, 'Link', 'link', index),
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
      
      final content = _note!['content'] as List;
      content[index]['type'] = newType;
      content[index]['content'] = text;
      
      _hideSlashMenu();
      _saveNote();
    });
  }

  void _createNewBlock(int afterIndex) {
    setState(() {
      final newBlock = {'type': 'paragraph', 'content': ''};
      final content = _note!['content'] as List;
      content.insert(afterIndex + 1, newBlock);
      
      _contentControllers.insert(afterIndex + 1, TextEditingController());
      _layerLinks.insert(afterIndex + 1, LayerLink());
      
      _saveNote();
    });
  }

  Future<void> _saveNote() async {
    if (_note == null || _isSaving) return;
    
    // Check if title changed
    final titleChanged = _note!['title'] != _titleController.text;
    
    setState(() => _isSaving = true);

    final List<dynamic> updatedContent = [];
    final originalContent = _note!['content'];

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
      'title': _titleController.text,
      'content': updatedContent,
    };

    final success = await NoteService.updateNote(widget.id, updates);
    
    if (mounted) {
      setState(() {
        _isSaving = false;
        if (success) {
          _note!['title'] = updates['title'];
          _note!['content'] = updates['content'];
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

    if (_note == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: const Center(child: Text('Note not found')),
      );
    }


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
            const Icon(LucideIcons.fileText, size: 14, color: AppTheme.notionMuted),
            const SizedBox(width: 8),
            Text(
              'Notes / ${AppTheme.safeString(_note!['title'])}',
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
            icon: const Icon(LucideIcons.share2, size: 18, color: AppTheme.notionMuted),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(LucideIcons.moreHorizontal, size: 18, color: AppTheme.notionMuted),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon Placeholder
            const Text('📄', style: TextStyle(fontSize: 48)),
            const SizedBox(height: 24),
            
            // Title (Web-style 5XL)
            TextField(
              controller: _titleController,
              onChanged: (_) {
                _saveTimer?.cancel();
                _saveTimer = Timer(const Duration(milliseconds: 1500), _saveNote);
              },
              style: const TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w800,
                letterSpacing: -1.5,
                color: AppTheme.notionText,
                height: 1.1,
              ),
              maxLines: null,
              decoration: const InputDecoration(
                hintText: 'Untitled',
                hintStyle: TextStyle(color: AppTheme.notionBorder),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 8),
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Metadata section (Web-style Badge + Tags)
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.notionText.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'NOTE',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.notionText,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(child: _buildTags(_note!['tags'])),
              ],
            ),
            
            const SizedBox(height: 16),
            _buildMetadataRow(LucideIcons.clock, 'Created', 
              DateFormat('MMMM d, yyyy').format(DateTime.tryParse(_note!['createdAt'] ?? '') ?? DateTime.now())),
            
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Divider(color: AppTheme.notionBorder, height: 1),
            ),
            
            // Content blocks
            _buildContent(_note!['content']),
            
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildMetadataRow(IconData icon, String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Row(
              children: [
                Icon(icon, size: 14, color: AppTheme.notionMuted),
                const SizedBox(width: 8),
                Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.notionMuted)),
              ],
            ),
          ),
          Expanded(
            child: value is Widget ? value : Text(
              value.toString(),
              style: const TextStyle(fontSize: 13, color: AppTheme.notionText, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTags(dynamic tags) {
    final tagList = (tags as List?)?.cast<String>() ?? [];
    if (tagList.isEmpty) return const Text('Empty', style: TextStyle(fontSize: 13, color: AppTheme.notionBorder));
    
    return Wrap(
      spacing: 6,
      children: tagList.map((tag) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: AppTheme.notionHover,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(tag, style: const TextStyle(fontSize: 12, color: AppTheme.notionText)),
        );
      }).toList(),
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
            case 'link':
              field = Row(
                children: [
                  const Icon(LucideIcons.link, size: 16, color: Colors.blue),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: controller,
                      onChanged: (_) => _onContentChanged(index),
                      onSubmitted: (_) => _createNewBlock(index),
                      style: const TextStyle(fontSize: 16, color: Colors.blue, decoration: TextDecoration.underline),
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
    
    // Fallback for string content
    return Text(
      content.toString(),
      style: const TextStyle(fontSize: 16, height: 1.5, color: AppTheme.notionText),
    );
  }
}
