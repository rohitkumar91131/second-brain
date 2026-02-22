import 'package:flutter/material.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/widgets/custom_button.dart';
import 'package:second_brain_flutter/widgets/input_field.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:second_brain_flutter/services/auth_service.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleRegister() async {
    if (_nameController.text.isEmpty || 
        _emailController.text.isEmpty || 
        _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final result = await AuthService.register(
      _nameController.text.trim(),
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      if (result.success) {
        Navigator.pushReplacementNamed(context, '/dashboard');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result.message)),
        );
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppTheme.notionText),
          onPressed: () => Navigator.pushReplacementNamed(context, '/'),
        ),
        title: const Text('Back to Home', style: TextStyle(color: AppTheme.notionText, fontSize: 14, fontWeight: FontWeight.w500)),
        titleSpacing: 0,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 20),
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppTheme.notionText,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(LucideIcons.brain, color: Colors.white, size: 24),
                ),
                const SizedBox(height: 32),
                const Text(
                  'Create an account',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Start building your digital second brain today',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.notionMuted),
                ),
                const SizedBox(height: 48),
                InputField(
                  label: 'Full Name',
                  hint: 'John Doe',
                  controller: _nameController,
                ),
                const SizedBox(height: 24),
                InputField(
                  label: 'Email',
                  hint: 'name@example.com',
                  keyboardType: TextInputType.emailAddress,
                  controller: _emailController,
                ),
                const SizedBox(height: 24),
                InputField(
                  label: 'Password',
                  hint: 'Create a password',
                  obscureText: true,
                  controller: _passwordController,
                ),
                const SizedBox(height: 32),
                _isLoading
                    ? const CircularProgressIndicator(color: AppTheme.notionText)
                    : CustomButton(
                        text: 'Create Account',
                        onPressed: _handleRegister,
                        isFullWidth: true,
                        fontSize: 16,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    const Expanded(child: Divider(color: AppTheme.notionBorder)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text('OR', style: TextStyle(color: AppTheme.notionMuted.withOpacity(0.5), fontSize: 12)),
                    ),
                    const Expanded(child: Divider(color: AppTheme.notionBorder)),
                  ],
                ),
                const SizedBox(height: 24),
                CustomButton(
                  text: 'Continue with Google',
                  onPressed: () {},
                  isOutline: true,
                  isFullWidth: true,
                ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Already have an account? ', style: TextStyle(color: AppTheme.notionMuted)),
                    TextButton(
                      onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                      child: const Text('Sign in', style: TextStyle(color: AppTheme.notionText, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
