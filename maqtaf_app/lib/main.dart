import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';

void main() => runApp(const MaqtafApp());

class C {
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
        scaffoldBackgroundColor: C.ivory,
        colorScheme: ColorScheme.fromSeed(seedColor: C.aqeeq, primary: C.aqeeq, secondary: C.gold, surface: C.ivory),
        appBarTheme: const AppBarTheme(backgroundColor: C.ivory, foregroundColor: C.ink, surfaceTintColor: Colors.transparent),
      ),
      home: const Directionality(textDirection: TextDirection.rtl, child: Shell()),
    );
  }
}

class Shell extends StatefulWidget {
  const Shell({super.key});
  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int index = 0;
  final pages = const [HomePage(), LiveHub(), EmptyPage(icon: Icons.shopping_basket_rounded, title: 'سلّتك', text: 'منتجان في السلة'), EmptyPage(icon: Icons.local_shipping_outlined, title: 'طلباتي', text: 'تابع الطلب من المزرعة إلى بابك'), AccountPage()];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: index, children: pages),
      bottomNavigationBar: NavigationBar(
        height: 72,
        selectedIndex: index,
        onDestinationSelected: (v) => setState(() => index = v),
        backgroundColor: Colors.white,
        indicatorColor: C.linen,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home_rounded), label: 'الرئيسية'),
          NavigationDestination(icon: LiveIcon(), selectedIcon: LiveIcon(selected: true), label: 'مباشر'),
          NavigationDestination(icon: Badge(label: Text('2'), child: Icon(Icons.shopping_basket_outlined)), selectedIcon: Badge(label: Text('2'), child: Icon(Icons.shopping_basket)), label: 'السلة'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'طلباتي'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'حسابي'),
        ],
      ),
    );
  }
}

class LiveIcon extends StatelessWidget {
  final bool selected;
  const LiveIcon({super.key, this.selected = false});
  @override
  Widget build(BuildContext context) => Stack(clipBehavior: Clip.none, children: [
    Icon(selected ? Icons.live_tv_rounded : Icons.live_tv_outlined, color: selected ? C.live : null),
    Positioned(top: -4, left: -4, child: Container(width: 9, height: 9, decoration: BoxDecoration(color: C.live, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)))),
  ]);
}

class Pattern extends StatelessWidget {
  final double height;
  const Pattern({super.key, this.height = 8});
  @override
  Widget build(BuildContext context) => SizedBox(height: height, width: double.infinity, child: CustomPaint(painter: PatternPainter()));
}

class PatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Offset.zero & size, Paint()..color = C.aqeeq);
    final p = Paint()..color = C.gold..style = PaintingStyle.stroke..strokeWidth = math.max(1.2, size.height * .2);
    final s = size.height * 1.8;
    for (double x = -s; x < size.width + s; x += s) {
      canvas.drawPath(Path()..moveTo(x, size.height / 2)..lineTo(x + s / 2, 0)..lineTo(x + s, size.height / 2)..lineTo(x + s / 2, size.height)..close(), p);
    }
  }
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class Logo extends StatelessWidget {
  final bool small;
  const Logo({super.key, this.small = false});
  @override
  Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, children: [
    Container(width: small ? 44 : 60, height: small ? 44 : 60, decoration: BoxDecoration(gradient: const LinearGradient(colors: [C.aqeeq, C.aqeeqDark]), borderRadius: BorderRadius.circular(small ? 14 : 19)), child: const CustomPaint(painter: LogoPainter())),
    const SizedBox(width: 9),
    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('مَقْطَف', style: TextStyle(fontSize: small ? 23 : 29, height: 1, fontWeight: FontWeight.w900, color: small ? C.aqeeq : Colors.white)), const SizedBox(height: 4), Text('من المزارع إلى بيتك', style: TextStyle(fontSize: small ? 9 : 11, color: small ? C.indigo : Colors.white70))]),
  ]);
}

class LogoPainter extends CustomPainter {
  const LogoPainter();
  @override
  void paint(Canvas canvas, Size s) {
    final ivory = Paint()..color = C.linen..style = PaintingStyle.stroke..strokeWidth = s.width * .065..strokeCap = StrokeCap.round;
    final gold = Paint()..color = C.gold..style = PaintingStyle.stroke..strokeWidth = s.width * .05..strokeCap = StrokeCap.round;
    final basket = Path()..moveTo(s.width * .22, s.height * .49)..lineTo(s.width * .78, s.height * .49)..lineTo(s.width * .69, s.height * .84)..lineTo(s.width * .31, s.height * .84)..close();
    canvas.drawPath(basket, Paint()..color = C.indigo);
    canvas.drawArc(Rect.fromLTWH(s.width * .34, s.height * .28, s.width * .32, s.height * .40), math.pi, math.pi, false, ivory);
    for (final y in [.60, .70]) canvas.drawLine(Offset(s.width * .29, s.height * y), Offset(s.width * .71, s.height * y), gold);
    for (final x in [.40, .50, .60]) canvas.drawLine(Offset(s.width * x, s.height * .52), Offset(s.width * x, s.height * .82), gold);
    canvas.drawCircle(Offset(s.width * .74, s.height * .25), s.width * .085, Paint()..color = C.gold);
  }
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});
  @override
  Widget build(BuildContext context) => CustomScrollView(slivers: [
    const SliverToBoxAdapter(child: Pattern()),
    SliverAppBar(pinned: true, toolbarHeight: 70, title: const Logo(small: true), actions: [TextButton.icon(onPressed: () {}, icon: const Icon(Icons.location_on_outlined, size: 17), label: const Text('صنعاء')), IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_none_rounded)), const SizedBox(width: 4)]),
    SliverPadding(padding: const EdgeInsets.fromLTRB(16, 7, 16, 100), sliver: SliverList(delegate: SliverChildListDelegate([
      TextField(decoration: InputDecoration(hintText: 'ابحث عن طماطم، بُن، عسل، عنب...', prefixIcon: const Icon(Icons.search, color: C.aqeeq), suffixIcon: Padding(padding: const EdgeInsets.all(6), child: FilledButton(onPressed: () {}, style: FilledButton.styleFrom(backgroundColor: C.indigo), child: const Text('بحث'))), filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: Color(0xFFEADFCF))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: const BorderSide(color: Color(0xFFEADFCF))))),
      const SizedBox(height: 14),
      const Hero(),
      const SizedBox(height: 22),
      const TitleRow(title: 'تسوّق حسب الفئة', action: 'عرض الكل'),
      const SizedBox(height: 10),
      const Categories(),
      const SizedBox(height: 24),
      const TitleRow(title: 'مباشر من المزرعة', action: 'كل البثوث', live: true),
      const SizedBox(height: 10),
      SizedBox(height: 230, child: ListView(scrollDirection: Axis.horizontal, children: const [LiveMini(title: 'حصاد الطماطم هذا الصباح', farm: 'مزرعة وادي ظهر', emoji: '🍅', viewers: '284', colors: [Color(0xFF7E966B), Color(0xFF324B35)]), SizedBox(width: 11), LiveMini(title: 'افحص عسل السدر معنا', farm: 'مناحل دوعن', emoji: '🍯', viewers: '116', colors: [Color(0xFFE5BD68), Color(0xFF895234)]), SizedBox(width: 11), LiveMini(title: 'رحلة البُن من الشجرة', farm: 'مزارعو حراز', emoji: '☕', viewers: '92', colors: [Color(0xFFB39678), Color(0xFF4C3226)])])),
      const SizedBox(height: 24),
      const TitleRow(title: 'حصاد اليوم', action: 'المزيد', subtitle: 'أضيف خلال الساعات الماضية'),
      const SizedBox(height: 10),
      const Products(),
    ]))),
  ]);
}

class Hero extends StatelessWidget {
  const Hero({super.key});
  @override
  Widget build(BuildContext context) => Container(height: 305, decoration: BoxDecoration(gradient: const LinearGradient(begin: Alignment.topRight, end: Alignment.bottomLeft, colors: [C.aqeeq, C.aqeeqDark]), borderRadius: BorderRadius.circular(28), boxShadow: const [BoxShadow(color: Color(0x337B2334), blurRadius: 24, offset: Offset(0, 12))]), clipBehavior: Clip.antiAlias, child: Stack(children: [
    const Positioned.fill(child: CustomPaint(painter: TerracePainter())),
    const Positioned(top: 0, right: 0, left: 0, child: Opacity(opacity: .6, child: Pattern(height: 12))),
    Padding(padding: const EdgeInsets.all(23), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5), decoration: BoxDecoration(color: C.gold, borderRadius: BorderRadius.circular(20)), child: const Text('حصادٌ تعرف مصدره', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900))), const SizedBox(height: 12), const Text('خيرات اليمن\nمن يد المزارع إلى بيتك', style: TextStyle(color: Colors.white, fontSize: 29, height: 1.25, fontWeight: FontWeight.w900)), const Spacer(), FilledButton.icon(onPressed: () {}, style: FilledButton.styleFrom(backgroundColor: C.gold, foregroundColor: C.ink), icon: const Icon(Icons.arrow_back), label: const Text('تسوّق حصاد اليوم', style: TextStyle(fontWeight: FontWeight.w900)))])),
    const Positioned(left: 15, bottom: 4, child: Text('🧺', style: TextStyle(fontSize: 91))),
    const Positioned(left: 58, bottom: 72, child: Text('🍅', style: TextStyle(fontSize: 37))),
    const Positioned(left: 21, bottom: 61, child: Text('🍇', style: TextStyle(fontSize: 37))),
  ]));
}

class TerracePainter extends CustomPainter {
  const TerracePainter();
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawCircle(Offset(size.width * .82, size.height * .22), 36, Paint()..color = C.gold.withOpacity(.72));
    final colors = [C.gold.withOpacity(.14), C.linen.withOpacity(.12), C.indigo.withOpacity(.34)];
    for (int i = 0; i < 3; i++) {
      final p = Paint()..color = colors[i]..style = PaintingStyle.stroke..strokeWidth = 34;
      canvas.drawArc(Rect.fromCenter(center: Offset(size.width * .78, size.height * (1.06 - i * .16)), width: size.width * (1.35 - i * .08), height: size.height * .55), math.pi, math.pi, false, p);
    }
  }
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class TitleRow extends StatelessWidget {
  final String title, action;
  final String? subtitle;
  final bool live;
  const TitleRow({super.key, required this.title, required this.action, this.subtitle, this.live = false});
  @override
  Widget build(BuildContext context) => Row(children: [if (live) ...[Container(width: 9, height: 9, decoration: const BoxDecoration(color: C.live, shape: BoxShape.circle)), const SizedBox(width: 7)], Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900, color: C.indigo)), if (subtitle != null) Text(subtitle!, style: const TextStyle(fontSize: 10, color: C.muted))])), TextButton(onPressed: () {}, child: Text(action))]);
}

class Categories extends StatelessWidget {
  const Categories({super.key});
  static const data = [('🥬','خضروات',Color(0xFFE7EDDA)),('🍎','فواكه',Color(0xFFF7DFDC)),('☕','البُن',Color(0xFFE5D4C4)),('🍯','العسل',Color(0xFFF8E7B7)),('🌾','حبوب',Color(0xFFEEE0BD)),('🥚','ألبان',Color(0xFFE0EDF0))];
  @override
  Widget build(BuildContext context) => SizedBox(height: 103, child: ListView.separated(scrollDirection: Axis.horizontal, itemCount: data.length, separatorBuilder: (_,__) => const SizedBox(width: 10), itemBuilder: (_,i) { final x=data[i]; return SizedBox(width: 75, child: Column(children: [Container(width: 61,height:61,alignment:Alignment.center,decoration:BoxDecoration(color:x.$3,borderRadius:BorderRadius.circular(19)),child:Text(x.$1,style:const TextStyle(fontSize:30))),const SizedBox(height:6),Text(x.$2,style:const TextStyle(fontSize:11,fontWeight:FontWeight.w900))])); }));
}

class LiveMini extends StatelessWidget {
  final String title,farm,emoji,viewers; final List<Color> colors;
  const LiveMini({super.key,required this.title,required this.farm,required this.emoji,required this.viewers,required this.colors});
  @override
  Widget build(BuildContext context) => SizedBox(width:185, child: Card(clipBehavior:Clip.antiAlias,margin:EdgeInsets.zero,shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(21),side:const BorderSide(color:Color(0xFFEADFCF))),child:InkWell(onTap:()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>LiveRoom(title:title,farm:farm,emoji:emoji))),child:Column(children:[Expanded(child:Container(decoration:BoxDecoration(gradient:LinearGradient(begin:Alignment.topCenter,end:Alignment.bottomCenter,colors:colors)),child:Stack(children:[const Positioned.fill(child:CustomPaint(painter:FieldPainter())),Center(child:Text(emoji,style:const TextStyle(fontSize:66))),Positioned(top:9,right:9,child:_pill('● مباشر',C.live)),Positioned(top:9,left:9,child:_pill('👁 $viewers',Colors.black45))]))),Padding(padding:const EdgeInsets.all(10),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(title,maxLines:1,overflow:TextOverflow.ellipsis,style:const TextStyle(fontSize:12,fontWeight:FontWeight.w900)),const SizedBox(height:3),Text(farm,style:const TextStyle(fontSize:9,color:C.muted))]))]))));
  Widget _pill(String text,Color color)=>Container(padding:const EdgeInsets.symmetric(horizontal:8,vertical:4),decoration:BoxDecoration(color:color,borderRadius:BorderRadius.circular(15)),child:Text(text,style:const TextStyle(color:Colors.white,fontSize:8,fontWeight:FontWeight.w900)));
}

class FieldPainter extends CustomPainter {
  const FieldPainter();
  @override
  void paint(Canvas canvas,Size size){final p=Paint()..color=Colors.white.withOpacity(.1)..style=PaintingStyle.stroke..strokeWidth=18;for(int i=0;i<4;i++){canvas.drawArc(Rect.fromCenter(center:Offset(size.width*.55,size.height*(1.14-i*.16)),width:size.width*1.4,height:size.height*.62),math.pi,math.pi,false,p);}}
  @override bool shouldRepaint(covariant CustomPainter oldDelegate)=>false;
}

class Products extends StatelessWidget {
  const Products({super.key});
  static const data=[('🍅','قُطف اليوم','طماطم بلدية','وادي ظهر · صنعاء','850','كجم',Color(0xFFF5DED8)),('🍇','موسمي','عنب رازقي','بساتين صعدة','4,600','صندوق',Color(0xFFE9E0EF)),('☕','من المصدر','بُن حرازي','مزارعو حراز','7,900','500 جم',Color(0xFFE3D4C0)),('🍯','مختبر ✓','عسل سدر','مناحل دوعن','18,500','500 جم',Color(0xFFF2DFAE))];
  @override
  Widget build(BuildContext context)=>GridView.builder(physics:const NeverScrollableScrollPhysics(),shrinkWrap:true,itemCount:data.length,gridDelegate:const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount:2,childAspectRatio:.66,crossAxisSpacing:10,mainAxisSpacing:10),itemBuilder:(_,i){final x=data[i];return Card(clipBehavior:Clip.antiAlias,margin:EdgeInsets.zero,shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(21),side:const BorderSide(color:Color(0xFFEADFCF))),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Expanded(child:Container(color:x.$7,width:double.infinity,child:Stack(children:[Center(child:Text(x.$1,style:const TextStyle(fontSize:65))),Positioned(top:8,right:8,child:Container(padding:const EdgeInsets.symmetric(horizontal:7,vertical:4),decoration:BoxDecoration(color:C.olive,borderRadius:BorderRadius.circular(9)),child:Text(x.$2,style:const TextStyle(color:Colors.white,fontSize:7,fontWeight:FontWeight.w900)))),Positioned(top:2,left:2,child:IconButton(onPressed:(){},icon:const Icon(Icons.favorite_border,color:C.aqeeq))) ]))),Padding(padding:const EdgeInsets.all(10),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(x.$4,style:const TextStyle(fontSize:8,color:C.olive,fontWeight:FontWeight.w800)),Text(x.$3,style:const TextStyle(fontSize:13,fontWeight:FontWeight.w900)),const Text('★ 4.9  ·  متوفر الآن',style:TextStyle(fontSize:8,color:C.muted)),const Divider(),Row(children:[Expanded(child:RichText(text:TextSpan(style:const TextStyle(color:C.aqeeq,fontSize:8),children:[TextSpan(text:x.$5,style:const TextStyle(fontSize:16,fontWeight:FontWeight.w900)),TextSpan(text:' ر.ي / ${x.$6}')]))),SizedBox(width:33,height:33,child:FilledButton(onPressed:(){},style:FilledButton.styleFrom(backgroundColor:C.indigo,padding:EdgeInsets.zero),child:const Icon(Icons.add,size:17)))])]))]));});
}

class LiveHub extends StatelessWidget {
  const LiveHub({super.key});
  @override
  Widget build(BuildContext context)=>Scaffold(appBar:AppBar(toolbarHeight:74,title:const Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('مباشر من المزرعة',style:TextStyle(fontWeight:FontWeight.w900)),Text('شاهد المنتج واسأل المزارع قبل الشراء',style:TextStyle(fontSize:9,color:C.muted))]),bottom:const PreferredSize(preferredSize:Size.fromHeight(8),child:Pattern())),body:ListView(padding:const EdgeInsets.fromLTRB(16,17,16,100),children:[Container(padding:const EdgeInsets.all(14),decoration:BoxDecoration(color:C.linen,borderRadius:BorderRadius.circular(18)),child:Row(children:[const Icon(Icons.verified,color:C.olive),const SizedBox(width:9),const Expanded(child:Text('البث متاح للمزارعين الموثّقين لحماية المشترين.',style:TextStyle(fontSize:10))),TextButton(onPressed:()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>const BroadcastSetup())),child:const Text('ابدأ بثًا'))])),const SizedBox(height:15),const LiveWide(title:'حصاد الطماطم هذا الصباح',farm:'مزرعة وادي ظهر',place:'صنعاء',emoji:'🍅',viewers:284,likes:1820,colors:[Color(0xFF7E966B),Color(0xFF314A35)]),const SizedBox(height:13),const LiveWide(title:'اختبار عسل السدر أمامكم',farm:'مناحل دوعن',place:'حضرموت',emoji:'🍯',viewers:116,likes:947,colors:[Color(0xFFE5BD68),Color(0xFF895234)]),const SizedBox(height:13),const LiveWide(title:'قطف وتجفيف البُن الحرازي',farm:'تعاونية حراز',place:'صنعاء',emoji:'☕',viewers:92,likes:611,colors:[Color(0xFFB39678),Color(0xFF4C3226)])]),floatingActionButton:FloatingActionButton.extended(onPressed:()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>const BroadcastSetup())),backgroundColor:C.live,foregroundColor:Colors.white,icon:const Icon(Icons.videocam),label:const Text('ابدأ بثًا')));
}

class LiveWide extends StatelessWidget {
  final String title,farm,place,emoji;final int viewers,likes;final List<Color> colors;
  const LiveWide({super.key,required this.title,required this.farm,required this.place,required this.emoji,required this.viewers,required this.likes,required this.colors});
  @override
  Widget build(BuildContext context)=>Card(clipBehavior:Clip.antiAlias,margin:EdgeInsets.zero,shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(22),side:const BorderSide(color:Color(0xFFEADFCF))),child:InkWell(onTap:()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>LiveRoom(title:title,farm:farm,emoji:emoji))),child:Column(children:[Container(height:215,decoration:BoxDecoration(gradient:LinearGradient(begin:Alignment.topCenter,end:Alignment.bottomCenter,colors:colors)),child:Stack(children:[const Positioned.fill(child:CustomPaint(painter:FieldPainter())),Center(child:Text(emoji,style:const TextStyle(fontSize:90))),Positioned(top:12,right:12,child:Container(padding:const EdgeInsets.symmetric(horizontal:9,vertical:5),decoration:BoxDecoration(color:C.live,borderRadius:BorderRadius.circular(18)),child:const Text('● مباشر',style:TextStyle(color:Colors.white,fontSize:9,fontWeight:FontWeight.w900)))),Positioned(top:12,left:12,child:Container(padding:const EdgeInsets.symmetric(horizontal:9,vertical:5),decoration:BoxDecoration(color:Colors.black45,borderRadius:BorderRadius.circular(18)),child:Text('👁 $viewers   ♥ $likes',style:const TextStyle(color:Colors.white,fontSize:8)))),Positioned(bottom:12,right:12,child:Container(padding:const EdgeInsets.symmetric(horizontal:9,vertical:5),decoration:BoxDecoration(color:Colors.black45,borderRadius:BorderRadius.circular(12)),child:Text(place,style:const TextStyle(color:Colors.white,fontSize:9))))])),Padding(padding:const EdgeInsets.all(13),child:Row(children:[CircleAvatar(backgroundColor:C.aqeeq,foregroundColor:Colors.white,child:Text(farm.substring(0,1))),const SizedBox(width:9),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(title,style:const TextStyle(fontWeight:FontWeight.w900)),Text('$farm · موثّق ✓',style:const TextStyle(fontSize:9,color:C.muted))])),const Icon(Icons.arrow_back_ios_new,size:15,color:C.aqeeq)]))])));
}

class LiveRoom extends StatefulWidget {
  final String title,farm,emoji;final bool broadcaster;
  const LiveRoom({super.key,required this.title,required this.farm,required this.emoji,this.broadcaster=false});
  @override State<LiveRoom> createState()=>_LiveRoomState();
}

class _LiveRoomState extends State<LiveRoom>{int likes=1820,id=0;final hearts=<int>[];void like(){final x=id++;setState((){likes++;hearts.add(x);});Timer(const Duration(milliseconds:1250),(){if(mounted)setState(()=>hearts.remove(x));});}
  @override Widget build(BuildContext context)=>Scaffold(backgroundColor:const Color(0xFF1E3125),body:Stack(children:[Positioned.fill(child:Container(decoration:const BoxDecoration(gradient:LinearGradient(begin:Alignment.topCenter,end:Alignment.bottomCenter,colors:[Color(0xFFA2B19A),Color(0xFF547052),Color(0xFF203527)])),child:Stack(children:[const Positioned.fill(child:CustomPaint(painter:FieldPainter())),Center(child:Column(mainAxisSize:MainAxisSize.min,children:[Text(widget.emoji,style:const TextStyle(fontSize:130)),const Icon(Icons.videocam,color:Colors.white54,size:34),const Text('معاينة البث المباشر',style:TextStyle(color:Colors.white70,fontSize:10))]))]))),SafeArea(child:Padding(padding:const EdgeInsets.fromLTRB(12,9,12,13),child:Column(children:[Row(children:[CircleAvatar(backgroundColor:C.aqeeq,foregroundColor:Colors.white,child:Text(widget.farm.substring(0,1))),const SizedBox(width:7),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(widget.farm,style:const TextStyle(color:Colors.white,fontWeight:FontWeight.w900)),Text(widget.broadcaster?'أنت تبث الآن':'284 مشاهدًا · موثّق ✓',style:const TextStyle(color:Colors.white70,fontSize:8))])),if(!widget.broadcaster)FilledButton(onPressed:(){},style:FilledButton.styleFrom(backgroundColor:C.live),child:const Text('متابعة')),const SizedBox(width:5),IconButton.filledTonal(onPressed:()=>Navigator.pop(context),icon:const Icon(Icons.close))]),const SizedBox(height:8),Align(alignment:Alignment.centerRight,child:Container(padding:const EdgeInsets.symmetric(horizontal:9,vertical:5),decoration:BoxDecoration(color:C.live,borderRadius:BorderRadius.circular(17)),child:Text('● مباشر · ${widget.title}',style:const TextStyle(color:Colors.white,fontSize:9,fontWeight:FontWeight.w900)))),const Spacer(),Row(crossAxisAlignment:CrossAxisAlignment.end,children:[Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[comment('أم محمد','هل التوصيل متاح إلى شارع حدة؟'),comment(widget.farm,'نعم، والتوصيل في نفس اليوم 🌿'),comment('عبدالله','ما شاء الله، المنتج واضح وطازج'),const SizedBox(height:7),TextField(style:const TextStyle(color:Colors.white),decoration:InputDecoration(hintText:'اكتب سؤالًا للمزارع...',hintStyle:const TextStyle(color:Colors.white70,fontSize:10),suffixIcon:const Icon(Icons.send,color:Colors.white),filled:true,fillColor:Colors.black38,border:OutlineInputBorder(borderRadius:BorderRadius.circular(24),borderSide:BorderSide.none)))])),const SizedBox(width:9),Column(children:[Stack(clipBehavior:Clip.none,alignment:Alignment.bottomCenter,children:[for(final h in hearts)Heart(key:ValueKey(h),offset:h%3),FloatingActionButton.small(heroTag:null,onPressed:like,backgroundColor:Colors.white,foregroundColor:C.live,child:const Icon(Icons.favorite))]),Text('$likes',style:const TextStyle(color:Colors.white,fontSize:9,fontWeight:FontWeight.w900)),const SizedBox(height:10),FloatingActionButton.small(heroTag:null,onPressed:(){},backgroundColor:Colors.white,foregroundColor:C.indigo,child:const Icon(Icons.share))])]),const SizedBox(height:10),Container(padding:const EdgeInsets.all(8),decoration:BoxDecoration(color:Colors.white,borderRadius:BorderRadius.circular(17)),child:Row(children:[Container(width:55,height:55,alignment:Alignment.center,decoration:BoxDecoration(color:const Color(0xFFF5DED8),borderRadius:BorderRadius.circular(13)),child:Text(widget.emoji,style:const TextStyle(fontSize:29))),const SizedBox(width:8),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(widget.emoji=='🍅'?'طماطم بلدية — قطف اليوم':'منتج المزرعة المثبّت',style:const TextStyle(fontSize:11,fontWeight:FontWeight.w900)),const Text('850 ر.ي / كجم',style:TextStyle(color:C.aqeeq,fontWeight:FontWeight.w900,fontSize:14)),const Text('متوفر 42 كجم',style:TextStyle(fontSize:7,color:C.muted))])),FilledButton(onPressed:(){},style:FilledButton.styleFrom(backgroundColor:C.aqeeq),child:Text(widget.broadcaster?'تغيير':'أضف للسلة'))])),if(widget.broadcaster)...[const SizedBox(height:8),Row(children:[Expanded(child:OutlinedButton.icon(onPressed:(){},style:OutlinedButton.styleFrom(foregroundColor:Colors.white,side:const BorderSide(color:Colors.white54)),icon:const Icon(Icons.flip_camera_android),label:const Text('تبديل الكاميرا'))),const SizedBox(width:8),Expanded(child:FilledButton.icon(onPressed:()=>Navigator.pop(context),style:FilledButton.styleFrom(backgroundColor:C.live),icon:const Icon(Icons.stop_circle_outlined),label:const Text('إنهاء البث')))])]])))]));
  Widget comment(String n,String t)=>Container(margin:const EdgeInsets.only(bottom:5),padding:const EdgeInsets.symmetric(horizontal:9,vertical:6),decoration:BoxDecoration(color:Colors.black38,borderRadius:BorderRadius.circular(13)),child:RichText(text:TextSpan(style:const TextStyle(color:Colors.white,fontSize:9),children:[TextSpan(text:'$n: ',style:const TextStyle(color:Color(0xFFFFD77D),fontWeight:FontWeight.w900)),TextSpan(text:t)])));
}

class Heart extends StatefulWidget{final int offset;const Heart({super.key,required this.offset});@override State<Heart>createState()=>_HeartState();}
class _HeartState extends State<Heart>{bool go=false;@override void initState(){super.initState();WidgetsBinding.instance.addPostFrameCallback((_){if(mounted)setState(()=>go=true);});}@override Widget build(BuildContext context)=>AnimatedPositioned(duration:const Duration(milliseconds:1050),curve:Curves.easeOut,bottom:go?135:20,right:go?(widget.offset-1)*22:0,child:AnimatedOpacity(duration:const Duration(milliseconds:980),opacity:go?0:1,child:const Icon(Icons.favorite,color:Color(0xFFFF6B75),size:28)));}

class BroadcastSetup extends StatefulWidget{const BroadcastSetup({super.key});@override State<BroadcastSetup>createState()=>_BroadcastSetupState();}
class _BroadcastSetupState extends State<BroadcastSetup>{bool cam=true,mic=true,chat=true;@override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:const Text('تجهيز البث',style:TextStyle(fontWeight:FontWeight.w900)),bottom:const PreferredSize(preferredSize:Size.fromHeight(8),child:Pattern())),body:ListView(padding:const EdgeInsets.all(16),children:[Container(height:245,decoration:BoxDecoration(gradient:const LinearGradient(colors:[Color(0xFF849A70),Color(0xFF334E39)]),borderRadius:BorderRadius.circular(24)),child:Stack(children:[const Positioned.fill(child:CustomPaint(painter:FieldPainter())),const Center(child:Column(mainAxisSize:MainAxisSize.min,children:[Icon(Icons.videocam,color:Colors.white,size:50),Text('معاينة الكاميرا',style:TextStyle(color:Colors.white,fontWeight:FontWeight.w900))])),Positioned(bottom:12,left:0,right:0,child:Row(mainAxisAlignment:MainAxisAlignment.center,children:[IconButton.filled(onPressed:()=>setState(()=>cam=!cam),icon:Icon(cam?Icons.videocam:Icons.videocam_off)),const SizedBox(width:8),IconButton.filled(onPressed:()=>setState(()=>mic=!mic),icon:Icon(mic?Icons.mic:Icons.mic_off)),const SizedBox(width:8),IconButton.filled(onPressed:(){},icon:const Icon(Icons.flip_camera_android))]))])),const SizedBox(height:16),TextField(decoration:InputDecoration(labelText:'عنوان البث',hintText:'مثال: حصاد الطماطم هذا الصباح',prefixIcon:const Icon(Icons.title),border:OutlineInputBorder(borderRadius:BorderRadius.circular(16)))),const SizedBox(height:11),Card(child:ListTile(leading:Container(width:48,height:48,alignment:Alignment.center,decoration:BoxDecoration(color:const Color(0xFFF5DED8),borderRadius:BorderRadius.circular(12)),child:const Text('🍅',style:TextStyle(fontSize:26))),title:const Text('المنتج المثبّت',style:TextStyle(fontSize:10,color:C.muted)),subtitle:const Text('طماطم بلدية · 850 ر.ي / كجم',style:TextStyle(fontWeight:FontWeight.w900)),trailing:const Icon(Icons.chevron_left))),Card(child:SwitchListTile(value:chat,onChanged:(v)=>setState(()=>chat=v),secondary:const Icon(Icons.chat_bubble_outline),title:const Text('السماح بالتعليقات'),subtitle:const Text('يمكن كتم مستخدم أو الإبلاغ عنه',style:TextStyle(fontSize:9)))),const SizedBox(height:8),Container(padding:const EdgeInsets.all(13),decoration:BoxDecoration(color:C.linen,borderRadius:BorderRadius.circular(16)),child:const Row(crossAxisAlignment:CrossAxisAlignment.start,children:[Icon(Icons.verified_user_outlined,color:C.olive),SizedBox(width:8),Expanded(child:Text('سيظهر اسم مزرعتك وحالة التوثيق. يمنع بث محتوى غير متعلق بالمزرعة أو المنتجات المسجّلة.',style:TextStyle(fontSize:9,height:1.6)))])),const SizedBox(height:18),FilledButton.icon(onPressed:cam&&mic?()=>Navigator.pushReplacement(context,MaterialPageRoute(builder:(_)=>const LiveRoom(title:'حصاد الطماطم هذا الصباح',farm:'مزرعة وادي ظهر',emoji:'🍅',broadcaster:true))):null,style:FilledButton.styleFrom(backgroundColor:C.live,padding:const EdgeInsets.symmetric(vertical:15)),icon:const Icon(Icons.wifi_tethering),label:const Text('ابدأ البث المباشر',style:TextStyle(fontWeight:FontWeight.w900,fontSize:15))),const SizedBox(height:8),const Text('هذه نسخة واجهة تفاعلية. ربط فيديو الكاميرا الحقيقي يحتاج خادم بث وواجهة API.',textAlign:TextAlign.center,style:TextStyle(fontSize:8,color:C.muted))]));}

class AccountPage extends StatelessWidget{const AccountPage({super.key});@override Widget build(BuildContext context)=>Scaffold(body:ListView(padding:EdgeInsets.zero,children:[const Pattern(),Container(padding:const EdgeInsets.fromLTRB(18,54,18,24),decoration:const BoxDecoration(gradient:LinearGradient(colors:[C.aqeeq,C.aqeeqDark]),borderRadius:BorderRadius.vertical(bottom:Radius.circular(31))),child:Column(children:[const Logo(),const SizedBox(height:23),Row(children:[const CircleAvatar(radius:32,backgroundColor:C.gold,foregroundColor:C.ink,child:Text('س',style:TextStyle(fontSize:26,fontWeight:FontWeight.w900))),const SizedBox(width:11),const Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('سالم أحمد',style:TextStyle(color:Colors.white,fontSize:18,fontWeight:FontWeight.w900)),Text('مزارع موثّق ✓ · صنعاء',style:TextStyle(color:Colors.white70,fontSize:9))])),IconButton.filledTonal(onPressed:(){},icon:const Icon(Icons.settings_outlined))])])),Padding(padding:const EdgeInsets.fromLTRB(16,18,16,100),child:Column(children:[Card(color:C.indigo,child:InkWell(borderRadius:BorderRadius.circular(20),onTap:()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>const BroadcastSetup())),child:const Padding(padding:EdgeInsets.all(17),child:Row(children:[CircleAvatar(radius:27,backgroundColor:C.live,child:Icon(Icons.videocam,color:Colors.white,size:29)),SizedBox(width:12),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('ابدأ بثًا من مزرعتك',style:TextStyle(color:Colors.white,fontSize:15,fontWeight:FontWeight.w900)),Text('اعرض حصادك وتلقَّ الأسئلة والإعجابات',style:TextStyle(color:Colors.white70,fontSize:9))])),Icon(Icons.arrow_back_ios_new,color:Colors.white,size:15)])))),const SizedBox(height:11),Card(child:Column(children:const [Tile(icon:Icons.storefront_outlined,title:'متجر المزرعة',sub:'المنتجات والمخزون'),Divider(height:1,indent:62),Tile(icon:Icons.receipt_long_outlined,title:'طلبات المزرعة',sub:'التأكيد والتجهيز'),Divider(height:1,indent:62),Tile(icon:Icons.account_balance_wallet_outlined,title:'الأرباح والمستحقات',sub:'الرصيد وسجل التسويات'),Divider(height:1,indent:62),Tile(icon:Icons.insights_outlined,title:'إحصاءات البث',sub:'المشاهدات والإعجابات والمبيعات')]))]))]));}

class Tile extends StatelessWidget{final IconData icon;final String title,sub;const Tile({super.key,required this.icon,required this.title,required this.sub});@override Widget build(BuildContext context)=>ListTile(leading:Container(width:39,height:39,decoration:BoxDecoration(color:C.linen,borderRadius:BorderRadius.circular(11)),child:Icon(icon,color:C.aqeeq,size:20)),title:Text(title,style:const TextStyle(fontSize:12,fontWeight:FontWeight.w900)),subtitle:Text(sub,style:const TextStyle(fontSize:8)),trailing:const Icon(Icons.chevron_left));}

class EmptyPage extends StatelessWidget{final IconData icon;final String title,text;const EmptyPage({super.key,required this.icon,required this.title,required this.text});@override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:Text(title,style:const TextStyle(fontWeight:FontWeight.w900)),bottom:const PreferredSize(preferredSize:Size.fromHeight(8),child:Pattern())),body:Center(child:Column(mainAxisSize:MainAxisSize.min,children:[Container(width:100,height:100,decoration:BoxDecoration(color:C.linen,borderRadius:BorderRadius.circular(31)),child:Icon(icon,size:48,color:C.aqeeq)),const SizedBox(height:15),Text(title,style:const TextStyle(fontSize:24,fontWeight:FontWeight.w900,color:C.indigo)),const SizedBox(height:6),Text(text,style:const TextStyle(color:C.muted)),const SizedBox(height:17),FilledButton(onPressed:(){},child:const Text('تصفح المنتجات'))])));}
