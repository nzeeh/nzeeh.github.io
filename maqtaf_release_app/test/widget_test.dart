import 'package:flutter_test/flutter_test.dart';
import 'package:maqtaf_release/main.dart';

void main() {
  testWidgets('Maqtaf home renders the Yemeni identity and live tab', (tester) async {
    await tester.pumpWidget(const MaqtafApp());
    await tester.pumpAndSettle();

    expect(find.text('مَقْطَف'), findsOneWidget);
    expect(find.text('مباشر'), findsOneWidget);
    expect(find.text('حصاد اليوم'), findsWidgets);
    expect(find.text('من المزارع إلى بيتك'), findsOneWidget);
  });
}
