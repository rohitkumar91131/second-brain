import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/goal_service.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:second_brain_flutter/screens/dashboard_page.dart'; // For ProgressBar and StatusTag
import 'package:second_brain_flutter/widgets/custom_button.dart';
import 'package:second_brain_flutter/widgets/quick_add_modal.dart';

class GoalsPage extends StatefulWidget {
  final bool isEmbedded;
  final ValueNotifier<int>? refreshSignal;
  const GoalsPage({super.key, this.isEmbedded = false, this.refreshSignal});

  @override
  State<GoalsPage> createState() => _GoalsPageState();
}

class _GoalsPageState extends State<GoalsPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<dynamic> _goals = [];
  bool _isLoading = true;
  String _view = 'list'; // 'list', 'board', 'table', 'calendar'

  @override
  void initState() {
    super.initState();
    _loadGoals();
    widget.refreshSignal?.addListener(_loadGoals);
  }

  @override
  void dispose() {
    widget.refreshSignal?.removeListener(_loadGoals);
    super.dispose();
  }

  Future<void> _loadGoals() async {
    setState(() => _isLoading = true);
    final goals = await GoalService.getGoals();
    if (mounted) {
      setState(() {
        _goals = goals;
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
        if (!_isLoading) _buildOverallProgress(),
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
        currentPath: '/goals',
        onToggle: () => Navigator.pop(context),
      ),
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) =>
                  Navigator.pushReplacementNamed(context, path),
              currentPath: '/goals',
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
          Icon(LucideIcons.target, size: 24, color: Colors.orange),
          SizedBox(width: 12),
          Text(
            'Goals',
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
          const Text('Track your long-term objectives and metrics',
              style: TextStyle(fontSize: 12, color: AppTheme.notionMuted)),
          const Spacer(),
          CustomButton(
            onPressed: () async {
              final result = await showDialog(
                context: context,
                builder: (context) => const QuickAddModal(defaultType: 'goal'),
              );
              if (result == true) _loadGoals();
            },
            icon: LucideIcons.plus,
            text: 'New Goal',
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

  Widget _buildOverallProgress() {
    if (_goals.isEmpty) return const SizedBox.shrink();

    final avgProgress = _goals.isEmpty
        ? 0.0
        : _goals.fold(0.0, (sum, g) => sum + (g['progress'] ?? 0)) /
            _goals.length;
    final activeCount = _goals.where((g) => g['status'] == 'Active').length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Row(
        children: [
          const Text('Overall progress',
              style: TextStyle(
                  fontSize: 12,
                  color: AppTheme.notionMuted,
                  fontWeight: FontWeight.w500)),
          const SizedBox(width: 16),
          Expanded(
            child: MaxWidth(
              maxWidth: 300,
              child: ProgressBar(value: avgProgress, color: Colors.orange),
            ),
          ),
          const SizedBox(width: 16),
          Text('$activeCount active goals',
              style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.notionMuted,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildCurrentView() {
    if (_goals.isEmpty && !_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.target,
                size: 48, color: AppTheme.notionMuted.withOpacity(0.3)),
            const SizedBox(height: 16),
            const Text(
              'No goals found',
              style: TextStyle(
                  color: AppTheme.notionMuted, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      );
    }

    switch (_view) {
      case 'board':
        return _buildGoalBoardView();
      case 'table':
        return _buildGoalTableView();
      case 'calendar':
        return const Center(
            child: Text('Calendar View coming soon',
                style: TextStyle(color: AppTheme.notionMuted)));
      case 'list':
      default:
        return _buildGoalListView();
    }
  }

  Widget _buildGoalListView() {
    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width > 1200
            ? 3
            : (MediaQuery.of(context).size.width > 800 ? 2 : 1),
        crossAxisSpacing: 20,
        mainAxisSpacing: 20,
        mainAxisExtent: 220,
      ),
      itemCount: _goals.length,
      itemBuilder: (context, index) {
        final goal = _goals[index];
        return _GoalCard(
          id: goal['_id'],
          title: goal['title'] ?? 'Untitled',
          status: goal['status'],
          progress: (goal['progress'] ?? 0).toDouble(),
          metric: goal['metric'],
          targetValue: goal['targetValue'],
          currentValue: goal['currentValue'],
          category: goal['category'],
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
      },
    );
  }

  Widget _buildGoalBoardView() {
    final statuses = ['Active', 'Planned', 'Completed', 'On Hold'];
    final Map<String, List<dynamic>> grouped = {for (var s in statuses) s: []};
    for (var g in _goals) {
      final s = g['status'] ?? 'Planned';
      if (grouped.containsKey(s)) {
        grouped[s]!.add(g);
      } else {
        grouped['Planned']!.add(g);
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
                      final goal = items[i];
                      return _GoalCard(
                        id: goal['_id'],
                        title: goal['title'] ?? 'Untitled',
                        status: goal['status'],
                        progress: (goal['progress'] ?? 0).toDouble(),
                        metric: goal['metric'],
                        targetValue: goal['targetValue'],
                        currentValue: goal['currentValue'],
                        category: goal['category'],
                      );
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

  Widget _buildGoalTableView() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTableHeader(),
            ..._goals.map((g) => _buildTableRow(g)),
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
          _TableCell(text: 'Metric', width: 150, isHeader: true),
          _TableCell(text: 'Target', width: 100, isHeader: true),
        ],
      ),
    );
  }

  Widget _buildTableRow(dynamic goal) {
    return Container(
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppTheme.notionBorder))),
      child: Row(
        children: [
          _TableCell(text: goal['title'] ?? '', width: 250),
          _TableCell(
              width: 120,
              child: StatusTag(status: goal['status'] ?? 'Planned')),
          _TableCell(
              width: 180,
              child: ProgressBar(
                  value: (goal['progress'] ?? 0).toDouble(),
                  color: Colors.orange)),
          _TableCell(text: goal['metric'] ?? '-', width: 150),
          _TableCell(text: goal['targetValue']?.toString() ?? '-', width: 100),
        ],
      ),
    );
  }

  Widget _buildTableFooter() {
    return _buildNewItemButton(() {});
  }
}

class MaxWidth extends StatelessWidget {
  final double maxWidth;
  final Widget child;
  const MaxWidth({super.key, required this.maxWidth, required this.child});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: maxWidth),
      child: child,
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

class _GoalCard extends StatelessWidget {
  final String id;
  final String title;
  final String? status;
  final double progress;
  final String? metric;
  final dynamic targetValue;
  final dynamic currentValue;
  final String? category;

  const _GoalCard({
    required this.id,
    required this.title,
    this.status,
    required this.progress,
    this.metric,
    this.targetValue,
    this.currentValue,
    this.category,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (category != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(category!.toUpperCase(),
                      style: const TextStyle(
                          fontSize: 9,
                          color: Colors.orange,
                          fontWeight: FontWeight.bold)),
                ),
              if (status != null) StatusTag(status: status!),
            ],
          ),
          const SizedBox(height: 12),
          Text(title,
              style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.3),
              maxLines: 2,
              overflow: TextOverflow.ellipsis),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${progress.toInt()}%',
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.orange)),
              if (currentValue != null && targetValue != null)
                Text('$currentValue / $targetValue',
                    style: const TextStyle(
                        fontSize: 11,
                        color: AppTheme.notionMuted,
                        fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: 8),
          ProgressBar(value: progress, color: Colors.orange),
          if (metric != null) ...[
            const SizedBox(height: 8),
            Text(metric!.toUpperCase(),
                style: const TextStyle(
                    fontSize: 9,
                    color: AppTheme.notionMuted,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5)),
          ],
        ],
      ),
    );
  }
}
