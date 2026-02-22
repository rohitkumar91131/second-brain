import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/task_service.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';
import 'package:second_brain_flutter/widgets/quick_add_modal.dart';
import 'package:second_brain_flutter/widgets/custom_button.dart';

class TasksPage extends StatefulWidget {
  final bool isEmbedded;
  final ValueNotifier<int>? refreshSignal;
  const TasksPage({super.key, this.isEmbedded = false, this.refreshSignal});

  @override
  State<TasksPage> createState() => _TasksPageState();
}

class _TasksPageState extends State<TasksPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<dynamic> _tasks = [];
  bool _isLoading = true;
  String _filter = 'all'; // 'all', 'active', 'completed'
  String _view = 'list'; // 'list', 'board', 'table', 'calendar'

  @override
  void initState() {
    super.initState();
    _loadTasks();
    widget.refreshSignal?.addListener(_loadTasks);
  }

  @override
  void dispose() {
    widget.refreshSignal?.removeListener(_loadTasks);
    super.dispose();
  }

  Future<void> _loadTasks() async {
    setState(() => _isLoading = true);
    final tasks = await TaskService.getTasks();
    if (mounted) {
      setState(() {
        _tasks = tasks;
        _isLoading = false;
      });
    }
  }

  List<dynamic> get _filteredTasks {
    if (_filter == 'active')
      return _tasks.where((t) => t['completed'] != true).toList();
    if (_filter == 'completed')
      return _tasks.where((t) => t['completed'] == true).toList();
    return _tasks;
  }

  @override
  Widget build(BuildContext context) {
    Widget content = Column(
      children: [
        _buildHeader(context),
        _buildToolbar(),
        _buildStats(),
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
        currentPath: '/tasks',
        onToggle: () => Navigator.pop(context),
      ),
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) =>
                  Navigator.pushReplacementNamed(context, path),
              currentPath: '/tasks',
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
          Icon(LucideIcons.checkSquare, size: 24, color: Colors.blue),
          SizedBox(width: 12),
          Text(
            'Tasks',
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
          // View Switcher (Web Parity)
          Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: const Color(0xFFF7F7F5),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppTheme.notionBorder),
            ),
            child: Row(
              children: [
                _buildViewTab(LucideIcons.list, 'List', 'list'),
                _buildViewTab(LucideIcons.layoutGrid, 'Board', 'board'),
                _buildViewTab(LucideIcons.table, 'Table', 'table'),
                _buildViewTab(LucideIcons.calendar, 'Calendar', 'calendar'),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Filter tabs
          _buildFilterTab('all', 'All'),
          _buildFilterTab('active', 'Active'),
          _buildFilterTab('completed', 'Completed'),
          const Spacer(),
          CustomButton(
            onPressed: () async {
              final result = await showDialog(
                context: context,
                builder: (context) => const QuickAddModal(defaultType: 'task'),
              );
              if (result == true) _loadTasks();
            },
            icon: LucideIcons.plus,
            text: 'New Task',
            fontSize: 12,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
        ],
      ),
    );
  }

  Widget _buildViewTab(IconData icon, String label, String view) {
    bool isSelected = _view == view;
    return InkWell(
      onTap: () => setState(() => _view = view),
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 13,
                color: isSelected ? AppTheme.notionText : AppTheme.notionMuted),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? AppTheme.notionText : AppTheme.notionMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterTab(String filter, String label) {
    bool isSelected = _filter == filter;
    return InkWell(
      onTap: () => setState(() => _filter = filter),
      borderRadius: BorderRadius.circular(4),
      child: Container(
        margin: const EdgeInsets.only(right: 4),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.notionText : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : AppTheme.notionMuted,
          ),
        ),
      ),
    );
  }

  Widget _buildStats() {
    int active = _tasks.where((t) => t['completed'] != true).length;
    int completed = _tasks.where((t) => t['completed'] == true).length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Row(
        children: [
          _buildStatItem('$active active'),
          _buildStatItem('$completed completed'),
          _buildStatItem('${_tasks.length} total'),
        ],
      ),
    );
  }

  Widget _buildStatItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(right: 16),
      child: Text(
        text,
        style: const TextStyle(
            fontSize: 11,
            color: AppTheme.notionMuted,
            fontWeight: FontWeight.w500),
      ),
    );
  }

  Widget _buildCurrentView() {
    final tasks = _filteredTasks;

    if (tasks.isEmpty && !_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.clipboardList,
                size: 48, color: AppTheme.notionMuted.withOpacity(0.3)),
            const SizedBox(height: 16),
            const Text(
              'No tasks found',
              style: TextStyle(
                  color: AppTheme.notionMuted, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      );
    }

    switch (_view) {
      case 'board':
        return _buildBoardView(tasks);
      case 'table':
        return _buildTableView(tasks);
      case 'calendar':
        return _buildCalendarView(tasks);
      case 'list':
      default:
        return _buildTaskList(tasks);
    }
  }

  Widget _buildTaskList(List<dynamic> tasks) {
    return ListView.builder(
      padding: EdgeInsets.zero,
      itemCount: tasks.length + 1,
      itemBuilder: (context, index) {
        if (index == tasks.length) {
          return _buildNewItemButton(() async {
            final result = await showDialog(
              context: context,
              builder: (context) => const QuickAddModal(defaultType: 'task'),
            );
            if (result == true) _loadTasks();
          });
        }
        final task = tasks[index];
        return Column(
          children: [
            _TaskListItem(
              id: AppTheme.safeString(task['_id']),
              title: AppTheme.safeString(task['title'] ?? 'Untitled'),
              isDone: task['completed'] ?? false,
              status: AppTheme.safeString(task['status']),
              priority: AppTheme.safeString(task['priority']),
              dueDate: AppTheme.safeString(task['dueDate']),
              onToggle: (id, completed) async {
                // Optimistic Update
                setState(() {
                  final taskIdx = _tasks.indexWhere((t) => t['_id'] == id);
                  if (taskIdx != -1) {
                    _tasks[taskIdx]['completed'] = completed;
                    _tasks[taskIdx]['status'] =
                        completed ? 'Done' : 'Not Started';
                  }
                });

                final success = await TaskService.updateTask(id, {
                  'completed': completed,
                  'status': completed ? 'Done' : 'Not Started',
                });
                if (!success) {
                  _loadTasks(); // Revert
                }
              },
              onDelete: (id) async {
                final success = await TaskService.deleteTask(id);
                if (success) _loadTasks();
              },
            ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.05, end: 0),
            const Divider(height: 1, color: AppTheme.notionBorder, indent: 46),
          ],
        );
      },
    );
  }

  Widget _buildBoardView(List<dynamic> tasks) {
    // Group tasks by status
    final statuses = [
      'Not Started',
      'In Progress',
      'Done',
      'Blocked',
      'On Hold'
    ];
    final Map<String, List<dynamic>> grouped = {for (var s in statuses) s: []};
    for (var t in tasks) {
      final s = t['status'] ?? 'Not Started';
      if (grouped.containsKey(s)) {
        grouped[s]!.add(t);
      } else {
        grouped['Not Started']!.add(t);
      }
    }

    final columnColors = {
      'Not Started': const Color(0xFFF1F1EF),
      'In Progress': const Color(0xFFDBEAFE),
      'Done': const Color(0xFFDCFCE7),
      'Blocked': const Color(0xFFFEE2E2),
      'On Hold': const Color(0xFFFEF3C7),
    };

    return Container(
      color: Colors.white,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.all(16),
        itemCount: statuses.length,
        itemBuilder: (context, index) {
          final status = statuses[index];
          final items = grouped[status]!;
          final color = columnColors[status] ?? const Color(0xFFF1F1EF);

          return Container(
            width: 280,
            margin: const EdgeInsets.only(right: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(bottom: 12, left: 4),
                  child: Row(
                    children: [
                      _StatusTag(status: status),
                      const SizedBox(width: 8),
                      Text(
                        '${items.length}',
                        style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.notionMuted,
                            fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () async {
                          final result = await showDialog(
                            context: context,
                            builder: (context) =>
                                const QuickAddModal(defaultType: 'task'),
                          );
                          if (result == true) _loadTasks();
                        },
                        icon: const Icon(LucideIcons.plus,
                            size: 14, color: AppTheme.notionMuted),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.all(8),
                    child: ListView.builder(
                      itemCount: items.length + 1,
                      itemBuilder: (context, i) {
                        if (i == items.length) {
                          return _buildNewItemButton(() async {
                            final result = await showDialog(
                              context: context,
                              builder: (context) =>
                                  const QuickAddModal(defaultType: 'task'),
                            );
                            if (result == true) _loadTasks();
                          });
                        }
                        final task = items[i];
                        return _BoardCard(task: task);
                      },
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTableView(List<dynamic> tasks) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildTableHeader(),
            // Rows
            ...tasks.map((t) => _buildTableRow(t)),
            _buildTableFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildCalendarView(List<dynamic> tasks) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.calendar, size: 48, color: AppTheme.notionMuted),
          SizedBox(height: 16),
          Text('Calendar View coming soon',
              style: TextStyle(color: AppTheme.notionMuted)),
        ],
      ),
    );
  }

  Widget _buildNewItemButton(VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: const Padding(
        padding: EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        child: Row(
          children: [
            Icon(LucideIcons.plus, size: 14, color: AppTheme.notionMuted),
            SizedBox(width: 8),
            Text('New',
                style: TextStyle(fontSize: 13, color: AppTheme.notionMuted)),
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
          _TableCell(text: 'Title', width: 250, isHeader: true),
          _TableCell(text: 'Status', width: 130, isHeader: true),
          _TableCell(text: 'Priority', width: 100, isHeader: true),
          _TableCell(text: 'Due Date', width: 110, isHeader: true),
          _TableCell(text: 'Tags', width: 150, isHeader: true),
          _TableCell(text: 'Done', width: 60, isHeader: true),
        ],
      ),
    );
  }

  Widget _buildTableRow(dynamic task) {
    bool isDone = task['completed'] ?? false;
    return Container(
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppTheme.notionBorder))),
      child: Row(
        children: [
          _TableCell(text: AppTheme.safeString(task['title']), width: 250),
          _TableCell(
              width: 130,
              child: _StatusTag(
                  status: AppTheme.safeString(task['status'],
                      fallback: 'Not Started'))),
          _TableCell(
              text: AppTheme.safeString(task['priority'], fallback: 'Medium'),
              width: 100),
          _TableCell(
              text: task['dueDate'] != null &&
                      task['dueDate'].toString().isNotEmpty
                  ? DateFormat('MMM d, y')
                      .format(DateTime.parse(task['dueDate']))
                  : '—',
              width: 110),
          _TableCell(
              text: (task['tags'] as List?)?.join(', ') ?? '—', width: 150),
          _TableCell(
            width: 60,
            child: InkWell(
              onTap: () async {
                final id = AppTheme.safeString(task['_id']);
                setState(() {
                  final taskIdx = _tasks.indexWhere((t) => t['_id'] == id);
                  if (taskIdx != -1) {
                    _tasks[taskIdx]['completed'] = !isDone;
                    _tasks[taskIdx]['status'] =
                        !isDone ? 'Done' : 'Not Started';
                  }
                });
                await TaskService.updateTask(id, {
                  'completed': !isDone,
                  'status': !isDone ? 'Done' : 'Not Started',
                });
              },
              child: Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  border: Border.all(
                      color: isDone
                          ? AppTheme.notionText
                          : const Color(0xFFD3D1CB),
                      width: 1),
                  borderRadius: BorderRadius.circular(3),
                  color: isDone ? AppTheme.notionText : null,
                ),
                child: isDone
                    ? const Icon(LucideIcons.check,
                        size: 10, color: Colors.white)
                    : null,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTableFooter() {
    return _buildNewItemButton(() async {
      final result = await showDialog(
        context: context,
        builder: (context) => const QuickAddModal(defaultType: 'task'),
      );
      if (result == true) _loadTasks();
    });
  }
}

class _BoardCard extends StatelessWidget {
  final dynamic task;
  const _BoardCard({required this.task});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.notionBorder),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 4,
              offset: const Offset(0, 1))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            task['title'] ?? 'Untitled',
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppTheme.notionText),
          ),
          if (task['priority'] != null || task['dueDate'] != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                if (task['priority'] != null)
                  _PriorityBadge(priority: task['priority']),
                const Spacer(),
                if (task['dueDate'] != null)
                  Text(
                    DateFormat('MMM d').format(DateTime.parse(task['dueDate'])),
                    style: const TextStyle(
                        fontSize: 10, color: AppTheme.notionMuted),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _PriorityBadge extends StatelessWidget {
  final String priority;
  const _PriorityBadge({required this.priority});

  @override
  Widget build(BuildContext context) {
    Color color = Colors.orange;
    if (priority == 'High') color = Colors.red;
    if (priority == 'Low') color = Colors.blue;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
      decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(4)),
      child: Text(priority,
          style: TextStyle(
              fontSize: 9, fontWeight: FontWeight.bold, color: color)),
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
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(
          border: Border(right: BorderSide(color: AppTheme.notionBorder))),
      alignment: Alignment.centerLeft,
      child: child ??
          Text(
            text ?? '',
            style: TextStyle(
              fontSize: 12,
              fontWeight: isHeader ? FontWeight.w600 : FontWeight.normal,
              color: isHeader ? AppTheme.notionMuted : AppTheme.notionText,
            ),
            overflow: TextOverflow.ellipsis,
          ),
    );
  }
}

class _TaskListItem extends StatelessWidget {
  final String id;
  final String title;
  final bool isDone;
  final String? status;
  final String? priority;
  final String? dueDate;
  final Function(String, bool) onToggle;
  final Function(String) onDelete;

  const _TaskListItem({
    required this.id,
    required this.title,
    required this.isDone,
    this.status,
    this.priority,
    this.dueDate,
    required this.onToggle,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    String? formattedDate;
    if (dueDate != null && dueDate!.isNotEmpty) {
      final date = DateTime.tryParse(dueDate!);
      if (date != null) {
        formattedDate = DateFormat('MMM d').format(date);
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          // Checkbox
          InkWell(
            onTap: () => onToggle(id, !isDone),
            borderRadius: BorderRadius.circular(4),
            child: Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                border: Border.all(
                    color:
                        isDone ? AppTheme.notionText : const Color(0xFFD3D1CB),
                    width: 1),
                borderRadius: BorderRadius.circular(3),
                color: isDone ? AppTheme.notionText : null,
              ),
              child: isDone
                  ? const Icon(LucideIcons.check, size: 10, color: Colors.white)
                  : null,
            ),
          ),
          const SizedBox(width: 12),
          // Title
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                decoration: isDone ? TextDecoration.lineThrough : null,
                color: isDone ? AppTheme.notionMuted : AppTheme.notionText,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 12),
          // Properties
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (status != null && status!.isNotEmpty) ...[
                _StatusTag(status: status!),
                const SizedBox(width: 12),
              ],
              if (formattedDate != null) ...[
                Text(
                  formattedDate,
                  style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.notionMuted,
                      fontWeight: FontWeight.w400),
                ),
                const SizedBox(width: 12),
              ],
              if (priority != null &&
                  priority!.isNotEmpty &&
                  priority != 'Medium') ...[
                _PriorityBadge(priority: priority!),
                const SizedBox(width: 12),
              ],
            ],
          ),
          // Delete
          IconButton(
            onPressed: () => onDelete(id),
            icon: const Icon(LucideIcons.trash2,
                size: 14, color: Color(0xFF9B9A97)),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            hoverColor: Colors.red.withOpacity(0.05),
          ),
        ],
      ),
    );
  }
}

class _StatusTag extends StatelessWidget {
  final String status;
  const _StatusTag({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg = const Color(0xFFF1F1EF);
    Color text = const Color(0xFF37352F);

    switch (status) {
      case 'In Progress':
        bg = const Color(0xFFDBEAFE);
        text = const Color(0xFF1E40AF);
        break;
      case 'Done':
        bg = const Color(0xFFDCFCE7);
        text = const Color(0xFF166534);
        break;
      case 'Blocked':
        bg = const Color(0xFFFEE2E2);
        text = const Color(0xFF991B1B);
        break;
      case 'On Hold':
        bg = const Color(0xFFFEF3C7);
        text = const Color(0xFF92400E);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(4)),
      child: Text(
        status,
        style:
            TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: text),
      ),
    );
  }
}
