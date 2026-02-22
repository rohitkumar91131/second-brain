import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:second_brain_flutter/services/archive_service.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';
import 'package:intl/intl.dart';

class ArchivePage extends StatefulWidget {
  final bool isEmbedded;
  final ValueNotifier<int>? refreshSignal;
  const ArchivePage({super.key, this.isEmbedded = false, this.refreshSignal});

  @override
  State<ArchivePage> createState() => _ArchivePageState();
}

class _ArchivePageState extends State<ArchivePage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<dynamic> _archive = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadArchive();
    widget.refreshSignal?.addListener(_loadArchive);
  }

  @override
  void dispose() {
    widget.refreshSignal?.removeListener(_loadArchive);
    super.dispose();
  }

  Future<void> _loadArchive() async {
    setState(() => _isLoading = true);
    final archive = await ArchiveService.getArchive();
    if (mounted) {
      setState(() {
        _archive = archive;
        _isLoading = false;
      });
    }
  }

  Future<void> _handleDelete(String id) async {
    await ArchiveService.deleteArchiveItem(id);
    _loadArchive();
  }

  Future<void> _handleClearAll() async {
    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Archive'),
        content:
            const Text('Are you sure you want to clear all archived items?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Clear All', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ArchiveService.clearArchive();
      _loadArchive();
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
              : _buildArchiveList(),
        ),
      ],
    );

    if (widget.isEmbedded) return content;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.white,
      drawer: Sidebar(
        onNavigate: (path) => Navigator.pushReplacementNamed(context, path),
        currentPath: '/archive',
        onToggle: () => Navigator.pop(context),
      ),
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) =>
                  Navigator.pushReplacementNamed(context, path),
              currentPath: '/archive',
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
          Icon(LucideIcons.archive, size: 24, color: Colors.brown),
          SizedBox(width: 12),
          Text(
            'Archive',
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
          Text('${_archive.length} archived items',
              style:
                  const TextStyle(fontSize: 12, color: AppTheme.notionMuted)),
          const Spacer(),
          if (_archive.isNotEmpty)
            TextButton(
              onPressed: _handleClearAll,
              child: const Text('Clear all',
                  style: TextStyle(fontSize: 12, color: Colors.redAccent)),
            ),
        ],
      ),
    );
  }

  Widget _buildArchiveList() {
    if (_archive.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.archive, size: 40, color: AppTheme.notionBorder),
            SizedBox(height: 12),
            Text('Archive is empty',
                style: TextStyle(color: AppTheme.notionMuted, fontSize: 13)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _archive.length,
      itemBuilder: (context, index) {
        final item = _archive[index];
        return _ArchiveItem(
          id: item['id'] ?? '',
          title: item['title'] ?? 'Untitled',
          type: item['type'] ?? 'Unknown',
          archivedAt: item['archivedAt'],
          status: item['status'],
          onDelete: () => _handleDelete(item['id']),
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
      },
    );
  }
}

class _ArchiveItem extends StatelessWidget {
  final String id;
  final String title;
  final String type;
  final String? archivedAt;
  final String? status;
  final VoidCallback onDelete;

  const _ArchiveItem({
    required this.id,
    required this.title,
    required this.type,
    this.archivedAt,
    this.status,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    String dateStr = '';
    if (archivedAt != null) {
      final date = DateTime.tryParse(archivedAt!);
      if (date != null) {
        dateStr = 'Archived ${DateFormat('MMM d, yyyy').format(date)}';
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontSize: 14,
                        color: AppTheme.notionText,
                        fontWeight: FontWeight.w500),
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text('$type · $dateStr',
                    style: const TextStyle(
                        fontSize: 11, color: AppTheme.notionMuted)),
              ],
            ),
          ),
          if (status != null) ...[
            StatusTag(status: status!),
            const SizedBox(width: 8),
          ],
          IconButton(
            icon: const Icon(LucideIcons.trash2,
                size: 13, color: Colors.redAccent),
            onPressed: onDelete,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
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
      case 'active':
        bg = AppTheme.statusInProgressBg;
        text = AppTheme.statusInProgressText;
        break;
      case 'done':
      case 'completed':
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
