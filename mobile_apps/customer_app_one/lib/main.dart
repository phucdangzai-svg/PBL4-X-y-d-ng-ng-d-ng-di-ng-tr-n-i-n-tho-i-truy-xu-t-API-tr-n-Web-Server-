import 'package:flutter/material.dart';

import 'customer_app.dart';

const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:3000/api/v1',
);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final auth = AuthService(baseUrl: apiBaseUrl);
  await auth.restoreSession();
  runApp(CustomerApp(auth: auth));
}

class CustomerApp extends StatelessWidget {
  const CustomerApp({super.key, required this.auth});
  final AuthService auth;

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: auth,
        builder: (context, _) => MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Stayly',
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff126e82)),
            useMaterial3: true,
          ),
          home: auth.session == null
              ? LoginScreen(auth: auth)
              : HomeScreen(auth: auth),
        ),
      );
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.auth});
  final AuthService auth;
  @override
  State<LoginScreen> createState() => _LoginState();
}

class _LoginState extends State<LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  String? error;

  Future<void> submit() async {
    setState(() => error = null);
    try {
      await widget.auth.login(email.text, password.text);
    } on ApiException catch (e) {
      setState(() => error = e.message);
    } catch (_) {
      setState(() => error = 'Không thể kết nối đến máy chủ.');
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(28),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(Icons.hotel, size: 64, color: Color(0xff126e82)),
                    const SizedBox(height: 12),
                    Text('Welcome to Stayly',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 32),
                    TextField(
                      controller: email,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: password,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        prefixIcon: Icon(Icons.lock_outline),
                      ),
                    ),
                    if (error != null) ...[
                      const SizedBox(height: 12),
                      Text(error!,
                          style: TextStyle(
                              color: Theme.of(context).colorScheme.error)),
                    ],
                    const SizedBox(height: 24),
                    FilledButton(
                      onPressed: widget.auth.isLoading ? null : submit,
                      child: widget.auth.isLoading
                          ? const CircularProgressIndicator()
                          : const Text('Sign in'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => RegisterScreen(auth: widget.auth)),
                      ),
                      child: const Text('Create an account'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key, required this.auth});
  final AuthService auth;
  @override
  State<RegisterScreen> createState() => _RegisterState();
}

class _RegisterState extends State<RegisterScreen> {
  final name = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final phone = TextEditingController();
  String? error;

  Future<void> submit() async {
    try {
      await widget.auth.register(
        email: email.text,
        password: password.text,
        fullName: name.text,
        phone: phone.text,
      );
      if (mounted) Navigator.pop(context);
    } on ApiException catch (e) {
      setState(() => error = e.message);
    } catch (_) {
      setState(() => error = 'Không thể kết nối đến máy chủ.');
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Create account')),
        body: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            TextField(
                controller: name,
                decoration: const InputDecoration(labelText: 'Full name')),
            TextField(
              controller: email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email (required)'),
            ),
            TextField(
                controller: password,
                obscureText: true,
                decoration:
                    const InputDecoration(labelText: 'Password (at least 8 characters)')),
            TextField(
                controller: phone,
                keyboardType: TextInputType.phone,
                decoration:
                    const InputDecoration(labelText: 'Phone (optional)')),
            if (error != null)
              Text(error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error)),
            const SizedBox(height: 20),
            FilledButton(
                onPressed: widget.auth.isLoading ? null : submit,
                child: const Text('Register')),
          ],
        ),
      );

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    password.dispose();
    phone.dispose();
    super.dispose();
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.auth});
  final AuthService auth;
  @override
  State<HomeScreen> createState() => _HomeState();
}

class _HomeState extends State<HomeScreen> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final token = widget.auth.session!.accessToken;
    final pages = [
      RoomBrowser(
        baseUrl: apiBaseUrl,
        title: 'Danh sách các phòng',
        accent: const Color(0xff126e82),
        accessToken: token,
      ),
      BookingListScreen(baseUrl: apiBaseUrl, accessToken: token),
      AccountScreen(
        baseUrl: apiBaseUrl,
        accessToken: token,
        email: widget.auth.session?.user['email']?.toString() ?? '',
        onLogout: widget.auth.logout,
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Stayly')),
      body: IndexedStack(index: index, children: pages),
      bottomNavigationBar: SafeArea(
        top: false,
        child: NavigationBar(
          selectedIndex: index,
          onDestinationSelected: (value) => setState(() => index = value),
          destinations: const [
            NavigationDestination(
                icon: Icon(Icons.hotel_outlined), label: 'Danh sách phòng'),
            NavigationDestination(
                icon: Icon(Icons.book_online_outlined), label: 'Đặt phòng'),
            NavigationDestination(
                icon: Icon(Icons.account_circle_outlined), label: 'Tài khoản'),
          ],
        ),
      ),
    );
  }
}

class BookingListScreen extends StatefulWidget {
  const BookingListScreen(
      {super.key, required this.baseUrl, required this.accessToken});
  final String baseUrl;
  final String accessToken;
  @override
  State<BookingListScreen> createState() => _BookingListState();
}

class _BookingListState extends State<BookingListScreen> {
  late final BookingService service;
  List<Booking> bookings = const [];
  String? error;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    service = BookingService(
        baseUrl: widget.baseUrl, accessToken: widget.accessToken);
    load();
  }

  Future<void> load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      bookings = await service.getBookings();
    } on ApiException catch (e) {
      error = e.message;
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> cancel(Booking booking) async {
    try {
      await service.cancelBooking(booking.id);
      await load();
    } on ApiException catch (e) {
      if (mounted) setState(() => error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading && bookings.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (error != null && bookings.isEmpty) {
      return Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text(error!),
        FilledButton(onPressed: load, child: const Text('Retry')),
      ]));
    }
    return RefreshIndicator(
      onRefresh: load,
      child: bookings.isEmpty
          ? ListView(children: const [
              SizedBox(height: 180),
              Center(child: Text('No bookings yet.')),
            ])
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              itemBuilder: (_, i) {
                final booking = bookings[i];
                return Card(
                  child: ListTile(
                    title: Text('Booking #${booking.id} - ${booking.status}'),
                    subtitle: Text(
                        'Room ${booking.roomNumber}\n${booking.checkIn} to ${booking.checkOut}'),
                    trailing: booking.status == 'pending' ||
                            booking.status == 'confirmed'
                        ? IconButton(
                            tooltip: 'Cancel',
                            icon: const Icon(Icons.cancel_outlined),
                            onPressed: () => cancel(booking),
                          )
                        : null,
                  ),
                );
              },
            ),
    );
  }

  @override
  void dispose() {
    service.dispose();
    super.dispose();
  }
}

class AccountScreen extends StatefulWidget {
  const AccountScreen({
    super.key,
    required this.baseUrl,
    required this.accessToken,
    required this.email,
    required this.onLogout,
  });
  final String baseUrl;
  final String accessToken;
  final String email;
  final VoidCallback onLogout;
  @override
  State<AccountScreen> createState() => _AccountState();
}

class _AccountState extends State<AccountScreen> {
  final name = TextEditingController();
  final email = TextEditingController();
  final phone = TextEditingController();
  final address = TextEditingController();
  String? message;
  bool loading = false;

  @override
  void initState() {
    super.initState();
    email.text = widget.email;
    load();
  }

  Future<void> load() async {
    try {
      final profile = await CustomerService(
              baseUrl: widget.baseUrl, accessToken: widget.accessToken)
          .getProfile();
      if (!mounted) return;
      name.text = '${profile['full_name'] ?? ''}';
      email.text = '${profile['email'] ?? widget.email}';
      phone.text = '${profile['phone'] ?? ''}';
      address.text = '${profile['address'] ?? ''}';
    } on ApiException catch (e) {
      if (mounted) setState(() => message = e.message);
    }
  }

  Future<void> save() async {
    if (name.text.trim().isEmpty) {
      setState(() => message = 'Full name is required.');
      return;
    }
    setState(() {
      loading = true;
      message = null;
    });
    try {
      await CustomerService(
              baseUrl: widget.baseUrl, accessToken: widget.accessToken)
          .updateProfile(
              fullName: name.text,
              email: email.text,
              phone: phone.text,
              address: address.text);
      if (mounted) setState(() => message = 'Account updated.');
    } on ApiException catch (e) {
      if (mounted) setState(() => message = e.message);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text('Tài khoản', style: Theme.of(context).textTheme.headlineSmall),
          TextField(
              controller: name,
              decoration: const InputDecoration(labelText: 'Full name')),
          TextField(
              controller: email,
              readOnly: true,
              decoration: const InputDecoration(labelText: 'Email')),
          TextField(
              controller: phone,
              keyboardType: TextInputType.phone,
              decoration:
                  const InputDecoration(labelText: 'Phone (optional)')),
          TextField(
              controller: address,
              decoration:
                  const InputDecoration(labelText: 'Address (optional)')),
          if (message != null)
            Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(message!)),
          const SizedBox(height: 20),
          FilledButton(
              onPressed: loading ? null : save, child: const Text('Save')),
          const SizedBox(height: 12),
          OutlinedButton.icon(
              onPressed: widget.onLogout,
              icon: const Icon(Icons.logout),
              label: const Text('Sign out')),
        ],
      );

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    phone.dispose();
    address.dispose();
    super.dispose();
  }
}
