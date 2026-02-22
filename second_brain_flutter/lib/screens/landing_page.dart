import 'package:flutter/material.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/widgets/custom_button.dart';
import 'package:second_brain_flutter/widgets/feature_card.dart';
import 'package:second_brain_flutter/screens/login_page.dart';
import 'package:second_brain_flutter/screens/register_page.dart';
import 'package:lucide_icons/lucide_icons.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildNavBar(context),
            _buildHero(context),
            _buildFeatures(context),
            _buildSocialProof(context),
            _buildCTAFooter(context),
            _buildFooter(context),
          ],
        ),
      ),
    );
  }

  Widget _buildNavBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppTheme.notionText,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(LucideIcons.brain, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 8),
              const Text(
                'Second Brain',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          if (MediaQuery.of(context).size.width > 600)
            Row(
              children: [
                TextButton(
                  onPressed: () {},
                  child: const Text('Features', style: TextStyle(color: AppTheme.notionText)),
                ),
                const SizedBox(width: 16),
                TextButton(
                  onPressed: () {},
                  child: const Text('About', style: TextStyle(color: AppTheme.notionText)),
                ),
                const SizedBox(width: 24),
                CustomButton(
                  text: 'Login',
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginPage())),
                  isOutline: true,
                ),
                const SizedBox(width: 12),
                CustomButton(
                  text: 'Get Started',
                  onPressed: () => Navigator.push(
                      context, MaterialPageRoute(builder: (_) => const RegisterPage())),
                ),
              ],
            )
          else
             IconButton(icon: const Icon(Icons.menu), onPressed: () {}),
        ],
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 80, 24, 60),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.sparkles, size: 12, color: Colors.blue),
                SizedBox(width: 8),
                Text(
                  'AI-Powered Life Management',
                  style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Build your Digital Second Brain',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.w900,
              height: 1.1,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'The all-in-one workspace to capture notes, track habits,\nmanage projects, and achieve your goals.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 18, color: AppTheme.notionMuted, height: 1.5),
          ),
          const SizedBox(height: 40),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            alignment: WrapAlignment.center,
            children: [
              CustomButton(
                text: 'Start for Free',
                onPressed: () => Navigator.push(
                    context, MaterialPageRoute(builder: (_) => const RegisterPage())),
                fontSize: 16,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
              CustomButton(
                text: 'View Demo',
                onPressed: () {},
                isOutline: true,
              ),
            ],
          ),
          const SizedBox(height: 80),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(32),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 40,
                  offset: const Offset(0, 20),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(32),
              child: Column(
                children: [
                  Container(
                    height: 32,
                    decoration: const BoxDecoration(
                      color: AppTheme.notionSidebar,
                      border: Border(bottom: BorderSide(color: AppTheme.notionBorder)),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        _buildDot(const Color(0xFFFF5F57)),
                        const SizedBox(width: 6),
                        _buildDot(const Color(0xFFFEBC2E)),
                        const SizedBox(width: 6),
                        _buildDot(const Color(0xFF28C840)),
                      ],
                    ),
                  ),
                  Image.network(
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                    fit: BoxFit.cover,
                    height: 400,
                    width: double.infinity,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot(Color color) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }

  Widget _buildFeatures(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      color: const Color(0xFFFCFCFC),
      child: Column(
        children: [
          const Text(
            'Core Components',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Text(
            'Everything you need to stay organized in one place.',
            style: TextStyle(color: AppTheme.notionMuted, fontSize: 16),
          ),
          const SizedBox(height: 60),
          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth > 800) {
                return const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: FeatureCard(
                      icon: LucideIcons.zap,
                      title: 'Quick Capture',
                      description: 'Instantly add tasks, notes, or ideas from anywhere in the app with our global Ctrl+K search.',
                    )),
                    SizedBox(width: 24),
                    Expanded(child: FeatureCard(
                      icon: LucideIcons.checkCircle,
                      title: 'Task Management',
                      description: 'Track your daily habits and to-dos with simple lists, boards, and calendar views.',
                    )),
                    SizedBox(width: 24),
                    Expanded(child: FeatureCard(
                      icon: LucideIcons.shield,
                      title: 'Secure Knowledge',
                      description: 'Write notes in a clean, Notion-like editor and organize them into specialized life areas.',
                    )),
                  ],
                );
              } else {
                return const Column(
                  children: [
                    FeatureCard(
                      icon: LucideIcons.zap,
                      title: 'Quick Capture',
                      description: 'Instantly add tasks, notes, or ideas from anywhere in the app with our global Ctrl+K search.',
                    ),
                    SizedBox(height: 24),
                    FeatureCard(
                      icon: LucideIcons.checkCircle,
                      title: 'Task Management',
                      description: 'Track your daily habits and to-dos with simple lists, boards, and calendar views.',
                    ),
                    SizedBox(height: 24),
                    FeatureCard(
                      icon: LucideIcons.shield,
                      title: 'Secure Knowledge',
                      description: 'Write notes in a clean, Notion-like editor and organize them into specialized life areas.',
                    ),
                  ],
                );
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSocialProof(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Column(
        children: [
          const Text(
            'TRUSTED BY PRODUCTIVE INDIVIDUALS',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 2,
              color: AppTheme.notionMuted,
            ),
          ),
          const SizedBox(height: 32),
          Wrap(
            spacing: 40,
            runSpacing: 20,
            alignment: WrapAlignment.center,
            children: [
              _buildBrandText('NOTION-ISH', true),
              _buildBrandText('SECOND BRAIN', false),
              _buildBrandText('HABIT TRACKER', false),
              _buildBrandText('PRODUCTIVE', true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBrandText(String text, bool italic) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        fontStyle: italic ? FontStyle.italic : FontStyle.normal,
        color: AppTheme.notionMuted.withOpacity(0.5),
      ),
    );
  }

  Widget _buildCTAFooter(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      padding: const EdgeInsets.all(48),
      decoration: BoxDecoration(
        color: AppTheme.notionText,
        borderRadius: BorderRadius.circular(32),
      ),
      child: Column(
        children: [
          const Text(
            'Reclaim your mental clarity today.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 24),
          const Text(
            'Join thousands of others organizing their lives with our Second Brain system.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 18, color: Colors.white70),
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterPage())),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppTheme.notionText,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
              textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text('Get Started Now'),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppTheme.notionBorder)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(LucideIcons.brain, size: 16, color: AppTheme.notionMuted),
                  SizedBox(width: 8),
                  Text(
                    'Second Brain Tracker',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.notionMuted),
                  ),
                ],
              ),
              Row(
                children: [
                  _buildFooterLink('Privacy'),
                  const SizedBox(width: 24),
                  _buildFooterLink('Terms'),
                  const SizedBox(width: 24),
                  _buildFooterLink('Twitter'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            '© 2026 Second Brain. Built for high performance.',
            style: TextStyle(fontSize: 12, color: AppTheme.notionMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildFooterLink(String text) {
    return Text(
      text,
      style: const TextStyle(fontSize: 12, color: AppTheme.notionMuted, fontWeight: FontWeight.w500),
    );
  }
}
