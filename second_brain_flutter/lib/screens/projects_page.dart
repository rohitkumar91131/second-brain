import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/project_service.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:second_brain_flutter/screens/dashboard_page.dart'; // For ProgressBar
import 'package:second_brain_flutter/widgets/custom_button.dart';
import 'package:second_brain_flutter/widgets/quick_add_modal.dart';

class ProjectsPage extends StatefulWidget {
  final bool isEmbedded;
  final ValueNotifier<int>? refreshSignal;
  const ProjectsPage({super.key, this.isEmbedded = false, this.refreshSignal});

  @override
  State<ProjectsPage> createState() => _ProjectsPageState();
}

class _ProjectsPageState extends State<ProjectsPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<dynamic> _projects = [];
  bool _isLoading = true;
  String _view = 'list'; // 'list', 'board', 'table', 'calendar'

  @override
  void initState() {
    super.initState();
    _loadProjects();
    widget.refreshSignal?.addListener(_loadProjects);
  }

  @override
  void dispose() {
    widget.refreshSignal?.removeListener(_loadProjects);
    super.dispose();
  }

  Future<void> _loadProjects() async {
    setState(() => _isLoading = true);
    final projects = await ProjectService.getProjects();
    if (mounted) {
      setState(() {
        _projects = projects;
        _isLoading = false;
      });
    }
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
        currentPath: '/projects',
        onToggle: () => Navigator.pop(context),
      ),
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) =>
                  Navigator.pushReplacementNamed(context, path),
              currentPath: '/projects',
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
          Icon(LucideIcons.folderOpen, size: 24, color: Colors.purple),
          SizedBox(width: 12),
          Text(
            'Projects',
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
                _buildViewIcon(LucideIcons.list, 'list'),
                _buildViewIcon(LucideIcons.layoutGrid, 'board'),
                _buildViewIcon(LucideIcons.table, 'table'),
                _buildViewIcon(LucideIcons.calendar, 'calendar'),
              ],
            ),
          ),
          const SizedBox(width: 16),
          const Text('Displaying all active and planned projects',
              style: TextStyle(fontSize: 12, color: AppTheme.notionMuted)),
          const Spacer(),
          CustomButton(
            onPressed: () async {
              final result = await showDialog(
                context: context,
                builder: (context) => const QuickAddModal(defaultType: 'project'),
              );
              if (result == true) _loadProjects();
            },
            icon: LucideIcons.plus,
            text: 'New Project',
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
    if (_projects.isEmpty && !_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.folder,
                size: 48, color: AppTheme.notionMuted.withOpacity(0.3)),
            const SizedBox(height: 16),
            const Text(
              'No projects found',
              style: TextStyle(
                  color: AppTheme.notionMuted, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      );
    }

    switch (_view) {
      case 'board':
        return _buildProjectBoardView();
      case 'table':
        return _buildProjectTableView();
      case 'calendar':
        return const Center(
            child: Text('Calendar View coming soon',
                style: TextStyle(color: AppTheme.notionMuted)));
      case 'list':
      default:
        return _buildProjectListView();
    }
  }

  Widget _buildProjectListView() {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _projects.length,
      itemBuilder: (context, index) {
        final project = _projects[index];
        return _ProjectListItem(
          id: project['_id'],
          title: project['title'] ?? 'Untitled',
          status: project['status'],
          progress: (project['progress'] ?? 0).toDouble(),
          priority: project['priority'],
          description: project['description'],
        );
      },
    );
  }

  Widget _buildProjectBoardView() {
    final statuses = ['Active', 'Planned', 'Completed', 'On Hold'];
    final Map<String, List<dynamic>> grouped = {for (var s in statuses) s: []};
    for (var p in _projects) {
      final s = p['status'] ?? 'Planned';
      if (grouped.containsKey(s)) {
        grouped[s]!.add(p);
      } else {
        grouped['Planned']!.add(p);
      }
    }

    return Container(
      color: const Color(0xFFFBFBFA),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.all(16),
        itemCount: statuses.length,
        itemBuilder: (context, index) {
          final status = statuses[index];
          final items = grouped[status]!;
          return Container(
            width: 300,
            margin: const EdgeInsets.only(right: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(bottom: 12, left: 4),
                  child: Row(
                    children: [
                      StatusTag(status: status),
                      const SizedBox(width: 8),
                      Text(
                        '${items.length}',
                        style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.notionMuted,
                            fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    itemCount: items.length + 1,
                    itemBuilder: (context, i) {
                      if (i == items.length) {
                        return _buildNewItemButton(() {});
                      }
                      final project = items[i];
                      return _ProjectBoardCard(project: project)
                          .animate()
                          .fadeIn(duration: 400.ms)
                          .slideY(begin: 0.1, end: 0);
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProjectTableView() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTableHeader(),
            ..._projects.map((p) => _buildTableRow(p)),
            _buildTableFooter(),
          ],
        ),
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
          _TableCell(text: 'Status', width: 120, isHeader: true),
          _TableCell(text: 'Progress', width: 180, isHeader: true),
          _TableCell(text: 'Priority', width: 100, isHeader: true),
          _TableCell(text: 'Area', width: 120, isHeader: true),
        ],
      ),
    );
  }

  Widget _buildTableRow(dynamic project) {
    return Container(
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppTheme.notionBorder))),
      child: Row(
        children: [
          _TableCell(text: project['title'] ?? '', width: 250),
          _TableCell(
              width: 120,
              child: StatusTag(status: project['status'] ?? 'Planned')),
          _TableCell(
              width: 180,
              child: ProgressBar(
                  value: (project['progress'] ?? 0).toDouble(),
                  color: Colors.purple)),
          _TableCell(text: project['priority'] ?? 'Medium', width: 100),
          _TableCell(text: project['area'] ?? '-', width: 120),
        ],
      ),
    );
  }

  Widget _buildTableFooter() {
    return _buildNewItemButton(() {});
  }
}

class _ProjectBoardCard extends StatelessWidget {
  final dynamic project;
  const _ProjectBoardCard({required this.project});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppTheme.safeString(project['title'], fallback: 'Untitled'),
            style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppTheme.notionText,
                letterSpacing: -0.3),
          ),
          if (project['description'] != null &&
              project['description']!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              project['description']!,
              style: const TextStyle(fontSize: 11, color: AppTheme.notionMuted),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 16),
          ProgressBar(
              value: (project['progress'] ?? 0).toDouble(),
              color: Colors.purple),
          const SizedBox(height: 8),
          Row(
            children: [
              if (project['priority'] != null)
                _PriorityBadge(priority: project['priority']),
              const Spacer(),
              Text('${(project['progress'] ?? 0).toInt()}%',
                  style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.notionMuted)),
            ],
          ),
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
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
      decoration: BoxDecoration(
        color: AppTheme.notionSidebar,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(LucideIcons.flag, size: 10, color: AppTheme.notionMuted),
          const SizedBox(width: 4),
          Text(priority,
              style: const TextStyle(
                  fontSize: 10,
                  color: AppTheme.notionMuted,
                  fontWeight: FontWeight.w500)),
        ],
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

class _ProjectListItem extends StatelessWidget {
  final String id;
  final String title;
  final String? status;
  final double progress;
  final String? priority;
  final String? description;

  const _ProjectListItem({
    required this.id,
    required this.title,
    this.status,
    required this.progress,
    this.priority,
    this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title,
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.3)),
              if (status != null) StatusTag(status: status!),
            ],
          ),
          if (description != null && description!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              description!,
              style: const TextStyle(fontSize: 13, color: AppTheme.notionMuted),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Progress',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.notionMuted)),
              Text('${progress.toInt()}%',
                  style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          ProgressBar(value: progress, color: Colors.purple),
          const SizedBox(height: 16),
          Row(
            children: [
              if (priority != null) ...[
                const Icon(LucideIcons.flag,
                    size: 12, color: AppTheme.notionMuted),
                const SizedBox(width: 4),
                Text(priority!,
                    style: const TextStyle(
                        fontSize: 12, color: AppTheme.notionMuted)),
              ],
              const Spacer(),
              TextButton(
                onPressed: () {},
                child: const Text('View Details',
                    style:
                        TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
