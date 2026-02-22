import 'package:flutter/material.dart';
import 'package:second_brain_flutter/theme/app_theme.dart';
import 'package:second_brain_flutter/screens/landing_page.dart';
import 'package:second_brain_flutter/screens/login_page.dart';
import 'package:second_brain_flutter/screens/register_page.dart';
import 'package:second_brain_flutter/widgets/main_layout.dart';
import 'package:second_brain_flutter/services/auth_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  final loggedIn = await AuthService.isLoggedIn();
  runApp(SecondBrainApp(initialRoute: loggedIn ? '/dashboard' : '/'));
}

class SecondBrainApp extends StatelessWidget {
  final String initialRoute;
  const SecondBrainApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Second Brain',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: initialRoute,
      routes: {
        '/': (context) => const LandingPage(),
        '/login': (context) => const LoginPage(),
        '/register': (context) => const RegisterPage(),
        '/dashboard': (context) => const MainLayout(initialPath: '/dashboard'),
        '/tasks': (context) => const MainLayout(initialPath: '/tasks'),
        '/projects': (context) => const MainLayout(initialPath: '/projects'),
        '/goals': (context) => const MainLayout(initialPath: '/goals'),
        '/notes': (context) => const MainLayout(initialPath: '/notes'),
        '/journal': (context) => const MainLayout(initialPath: '/journal'),
        '/resources': (context) => const MainLayout(initialPath: '/resources'),
        '/areas': (context) => const MainLayout(initialPath: '/areas'),
        '/archive': (context) => const MainLayout(initialPath: '/archive'),
      },
    );
  }
}
