import 'package:customer_app_one/main.dart';
import 'package:customer_app_one/customer_app.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows the customer sign-in screen', (tester) async {
    final auth = AuthService();
    await tester.pumpWidget(CustomerApp(auth: auth));
    expect(find.text('Welcome to Stayly'), findsOneWidget);
    auth.dispose();
  });
}
