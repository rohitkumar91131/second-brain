import 'package:flutter/material.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/services/task_service.dart';
import 'package:second_brain_flutter/services/auth_service.dart';
import 'package:second_brain_flutter/services/project_service.dart';
import 'package:second_brain_flutter/services/goal_service.dart';
import 'package:second_brain_flutter/services/note_service.dart';
import 'package:second_brain_flutter/services/journal_service.dart';
import 'package:second_brain_flutter/services/resource_service.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';
import 'package:second_brain_flutter/widgets/quick_add_modal.dart';
import 'package:second_brain_flutter/widgets/custom_button.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:second_brain_flutter/screens/note_details_page.dart';

class DashboardPage extends StatefulWidget {
  final bool isEmbedded;
  final ValueNotifier<int>? refreshSignal;
  const DashboardPage({super.key, this.isEmbedded = false, this.refreshSignal});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  Map<String, dynamic>? _user;
  List<dynamic> _tasks = [];
  List<dynamic> _projects = [];
  List<dynamic> _goals = [];
  List<dynamic> _notes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
    widget.refreshSignal?.addListener(_loadDashboardData);
  }

  @override
  void dispose() {
    widget.refreshSignal?.removeListener(_loadDashboardData);
    super.dispose();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);
    final user = await AuthService.getCurrentUser();
    final tasks = await TaskService.getTasks();
    final projects = await ProjectService.getProjects();
    final goals = await GoalService.getGoals();
    final notes = await NoteService.getNotes();

    if (mounted) {
      setState(() {
        _user = user;
        _tasks = tasks;
        _projects = projects;
        _goals = goals;
        _notes = notes;
        _isLoading = false;
      });
    }
  }

  Future<void> _handleLogout() async {
    await AuthService.logout();
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
            child: CircularProgressIndicator(color: AppTheme.notionText)),
      );
    }

    Widget content = SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 32),
          _buildQuickAdd(),
          const SizedBox(height: 32),
          DashboardGrid(
            tasks: _tasks,
            projects: _projects,
            goals: _goals,
            notes: _notes,
          ),
        ],
      ),
    );

    if (widget.isEmbedded) return content;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.white,
      drawer: Sidebar(
        onNavigate: (path) => Navigator.pushReplacementNamed(context, path),
        currentPath: '/dashboard',
        onToggle: () => Navigator.pop(context),
      ),
      appBar: MediaQuery.of(context).size.width < 800
          ? AppBar(
              title: const Text('Dashboard',
                  style: TextStyle(
                      color: AppTheme.notionText, fontWeight: FontWeight.bold)),
              actions: [
                IconButton(
                    icon: const Icon(LucideIcons.bell,
                        color: AppTheme.notionText),
                    onPressed: () {}),
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppTheme.notionSidebar,
                  child: Text(
                    (_user?['name'] ?? 'U').substring(0, 1).toUpperCase(),
                    style: const TextStyle(
                        color: AppTheme.notionText,
                        fontSize: 12,
                        fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 16),
              ],
            )
          : null,
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) =>
                  Navigator.pushReplacementNamed(context, path),
              currentPath: '/dashboard',
              onToggle: () {},
            ),
          Expanded(child: content),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final name = _user?['name'] ?? 'User';
    final now = DateTime.now();
    final formatter = DateFormat('EEEE, MMMM d, yyyy');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Good morning, $name 👋',
          style: const TextStyle(
              fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: -0.5),
        ),
        const SizedBox(height: 8),
        Text(
          formatter.format(now),
          style: const TextStyle(
              fontSize: 14,
              color: AppTheme.notionMuted,
              fontWeight: FontWeight.w500),
        ).animate().fadeIn(delay: 200.ms).slideX(begin: -0.1, end: 0),
      ],
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildQuickAdd() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        CustomButton(
          text: 'New Task',
          icon: LucideIcons.checkSquare,
          onPressed: () async {
            final result = await showDialog<bool>(
              context: context,
              builder: (context) => const QuickAddModal(defaultType: 'task'),
            );
            if (result == true) _loadDashboardData();
          },
          fontSize: 12,
        ),
        CustomButton(
          text: 'New Note',
          icon: LucideIcons.fileText,
          onPressed: () async {
            final result = await showDialog<bool>(
              context: context,
              builder: (context) => const QuickAddModal(defaultType: 'note'),
            );
            if (result == true) _loadDashboardData();
          },
          fontSize: 12,
        ),
        CustomButton(
          text: 'New Project',
          icon: LucideIcons.folderOpen,
          onPressed: () async {
            final result = await showDialog<bool>(
              context: context,
              builder: (context) => const QuickAddModal(defaultType: 'project'),
            );
            if (result == true) _loadDashboardData();
          },
          fontSize: 12,
        ),
        CustomButton(
          text: 'New Goal',
          icon: LucideIcons.target,
          onPressed: () async {
            final result = await showDialog<bool>(
              context: context,
              builder: (context) => const QuickAddModal(defaultType: 'goal'),
            );
            if (result == true) _loadDashboardData();
          },
          fontSize: 12,
        ),
      ],
    );
  }

  Future<void> _showQuickAddDialog(String title, String hint) async {
    final controller = TextEditingController();
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(hintText: hint),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('$title created: ${controller.text}')),
              );
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}

class _QuickAddButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final VoidCallback? onTap;

  const _QuickAddButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.bgColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap ?? () {},
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.plus, size: 16, color: color),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                  color: color, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

class DashboardGrid extends StatelessWidget {
  final List<dynamic> tasks;
  final List<dynamic> projects;
  final List<dynamic> goals;
  final List<dynamic> notes;

  const DashboardGrid({
    super.key,
    required this.tasks,
    required this.projects,
    required this.goals,
    required this.notes,
  });

  @override
  Widget build(BuildContext context) {
    // Determine today's tasks and upcoming tasks like in page.jsx
    final now = DateTime.now();
    final todayStr = DateFormat('yyyy-MM-dd').format(now);

    final todayTasks = tasks
        .where((t) =>
            t['completed'] != true &&
            t['dueDate'] != null &&
            t['dueDate'].toString().startsWith(todayStr))
        .toList();

    final upcomingTasks = tasks
        .where((t) =>
            t['completed'] != true &&
            t['dueDate'] != null &&
            !t['dueDate'].toString().startsWith(todayStr))
        .toList();

    final activeProjects =
        projects.where((p) => p['status'] == 'Active').take(4).toList();
    final activeGoals =
        goals.where((g) => g['status'] == 'Active').take(4).toList();
    final recentNotes = List.from(notes)
      ..sort((a, b) {
        final dateA = DateTime.tryParse(a['updatedAt'] ?? '') ?? DateTime(1970);
        final dateB = DateTime.tryParse(b['updatedAt'] ?? '') ?? DateTime(1970);
        return dateB.compareTo(dateA);
      });
    final displayedNotes = recentNotes.take(4).toList();

    if (MediaQuery.of(context).size.width > 1000) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              children: [
                _buildTasksWidget(context, todayTasks)
                    .animate()
                    .fadeIn(delay: 100.ms)
                    .slideY(begin: 0.1, end: 0),
                const SizedBox(height: 24),
                _buildProjectsWidget(context, activeProjects)
                    .animate()
                    .fadeIn(delay: 200.ms)
                    .slideY(begin: 0.1, end: 0),
                const SizedBox(height: 24),
                _buildNotesWidget(context, displayedNotes)
                    .animate()
                    .fadeIn(delay: 300.ms)
                    .slideY(begin: 0.1, end: 0),
              ],
            ),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: Column(
              children: [
                _buildUpcomingWidget(context, upcomingTasks)
                    .animate()
                    .fadeIn(delay: 150.ms)
                    .slideY(begin: 0.1, end: 0),
                const SizedBox(height: 24),
                _buildGoalsWidget(context, activeGoals)
                    .animate()
                    .fadeIn(delay: 250.ms)
                    .slideY(begin: 0.1, end: 0),
                const SizedBox(height: 24),
                MiniCalendar(tasks: tasks)
                    .animate()
                    .fadeIn(delay: 350.ms)
                    .slideY(begin: 0.1, end: 0),
              ],
            ),
          ),
        ],
      );
    } else {
      return Column(
        children: [
          _buildTasksWidget(context, todayTasks),
          const SizedBox(height: 24),
          _buildUpcomingWidget(context, upcomingTasks),
          const SizedBox(height: 24),
          _buildProjectsWidget(context, activeProjects),
          const SizedBox(height: 24),
          _buildGoalsWidget(context, activeGoals),
          const SizedBox(height: 24),
          _buildNotesWidget(context, displayedNotes),
          const SizedBox(height: 24),
          MiniCalendar(tasks: tasks),
        ],
      );
    }
  }

  Widget _buildTasksWidget(BuildContext context, List<dynamic> todayTasks) {
    return DashboardWidget(
      title: "Today's Tasks",
      icon: LucideIcons.checkSquare,
      iconColor: Colors.blue,
      count: todayTasks.length,
      href: '/tasks',
      child: Column(
        children: todayTasks.isEmpty
            ? [const EmptyWidget(text: 'No tasks for today 🎉')]
            : todayTasks
                .map((task) => _TaskItem(
                      id: AppTheme.safeString(task['_id']),
                      title: AppTheme.safeString(task['title'],
                          fallback: 'Untitled Task'),
                      isDone: task['completed'] ?? false,
                      tagName: AppTheme.safeString(task['status']),
                      onToggle: (id, completed) async {
                        // Optimistic Update
                        final dashboardPageState = context
                            .findAncestorStateOfType<_DashboardPageState>();
                        if (dashboardPageState != null) {
                          dashboardPageState.setState(() {
                            final taskIndex = dashboardPageState._tasks
                                .indexWhere((t) => t['_id'] == id);
                            if (taskIndex != -1) {
                              dashboardPageState._tasks[taskIndex]
                                  ['completed'] = completed;
                            }
                          });
                        }

                        final success = await TaskService.updateTask(id, {
                          'completed': completed,
                          'status': completed ? 'Done' : 'In Progress'
                        });
                        if (!success) {
                          // Revert if failed
                          dashboardPageState?._loadDashboardData();
                        } else {
                          dashboardPageState
                              ?._loadDashboardData(); // Reload to ensure consistency and update counts
                        }
                      },
                    ))
                .toList(),
      ),
    );
  }

  Widget _buildUpcomingWidget(
      BuildContext context, List<dynamic> upcomingTasks) {
    return DashboardWidget(
      title: "Upcoming",
      icon: LucideIcons.calendar,
      iconColor: Colors.purple,
      count: upcomingTasks.length,
      href: '/tasks',
      child: Column(
        children: upcomingTasks.isEmpty
            ? [const EmptyWidget(text: 'No upcoming tasks')]
            : upcomingTasks.map((task) {
                final date =
                    DateTime.tryParse(task['dueDate'] ?? '') ?? DateTime.now();
                final dateStr = DateFormat('MMM d').format(date);
                return _TaskItem(
                  id: AppTheme.safeString(task['_id']),
                  title: AppTheme.safeString(task['title'],
                      fallback: 'Untitled Task'),
                  isDone: task['completed'] ?? false,
                  dateStr: dateStr,
                );
              }).toList(),
      ),
    );
  }

  Widget _buildProjectsWidget(
      BuildContext context, List<dynamic> activeProjects) {
    return DashboardWidget(
      title: "Active Projects",
      icon: LucideIcons.folderOpen,
      iconColor: Colors.purple,
      count: activeProjects.length,
      href: '/projects',
      child: Column(
        children: activeProjects.isEmpty
            ? [const EmptyWidget(text: 'No active projects')]
            : activeProjects
                .map((project) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                  child: Text(
                                      AppTheme.safeString(project['title'],
                                          fallback: 'Untitled'),
                                      style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold))),
                              Text('${project['progress']}%',
                                  style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          ProgressBar(
                              value: (project['progress'] ?? 0).toDouble()),
                        ],
                      ),
                    ))
                .toList(),
      ),
    );
  }

  Widget _buildGoalsWidget(BuildContext context, List<dynamic> activeGoals) {
    return DashboardWidget(
      title: "Goal Progress",
      icon: LucideIcons.target,
      iconColor: Colors.orange,
      count: activeGoals.length,
      href: '/goals',
      child: Column(
        children: activeGoals.isEmpty
            ? [const EmptyWidget(text: 'No active goals')]
            : activeGoals
                .map((goal) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                  child: Text(goal['title'] ?? 'Untitled',
                                      style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold))),
                              Text('${goal['progress']}%',
                                  style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.orange)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          ProgressBar(
                              value: (goal['progress'] ?? 0).toDouble(),
                              color: Colors.orange),
                          if (goal['metric'] != null) ...[
                            const SizedBox(height: 4),
                            Text(goal['metric'].toString().toUpperCase(),
                                style: const TextStyle(
                                    fontSize: 9,
                                    color: AppTheme.notionMuted,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5)),
                          ],
                        ],
                      ),
                    ))
                .toList(),
      ),
    );
  }

  Widget _buildNotesWidget(BuildContext context, List<dynamic> recentNotes) {
    return DashboardWidget(
      title: "Recent Notes",
      icon: LucideIcons.fileText,
      iconColor: Colors.green,
      count: recentNotes.length,
      href: '/notes',
      child: Column(
        children: recentNotes.isEmpty
            ? [const EmptyWidget(text: 'No notes yet')]
            : recentNotes
                .map((note) => InkWell(
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => NoteDetailsPage(id: note['_id']),
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            vertical: 6, horizontal: 4),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.fileText,
                                size: 14, color: AppTheme.notionMuted),
                            const SizedBox(width: 8),
                            Expanded(
                                child: Text(note['title'] ?? 'Untitled',
                                    style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500))),
                            Text(
                                note['updatedAt'] != null
                                    ? DateFormat('MMM d').format(
                                        DateTime.tryParse(note['updatedAt']!) ??
                                            DateTime.now())
                                    : 'Recent',
                                style: const TextStyle(
                                    fontSize: 11, color: AppTheme.notionMuted)),
                          ],
                        ),
                      ),
                    ))
                .toList(),
      ),
    );
  }
}

class DashboardWidget extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color iconColor;
  final int count;
  final Widget child;
  final String? href;

  const DashboardWidget({
    super.key,
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.count,
    required this.child,
    this.href,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.notionBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.notionSidebar,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, size: 16, color: iconColor),
                  ),
                  const SizedBox(width: 12),
                  Text(title,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          letterSpacing: -0.2)),
                  const SizedBox(width: 8),
                  if (count > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.notionSidebar,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text('$count',
                          style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.notionMuted)),
                    ),
                ],
              ),
              if (href != null)
                InkWell(
                  onTap: () {
                    Navigator.pushReplacementNamed(context, href!);
                  },
                  child: const Icon(LucideIcons.chevronRight,
                      size: 16, color: AppTheme.notionMuted),
                ),
            ],
          ),
          const SizedBox(height: 20),
          child,
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.05, end: 0);
  }
}

class EmptyWidget extends StatelessWidget {
  final String text;
  const EmptyWidget({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Text(
        text,
        style: const TextStyle(
            color: AppTheme.notionMuted,
            fontSize: 13,
            fontStyle: FontStyle.italic),
        textAlign: TextAlign.center,
      ),
    );
  }
}

class StatusTag extends StatelessWidget {
  final String status;
  const StatusTag({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg = AppTheme.statusNotStartedBg;
    Color text = AppTheme.statusNotStartedText;

    switch (status.toLowerCase()) {
      case 'in progress':
        bg = AppTheme.statusInProgressBg;
        text = AppTheme.statusInProgressText;
        break;
      case 'done':
        bg = AppTheme.statusDoneBg;
        text = AppTheme.statusDoneText;
        break;
      case 'blocked':
        bg = AppTheme.statusBlockedBg;
        text = AppTheme.statusBlockedText;
        break;
      case 'on hold':
        bg = AppTheme.statusOnHoldBg;
        text = AppTheme.statusOnHoldText;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status,
        style:
            TextStyle(color: text, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}

class ProgressBar extends StatelessWidget {
  final double value;
  final Color color;
  const ProgressBar({super.key, required this.value, this.color = Colors.blue});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 6,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.notionSidebar,
        borderRadius: BorderRadius.circular(3),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: (value / 100).clamp(0.0, 1.0),
        child: Container(
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
      ),
    );
  }
}

class MiniCalendar extends StatelessWidget {
  final List<dynamic> tasks;
  const MiniCalendar({super.key, required this.tasks});

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final days = List.generate(7, (i) => now.add(Duration(days: i)));

    return DashboardWidget(
      title: "Next 7 Days",
      icon: LucideIcons.bookMarked,
      iconColor: AppTheme.notionAccent,
      count: 0,
      child: Column(
        children: days.asMap().entries.map((entry) {
          final i = entry.key;
          final day = entry.value;
          final dateStr = DateFormat('yyyy-MM-dd').format(day);
          final dayTasks = tasks
              .where((t) =>
                  t['dueDate'] != null &&
                  t['dueDate'].toString().startsWith(dateStr))
              .toList();

          final isToday = i == 0;

          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              children: [
                SizedBox(
                  width: 35,
                  child: Text(
                    isToday
                        ? 'Now'
                        : DateFormat('EEE').format(day).toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isToday ? Colors.blue : AppTheme.notionMuted,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                Expanded(
                  child: dayTasks.isEmpty
                      ? Container(height: 1, color: AppTheme.notionBorder)
                      : Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: dayTasks
                              .take(3)
                              .map((t) => Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.withOpacity(0.05),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                          color: Colors.blue.withOpacity(0.1)),
                                    ),
                                    child: Text(
                                      t['title'] ?? '',
                                      style: const TextStyle(
                                          fontSize: 10,
                                          color: Colors.blue,
                                          fontWeight: FontWeight.bold),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ))
                              .toList(),
                        ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _TaskItem extends StatelessWidget {
  final String id;
  final String title;
  final bool isDone;
  final String? tagName;
  final String? dateStr;
  final Function(String, bool)? onToggle;

  const _TaskItem({
    required this.id,
    required this.title,
    required this.isDone,
    this.tagName,
    this.dateStr,
    this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onToggle?.call(id, !isDone),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        margin: const EdgeInsets.only(bottom: 4),
        padding: const EdgeInsets.all(8),
        child: Row(
          children: [
            Container(
              width: 18,
              height: 18,
              decoration: BoxDecoration(
                border: Border.all(
                    color: isDone ? AppTheme.notionText : AppTheme.notionBorder,
                    width: 1.5),
                borderRadius: BorderRadius.circular(5),
                color: isDone ? AppTheme.notionText : null,
              ),
              child: isDone
                  ? const Icon(Icons.check, size: 12, color: Colors.white)
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
                child: Text(title,
                    style: TextStyle(
                      decoration: isDone ? TextDecoration.lineThrough : null,
                      color:
                          isDone ? AppTheme.notionMuted : AppTheme.notionText,
                      fontWeight: FontWeight.w500,
                      fontSize: 13,
                    ))),
            if (tagName != null) StatusTag(status: tagName!),
            if (dateStr != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.notionSidebar,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(dateStr!,
                    style: const TextStyle(
                        fontSize: 10,
                        color: AppTheme.notionMuted,
                        fontWeight: FontWeight.bold)),
              ),
          ],
        ),
      ),
    );
  }
}

class _ProjectItem extends StatelessWidget {
  final String title;
  final double progress;
  final Color color;

  const _ProjectItem(
      {required this.title, required this.progress, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title,
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Text('${(progress * 100).toInt()}%',
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                    color: AppTheme.notionMuted)),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: AppTheme.notionSidebar,
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
        )
      ],
    );
  }
}
