import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/task_service.dart';
import 'package:second_brain_flutter/services/note_service.dart';
import 'package:second_brain_flutter/services/project_service.dart';
import 'package:second_brain_flutter/services/goal_service.dart';
import 'package:second_brain_flutter/services/resource_service.dart';

class QuickAddModal extends StatefulWidget {
  final String defaultType;
  const QuickAddModal({super.key, this.defaultType = 'task'});

  @override
  State<QuickAddModal> createState() => _QuickAddModalState();
}

class _QuickAddModalState extends State<QuickAddModal> {
  late String _type;
  final _titleController = TextEditingController();
  final _tagsController = TextEditingController();
  String _status = 'Not Started';
  DateTime _dueDate = DateTime.now();
  bool _isSubmitting = false;

  final List<Map<String, dynamic>> _types = [
    {'key': 'task', 'label': 'Task', 'icon': LucideIcons.checkSquare, 'color': Colors.blue},
    {'key': 'note', 'label': 'Note', 'icon': LucideIcons.fileText, 'color': Colors.green},
    {'key': 'project', 'label': 'Project', 'icon': LucideIcons.folderOpen, 'color': Colors.purple},
    {'key': 'goal', 'label': 'Goal', 'icon': LucideIcons.target, 'color': Colors.orange},
    {'key': 'resource', 'label': 'Resource', 'icon': LucideIcons.bookOpen, 'color': Colors.teal},
  ];

  @override
  void initState() {
    super.initState();
    _type = widget.defaultType;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _tagsController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;

    setState(() => _isSubmitting = true);

    final tags = _tagsController.text.split(',').map((t) => t.trim()).where((t) => t.isNotEmpty).toList();
    final data = {
      'title': title,
      'status': _status,
      'tags': tags,
      'dueDate': DateFormat('yyyy-MM-dd').format(_dueDate),
    };

    bool success = false;
    if (_type == 'task') {
      success = await TaskService.createTask({...data, 'completed': false, 'priority': 'Medium'});
    } else if (_type == 'note') {
      success = await NoteService.createNote({...data, 'content': []});
    } else if (_type == 'project') {
      success = await ProjectService.createProject({...data, 'progress': 0});
    } else if (_type == 'goal') {
      success = await GoalService.createGoal({...data, 'progress': 0});
    } else if (_type == 'resource') {
      success = await ResourceService.createResource({...data, 'type': 'Link'});
    }

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (success) {
        Navigator.pop(context, true); // Return true to indicate success
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to create item. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        padding: const EdgeInsets.all(20),
        constraints: const BoxConstraints(maxWidth: 400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Quick Add',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: -0.5),
            ),
            const SizedBox(height: 16),
            
            // Type Selector
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppTheme.notionSidebar,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: _types.map((t) {
                  final isSelected = _type == t['key'];
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _type = t['key'] as String),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(6),
                          boxShadow: isSelected ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 2, offset: const Offset(0, 1))] : null,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(t['icon'] as IconData, size: 11, color: isSelected ? t['color'] as Color : AppTheme.notionMuted),
                            const SizedBox(width: 4),
                            Text(
                              t['label'] as String,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                color: isSelected ? AppTheme.notionText : AppTheme.notionMuted,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Title Input
            TextField(
              controller: _titleController,
              autofocus: true,
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                hintText: '${_type[0].toUpperCase()}${_type.substring(1)} title...',
                hintStyle: const TextStyle(color: AppTheme.notionMuted),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppTheme.notionBorder)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppTheme.notionBorder)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppTheme.notionAccent)),
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Status & Date
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Status', style: TextStyle(fontSize: 11, color: AppTheme.notionMuted)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        decoration: BoxDecoration(
                          border: Border.all(color: AppTheme.notionBorder),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _status,
                            isExpanded: true,
                            icon: const Icon(LucideIcons.chevronDown, size: 14),
                            style: const TextStyle(fontSize: 12, color: AppTheme.notionText),
                            onChanged: (String? newValue) {
                              if (newValue != null) setState(() => _status = newValue);
                            },
                            items: <String>['Not Started', 'In Progress', 'Done', 'On Hold', 'Blocked']
                                .map<DropdownMenuItem<String>>((String value) {
                              return DropdownMenuItem<String>(
                                value: value,
                                child: Text(value),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Due Date', style: TextStyle(fontSize: 11, color: AppTheme.notionMuted)),
                      const SizedBox(height: 4),
                      InkWell(
                        onTap: () async {
                          final DateTime? picked = await showDatePicker(
                            context: context,
                            initialDate: _dueDate,
                            firstDate: DateTime(2000),
                            lastDate: DateTime(2101),
                          );
                          if (picked != null && picked != _dueDate) {
                            setState(() => _dueDate = picked);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            border: Border.all(color: AppTheme.notionBorder),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Text(DateFormat('MMM dd, yyyy').format(_dueDate), style: const TextStyle(fontSize: 12)),
                              const Spacer(),
                              const Icon(LucideIcons.calendar, size: 14, color: AppTheme.notionMuted),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Tags
            const Text('Tags (comma separated)', style: TextStyle(fontSize: 11, color: AppTheme.notionMuted)),
            const SizedBox(height: 4),
            TextField(
              controller: _tagsController,
              style: const TextStyle(fontSize: 12),
              decoration: InputDecoration(
                hintText: 'productivity, work, personal',
                hintStyle: const TextStyle(color: AppTheme.notionMuted),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppTheme.notionBorder)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppTheme.notionBorder)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppTheme.notionAccent)),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: AppTheme.notionBorder),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Cancel', style: TextStyle(fontSize: 13, color: AppTheme.notionText)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.notionText,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                    child: _isSubmitting
                        ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Create', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
