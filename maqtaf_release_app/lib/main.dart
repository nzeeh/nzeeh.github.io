import 'package:flutter/material.dart';

void main() {
  runApp(const MaqtafApp());
}

class Brand {
  static const aqeeq = Color(0xFF7B2334);
  static const aqeeqDark = Color(0xFF4D1824);
  static const indigo = Color(0xFF173B55);
  static const gold = Color(0xFFD9A441);
  static const henna = Color(0xFFB9573D);
  static const olive = Color(0xFF51633A);
  static const linen = Color(0xFFF6F0E4);
  static const ivory = Color(0xFFFFFDF8);
  static const ink = Color(0xFF241C1D);
  static const muted = Color(0xFF716668);
  static const live = Color(0xFFD9383E);
}

class MaqtafApp extends StatelessWidget {
  const MaqtafApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'مَقْطَف',
      debugShowCheckedModeBanner: false,
      locale: const Locale('ar'),
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: Brand.ivory,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Brand.aqeeq,
          primary: Brand.aqeeq,
          secondary: Brand.gold,
          surface: Brand.ivory,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Brand.ivory,
          foregroundColor: Brand.ink,
          centerTitle: false,
          surfaceTintColor: Colors.transparent,
        ),
      ),
      home: const Directionality(
        textDirection: TextDirection.rtl,
        child: MainShell(),
      ),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const HomeScreen(),
      const LiveHubScreen(),
      const PlaceholderScreen(
        icon: Icons.shopping_basket_rounded,
        title: 'سلّتك',
        body: 'أضف منتجات المزارعين ثم أكمل طلبك.',
      ),
      const PlaceholderScreen(
        icon: Icons.local_shipping_outlined,
        title: 'طلباتي',
        body: 'تتبّع الطلب من تأكيد المزارع حتى وصول السائق.',
      ),
      const AccountScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: selectedIndex, children: pages),
      bottomNavigationBar: NavigationBar(
        height: 72,
        backgroundColor: Colors.white,
        indicatorColor: Brand.linen,
        selectedIndex: selectedIndex,
        onDestinationSelected: (value) {
          setState(() {
            selectedIndex = value;
          });
        },
        destinations: const <NavigationDestination>[
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'الرئيسية',
          ),
          NavigationDestination(
            icon: LiveNavigationIcon(),
            selectedIcon: LiveNavigationIcon(selected: true),
            label: 'مباشر',
          ),
          NavigationDestination(
            icon: Icon(Icons.shopping_basket_outlined),
            selectedIcon: Icon(Icons.shopping_basket_rounded),
            label: 'السلة',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long_rounded),
            label: 'طلباتي',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'حسابي',
          ),
        ],
      ),
    );
  }
}

class LiveNavigationIcon extends StatelessWidget {
  final bool selected;

  const LiveNavigationIcon({super.key, this.selected = false});

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: <Widget>[
        Icon(
          selected ? Icons.live_tv_rounded : Icons.live_tv_outlined,
          color: selected ? Brand.live : null,
        ),
        Positioned(
          top: -4,
          left: -4,
          child: Container(
            width: 9,
            height: 9,
            decoration: BoxDecoration(
              color: Brand.live,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
            ),
          ),
        ),
      ],
    );
  }
}

class TextileStrip extends StatelessWidget {
  const TextileStrip({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 9,
      child: Row(
        children: List<Widget>.generate(
          18,
          (index) => Expanded(
            child: Container(
              color: index.isEven ? Brand.aqeeq : Brand.gold,
              child: Center(
                child: Transform.rotate(
                  angle: 0.78,
                  child: Container(
                    width: 5,
                    height: 5,
                    color: Brand.linen,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class BrandLogo extends StatelessWidget {
  final bool light;

  const BrandLogo({super.key, this.light = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: <Color>[Brand.aqeeq, Brand.aqeeqDark],
            ),
            borderRadius: BorderRadius.circular(15),
          ),
          child: const Stack(
            alignment: Alignment.center,
            children: <Widget>[
              Positioned(
                top: 8,
                right: 8,
                child: Icon(Icons.wb_sunny_rounded, color: Brand.gold, size: 13),
              ),
              Positioned(
                bottom: 7,
                child: Icon(Icons.shopping_basket_rounded, color: Brand.linen, size: 29),
              ),
            ],
          ),
        ),
        const SizedBox(width: 9),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              'مَقْطَف',
              style: TextStyle(
                color: light ? Colors.white : Brand.aqeeq,
                fontWeight: FontWeight.w900,
                fontSize: 23,
                height: 1,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'من المزارع إلى بيتك',
              style: TextStyle(
                color: light ? Colors.white70 : Brand.indigo,
                fontSize: 9,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: <Widget>[
        const SliverToBoxAdapter(child: TextileStrip()),
        SliverAppBar(
          pinned: true,
          toolbarHeight: 70,
          title: const BrandLogo(),
          actions: <Widget>[
            TextButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.location_on_outlined, size: 17),
              label: const Text('صنعاء'),
            ),
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.notifications_none_rounded),
            ),
            const SizedBox(width: 4),
          ],
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
          sliver: SliverList(
            delegate: SliverChildListDelegate(<Widget>[
              TextField(
                decoration: InputDecoration(
                  hintText: 'ابحث عن طماطم، بُن، عسل، عنب...',
                  prefixIcon: const Icon(Icons.search_rounded, color: Brand.aqeeq),
                  suffixIcon: Padding(
                    padding: const EdgeInsets.all(6),
                    child: FilledButton(
                      onPressed: () {},
                      style: FilledButton.styleFrom(backgroundColor: Brand.indigo),
                      child: const Text('بحث'),
                    ),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: const BorderSide(color: Color(0xFFEADFCF)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: const BorderSide(color: Color(0xFFEADFCF)),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              const HeroBanner(),
              const SizedBox(height: 24),
              const SectionHeader(title: 'تسوّق حسب الفئة', action: 'عرض الكل'),
              const SizedBox(height: 10),
              const CategoryList(),
              const SizedBox(height: 25),
              const SectionHeader(
                title: 'مباشر من المزرعة',
                action: 'كل البثوث',
                isLive: true,
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 225,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: const <Widget>[
                    LivePreviewCard(
                      title: 'حصاد الطماطم هذا الصباح',
                      farm: 'مزرعة وادي ظهر',
                      emoji: '🍅',
                      viewers: '284',
                      start: Color(0xFF7E966B),
                      end: Color(0xFF314A35),
                    ),
                    SizedBox(width: 11),
                    LivePreviewCard(
                      title: 'افحص عسل السدر معنا',
                      farm: 'مناحل دوعن',
                      emoji: '🍯',
                      viewers: '116',
                      start: Color(0xFFE5BD68),
                      end: Color(0xFF895234),
                    ),
                    SizedBox(width: 11),
                    LivePreviewCard(
                      title: 'رحلة البُن من الشجرة',
                      farm: 'مزارعو حراز',
                      emoji: '☕',
                      viewers: '92',
                      start: Color(0xFFB39678),
                      end: Color(0xFF4C3226),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 25),
              const SectionHeader(
                title: 'حصاد اليوم',
                subtitle: 'منتجات أضيفت خلال الساعات الماضية',
                action: 'المزيد',
              ),
              const SizedBox(height: 10),
              const ProductGrid(),
            ]),
          ),
        ),
      ],
    );
  }
}

class HeroBanner extends StatelessWidget {
  const HeroBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 305,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
          colors: <Color>[Brand.aqeeq, Brand.aqeeqDark],
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x337B2334),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Stack(
        children: <Widget>[
          Positioned(
            left: -55,
            bottom: -70,
            child: Container(
              width: 280,
              height: 180,
              decoration: BoxDecoration(
                color: Brand.indigo.withOpacity(0.50),
                borderRadius: const BorderRadius.all(Radius.elliptical(280, 180)),
              ),
            ),
          ),
          Positioned(
            left: -15,
            bottom: -20,
            child: Container(
              width: 245,
              height: 130,
              decoration: BoxDecoration(
                color: Brand.gold.withOpacity(0.20),
                borderRadius: const BorderRadius.all(Radius.elliptical(245, 130)),
              ),
            ),
          ),
          const Positioned(top: 0, right: 0, left: 0, child: TextileStrip()),
          Padding(
            padding: const EdgeInsets.all(23),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Brand.gold,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'حصادٌ تعرف مصدره',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'خيرات اليمن\nمن يد المزارع إلى بيتك',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 29,
                    height: 1.25,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const Spacer(),
                FilledButton.icon(
                  onPressed: () {},
                  style: FilledButton.styleFrom(
                    backgroundColor: Brand.gold,
                    foregroundColor: Brand.ink,
                  ),
                  icon: const Icon(Icons.arrow_back_rounded),
                  label: const Text(
                    'تسوّق حصاد اليوم',
                    style: TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ],
            ),
          ),
          const Positioned(left: 15, bottom: 4, child: Text('🧺', style: TextStyle(fontSize: 91))),
          const Positioned(left: 58, bottom: 72, child: Text('🍅', style: TextStyle(fontSize: 37))),
          const Positioned(left: 21, bottom: 61, child: Text('🍇', style: TextStyle(fontSize: 37))),
          const Positioned(left: 115, bottom: 58, child: Text('☕', style: TextStyle(fontSize: 34))),
        ],
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String action;
  final bool isLive;

  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    required this.action,
    this.isLive = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        if (isLive) ...<Widget>[
          Container(
            width: 9,
            height: 9,
            decoration: const BoxDecoration(color: Brand.live, shape: BoxShape.circle),
          ),
          const SizedBox(width: 7),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                title,
                style: const TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                  color: Brand.indigo,
                ),
              ),
              if (subtitle != null)
                Text(
                  subtitle!,
                  style: const TextStyle(fontSize: 10, color: Brand.muted),
                ),
            ],
          ),
        ),
        TextButton(onPressed: () {}, child: Text(action)),
      ],
    );
  }
}

class CategoryList extends StatelessWidget {
  const CategoryList({super.key});

  @override
  Widget build(BuildContext context) {
    final categories = <Map<String, Object>>[
      <String, Object>{'icon': '🥬', 'name': 'خضروات', 'color': const Color(0xFFE7EDDA)},
      <String, Object>{'icon': '🍎', 'name': 'فواكه', 'color': const Color(0xFFF7DFDC)},
      <String, Object>{'icon': '☕', 'name': 'البُن', 'color': const Color(0xFFE5D4C4)},
      <String, Object>{'icon': '🍯', 'name': 'العسل', 'color': const Color(0xFFF8E7B7)},
      <String, Object>{'icon': '🌾', 'name': 'حبوب', 'color': const Color(0xFFEEE0BD)},
      <String, Object>{'icon': '🥚', 'name': 'ألبان', 'color': const Color(0xFFE0EDF0)},
    ];

    return SizedBox(
      height: 103,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (BuildContext context, int index) => const SizedBox(width: 10),
        itemBuilder: (BuildContext context, int index) {
          final category = categories[index];
          return SizedBox(
            width: 75,
            child: Column(
              children: <Widget>[
                Container(
                  width: 61,
                  height: 61,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: category['color']! as Color,
                    borderRadius: BorderRadius.circular(19),
                  ),
                  child: Text(
                    category['icon']! as String,
                    style: const TextStyle(fontSize: 30),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  category['name']! as String,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class LivePreviewCard extends StatelessWidget {
  final String title;
  final String farm;
  final String emoji;
  final String viewers;
  final Color start;
  final Color end;

  const LivePreviewCard({
    super.key,
    required this.title,
    required this.farm,
    required this.emoji,
    required this.viewers,
    required this.start,
    required this.end,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 185,
      child: Card(
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(21),
          side: const BorderSide(color: Color(0xFFEADFCF)),
        ),
        child: InkWell(
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (BuildContext context) => LiveRoomScreen(
                  title: title,
                  farm: farm,
                  emoji: emoji,
                ),
              ),
            );
          },
          child: Column(
            children: <Widget>[
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: <Color>[start, end],
                    ),
                  ),
                  child: Stack(
                    children: <Widget>[
                      Center(child: Text(emoji, style: const TextStyle(fontSize: 66))),
                      Positioned(
                        top: 9,
                        right: 9,
                        child: _LivePill(text: '● مباشر', color: Brand.live),
                      ),
                      Positioned(
                        top: 9,
                        left: 9,
                        child: _LivePill(text: '👁 $viewers', color: Colors.black45),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 3),
                    Text(farm, style: const TextStyle(fontSize: 9, color: Brand.muted)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LivePill extends StatelessWidget {
  final String text;
  final Color color;

  const _LivePill({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(15)),
      child: Text(
        text,
        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900),
      ),
    );
  }
}

class ProductGrid extends StatelessWidget {
  const ProductGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final products = <Map<String, Object>>[
      <String, Object>{'emoji': '🍅', 'tag': 'قُطف اليوم', 'name': 'طماطم بلدية', 'farm': 'وادي ظهر · صنعاء', 'price': '850', 'unit': 'كجم', 'color': const Color(0xFFF5DED8)},
      <String, Object>{'emoji': '🍇', 'tag': 'موسمي', 'name': 'عنب رازقي', 'farm': 'بساتين صعدة', 'price': '4,600', 'unit': 'صندوق', 'color': const Color(0xFFE9E0EF)},
      <String, Object>{'emoji': '☕', 'tag': 'من المصدر', 'name': 'بُن حرازي', 'farm': 'مزارعو حراز', 'price': '7,900', 'unit': '500 جم', 'color': const Color(0xFFE3D4C0)},
      <String, Object>{'emoji': '🍯', 'tag': 'مختبر ✓', 'name': 'عسل سدر', 'farm': 'مناحل دوعن', 'price': '18,500', 'unit': '500 جم', 'color': const Color(0xFFF2DFAE)},
    ];

    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: products.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.66,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemBuilder: (BuildContext context, int index) {
        final product = products[index];
        return Card(
          margin: EdgeInsets.zero,
          clipBehavior: Clip.antiAlias,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(21),
            side: const BorderSide(color: Color(0xFFEADFCF)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: Container(
                  color: product['color']! as Color,
                  width: double.infinity,
                  child: Stack(
                    children: <Widget>[
                      Center(
                        child: Text(
                          product['emoji']! as String,
                          style: const TextStyle(fontSize: 65),
                        ),
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                          decoration: BoxDecoration(
                            color: Brand.olive,
                            borderRadius: BorderRadius.circular(9),
                          ),
                          child: Text(
                            product['tag']! as String,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 7,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 2,
                        left: 2,
                        child: IconButton(
                          onPressed: () {},
                          icon: const Icon(Icons.favorite_border_rounded, color: Brand.aqeeq),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      product['farm']! as String,
                      style: const TextStyle(fontSize: 8, color: Brand.olive, fontWeight: FontWeight.w800),
                    ),
                    Text(
                      product['name']! as String,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                    ),
                    const Text('★ 4.9  ·  متوفر الآن', style: TextStyle(fontSize: 8, color: Brand.muted)),
                    const Divider(),
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: Text.rich(
                            TextSpan(
                              children: <InlineSpan>[
                                TextSpan(
                                  text: product['price']! as String,
                                  style: const TextStyle(
                                    color: Brand.aqeeq,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                TextSpan(
                                  text: ' ر.ي / ${product['unit']! as String}',
                                  style: const TextStyle(color: Brand.aqeeq, fontSize: 8),
                                ),
                              ],
                            ),
                          ),
                        ),
                        SizedBox(
                          width: 33,
                          height: 33,
                          child: FilledButton(
                            onPressed: () {},
                            style: FilledButton.styleFrom(
                              backgroundColor: Brand.indigo,
                              padding: EdgeInsets.zero,
                            ),
                            child: const Icon(Icons.add_rounded, size: 17),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class LiveHubScreen extends StatelessWidget {
  const LiveHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 74,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text('مباشر من المزرعة', style: TextStyle(fontWeight: FontWeight.w900)),
            Text(
              'شاهد المنتج واسأل المزارع قبل الشراء',
              style: TextStyle(fontSize: 9, color: Brand.muted),
            ),
          ],
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(9),
          child: TextileStrip(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 17, 16, 100),
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Brand.linen, borderRadius: BorderRadius.circular(18)),
            child: Row(
              children: <Widget>[
                const Icon(Icons.verified_rounded, color: Brand.olive),
                const SizedBox(width: 9),
                const Expanded(
                  child: Text(
                    'البث متاح للمزارعين الموثّقين لحماية المشترين.',
                    style: TextStyle(fontSize: 10),
                  ),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(builder: (BuildContext context) => const BroadcastSetupScreen()),
                    );
                  },
                  child: const Text('ابدأ بثًا'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 15),
          const LiveWideCard(
            title: 'حصاد الطماطم هذا الصباح',
            farm: 'مزرعة وادي ظهر',
            place: 'صنعاء',
            emoji: '🍅',
            viewers: 284,
            likes: 1820,
            start: Color(0xFF7E966B),
            end: Color(0xFF314A35),
          ),
          const SizedBox(height: 13),
          const LiveWideCard(
            title: 'اختبار عسل السدر أمامكم',
            farm: 'مناحل دوعن',
            place: 'حضرموت',
            emoji: '🍯',
            viewers: 116,
            likes: 947,
            start: Color(0xFFE5BD68),
            end: Color(0xFF895234),
          ),
          const SizedBox(height: 13),
          const LiveWideCard(
            title: 'قطف وتجفيف البُن الحرازي',
            farm: 'تعاونية حراز',
            place: 'صنعاء',
            emoji: '☕',
            viewers: 92,
            likes: 611,
            start: Color(0xFFB39678),
            end: Color(0xFF4C3226),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (BuildContext context) => const BroadcastSetupScreen()),
          );
        },
        backgroundColor: Brand.live,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.videocam_rounded),
        label: const Text('ابدأ بثًا', style: TextStyle(fontWeight: FontWeight.w900)),
      ),
    );
  }
}

class LiveWideCard extends StatelessWidget {
  final String title;
  final String farm;
  final String place;
  final String emoji;
  final int viewers;
  final int likes;
  final Color start;
  final Color end;

  const LiveWideCard({
    super.key,
    required this.title,
    required this.farm,
    required this.place,
    required this.emoji,
    required this.viewers,
    required this.likes,
    required this.start,
    required this.end,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(22),
        side: const BorderSide(color: Color(0xFFEADFCF)),
      ),
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (BuildContext context) => LiveRoomScreen(
                title: title,
                farm: farm,
                emoji: emoji,
              ),
            ),
          );
        },
        child: Column(
          children: <Widget>[
            Container(
              height: 215,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: <Color>[start, end],
                ),
              ),
              child: Stack(
                children: <Widget>[
                  Center(child: Text(emoji, style: const TextStyle(fontSize: 90))),
                  const Positioned(
                    top: 12,
                    right: 12,
                    child: _LivePill(text: '● مباشر', color: Brand.live),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: _LivePill(
                      text: '👁 $viewers   ♥ $likes',
                      color: Colors.black45,
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: _LivePill(text: place, color: Colors.black45),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(13),
              child: Row(
                children: <Widget>[
                  CircleAvatar(
                    backgroundColor: Brand.aqeeq,
                    foregroundColor: Colors.white,
                    child: Text(farm.substring(0, 1)),
                  ),
                  const SizedBox(width: 9),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
                        Text(
                          '$farm · موثّق ✓',
                          style: const TextStyle(fontSize: 9, color: Brand.muted),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_back_ios_new_rounded, size: 15, color: Brand.aqeeq),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class LiveRoomScreen extends StatefulWidget {
  final String title;
  final String farm;
  final String emoji;
  final bool broadcaster;

  const LiveRoomScreen({
    super.key,
    required this.title,
    required this.farm,
    required this.emoji,
    this.broadcaster = false,
  });

  @override
  State<LiveRoomScreen> createState() => _LiveRoomScreenState();
}

class _LiveRoomScreenState extends State<LiveRoomScreen> {
  int likes = 1820;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E3125),
      body: Stack(
        children: <Widget>[
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: <Color>[
                    Color(0xFFA2B19A),
                    Color(0xFF547052),
                    Color(0xFF203527),
                  ],
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text(widget.emoji, style: const TextStyle(fontSize: 130)),
                    const Icon(Icons.videocam_rounded, color: Colors.white54, size: 34),
                    const Text(
                      'معاينة البث المباشر',
                      style: TextStyle(color: Colors.white70, fontSize: 10),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 9, 12, 13),
              child: Column(
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      CircleAvatar(
                        backgroundColor: Brand.aqeeq,
                        foregroundColor: Colors.white,
                        child: Text(widget.farm.substring(0, 1)),
                      ),
                      const SizedBox(width: 7),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              widget.farm,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            Text(
                              widget.broadcaster ? 'أنت تبث الآن' : '284 مشاهدًا · موثّق ✓',
                              style: const TextStyle(color: Colors.white70, fontSize: 8),
                            ),
                          ],
                        ),
                      ),
                      if (!widget.broadcaster)
                        FilledButton(
                          onPressed: () {},
                          style: FilledButton.styleFrom(backgroundColor: Brand.live),
                          child: const Text('متابعة'),
                        ),
                      const SizedBox(width: 5),
                      IconButton.filledTonal(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                      decoration: BoxDecoration(
                        color: Brand.live,
                        borderRadius: BorderRadius.circular(17),
                      ),
                      child: Text(
                        '● مباشر · ${widget.title}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                  const Spacer(),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: <Widget>[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            _Comment(name: 'أم محمد', text: 'هل التوصيل متاح إلى شارع حدة؟'),
                            _Comment(name: widget.farm, text: 'نعم، والتوصيل في نفس اليوم 🌿'),
                            const _Comment(name: 'عبدالله', text: 'ما شاء الله، المنتج واضح وطازج'),
                            const SizedBox(height: 7),
                            TextField(
                              style: const TextStyle(color: Colors.white),
                              decoration: InputDecoration(
                                hintText: 'اكتب سؤالًا للمزارع...',
                                hintStyle: const TextStyle(color: Colors.white70, fontSize: 10),
                                suffixIcon: const Icon(Icons.send_rounded, color: Colors.white),
                                filled: true,
                                fillColor: Colors.black38,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(24),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 9),
                      Column(
                        children: <Widget>[
                          FloatingActionButton.small(
                            heroTag: null,
                            onPressed: () {
                              setState(() {
                                likes += 1;
                              });
                            },
                            backgroundColor: Colors.white,
                            foregroundColor: Brand.live,
                            child: const Icon(Icons.favorite_rounded),
                          ),
                          Text(
                            '$likes',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 10),
                          FloatingActionButton.small(
                            heroTag: null,
                            onPressed: () {},
                            backgroundColor: Colors.white,
                            foregroundColor: Brand.indigo,
                            child: const Icon(Icons.share_rounded),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(17),
                    ),
                    child: Row(
                      children: <Widget>[
                        Container(
                          width: 55,
                          height: 55,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF5DED8),
                            borderRadius: BorderRadius.circular(13),
                          ),
                          child: Text(widget.emoji, style: const TextStyle(fontSize: 29)),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                widget.emoji == '🍅'
                                    ? 'طماطم بلدية — قطف اليوم'
                                    : 'منتج المزرعة المثبّت',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                              ),
                              const Text(
                                '850 ر.ي / كجم',
                                style: TextStyle(
                                  color: Brand.aqeeq,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14,
                                ),
                              ),
                              const Text('متوفر 42 كجم', style: TextStyle(fontSize: 7, color: Brand.muted)),
                            ],
                          ),
                        ),
                        FilledButton(
                          onPressed: () {},
                          style: FilledButton.styleFrom(backgroundColor: Brand.aqeeq),
                          child: Text(widget.broadcaster ? 'تغيير' : 'أضف للسلة'),
                        ),
                      ],
                    ),
                  ),
                  if (widget.broadcaster) ...<Widget>[
                    const SizedBox(height: 8),
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {},
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Colors.white54),
                            ),
                            icon: const Icon(Icons.flip_camera_android_rounded),
                            label: const Text('تبديل الكاميرا'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: FilledButton.icon(
                            onPressed: () => Navigator.of(context).pop(),
                            style: FilledButton.styleFrom(backgroundColor: Brand.live),
                            icon: const Icon(Icons.stop_circle_outlined),
                            label: const Text('إنهاء البث'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Comment extends StatelessWidget {
  final String name;
  final String text;

  const _Comment({required this.name, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 5),
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black38,
        borderRadius: BorderRadius.circular(13),
      ),
      child: Text.rich(
        TextSpan(
          children: <InlineSpan>[
            TextSpan(
              text: '$name: ',
              style: const TextStyle(
                color: Color(0xFFFFD77D),
                fontWeight: FontWeight.w900,
              ),
            ),
            TextSpan(text: text),
          ],
        ),
        style: const TextStyle(color: Colors.white, fontSize: 9),
      ),
    );
  }
}

class BroadcastSetupScreen extends StatefulWidget {
  const BroadcastSetupScreen({super.key});

  @override
  State<BroadcastSetupScreen> createState() => _BroadcastSetupScreenState();
}

class _BroadcastSetupScreenState extends State<BroadcastSetupScreen> {
  bool cameraEnabled = true;
  bool microphoneEnabled = true;
  bool commentsEnabled = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تجهيز البث', style: TextStyle(fontWeight: FontWeight.w900)),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(9),
          child: TextileStrip(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          Container(
            height: 245,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: <Color>[Color(0xFF849A70), Color(0xFF334E39)],
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Stack(
              children: <Widget>[
                const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Icon(Icons.videocam_rounded, color: Colors.white, size: 50),
                      Text(
                        'معاينة الكاميرا',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  bottom: 12,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      IconButton.filled(
                        onPressed: () {
                          setState(() {
                            cameraEnabled = !cameraEnabled;
                          });
                        },
                        icon: Icon(
                          cameraEnabled ? Icons.videocam_rounded : Icons.videocam_off_rounded,
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: () {
                          setState(() {
                            microphoneEnabled = !microphoneEnabled;
                          });
                        },
                        icon: Icon(
                          microphoneEnabled ? Icons.mic_rounded : Icons.mic_off_rounded,
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: () {},
                        icon: const Icon(Icons.flip_camera_android_rounded),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            decoration: InputDecoration(
              labelText: 'عنوان البث',
              hintText: 'مثال: حصاد الطماطم هذا الصباح',
              prefixIcon: const Icon(Icons.title_rounded),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
          const SizedBox(height: 11),
          Card(
            child: ListTile(
              leading: Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFFF5DED8),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text('🍅', style: TextStyle(fontSize: 26)),
              ),
              title: const Text('المنتج المثبّت', style: TextStyle(fontSize: 10, color: Brand.muted)),
              subtitle: const Text(
                'طماطم بلدية · 850 ر.ي / كجم',
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
              trailing: const Icon(Icons.chevron_left_rounded),
            ),
          ),
          Card(
            child: SwitchListTile(
              value: commentsEnabled,
              onChanged: (bool value) {
                setState(() {
                  commentsEnabled = value;
                });
              },
              secondary: const Icon(Icons.chat_bubble_outline_rounded),
              title: const Text('السماح بالتعليقات'),
              subtitle: const Text(
                'يمكن كتم مستخدم أو الإبلاغ عنه',
                style: TextStyle(fontSize: 9),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(13),
            decoration: BoxDecoration(
              color: Brand.linen,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Icon(Icons.verified_user_outlined, color: Brand.olive),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'سيظهر اسم مزرعتك وحالة التوثيق. يمنع بث محتوى غير متعلق بالمزرعة أو المنتجات المسجّلة.',
                    style: TextStyle(fontSize: 9, height: 1.6),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: cameraEnabled && microphoneEnabled
                ? () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute<void>(
                        builder: (BuildContext context) => const LiveRoomScreen(
                          title: 'حصاد الطماطم هذا الصباح',
                          farm: 'مزرعة وادي ظهر',
                          emoji: '🍅',
                          broadcaster: true,
                        ),
                      ),
                    );
                  }
                : null,
            style: FilledButton.styleFrom(
              backgroundColor: Brand.live,
              padding: const EdgeInsets.symmetric(vertical: 15),
            ),
            icon: const Icon(Icons.wifi_tethering_rounded),
            label: const Text(
              'ابدأ البث المباشر',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'هذه نسخة واجهة تفاعلية. ربط فيديو الكاميرا الحقيقي يحتاج خادم بث وواجهة API.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 8, color: Brand.muted),
          ),
        ],
      ),
    );
  }
}

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        padding: EdgeInsets.zero,
        children: <Widget>[
          const TextileStrip(),
          Container(
            padding: const EdgeInsets.fromLTRB(18, 54, 18, 24),
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: <Color>[Brand.aqeeq, Brand.aqeeqDark]),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(31)),
            ),
            child: Column(
              children: <Widget>[
                const BrandLogo(light: true),
                const SizedBox(height: 23),
                Row(
                  children: <Widget>[
                    const CircleAvatar(
                      radius: 32,
                      backgroundColor: Brand.gold,
                      foregroundColor: Brand.ink,
                      child: Text(
                        'س',
                        style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900),
                      ),
                    ),
                    const SizedBox(width: 11),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            'سالم أحمد',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          Text(
                            'مزارع موثّق ✓ · صنعاء',
                            style: TextStyle(color: Colors.white70, fontSize: 9),
                          ),
                        ],
                      ),
                    ),
                    IconButton.filledTonal(
                      onPressed: () {},
                      icon: const Icon(Icons.settings_outlined),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 100),
            child: Column(
              children: <Widget>[
                Card(
                  color: Brand.indigo,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (BuildContext context) => const BroadcastSetupScreen(),
                        ),
                      );
                    },
                    child: const Padding(
                      padding: EdgeInsets.all(17),
                      child: Row(
                        children: <Widget>[
                          CircleAvatar(
                            radius: 27,
                            backgroundColor: Brand.live,
                            child: Icon(Icons.videocam_rounded, color: Colors.white, size: 29),
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  'ابدأ بثًا من مزرعتك',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                Text(
                                  'اعرض حصادك وتلقَّ الأسئلة والإعجابات',
                                  style: TextStyle(color: Colors.white70, fontSize: 9),
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 15),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 11),
                const Card(
                  child: Column(
                    children: <Widget>[
                      AccountTile(
                        icon: Icons.storefront_outlined,
                        title: 'متجر المزرعة',
                        subtitle: 'المنتجات والمخزون',
                      ),
                      Divider(height: 1, indent: 62),
                      AccountTile(
                        icon: Icons.receipt_long_outlined,
                        title: 'طلبات المزرعة',
                        subtitle: 'التأكيد والتجهيز',
                      ),
                      Divider(height: 1, indent: 62),
                      AccountTile(
                        icon: Icons.account_balance_wallet_outlined,
                        title: 'الأرباح والمستحقات',
                        subtitle: 'الرصيد وسجل التسويات',
                      ),
                      Divider(height: 1, indent: 62),
                      AccountTile(
                        icon: Icons.insights_outlined,
                        title: 'إحصاءات البث',
                        subtitle: 'المشاهدات والإعجابات والمبيعات',
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class AccountTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const AccountTile({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 39,
        height: 39,
        decoration: BoxDecoration(color: Brand.linen, borderRadius: BorderRadius.circular(11)),
        child: Icon(icon, color: Brand.aqeeq, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 8)),
      trailing: const Icon(Icons.chevron_left_rounded),
    );
  }
}

class PlaceholderScreen extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;

  const PlaceholderScreen({
    super.key,
    required this.icon,
    required this.title,
    required this.body,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(9),
          child: TextileStrip(),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: Brand.linen,
                  borderRadius: BorderRadius.circular(31),
                ),
                child: Icon(icon, size: 48, color: Brand.aqeeq),
              ),
              const SizedBox(height: 15),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Brand.indigo,
                ),
              ),
              const SizedBox(height: 6),
              Text(body, textAlign: TextAlign.center, style: const TextStyle(color: Brand.muted)),
              const SizedBox(height: 17),
              FilledButton(onPressed: () {}, child: const Text('تصفح المنتجات')),
            ],
          ),
        ),
      ),
    );
  }
}
