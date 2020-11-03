;// florus-funds.js v1.0 by Tingyu // 这个是基金估值版本（无提醒事项）
const CD=new Date(), WD=['日','一','二','三','四','五','六'];
const Con={'CLEAR_DAY':'晴', 'CLEAR_NIGHT':'晴', 'PARTLY_CLOUDY_DAY':'多云', 'PARTLY_CLOUDY_NIGHT':'多云', 'CLOUDY':'阴', 'LIGHT_RAIN':'小雨', 'MODERATE_RAIN':'中雨', 'HEAVY_RAIN':'大雨', 'STORM_RAIN':'暴雨', 'LIGHT_SNOW':'小雪', 'MODERATE_SNOW':'中雪', 'HEAVY_SNOW':'大雪', 'STORM_SNOW':'暴雪', 'FOG':'雾', 'WIND':'大风', 'DUST':'浮尘', 'SAND':'沙尘', 'LIGHT_HAZE':'轻度雾霾', 'MODERATE_HAZE':'中度雾霾', 'HEAVY_HAZE':'重度雾霾',};  // weather text
const lon=121.234567, lat=31.056789; // 请设置经纬度，用于显示天气
const apikey='TAkhjf8d1nlSlspN'; // 彩云天气APIKey，公用Key有每小时请求次数限制，如果你有自己的Key，推荐换成自己的。申请地址：https://dashboard.caiyunapp.com/user/sign_in/
const wAPI='https://api.caiyunapp.com/v2.5/'+apikey+'/'+lon+','+lat+'/realtime.json', yAPI='https://v1.hitokoto.cn/?encode=json'; // weather and motto API
const funds='004854,000294'; // 请设置基金代码，用英文半角逗号隔开。中、小尺寸将显示不超过三个，大尺寸将显示不超过六个。
let DF=new DateFormatter();
DF.dateFormat='M月d日'; 
let datext=DF.string(CD)+' · 周'+WD[CD.getDay()];
DF.dateFormat='D';
datext+=' · '+lunar(DF.string(CD))+' · 全年'+Math.floor(Number(DF.string(CD))/(365+(CD.getYear()%4?0:1))*100)+'%';
let widget=await createWidget(datext);
Script.setWidget(widget);
Script.complete();

async function createWidget(da) {
	let w= new ListWidget()
	w.backgroundColor=new Color('#111',0.9);
	// Dateline
	let date=w.addText(da);
	date.font=Font.boldSystemFont(15);
	date.textColor=Color.white();
	w.addSpacer(8);
	// Weather
	let wtext='', rb=10000;
	try {
		const reqW=new Request(wAPI), resW=await reqW.loadJSON()||{}, rt=resW.result.realtime||{}, rn=rt.precipitation.nearest||null;
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
	// Funds
	try {
		const l=config.widgetFamily=='large'?6:3;
		const reqF=new Request('https://api.doctorxiong.club/v1/fund?code='+funds), resF=await reqF.loadJSON()||{};
		let F=resF.data||[];
		if (F.length>l) {F.length=l;}
		for (let o of F) {
			w.addSpacer(6); // newline
			let fund=w.addText(o.name+' · '+o.expectWorth+' ('+(o.expectGrowth>0?'+':'')+o.expectGrowth+'%)');
			fund.font=Font.lightSystemFont(11);
			fund.textColor=new Color('#b3e5fc',0.9);
			fund.textOpacity=0.8;
		}
	} catch (err) {
		let fund=w.addText('暂时与证券交易所失去了联系');
		fund.font=Font.lightSystemFont(11);
		fund.textColor=new Color('#b3e5fc',0.9);
		fund.textOpacity=0.8;
	}
	w.addSpacer(8);
	// Motto
	let y='';
	try {
		const reqY=new Request(yAPI), resY=await reqY.loadJSON()||{};
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