import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/resource_service.dart';
import 'package:second_brain_flutter/widgets/sidebar.dart';
import 'package:second_brain_flutter/widgets/custom_button.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:second_brain_flutter/widgets/quick_add_modal.dart';

class ResourcesPage extends StatefulWidget {
  final bool isEmbedded;
  final ValueNotifier<int>? refreshSignal;
  const ResourcesPage({super.key, this.isEmbedded = false, this.refreshSignal});

  @override
  State<ResourcesPage> createState() => _ResourcesPageState();
}

class _ResourcesPageState extends State<ResourcesPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<dynamic> _resources = [];
  bool _isLoading = true;
  String _view = 'board';

  @override
  void initState() {
    super.initState();
    _loadResources();
    widget.refreshSignal?.addListener(_loadResources);
  }

  @override
  void dispose() {
    widget.refreshSignal?.removeListener(_loadResources);
    super.dispose();
  }

  Future<void> _loadResources() async {
    setState(() => _isLoading = true);
    try {
      final resources = await ResourceService.getResources();
      if (mounted) {
        setState(() {
          _resources = resources;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget content = Column(
      children: [
        _buildHeader(context),
        _buildToolbar(),
        _buildTypeCounters(),
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
        currentPath: '/resources',
        onToggle: () => Navigator.pop(context),
      ),
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) =>
                  Navigator.pushReplacementNamed(context, path),
              currentPath: '/resources',
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
          Icon(LucideIcons.bookOpen, size: 24, color: Colors.teal),
          SizedBox(width: 12),
          Text(
            'Resources',
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
          // View Switcher (Match other pages)
          Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: const Color(0xFFF7F7F5),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppTheme.notionBorder),
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
          if (MediaQuery.of(context).size.width > 600)
            const Text(
              'Collected knowledge and links',
              style: TextStyle(fontSize: 12, color: AppTheme.notionMuted),
            ),
          const Spacer(),
          CustomButton(
            text: 'Add Resource',
            icon: LucideIcons.plus,
            onPressed: () async {
              final result = await showDialog(
                context: context,
                builder: (context) => QuickAddModal(defaultType: 'resource'),
              );
              if (result == true) _loadResources();
            },
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

  Widget _buildTypeCounters() {
    final types = ['Book', 'Article', 'Website', 'Video', 'Course'];
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Row(
        children: types.map((type) {
          final count = _resources.where((r) => r['type'] == type).length;
          return Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Text(
              '$count $type${count == 1 ? '' : 's'}',
              style: const TextStyle(
                  fontSize: 10,
                  color: AppTheme.notionMuted,
                  fontWeight: FontWeight.bold),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCurrentView() {
    if (_resources.isEmpty && !_isLoading) {
      return const Center(
        child: Text(
          'No resources found',
          style: TextStyle(
              color: AppTheme.notionMuted, fontStyle: FontStyle.italic),
        ),
      );
    }

    switch (_view) {
      case 'list':
        return _buildResourceListView();
      case 'table':
        return _buildResourceTableView();
      case 'board':
      default:
        return _buildResourceGridView();
    }
  }

  Widget _buildResourceGridView() {
    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width > 1200
            ? 3
            : (MediaQuery.of(context).size.width > 800 ? 2 : 1),
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        mainAxisExtent: 140,
      ),
      itemCount: _resources.length,
      itemBuilder: (context, index) {
        final res = _resources[index];
        return _ResourceCard(
          id: res['_id'] ?? res['id'],
          title: res['title'] ?? 'Untitled',
          type: res['type'],
          url: res['url'],
          status: res['status'],
          onDelete: () =>
              ResourceService.deleteResource(res['_id'] ?? res['id'])
                  .then((_) => _loadResources()),
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
      },
    );
  }

  Widget _buildResourceListView() {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _resources.length,
      itemBuilder: (context, index) {
        final res = _resources[index];
        return ListTile(
          leading: Icon(_getTypeIcon(res['type']),
              color: AppTheme.notionMuted, size: 20),
          title: Text(res['title'] ?? 'Untitled',
              style:
                  const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          subtitle: Text(res['url'] ?? '',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 12)),
          trailing: IconButton(
            icon: const Icon(LucideIcons.trash2,
                size: 16, color: Colors.redAccent),
            onPressed: () =>
                ResourceService.deleteResource(res['_id'] ?? res['id'])
                    .then((_) => _loadResources()),
          ),
        ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.05, end: 0);
      },
    );
  }

  Widget _buildResourceTableView() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTableHeader(),
            ..._resources.map((r) => _buildTableRow(r)),
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
          _TableCell(text: 'Type', width: 120, isHeader: true),
          _TableCell(text: 'Status', width: 120, isHeader: true),
          _TableCell(text: 'URL', width: 300, isHeader: true),
        ],
      ),
    );
  }

  Widget _buildTableRow(dynamic res) {
    return Container(
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppTheme.notionBorder))),
      child: Row(
        children: [
          _TableCell(text: res['title'] ?? '', width: 300),
          _TableCell(text: res['type'] ?? '', width: 120),
          _TableCell(text: res['status'] ?? '', width: 120),
          _TableCell(text: res['url'] ?? '', width: 300),
        ],
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
            Text('New Resource',
                style: TextStyle(fontSize: 13, color: AppTheme.notionMuted)),
          ],
        ),
      ),
    );
  }

  IconData _getTypeIcon(String? type) {
    final lowerType = type?.toLowerCase();
    if (lowerType == 'link' || lowerType == 'article' || lowerType == 'website') {
      return LucideIcons.externalLink;
    }
    if (lowerType == 'book') return LucideIcons.book;
    if (lowerType == 'video' || lowerType == 'course') return LucideIcons.video;
    if (lowerType == 'podcast') return LucideIcons.mic;
    if (lowerType == 'tool') return LucideIcons.wrench;
    return LucideIcons.file;
  }
}

class _ResourceCard extends StatelessWidget {
  final dynamic id;
  final String title;
  final String? type;
  final String? url;
  final String? status;
  final VoidCallback onDelete;

  const _ResourceCard({
    required this.id,
    required this.title,
    this.type,
    this.url,
    this.status,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    IconData typeIcon = LucideIcons.file;
    Color typeColor = Colors.teal;
    final lowerType = type?.toLowerCase();
    
    if (lowerType == 'link' || lowerType == 'article' || lowerType == 'website') {
      typeIcon = LucideIcons.externalLink;
      typeColor = Colors.blue;
    } else if (lowerType == 'book') {
      typeIcon = LucideIcons.book;
      typeColor = Colors.orange;
    } else if (lowerType == 'video' || lowerType == 'course') {
      typeIcon = LucideIcons.video;
      typeColor = Colors.red;
    } else if (lowerType == 'podcast') {
      typeIcon = LucideIcons.mic;
      typeColor = Colors.purple;
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.notionBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
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
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: typeColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(typeIcon, size: 14, color: typeColor),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.notionText,
                    height: 1.3,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              _buildActionButton(LucideIcons.trash2, Colors.redAccent, onDelete),
            ],
          ),
          const Spacer(),
          if (status != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: (status == 'Completed' ? Colors.green : Colors.teal).withOpacity(0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                status!.toUpperCase(),
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: status == 'Completed' ? Colors.green : Colors.teal,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          if (url != null && url!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(LucideIcons.link, size: 10, color: Colors.blue),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    url!,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Colors.blue,
                      decoration: TextDecoration.underline,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: Icon(icon, size: 14, color: color.withOpacity(0.7)),
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
