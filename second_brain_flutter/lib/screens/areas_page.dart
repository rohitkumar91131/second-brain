import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/services/area_service.dart';
import 'package:second_brain_flutter/screens/dashboard_page.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../widgets/sidebar.dart';
import '../widgets/custom_button.dart';

class AreasPage extends StatefulWidget {
  final bool isEmbedded;
  final ValueNotifier<int>? refreshSignal;
  const AreasPage({super.key, this.isEmbedded = false, this.refreshSignal});

  @override
  State<AreasPage> createState() => _AreasPageState();
}

class _AreasPageState extends State<AreasPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<dynamic> _areas = [];
  bool _isLoading = true;
  String _view = 'board'; // 'board' (grid), 'list', 'table'

  @override
  void initState() {
    super.initState();
    _loadAreas();
    widget.refreshSignal?.addListener(_loadAreas);
  }

  @override
  void dispose() {
    widget.refreshSignal?.removeListener(_loadAreas);
    super.dispose();
  }

  Future<void> _loadAreas() async {
    setState(() => _isLoading = true);
    final areas = await AreaService.getAreas();
    if (mounted) {
      setState(() {
        _areas = areas;
        _isLoading = false;
      });
    }
  }

  Future<void> _addArea() async {
    final colors = [
      '#2eaadc',
      '#0f7b6c',
      '#6940a5',
      '#d9730d',
      '#e03e3e',
      '#0b6e99',
      '#37352f',
    ];
    final newArea = {
      'id': 'area-${DateTime.now().millisecondsSinceEpoch}',
      'title': 'New Area',
      'icon': '📌',
      'description': '',
      'color': colors[_areas.length % colors.length],
    };
    await AreaService.addArea(newArea);
    _loadAreas();
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
        currentPath: '/areas',
        onToggle: () => Navigator.pop(context),
      ),
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width >= 800)
            Sidebar(
              onNavigate: (path) =>
                  Navigator.pushReplacementNamed(context, path),
              currentPath: '/areas',
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
          Icon(LucideIcons.map, size: 24, color: Colors.cyan),
          SizedBox(width: 12),
          Text(
            'Areas',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
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
              'Long-term responsibilities',
              style: TextStyle(fontSize: 12, color: AppTheme.notionMuted),
            ),
          const Spacer(),
          CustomButton(
            text: 'New Area',
            icon: LucideIcons.plus,
            onPressed: _addArea,
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
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ]
              : null,
        ),
        child: Icon(
          icon,
          size: 14,
          color: isSelected ? AppTheme.notionText : AppTheme.notionMuted,
        ),
      ),
    );
  }

  Widget _buildCurrentView() {
    if (_areas.isEmpty && !_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              LucideIcons.map,
              size: 48,
              color: AppTheme.notionMuted.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            const Text(
              'No areas found. Add your first area of life!',
              style: TextStyle(
                color: AppTheme.notionMuted,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      );
    }

    switch (_view) {
      case 'list':
        return _buildAreaListView();
      case 'table':
        return _buildAreaTableView();
      case 'board':
      default:
        return _buildAreaGridView();
    }
  }

  Widget _buildAreaGridView() {
    return GridView.builder(
      padding: const EdgeInsets.all(24),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width > 1200
            ? 3
            : (MediaQuery.of(context).size.width > 800 ? 2 : 1),
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        mainAxisExtent: 120,
      ),
      itemCount: _areas.length,
      itemBuilder: (context, index) {
        final area = _areas[index];
        return _AreaCard(
          id: area['id'],
          title: area['title'] ?? 'Untitled',
          icon: area['icon'] ?? '📌',
          description: area['description'],
          color: _parseColor(area['color']),
          onUpdate: (updates) => AreaService.updateArea(
            area['id'],
            updates,
          ).then((_) => _loadAreas()),
          onDelete: () =>
              AreaService.deleteArea(area['id']).then((_) => _loadAreas()),
        ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.1, end: 0);
      },
    );
  }

  Widget _buildAreaListView() {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: _areas.length,
      itemBuilder: (context, index) {
        final area = _areas[index];
        return ListTile(
          leading: Text(
            area['icon'] ?? '📌',
            style: const TextStyle(fontSize: 20),
          ),
          title: Text(
            area['title'] ?? 'Untitled',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          subtitle: Text(
            area['description'] ?? '',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          trailing: IconButton(
            icon: const Icon(
              LucideIcons.trash2,
              size: 16,
              color: Colors.redAccent,
            ),
            onPressed: () =>
                AreaService.deleteArea(area['id']).then((_) => _loadAreas()),
          ),
        );
      },
    );
  }

  Widget _buildAreaTableView() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTableHeader(),
            ..._areas.map((a) => _buildTableRow(a)),
            _buildTableFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: const Row(
        children: [
          _TableCell(text: 'Icon', width: 60, isHeader: true),
          _TableCell(text: 'Title', width: 250, isHeader: true),
          _TableCell(text: 'Description', width: 400, isHeader: true),
          _TableCell(text: 'Color', width: 100, isHeader: true),
        ],
      ),
    );
  }

  Widget _buildTableRow(dynamic area) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Row(
        children: [
          _TableCell(text: area['icon'] ?? '📌', width: 60),
          _TableCell(text: area['title'] ?? '', width: 250),
          _TableCell(text: area['description'] ?? '', width: 400),
          _TableCell(
            width: 100,
            child: Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: _parseColor(area['color']),
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTableFooter() {
    return InkWell(
      onTap: _addArea,
      child: const Padding(
        padding: EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        child: Row(
          children: [
            Icon(LucideIcons.plus, size: 14, color: AppTheme.notionMuted),
            SizedBox(width: 8),
            Text(
              'New',
              style: TextStyle(fontSize: 13, color: AppTheme.notionMuted),
            ),
          ],
        ),
      ),
    );
  }

  Color _parseColor(dynamic color) {
    if (color is Color) return color;
    if (color is String && color.startsWith('#')) {
      return Color(int.parse(color.substring(1), radix: 16) + 0xFF000000);
    }
    return Colors.grey;
  }
}

class _AreaCard extends StatelessWidget {
  final String id;
  final String title;
  final String icon;
  final String? description;
  final Color color;
  final Function(Map<String, dynamic>) onUpdate;
  final VoidCallback onDelete;

  const _AreaCard({
    required this.id,
    required this.title,
    required this.icon,
    this.description,
    required this.color,
    required this.onUpdate,
    required this.onDelete,
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
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            left: -20,
            top: -20,
            bottom: -20,
            child: Container(
              width: 4,
              decoration: BoxDecoration(
                color: color,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  bottomLeft: Radius.circular(16),
                ),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(icon, style: const TextStyle(fontSize: 20)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.notionText,
                        letterSpacing: -0.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildActionButton(LucideIcons.trash2, Colors.redAccent, onDelete),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                description != null && description!.isNotEmpty
                    ? description!
                    : 'No description provided for this area...',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.notionMuted,
                  height: 1.4,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
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

  const _TableCell({
    this.text,
    this.child,
    required this.width,
    this.isHeader = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(
        border: Border(right: BorderSide(color: AppTheme.notionBorder)),
      ),
      alignment: Alignment.centerLeft,
      child:
          child ??
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
