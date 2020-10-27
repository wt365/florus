;// florus.js v4.5 by Tingyu
const CD=new Date(), WD=['日','一','二','三','四','五','六'];
const Con={'CLEAR_DAY':'晴', 'CLEAR_NIGHT':'晴', 'PARTLY_CLOUDY_DAY':'多云', 'PARTLY_CLOUDY_NIGHT':'多云', 'CLOUDY':'阴', 'LIGHT_RAIN':'小雨', 'MODERATE_RAIN':'中雨', 'HEAVY_RAIN':'大雨', 'STORM_RAIN':'暴雨', 'LIGHT_SNOW':'小雪', 'MODERATE_SNOW':'中雪', 'HEAVY_SNOW':'大雪', 'STORM_SNOW':'暴雪', 'FOG':'雾', 'WIND':'大风', 'DUST':'浮尘', 'SAND':'沙尘', 'LIGHT_HAZE':'轻度雾霾', 'MODERATE_HAZE':'中度雾霾', 'HEAVY_HAZE':'重度雾霾',};  // weather text
const lon=121.2345, lat=31.0567; // longitude & latitude // 请设置经纬度，用于显示天气
const wAPI='https://api.caiyunapp.com/v2.5/TAkhjf8d1nlSlspN/'+lon+','+lat+'/realtime.json', yAPI='https://v1.hitokoto.cn/?encode=json'; // weather and motto API
const max=2, Events=[ // your events here // 可添加任意多条，无需按顺序，会自动排序后显示未来最近max条
	['新年','2021-01-01'],
	['东京奥运会','2021-07-23'],
];
let DF=new DateFormatter();
DF.dateFormat='M月d日'; 
let datext=DF.string(CD)+' · 周'+WD[CD.getDay()];
DF.dateFormat='D';
datext+=' · '+lunar(DF.string(CD));
datext+=' · 全年'+Math.floor(Number(DF.string(CD))/(365+(CD.getYear()%4?0:1))*100)+'%';
let widget=await createWidget(datext,procEvents(Events));
Script.setWidget(widget);
Script.complete();

async function createWidget(da,Ev) {
	let w= new ListWidget()
	w.backgroundColor=new Color('#111',0.9);
	// Dateline
	let date=w.addText(da);
	date.font=Font.boldSystemFont(15);
	date.textColor=Color.white();
	w.addSpacer(8);
	// Weather
	let wtext='',rb=10000;
	try {
		const reqW=new Request(wAPI), resW=await reqW.loadJSON()||null, rt=resW.result.realtime||null, rn=rt.precipitation.nearest||null;
		if (rn) {rb=rn.distance>10?Math.floor(rn.distance):rn.distance;}
		wtext+=Con[rt.skycon]+' · '+rt.temperature+'度';
		if (rb<100) {wtext+=' · 最近降雨带'+rb+ '公里外';}
	} catch (err) {
		wtext='暂时与气象卫星失去了联系';
	}
	let weather=w.addText(wtext);
	weather.font=Font.lightSystemFont(13);
	weather.textColor=new Color('#fff59d',0.9);
	weather.textOpacity=0.9;
	w.addSpacer(2);
	// Events
	for (let o of Ev) {
		// newline
		w.addSpacer(6);
		let ev=w.addText(o);
		ev.font=Font.lightSystemFont(11);
		ev.textColor=new Color('#b3e5fc',0.9);
		ev.textOpacity=0.8;
	}
	w.addSpacer(8);
	// Motto
	let y='';
	try {
		const reqY=new Request(yAPI), resY=await reqY.loadJSON()||null;
		y+='“'+resY.hitokoto+'” -- '+resY.from;
	} catch (err) {
		y='“此时无声胜有声。” -- 在那个没有互联网的远古时代';
	}
	let motto=w.addText(y);
	motto.font=Font.lightSystemFont(10);
	motto.textColor=new Color('#fff',0.9);
	motto.textOpacity=0.8;
	// return widget
	return w;
}

function procEvents(E) {
	E.sort((a,b)=>{return new Date(a[1]).getTime()-new Date(b[1]).getTime();});
	let Ex=[];
	for (let o of E) {
		let diff=Math.ceil((new Date(o[1]).getTime()-28800000-CD.getTime())/86400000);
		if (diff>-1) {Ex.push(o[0]+(diff>0?' · 还有'+diff+'天':' · 就是今天')); if (Ex.length==max) {break;}}
	}
	return Ex;
}

function lunar(D) {
	// 农历暂支持2020年，到了2021年我再更新
	const L=[-6,24,53,83,113,143,172,202,231,260,290,319,349], Lx=['腊','正','二','三','四','闰四','五','六','七','八','九','十','冬'];
	let i=L.length-1;
	while (D<L[i]+1) {i--;}
	const lm=Lx[i], ld=D-L[i];
	return lm+'月'+zh(ld);
}

function zh(x) {
	const Z=['','一','二','三','四','五','六','七','八','九','十'];
	return x<11?'初'+Z[x]:x<20?'十'+Z[x-10]:x==20?'二十':x<30?'廿'+Z[x-20]:'三十';
}