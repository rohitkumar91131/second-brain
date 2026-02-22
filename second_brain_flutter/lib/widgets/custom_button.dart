import 'package:flutter/material.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:flutter_animate/flutter_animate.dart';

class CustomButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isOutline;
  final bool isFullWidth;
  final List<Color>? gradient;
  final IconData? icon;
  final double? fontSize;
  final EdgeInsets? padding;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isOutline = false,
    this.isFullWidth = false,
    this.gradient,
    this.icon,
    this.fontSize,
    this.padding,
  });

  @override
  State<CustomButton> createState() => _CustomButtonState();
}

class _CustomButtonState extends State<CustomButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final effectiveGradient = widget.gradient ?? AppTheme.sexyGradient;
    
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedScale(
        scale: _isHovered ? 1.02 : 1.0,
        duration: 150.ms,
        curve: Curves.easeOutCubic,
        child: Container(
          width: widget.isFullWidth ? double.infinity : null,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            gradient: !widget.isOutline ? LinearGradient(
              colors: effectiveGradient,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ) : null,
            border: widget.isOutline ? Border.all(color: AppTheme.notionBorder) : null,
            boxShadow: [
              if (!widget.isOutline)
                BoxShadow(
                  color: effectiveGradient.first.withOpacity(0.3),
                  blurRadius: _isHovered ? 12 : 8,
                  offset: const Offset(0, 4),
                ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.onPressed,
              borderRadius: BorderRadius.circular(8),
              hoverColor: Colors.white.withOpacity(0.1),
              child: Padding(
                padding: widget.padding ?? const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (widget.icon != null) ...[
                      Icon(
                        widget.icon,
                        size: (widget.fontSize ?? 14) + 2,
                        color: widget.isOutline ? AppTheme.notionText : Colors.white,
                      ),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      widget.text,
                      style: TextStyle(
                        color: widget.isOutline ? AppTheme.notionText : Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: widget.fontSize ?? 14,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    ).animate().fadeIn(duration: 400.ms);
  }
}
