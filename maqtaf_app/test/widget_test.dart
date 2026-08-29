import 'package:flutter_test/flutter_test.dart';
import 'package:maqtaf/main.dart';

void main() {
  testWidgets('shows Maqtaf home and live navigation', (tester) async {
    await tester.pumpWidget(const MaqtafApp());
    expect(find.text('مَقْطَف'), findsOneWidget);
    expect(find.text('مباشر'), findsOneWidget);
    expect(find.text('حصاد اليوم'), findsWidgets);
  });
}
