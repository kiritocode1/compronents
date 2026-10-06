var e=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=e(((e,t)=>{t.exports={}}));String.prototype.codePointAt||(function(){var e=function(){try{var e={},t=Object.defineProperty,n=t(e,e,e)&&t}catch{}return n}(),t=function(e){if(this==null)throw TypeError();var t=String(this),n=t.length,r=e?Number(e):0;if(r!=r&&(r=0),!(r<0||r>=n)){var i=t.charCodeAt(r),a;return i>=55296&&i<=56319&&n>r+1&&(a=t.charCodeAt(r+1),a>=56320&&a<=57343)?(i-55296)*1024+a-56320+65536:i}};e?e(String.prototype,`codePointAt`,{value:t,configurable:!0,writable:!0}):String.prototype.codePointAt=t})();var n=0,r=-3;function i(){this.table=new Uint16Array(16),this.trans=new Uint16Array(288)}function a(e,t){this.source=e,this.sourceIndex=0,this.tag=0,this.bitcount=0,this.dest=t,this.destLen=0,this.ltree=new i,this.dtree=new i}var o=new i,s=new i,c=new Uint8Array(30),l=new Uint16Array(30),u=new Uint8Array(30),d=new Uint16Array(30),f=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),p=new i,m=new Uint8Array(320);function h(e,t,n,r){for(var i=0,a;i<n;++i)e[i]=0;for(i=0;i<30-n;++i)e[i+n]=i/n|0;for(a=r,i=0;i<30;++i)t[i]=a,a+=1<<e[i]}function g(e,t){for(var n=0;n<7;++n)e.table[n]=0;for(e.table[7]=24,e.table[8]=152,e.table[9]=112,n=0;n<24;++n)e.trans[n]=256+n;for(n=0;n<144;++n)e.trans[24+n]=n;for(n=0;n<8;++n)e.trans[168+n]=280+n;for(n=0;n<112;++n)e.trans[176+n]=144+n;for(n=0;n<5;++n)t.table[n]=0;for(t.table[5]=32,n=0;n<32;++n)t.trans[n]=n}var _=new Uint16Array(16);function v(e,t,n,r){for(var i=0,a;i<16;++i)e.table[i]=0;for(i=0;i<r;++i)e.table[t[n+i]]++;for(e.table[0]=0,a=0,i=0;i<16;++i)_[i]=a,a+=e.table[i];for(i=0;i<r;++i)t[n+i]&&(e.trans[_[t[n+i]]++]=i)}function y(e){e.bitcount--||(e.tag=e.source[e.sourceIndex++],e.bitcount=7);var t=e.tag&1;return e.tag>>>=1,t}function b(e,t,n){if(!t)return n;for(;e.bitcount<24;)e.tag|=e.source[e.sourceIndex++]<<e.bitcount,e.bitcount+=8;var r=e.tag&65535>>>16-t;return e.tag>>>=t,e.bitcount-=t,r+n}function x(e,t){for(;e.bitcount<24;)e.tag|=e.source[e.sourceIndex++]<<e.bitcount,e.bitcount+=8;var n=0,r=0,i=0,a=e.tag;do r=2*r+(a&1),a>>>=1,++i,n+=t.table[i],r-=t.table[i];while(r>=0);return e.tag=a,e.bitcount-=i,t.trans[n+r]}function S(e,t,n){for(var r=b(e,5,257),i=b(e,5,1),a=b(e,4,4),o=0,s,c;o<19;++o)m[o]=0;for(o=0;o<a;++o){var l=b(e,3,0);m[f[o]]=l}for(v(p,m,0,19),s=0;s<r+i;){var u=x(e,p);switch(u){case 16:var d=m[s-1];for(c=b(e,2,3);c;--c)m[s++]=d;break;case 17:for(c=b(e,3,3);c;--c)m[s++]=0;break;case 18:for(c=b(e,7,11);c;--c)m[s++]=0;break;default:m[s++]=u}}v(t,m,0,r),v(n,m,r,i)}function C(e,t,r){for(;;){var i=x(e,t);if(i===256)return n;if(i<256)e.dest[e.destLen++]=i;else{var a,o,s,f;for(i-=257,a=b(e,c[i],l[i]),o=x(e,r),s=e.destLen-b(e,u[o],d[o]),f=s;f<s+a;++f)e.dest[e.destLen++]=e.dest[f]}}}function w(e){for(var t,i,a;e.bitcount>8;)e.sourceIndex--,e.bitcount-=8;if(t=e.source[e.sourceIndex+1],t=256*t+e.source[e.sourceIndex],i=e.source[e.sourceIndex+3],i=256*i+e.source[e.sourceIndex+2],t!==(~i&65535))return r;for(e.sourceIndex+=4,a=t;a;--a)e.dest[e.destLen++]=e.source[e.sourceIndex++];return e.bitcount=0,n}function T(e,t){var i=new a(e,t),c,l,u;do{switch(c=y(i),l=b(i,2,0),l){case 0:u=w(i);break;case 1:u=C(i,o,s);break;case 2:S(i,i.ltree,i.dtree),u=C(i,i.ltree,i.dtree);break;default:u=r}if(u!==n)throw Error(`Data error`)}while(!c);return i.destLen<i.dest.length?typeof i.dest.slice==`function`?i.dest.slice(0,i.destLen):i.dest.subarray(0,i.destLen):i.dest}g(o,s),h(c,l,4,3),h(u,d,2,1),c[28]=0,l[28]=258;var E=T;function D(e,t,n,r,i){return(1-i)**3*e+3*(1-i)**2*i*t+3*(1-i)*i**2*n+i**3*r}function O(){this.x1=NaN,this.y1=NaN,this.x2=NaN,this.y2=NaN}O.prototype.isEmpty=function(){return isNaN(this.x1)||isNaN(this.y1)||isNaN(this.x2)||isNaN(this.y2)},O.prototype.addPoint=function(e,t){typeof e==`number`&&((isNaN(this.x1)||isNaN(this.x2))&&(this.x1=e,this.x2=e),e<this.x1&&(this.x1=e),e>this.x2&&(this.x2=e)),typeof t==`number`&&((isNaN(this.y1)||isNaN(this.y2))&&(this.y1=t,this.y2=t),t<this.y1&&(this.y1=t),t>this.y2&&(this.y2=t))},O.prototype.addX=function(e){this.addPoint(e,null)},O.prototype.addY=function(e){this.addPoint(null,e)},O.prototype.addBezier=function(e,t,n,r,i,a,o,s){var c=[e,t],l=[n,r],u=[i,a],d=[o,s];this.addPoint(e,t),this.addPoint(o,s);for(var f=0;f<=1;f++){var p=6*c[f]-12*l[f]+6*u[f],m=-3*c[f]+9*l[f]-9*u[f]+3*d[f],h=3*l[f]-3*c[f];if(m===0){if(p===0)continue;var g=-h/p;0<g&&g<1&&(f===0&&this.addX(D(c[f],l[f],u[f],d[f],g)),f===1&&this.addY(D(c[f],l[f],u[f],d[f],g)));continue}var _=p**2-4*h*m;if(!(_<0)){var v=(-p+Math.sqrt(_))/(2*m);0<v&&v<1&&(f===0&&this.addX(D(c[f],l[f],u[f],d[f],v)),f===1&&this.addY(D(c[f],l[f],u[f],d[f],v)));var y=(-p-Math.sqrt(_))/(2*m);0<y&&y<1&&(f===0&&this.addX(D(c[f],l[f],u[f],d[f],y)),f===1&&this.addY(D(c[f],l[f],u[f],d[f],y)))}}},O.prototype.addQuad=function(e,t,n,r,i,a){var o=e+2/3*(n-e),s=t+2/3*(r-t),c=o+1/3*(i-e),l=s+1/3*(a-t);this.addBezier(e,t,o,s,c,l,i,a)};function k(){this.commands=[],this.fill=`black`,this.stroke=null,this.strokeWidth=1}k.prototype.moveTo=function(e,t){this.commands.push({type:`M`,x:e,y:t})},k.prototype.lineTo=function(e,t){this.commands.push({type:`L`,x:e,y:t})},k.prototype.curveTo=k.prototype.bezierCurveTo=function(e,t,n,r,i,a){this.commands.push({type:`C`,x1:e,y1:t,x2:n,y2:r,x:i,y:a})},k.prototype.quadTo=k.prototype.quadraticCurveTo=function(e,t,n,r){this.commands.push({type:`Q`,x1:e,y1:t,x:n,y:r})},k.prototype.close=k.prototype.closePath=function(){this.commands.push({type:`Z`})},k.prototype.extend=function(e){if(e.commands)e=e.commands;else if(e instanceof O){var t=e;this.moveTo(t.x1,t.y1),this.lineTo(t.x2,t.y1),this.lineTo(t.x2,t.y2),this.lineTo(t.x1,t.y2),this.close();return}Array.prototype.push.apply(this.commands,e)},k.prototype.getBoundingBox=function(){for(var e=new O,t=0,n=0,r=0,i=0,a=0;a<this.commands.length;a++){var o=this.commands[a];switch(o.type){case`M`:e.addPoint(o.x,o.y),t=r=o.x,n=i=o.y;break;case`L`:e.addPoint(o.x,o.y),r=o.x,i=o.y;break;case`Q`:e.addQuad(r,i,o.x1,o.y1,o.x,o.y),r=o.x,i=o.y;break;case`C`:e.addBezier(r,i,o.x1,o.y1,o.x2,o.y2,o.x,o.y),r=o.x,i=o.y;break;case`Z`:r=t,i=n;break;default:throw Error(`Unexpected path command `+o.type)}}return e.isEmpty()&&e.addPoint(0,0),e},k.prototype.draw=function(e){e.beginPath();for(var t=0;t<this.commands.length;t+=1){var n=this.commands[t];n.type===`M`?e.moveTo(n.x,n.y):n.type===`L`?e.lineTo(n.x,n.y):n.type===`C`?e.bezierCurveTo(n.x1,n.y1,n.x2,n.y2,n.x,n.y):n.type===`Q`?e.quadraticCurveTo(n.x1,n.y1,n.x,n.y):n.type===`Z`&&e.closePath()}this.fill&&(e.fillStyle=this.fill,e.fill()),this.stroke&&(e.strokeStyle=this.stroke,e.lineWidth=this.strokeWidth,e.stroke())},k.prototype.toPathData=function(e){e=e===void 0?2:e;function t(t){return Math.round(t)===t?``+Math.round(t):t.toFixed(e)}function n(){for(var e=arguments,n=``,r=0;r<arguments.length;r+=1){var i=e[r];i>=0&&r>0&&(n+=` `),n+=t(i)}return n}for(var r=``,i=0;i<this.commands.length;i+=1){var a=this.commands[i];a.type===`M`?r+=`M`+n(a.x,a.y):a.type===`L`?r+=`L`+n(a.x,a.y):a.type===`C`?r+=`C`+n(a.x1,a.y1,a.x2,a.y2,a.x,a.y):a.type===`Q`?r+=`Q`+n(a.x1,a.y1,a.x,a.y):a.type===`Z`&&(r+=`Z`)}return r},k.prototype.toSVG=function(e){var t=`<path d="`;return t+=this.toPathData(e),t+=`"`,this.fill&&this.fill!==`black`&&(this.fill===null?t+=` fill="none"`:t+=` fill="`+this.fill+`"`),this.stroke&&(t+=` stroke="`+this.stroke+`" stroke-width="`+this.strokeWidth+`"`),t+=`/>`,t},k.prototype.toDOMElement=function(e){var t=this.toPathData(e),n=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);return n.setAttribute(`d`,t),n};function A(e){throw Error(e)}function j(e,t){e||A(t)}var M={fail:A,argument:j,assert:j},N=32768,P=2147483648,ee={},F={},I={};function te(e){return function(){return e}}F.BYTE=function(e){return M.argument(e>=0&&e<=255,`Byte value should be between 0 and 255.`),[e]},I.BYTE=te(1),F.CHAR=function(e){return[e.charCodeAt(0)]},I.CHAR=te(1),F.CHARARRAY=function(e){e===void 0&&(e=``,console.warn(`Undefined CHARARRAY encountered and treated as an empty string. This is probably caused by a missing glyph name.`));for(var t=[],n=0;n<e.length;n+=1)t[n]=e.charCodeAt(n);return t},I.CHARARRAY=function(e){return e===void 0?0:e.length},F.USHORT=function(e){return[e>>8&255,e&255]},I.USHORT=te(2),F.SHORT=function(e){return e>=N&&(e=-(2*N-e)),[e>>8&255,e&255]},I.SHORT=te(2),F.UINT24=function(e){return[e>>16&255,e>>8&255,e&255]},I.UINT24=te(3),F.ULONG=function(e){return[e>>24&255,e>>16&255,e>>8&255,e&255]},I.ULONG=te(4),F.LONG=function(e){return e>=P&&(e=-(2*P-e)),[e>>24&255,e>>16&255,e>>8&255,e&255]},I.LONG=te(4),F.FIXED=F.ULONG,I.FIXED=I.ULONG,F.FWORD=F.SHORT,I.FWORD=I.SHORT,F.UFWORD=F.USHORT,I.UFWORD=I.USHORT,F.LONGDATETIME=function(e){return[0,0,0,0,e>>24&255,e>>16&255,e>>8&255,e&255]},I.LONGDATETIME=te(8),F.TAG=function(e){return M.argument(e.length===4,`Tag should be exactly 4 ASCII characters.`),[e.charCodeAt(0),e.charCodeAt(1),e.charCodeAt(2),e.charCodeAt(3)]},I.TAG=te(4),F.Card8=F.BYTE,I.Card8=I.BYTE,F.Card16=F.USHORT,I.Card16=I.USHORT,F.OffSize=F.BYTE,I.OffSize=I.BYTE,F.SID=F.USHORT,I.SID=I.USHORT,F.NUMBER=function(e){return e>=-107&&e<=107?[e+139]:e>=108&&e<=1131?(e-=108,[(e>>8)+247,e&255]):e>=-1131&&e<=-108?(e=-e-108,[(e>>8)+251,e&255]):e>=-32768&&e<=32767?F.NUMBER16(e):F.NUMBER32(e)},I.NUMBER=function(e){return F.NUMBER(e).length},F.NUMBER16=function(e){return[28,e>>8&255,e&255]},I.NUMBER16=te(3),F.NUMBER32=function(e){return[29,e>>24&255,e>>16&255,e>>8&255,e&255]},I.NUMBER32=te(5),F.REAL=function(e){var t=e.toString(),n=/\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/.exec(t);if(n){var r=parseFloat(`1e`+((n[2]?+n[2]:0)+n[1].length));t=(Math.round(e*r)/r).toString()}for(var i=``,a=0,o=t.length;a<o;a+=1){var s=t[a];i+=s===`e`?t[++a]===`-`?`c`:`b`:s===`.`?`a`:s===`-`?`e`:s}i+=i.length&1?`f`:`ff`;for(var c=[30],l=0,u=i.length;l<u;l+=2)c.push(parseInt(i.substr(l,2),16));return c},I.REAL=function(e){return F.REAL(e).length},F.NAME=F.CHARARRAY,I.NAME=I.CHARARRAY,F.STRING=F.CHARARRAY,I.STRING=I.CHARARRAY,ee.UTF8=function(e,t,n){for(var r=[],i=n,a=0;a<i;a++,t+=1)r[a]=e.getUint8(t);return String.fromCharCode.apply(null,r)},ee.UTF16=function(e,t,n){for(var r=[],i=n/2,a=0;a<i;a++,t+=2)r[a]=e.getUint16(t);return String.fromCharCode.apply(null,r)},F.UTF16=function(e){for(var t=[],n=0;n<e.length;n+=1){var r=e.charCodeAt(n);t[t.length]=r>>8&255,t[t.length]=r&255}return t},I.UTF16=function(e){return e.length*2};var ne={"x-mac-croatian":`ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø¿¡¬√ƒ≈Ć«Č…\xA0ÀÃÕŒœĐ—“”‘’÷◊©⁄€‹›Æ»–·‚„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙıˆ˜¯πË˚¸Êæˇ`,"x-mac-cyrillic":`АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњјЅ¬√ƒ≈∆«»…\xA0ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю`,"x-mac-gaelic":`ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØḂ±≤≥ḃĊċḊḋḞḟĠġṀæøṁṖṗɼƒſṠ«»…\xA0ÀÃÕŒœ–—“”‘’ṡẛÿŸṪ€‹›Ŷŷṫ·Ỳỳ⁊ÂÊÁËÈÍÎÏÌÓÔ♣ÒÚÛÙıÝýŴŵẄẅẀẁẂẃ`,"x-mac-greek":`Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï•½‰ôö¦€ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩάΝ¬ΟΡ≈Τ«»…\xA0ΥΧΆΈœ–―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ­`,"x-mac-icelandic":`ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»…\xA0ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€ÐðÞþý·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ`,"x-mac-inuit":`ᐃᐄᐅᐆᐊᐋᐱᐲᐳᐴᐸᐹᑉᑎᑏᑐᑑᑕᑖᑦᑭᑮᑯᑰᑲᑳᒃᒋᒌᒍᒎᒐᒑ°ᒡᒥᒦ•¶ᒧ®©™ᒨᒪᒫᒻᓂᓃᓄᓅᓇᓈᓐᓯᓰᓱᓲᓴᓵᔅᓕᓖᓗᓘᓚᓛᓪᔨᔩᔪᔫᔭ…\xA0ᔮᔾᕕᕖᕗ–—“”‘’ᕘᕙᕚᕝᕆᕇᕈᕉᕋᕌᕐᕿᖀᖁᖂᖃᖄᖅᖏᖐᖑᖒᖓᖔᖕᙱᙲᙳᙴᙵᙶᖖᖠᖡᖢᖣᖤᖥᖦᕼŁł`,"x-mac-ce":`ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§•¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅņŃ¬√ńŇ∆«»…\xA0ňŐÕőŌ–—“”‘’÷◊ōŔŕŘ‹›řŖŗŠ‚„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ`,macintosh:`ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»…\xA0ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ`,"x-mac-romanian":`ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ĂȘ∞±≤≥¥µ∂∑∏π∫ªºΩăș¿¡¬√ƒ≈∆«»…\xA0ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›Țț‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ`,"x-mac-turkish":`ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»…\xA0ÀÃÕŒœ–—“”‘’÷◊ÿŸĞğİıŞş‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙˆ˜¯˘˙˚¸˝˛ˇ`};ee.MACSTRING=function(e,t,n,r){var i=ne[r];if(i!==void 0){for(var a=``,o=0;o<n;o++){var s=e.getUint8(t+o);a+=s<=127?String.fromCharCode(s):i[s&127]}return a}};var re=typeof WeakMap==`function`&&new WeakMap,L,ie=function(e){if(!L)for(var t in L={},ne)L[t]=new String(t);var n=L[e];if(n!==void 0){if(re){var r=re.get(n);if(r!==void 0)return r}var i=ne[e];if(i!==void 0){for(var a={},o=0;o<i.length;o++)a[i.charCodeAt(o)]=o+128;return re&&re.set(n,a),a}}};F.MACSTRING=function(e,t){var n=ie(t);if(n!==void 0){for(var r=[],i=0;i<e.length;i++){var a=e.charCodeAt(i);if(a>=128&&(a=n[a],a===void 0))return;r[i]=a}return r}},I.MACSTRING=function(e,t){var n=F.MACSTRING(e,t);return n===void 0?0:n.length};function ae(e){return e>=-128&&e<=127}function oe(e,t,n){for(var r=0,i=e.length;t<i&&r<64&&e[t]===0;)++t,++r;return n.push(128|r-1),t}function se(e,t,n){for(var r=0,i=e.length,a=t;a<i&&r<64;){var o=e[a];if(!ae(o)||o===0&&a+1<i&&e[a+1]===0)break;++a,++r}n.push(r-1);for(var s=t;s<a;++s)n.push(e[s]+256&255);return a}function ce(e,t,n){for(var r=0,i=e.length,a=t;a<i&&r<64;){var o=e[a];if(o===0||ae(o)&&a+1<i&&ae(e[a+1]))break;++a,++r}n.push(64|r-1);for(var s=t;s<a;++s){var c=e[s];n.push(c+65536>>8&255,c+256&255)}return a}F.VARDELTAS=function(e){for(var t=0,n=[];t<e.length;){var r=e[t];t=r===0?oe(e,t,n):r>=-128&&r<=127?se(e,t,n):ce(e,t,n)}return n},F.INDEX=function(e){for(var t=1,n=[t],r=[],i=0;i<e.length;i+=1){var a=F.OBJECT(e[i]);Array.prototype.push.apply(r,a),t+=a.length,n.push(t)}if(r.length===0)return[0,0];for(var o=[],s=1+Math.floor(Math.log(t)/Math.log(2))/8|0,c=[void 0,F.BYTE,F.USHORT,F.UINT24,F.ULONG][s],l=0;l<n.length;l+=1){var u=c(n[l]);Array.prototype.push.apply(o,u)}return Array.prototype.concat(F.Card16(e.length),F.OffSize(s),o,r)},I.INDEX=function(e){return F.INDEX(e).length},F.DICT=function(e){for(var t=[],n=Object.keys(e),r=n.length,i=0;i<r;i+=1){var a=parseInt(n[i],0),o=e[a];t=t.concat(F.OPERAND(o.value,o.type)),t=t.concat(F.OPERATOR(a))}return t},I.DICT=function(e){return F.DICT(e).length},F.OPERATOR=function(e){return e<1200?[e]:[12,e-1200]},F.OPERAND=function(e,t){var n=[];if(Array.isArray(t))for(var r=0;r<t.length;r+=1)M.argument(e.length===t.length,`Not enough arguments given for type`+t),n=n.concat(F.OPERAND(e[r],t[r]));else if(t===`SID`)n=n.concat(F.NUMBER(e));else if(t===`offset`)n=n.concat(F.NUMBER32(e));else if(t===`number`)n=n.concat(F.NUMBER(e));else if(t===`real`)n=n.concat(F.REAL(e));else throw Error(`Unknown operand type `+t);return n},F.OP=F.BYTE,I.OP=I.BYTE;var le=typeof WeakMap==`function`&&new WeakMap;F.CHARSTRING=function(e){if(le){var t=le.get(e);if(t!==void 0)return t}for(var n=[],r=e.length,i=0;i<r;i+=1){var a=e[i];n=n.concat(F[a.type](a.value))}return le&&le.set(e,n),n},I.CHARSTRING=function(e){return F.CHARSTRING(e).length},F.OBJECT=function(e){var t=F[e.type];return M.argument(t!==void 0,`No encoding function for type `+e.type),t(e.value)},I.OBJECT=function(e){var t=I[e.type];return M.argument(t!==void 0,`No sizeOf function for type `+e.type),t(e.value)},F.TABLE=function(e){for(var t=[],n=e.fields.length,r=[],i=[],a=0;a<n;a+=1){var o=e.fields[a],s=F[o.type];M.argument(s!==void 0,`No encoding function for field type `+o.type+` (`+o.name+`)`);var c=e[o.name];c===void 0&&(c=o.value);var l=s(c);o.type===`TABLE`?(i.push(t.length),t=t.concat([0,0]),r.push(l)):t=t.concat(l)}for(var u=0;u<r.length;u+=1){var d=i[u],f=t.length;M.argument(f<65536,`Table `+e.tableName+` too big.`),t[d]=f>>8,t[d+1]=f&255,t=t.concat(r[u])}return t},I.TABLE=function(e){for(var t=0,n=e.fields.length,r=0;r<n;r+=1){var i=e.fields[r],a=I[i.type];M.argument(a!==void 0,`No sizeOf function for field type `+i.type+` (`+i.name+`)`);var o=e[i.name];o===void 0&&(o=i.value),t+=a(o),i.type===`TABLE`&&(t+=2)}return t},F.RECORD=F.TABLE,I.RECORD=I.TABLE,F.LITERAL=function(e){return e},I.LITERAL=function(e){return e.length};function ue(e,t,n){if(t.length&&(t[0].name!==`coverageFormat`||t[0].value===1))for(var r=0;r<t.length;r+=1){var i=t[r];this[i.name]=i.value}if(this.tableName=e,this.fields=t,n)for(var a=Object.keys(n),o=0;o<a.length;o+=1){var s=a[o],c=n[s];this[s]!==void 0&&(this[s]=c)}}ue.prototype.encode=function(){return F.TABLE(this)},ue.prototype.sizeOf=function(){return I.TABLE(this)};function de(e,t,n){n===void 0&&(n=t.length);var r=Array(t.length+1);r[0]={name:e+`Count`,type:`USHORT`,value:n};for(var i=0;i<t.length;i++)r[i+1]={name:e+i,type:`USHORT`,value:t[i]};return r}function fe(e,t,n){var r=t.length,i=Array(r+1);i[0]={name:e+`Count`,type:`USHORT`,value:r};for(var a=0;a<r;a++)i[a+1]={name:e+a,type:`TABLE`,value:n(t[a],a)};return i}function pe(e,t,n){var r=t.length,i=[];i[0]={name:e+`Count`,type:`USHORT`,value:r};for(var a=0;a<r;a++)i=i.concat(n(t[a],a));return i}function me(e){e.format===1?ue.call(this,`coverageTable`,[{name:`coverageFormat`,type:`USHORT`,value:1}].concat(de(`glyph`,e.glyphs))):e.format===2?ue.call(this,`coverageTable`,[{name:`coverageFormat`,type:`USHORT`,value:2}].concat(pe(`rangeRecord`,e.ranges,function(e){return[{name:`startGlyphID`,type:`USHORT`,value:e.start},{name:`endGlyphID`,type:`USHORT`,value:e.end},{name:`startCoverageIndex`,type:`USHORT`,value:e.index}]}))):M.assert(!1,`Coverage format must be 1 or 2.`)}me.prototype=Object.create(ue.prototype),me.prototype.constructor=me;function he(e){ue.call(this,`scriptListTable`,pe(`scriptRecord`,e,function(e,t){var n=e.script,r=n.defaultLangSys;return M.assert(!!r,`Unable to write GSUB: script `+e.tag+` has no default language system.`),[{name:`scriptTag`+t,type:`TAG`,value:e.tag},{name:`script`+t,type:`TABLE`,value:new ue(`scriptTable`,[{name:`defaultLangSys`,type:`TABLE`,value:new ue(`defaultLangSys`,[{name:`lookupOrder`,type:`USHORT`,value:0},{name:`reqFeatureIndex`,type:`USHORT`,value:r.reqFeatureIndex}].concat(de(`featureIndex`,r.featureIndexes)))}].concat(pe(`langSys`,n.langSysRecords,function(e,t){var n=e.langSys;return[{name:`langSysTag`+t,type:`TAG`,value:e.tag},{name:`langSys`+t,type:`TABLE`,value:new ue(`langSys`,[{name:`lookupOrder`,type:`USHORT`,value:0},{name:`reqFeatureIndex`,type:`USHORT`,value:n.reqFeatureIndex}].concat(de(`featureIndex`,n.featureIndexes)))}]})))}]}))}he.prototype=Object.create(ue.prototype),he.prototype.constructor=he;function ge(e){ue.call(this,`featureListTable`,pe(`featureRecord`,e,function(e,t){var n=e.feature;return[{name:`featureTag`+t,type:`TAG`,value:e.tag},{name:`feature`+t,type:`TABLE`,value:new ue(`featureTable`,[{name:`featureParams`,type:`USHORT`,value:n.featureParams}].concat(de(`lookupListIndex`,n.lookupListIndexes)))}]}))}ge.prototype=Object.create(ue.prototype),ge.prototype.constructor=ge;function _e(e,t){ue.call(this,`lookupListTable`,fe(`lookup`,e,function(e){var n=t[e.lookupType];return M.assert(!!n,`Unable to write GSUB lookup type `+e.lookupType+` tables.`),new ue(`lookupTable`,[{name:`lookupType`,type:`USHORT`,value:e.lookupType},{name:`lookupFlag`,type:`USHORT`,value:e.lookupFlag}].concat(fe(`subtable`,e.subtables,n)))}))}_e.prototype=Object.create(ue.prototype),_e.prototype.constructor=_e;var R={Table:ue,Record:ue,Coverage:me,ScriptList:he,FeatureList:ge,LookupList:_e,ushortList:de,tableList:fe,recordList:pe};function ve(e,t){return e.getUint8(t)}function z(e,t){return e.getUint16(t,!1)}function ye(e,t){return e.getInt16(t,!1)}function be(e,t){return e.getUint32(t,!1)}function xe(e,t){return e.getInt16(t,!1)+e.getUint16(t+2,!1)/65535}function B(e,t){for(var n=``,r=t;r<t+4;r+=1)n+=String.fromCharCode(e.getInt8(r));return n}function Se(e,t,n){for(var r=0,i=0;i<n;i+=1)r<<=8,r+=e.getUint8(t+i);return r}function V(e,t,n){for(var r=[],i=t;i<n;i+=1)r.push(e.getUint8(i));return r}function Ce(e){for(var t=``,n=0;n<e.length;n+=1)t+=String.fromCharCode(e[n]);return t}var we={byte:1,uShort:2,short:2,uLong:4,fixed:4,longDateTime:8,tag:4};function H(e,t){this.data=e,this.offset=t,this.relativeOffset=0}H.prototype.parseByte=function(){var e=this.data.getUint8(this.offset+this.relativeOffset);return this.relativeOffset+=1,e},H.prototype.parseChar=function(){var e=this.data.getInt8(this.offset+this.relativeOffset);return this.relativeOffset+=1,e},H.prototype.parseCard8=H.prototype.parseByte,H.prototype.parseUShort=function(){var e=this.data.getUint16(this.offset+this.relativeOffset);return this.relativeOffset+=2,e},H.prototype.parseCard16=H.prototype.parseUShort,H.prototype.parseSID=H.prototype.parseUShort,H.prototype.parseOffset16=H.prototype.parseUShort,H.prototype.parseShort=function(){var e=this.data.getInt16(this.offset+this.relativeOffset);return this.relativeOffset+=2,e},H.prototype.parseF2Dot14=function(){var e=this.data.getInt16(this.offset+this.relativeOffset)/16384;return this.relativeOffset+=2,e},H.prototype.parseULong=function(){var e=be(this.data,this.offset+this.relativeOffset);return this.relativeOffset+=4,e},H.prototype.parseOffset32=H.prototype.parseULong,H.prototype.parseFixed=function(){var e=xe(this.data,this.offset+this.relativeOffset);return this.relativeOffset+=4,e},H.prototype.parseString=function(e){var t=this.data,n=this.offset+this.relativeOffset,r=``;this.relativeOffset+=e;for(var i=0;i<e;i++)r+=String.fromCharCode(t.getUint8(n+i));return r},H.prototype.parseTag=function(){return this.parseString(4)},H.prototype.parseLongDateTime=function(){var e=be(this.data,this.offset+this.relativeOffset+4);return e-=2082844800,this.relativeOffset+=8,e},H.prototype.parseVersion=function(e){var t=z(this.data,this.offset+this.relativeOffset),n=z(this.data,this.offset+this.relativeOffset+2);return this.relativeOffset+=4,e===void 0&&(e=4096),t+n/e/10},H.prototype.skip=function(e,t){t===void 0&&(t=1),this.relativeOffset+=we[e]*t},H.prototype.parseULongList=function(e){e===void 0&&(e=this.parseULong());for(var t=Array(e),n=this.data,r=this.offset+this.relativeOffset,i=0;i<e;i++)t[i]=n.getUint32(r),r+=4;return this.relativeOffset+=e*4,t},H.prototype.parseOffset16List=H.prototype.parseUShortList=function(e){e===void 0&&(e=this.parseUShort());for(var t=Array(e),n=this.data,r=this.offset+this.relativeOffset,i=0;i<e;i++)t[i]=n.getUint16(r),r+=2;return this.relativeOffset+=e*2,t},H.prototype.parseShortList=function(e){for(var t=Array(e),n=this.data,r=this.offset+this.relativeOffset,i=0;i<e;i++)t[i]=n.getInt16(r),r+=2;return this.relativeOffset+=e*2,t},H.prototype.parseByteList=function(e){for(var t=Array(e),n=this.data,r=this.offset+this.relativeOffset,i=0;i<e;i++)t[i]=n.getUint8(r++);return this.relativeOffset+=e,t},H.prototype.parseList=function(e,t){t||(t=e,e=this.parseUShort());for(var n=Array(e),r=0;r<e;r++)n[r]=t.call(this);return n},H.prototype.parseList32=function(e,t){t||(t=e,e=this.parseULong());for(var n=Array(e),r=0;r<e;r++)n[r]=t.call(this);return n},H.prototype.parseRecordList=function(e,t){t||(t=e,e=this.parseUShort());for(var n=Array(e),r=Object.keys(t),i=0;i<e;i++){for(var a={},o=0;o<r.length;o++){var s=r[o];a[s]=t[s].call(this)}n[i]=a}return n},H.prototype.parseRecordList32=function(e,t){t||(t=e,e=this.parseULong());for(var n=Array(e),r=Object.keys(t),i=0;i<e;i++){for(var a={},o=0;o<r.length;o++){var s=r[o];a[s]=t[s].call(this)}n[i]=a}return n},H.prototype.parseStruct=function(e){if(typeof e==`function`)return e.call(this);for(var t=Object.keys(e),n={},r=0;r<t.length;r++){var i=t[r];n[i]=e[i].call(this)}return n},H.prototype.parseValueRecord=function(e){if(e===void 0&&(e=this.parseUShort()),e!==0){var t={};return e&1&&(t.xPlacement=this.parseShort()),e&2&&(t.yPlacement=this.parseShort()),e&4&&(t.xAdvance=this.parseShort()),e&8&&(t.yAdvance=this.parseShort()),e&16&&(t.xPlaDevice=void 0,this.parseShort()),e&32&&(t.yPlaDevice=void 0,this.parseShort()),e&64&&(t.xAdvDevice=void 0,this.parseShort()),e&128&&(t.yAdvDevice=void 0,this.parseShort()),t}},H.prototype.parseValueRecordList=function(){for(var e=this.parseUShort(),t=this.parseUShort(),n=Array(t),r=0;r<t;r++)n[r]=this.parseValueRecord(e);return n},H.prototype.parsePointer=function(e){var t=this.parseOffset16();if(t>0)return new H(this.data,this.offset+t).parseStruct(e)},H.prototype.parsePointer32=function(e){var t=this.parseOffset32();if(t>0)return new H(this.data,this.offset+t).parseStruct(e)},H.prototype.parseListOfLists=function(e){for(var t=this.parseOffset16List(),n=t.length,r=this.relativeOffset,i=Array(n),a=0;a<n;a++){var o=t[a];if(o===0){i[a]=void 0;continue}if(this.relativeOffset=o,e){for(var s=this.parseOffset16List(),c=Array(s.length),l=0;l<s.length;l++)this.relativeOffset=o+s[l],c[l]=e.call(this);i[a]=c}else i[a]=this.parseUShortList()}return this.relativeOffset=r,i},H.prototype.parseCoverage=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort(),n=this.parseUShort();if(t===1)return{format:1,glyphs:this.parseUShortList(n)};if(t===2){for(var r=Array(n),i=0;i<n;i++)r[i]={start:this.parseUShort(),end:this.parseUShort(),index:this.parseUShort()};return{format:2,ranges:r}}throw Error(`0x`+e.toString(16)+`: Coverage format must be 1 or 2.`)},H.prototype.parseClassDef=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();if(t===1)return{format:1,startGlyph:this.parseUShort(),classes:this.parseUShortList()};if(t===2)return{format:2,ranges:this.parseRecordList({start:H.uShort,end:H.uShort,classId:H.uShort})};throw Error(`0x`+e.toString(16)+`: ClassDef format must be 1 or 2.`)},H.list=function(e,t){return function(){return this.parseList(e,t)}},H.list32=function(e,t){return function(){return this.parseList32(e,t)}},H.recordList=function(e,t){return function(){return this.parseRecordList(e,t)}},H.recordList32=function(e,t){return function(){return this.parseRecordList32(e,t)}},H.pointer=function(e){return function(){return this.parsePointer(e)}},H.pointer32=function(e){return function(){return this.parsePointer32(e)}},H.tag=H.prototype.parseTag,H.byte=H.prototype.parseByte,H.uShort=H.offset16=H.prototype.parseUShort,H.uShortList=H.prototype.parseUShortList,H.uLong=H.offset32=H.prototype.parseULong,H.uLongList=H.prototype.parseULongList,H.struct=H.prototype.parseStruct,H.coverage=H.prototype.parseCoverage,H.classDef=H.prototype.parseClassDef;var Te={reserved:H.uShort,reqFeatureIndex:H.uShort,featureIndexes:H.uShortList};H.prototype.parseScriptList=function(){return this.parsePointer(H.recordList({tag:H.tag,script:H.pointer({defaultLangSys:H.pointer(Te),langSysRecords:H.recordList({tag:H.tag,langSys:H.pointer(Te)})})}))||[]},H.prototype.parseFeatureList=function(){return this.parsePointer(H.recordList({tag:H.tag,feature:H.pointer({featureParams:H.offset16,lookupListIndexes:H.uShortList})}))||[]},H.prototype.parseLookupList=function(e){return this.parsePointer(H.list(H.pointer(function(){var t=this.parseUShort();M.argument(1<=t&&t<=9,`GPOS/GSUB lookup type `+t+` unknown.`);var n=this.parseUShort(),r=n&16;return{lookupType:t,lookupFlag:n,subtables:this.parseList(H.pointer(e[t])),markFilteringSet:r?this.parseUShort():void 0}})))||[]},H.prototype.parseFeatureVariationsList=function(){return this.parsePointer32(function(){var e=this.parseUShort(),t=this.parseUShort();return M.argument(e===1&&t<1,`GPOS/GSUB feature variations table unknown.`),this.parseRecordList32({conditionSetOffset:H.offset32,featureTableSubstitutionOffset:H.offset32})})||[]};var U={getByte:ve,getCard8:ve,getUShort:z,getCard16:z,getShort:ye,getULong:be,getFixed:xe,getTag:B,getOffset:Se,getBytes:V,bytesToString:Ce,Parser:H};function Ee(e,t){t.parseUShort(),e.length=t.parseULong(),e.language=t.parseULong();var n;e.groupCount=n=t.parseULong(),e.glyphIndexMap={};for(var r=0;r<n;r+=1)for(var i=t.parseULong(),a=t.parseULong(),o=t.parseULong(),s=i;s<=a;s+=1)e.glyphIndexMap[s]=o,o++}function De(e,t,n,r,i){e.length=t.parseUShort(),e.language=t.parseUShort();var a;e.segCount=a=t.parseUShort()>>1,t.skip(`uShort`,3),e.glyphIndexMap={};for(var o=new U.Parser(n,r+i+14),s=new U.Parser(n,r+i+16+a*2),c=new U.Parser(n,r+i+16+a*4),l=new U.Parser(n,r+i+16+a*6),u=r+i+16+a*8,d=0;d<a-1;d+=1)for(var f=void 0,p=o.parseUShort(),m=s.parseUShort(),h=c.parseShort(),g=l.parseUShort(),_=m;_<=p;_+=1)g===0?f=_+h&65535:(u=l.offset+l.relativeOffset-2,u+=g,u+=(_-m)*2,f=U.getUShort(n,u),f!==0&&(f=f+h&65535)),e.glyphIndexMap[_]=f}function Oe(e,t){var n={};n.version=U.getUShort(e,t),M.argument(n.version===0,`cmap table version should be 0.`),n.numTables=U.getUShort(e,t+2);for(var r=-1,i=n.numTables-1;i>=0;--i){var a=U.getUShort(e,t+4+i*8),o=U.getUShort(e,t+4+i*8+2);if(a===3&&(o===0||o===1||o===10)||a===0&&(o===0||o===1||o===2||o===3||o===4)){r=U.getULong(e,t+4+i*8+4);break}}if(r===-1)throw Error(`No valid cmap sub-tables found.`);var s=new U.Parser(e,t+r);if(n.format=s.parseUShort(),n.format===12)Ee(n,s);else if(n.format===4)De(n,s,e,t,r);else throw Error(`Only format 4 and 12 cmap tables are supported (found format `+n.format+`).`);return n}function ke(e,t,n){e.segments.push({end:t,start:t,delta:-(t-n),offset:0,glyphIndex:n})}function Ae(e){e.segments.push({end:65535,start:65535,delta:1,offset:0})}function je(e){for(var t=!0,n=e.length-1;n>0;--n)if(e.get(n).unicode>65535){console.log(`Adding CMAP format 12 (needed!)`),t=!1;break}var r=[{name:`version`,type:`USHORT`,value:0},{name:`numTables`,type:`USHORT`,value:t?1:2},{name:`platformID`,type:`USHORT`,value:3},{name:`encodingID`,type:`USHORT`,value:1},{name:`offset`,type:`ULONG`,value:t?12:20}];t||(r=r.concat([{name:`cmap12PlatformID`,type:`USHORT`,value:3},{name:`cmap12EncodingID`,type:`USHORT`,value:10},{name:`cmap12Offset`,type:`ULONG`,value:0}])),r=r.concat([{name:`format`,type:`USHORT`,value:4},{name:`cmap4Length`,type:`USHORT`,value:0},{name:`language`,type:`USHORT`,value:0},{name:`segCountX2`,type:`USHORT`,value:0},{name:`searchRange`,type:`USHORT`,value:0},{name:`entrySelector`,type:`USHORT`,value:0},{name:`rangeShift`,type:`USHORT`,value:0}]);var i=new R.Table(`cmap`,r);for(i.segments=[],n=0;n<e.length;n+=1){for(var a=e.get(n),o=0;o<a.unicodes.length;o+=1)ke(i,a.unicodes[o],n);i.segments=i.segments.sort(function(e,t){return e.start-t.start})}Ae(i);var s=i.segments.length,c=0,l=[],u=[],d=[],f=[],p=[],m=[];for(n=0;n<s;n+=1){var h=i.segments[n];h.end<=65535&&h.start<=65535?(l=l.concat({name:`end_`+n,type:`USHORT`,value:h.end}),u=u.concat({name:`start_`+n,type:`USHORT`,value:h.start}),d=d.concat({name:`idDelta_`+n,type:`SHORT`,value:h.delta}),f=f.concat({name:`idRangeOffset_`+n,type:`USHORT`,value:h.offset}),h.glyphId!==void 0&&(p=p.concat({name:`glyph_`+n,type:`USHORT`,value:h.glyphId}))):c+=1,!t&&h.glyphIndex!==void 0&&(m=m.concat({name:`cmap12Start_`+n,type:`ULONG`,value:h.start}),m=m.concat({name:`cmap12End_`+n,type:`ULONG`,value:h.end}),m=m.concat({name:`cmap12Glyph_`+n,type:`ULONG`,value:h.glyphIndex}))}if(i.segCountX2=(s-c)*2,i.searchRange=2**Math.floor(Math.log(s-c)/Math.log(2))*2,i.entrySelector=Math.log(i.searchRange/2)/Math.log(2),i.rangeShift=i.segCountX2-i.searchRange,i.fields=i.fields.concat(l),i.fields.push({name:`reservedPad`,type:`USHORT`,value:0}),i.fields=i.fields.concat(u),i.fields=i.fields.concat(d),i.fields=i.fields.concat(f),i.fields=i.fields.concat(p),i.cmap4Length=14+l.length*2+2+u.length*2+d.length*2+f.length*2+p.length*2,!t){var g=16+m.length*4;i.cmap12Offset=20+i.cmap4Length,i.fields=i.fields.concat([{name:`cmap12Format`,type:`USHORT`,value:12},{name:`cmap12Reserved`,type:`USHORT`,value:0},{name:`cmap12Length`,type:`ULONG`,value:g},{name:`cmap12Language`,type:`ULONG`,value:0},{name:`cmap12nGroups`,type:`ULONG`,value:m.length/3}]),i.fields=i.fields.concat(m)}return i}var Me={parse:Oe,make:je},Ne=`.notdef,space,exclam,quotedbl,numbersign,dollar,percent,ampersand,quoteright,parenleft,parenright,asterisk,plus,comma,hyphen,period,slash,zero,one,two,three,four,five,six,seven,eight,nine,colon,semicolon,less,equal,greater,question,at,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,bracketleft,backslash,bracketright,asciicircum,underscore,quoteleft,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,braceleft,bar,braceright,asciitilde,exclamdown,cent,sterling,fraction,yen,florin,section,currency,quotesingle,quotedblleft,guillemotleft,guilsinglleft,guilsinglright,fi,fl,endash,dagger,daggerdbl,periodcentered,paragraph,bullet,quotesinglbase,quotedblbase,quotedblright,guillemotright,ellipsis,perthousand,questiondown,grave,acute,circumflex,tilde,macron,breve,dotaccent,dieresis,ring,cedilla,hungarumlaut,ogonek,caron,emdash,AE,ordfeminine,Lslash,Oslash,OE,ordmasculine,ae,dotlessi,lslash,oslash,oe,germandbls,onesuperior,logicalnot,mu,trademark,Eth,onehalf,plusminus,Thorn,onequarter,divide,brokenbar,degree,thorn,threequarters,twosuperior,registered,minus,eth,multiply,threesuperior,copyright,Aacute,Acircumflex,Adieresis,Agrave,Aring,Atilde,Ccedilla,Eacute,Ecircumflex,Edieresis,Egrave,Iacute,Icircumflex,Idieresis,Igrave,Ntilde,Oacute,Ocircumflex,Odieresis,Ograve,Otilde,Scaron,Uacute,Ucircumflex,Udieresis,Ugrave,Yacute,Ydieresis,Zcaron,aacute,acircumflex,adieresis,agrave,aring,atilde,ccedilla,eacute,ecircumflex,edieresis,egrave,iacute,icircumflex,idieresis,igrave,ntilde,oacute,ocircumflex,odieresis,ograve,otilde,scaron,uacute,ucircumflex,udieresis,ugrave,yacute,ydieresis,zcaron,exclamsmall,Hungarumlautsmall,dollaroldstyle,dollarsuperior,ampersandsmall,Acutesmall,parenleftsuperior,parenrightsuperior,266 ff,onedotenleader,zerooldstyle,oneoldstyle,twooldstyle,threeoldstyle,fouroldstyle,fiveoldstyle,sixoldstyle,sevenoldstyle,eightoldstyle,nineoldstyle,commasuperior,threequartersemdash,periodsuperior,questionsmall,asuperior,bsuperior,centsuperior,dsuperior,esuperior,isuperior,lsuperior,msuperior,nsuperior,osuperior,rsuperior,ssuperior,tsuperior,ff,ffi,ffl,parenleftinferior,parenrightinferior,Circumflexsmall,hyphensuperior,Gravesmall,Asmall,Bsmall,Csmall,Dsmall,Esmall,Fsmall,Gsmall,Hsmall,Ismall,Jsmall,Ksmall,Lsmall,Msmall,Nsmall,Osmall,Psmall,Qsmall,Rsmall,Ssmall,Tsmall,Usmall,Vsmall,Wsmall,Xsmall,Ysmall,Zsmall,colonmonetary,onefitted,rupiah,Tildesmall,exclamdownsmall,centoldstyle,Lslashsmall,Scaronsmall,Zcaronsmall,Dieresissmall,Brevesmall,Caronsmall,Dotaccentsmall,Macronsmall,figuredash,hypheninferior,Ogoneksmall,Ringsmall,Cedillasmall,questiondownsmall,oneeighth,threeeighths,fiveeighths,seveneighths,onethird,twothirds,zerosuperior,foursuperior,fivesuperior,sixsuperior,sevensuperior,eightsuperior,ninesuperior,zeroinferior,oneinferior,twoinferior,threeinferior,fourinferior,fiveinferior,sixinferior,seveninferior,eightinferior,nineinferior,centinferior,dollarinferior,periodinferior,commainferior,Agravesmall,Aacutesmall,Acircumflexsmall,Atildesmall,Adieresissmall,Aringsmall,AEsmall,Ccedillasmall,Egravesmall,Eacutesmall,Ecircumflexsmall,Edieresissmall,Igravesmall,Iacutesmall,Icircumflexsmall,Idieresissmall,Ethsmall,Ntildesmall,Ogravesmall,Oacutesmall,Ocircumflexsmall,Otildesmall,Odieresissmall,OEsmall,Oslashsmall,Ugravesmall,Uacutesmall,Ucircumflexsmall,Udieresissmall,Yacutesmall,Thornsmall,Ydieresissmall,001.000,001.001,001.002,001.003,Black,Bold,Book,Light,Medium,Regular,Roman,Semibold`.split(`,`),Pe=`................................space.exclam.quotedbl.numbersign.dollar.percent.ampersand.quoteright.parenleft.parenright.asterisk.plus.comma.hyphen.period.slash.zero.one.two.three.four.five.six.seven.eight.nine.colon.semicolon.less.equal.greater.question.at.A.B.C.D.E.F.G.H.I.J.K.L.M.N.O.P.Q.R.S.T.U.V.W.X.Y.Z.bracketleft.backslash.bracketright.asciicircum.underscore.quoteleft.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.braceleft.bar.braceright.asciitilde...................................exclamdown.cent.sterling.fraction.yen.florin.section.currency.quotesingle.quotedblleft.guillemotleft.guilsinglleft.guilsinglright.fi.fl..endash.dagger.daggerdbl.periodcentered..paragraph.bullet.quotesinglbase.quotedblbase.quotedblright.guillemotright.ellipsis.perthousand..questiondown..grave.acute.circumflex.tilde.macron.breve.dotaccent.dieresis..ring.cedilla..hungarumlaut.ogonek.caron.emdash.................AE..ordfeminine.....Lslash.Oslash.OE.ordmasculine......ae....dotlessi...lslash.oslash.oe.germandbls`.split(`.`),Fe=`................................space.exclamsmall.Hungarumlautsmall..dollaroldstyle.dollarsuperior.ampersandsmall.Acutesmall.parenleftsuperior.parenrightsuperior.twodotenleader.onedotenleader.comma.hyphen.period.fraction.zerooldstyle.oneoldstyle.twooldstyle.threeoldstyle.fouroldstyle.fiveoldstyle.sixoldstyle.sevenoldstyle.eightoldstyle.nineoldstyle.colon.semicolon.commasuperior.threequartersemdash.periodsuperior.questionsmall..asuperior.bsuperior.centsuperior.dsuperior.esuperior...isuperior...lsuperior.msuperior.nsuperior.osuperior...rsuperior.ssuperior.tsuperior..ff.fi.fl.ffi.ffl.parenleftinferior..parenrightinferior.Circumflexsmall.hyphensuperior.Gravesmall.Asmall.Bsmall.Csmall.Dsmall.Esmall.Fsmall.Gsmall.Hsmall.Ismall.Jsmall.Ksmall.Lsmall.Msmall.Nsmall.Osmall.Psmall.Qsmall.Rsmall.Ssmall.Tsmall.Usmall.Vsmall.Wsmall.Xsmall.Ysmall.Zsmall.colonmonetary.onefitted.rupiah.Tildesmall...................................exclamdownsmall.centoldstyle.Lslashsmall...Scaronsmall.Zcaronsmall.Dieresissmall.Brevesmall.Caronsmall..Dotaccentsmall...Macronsmall...figuredash.hypheninferior...Ogoneksmall.Ringsmall.Cedillasmall....onequarter.onehalf.threequarters.questiondownsmall.oneeighth.threeeighths.fiveeighths.seveneighths.onethird.twothirds...zerosuperior.onesuperior.twosuperior.threesuperior.foursuperior.fivesuperior.sixsuperior.sevensuperior.eightsuperior.ninesuperior.zeroinferior.oneinferior.twoinferior.threeinferior.fourinferior.fiveinferior.sixinferior.seveninferior.eightinferior.nineinferior.centinferior.dollarinferior.periodinferior.commainferior.Agravesmall.Aacutesmall.Acircumflexsmall.Atildesmall.Adieresissmall.Aringsmall.AEsmall.Ccedillasmall.Egravesmall.Eacutesmall.Ecircumflexsmall.Edieresissmall.Igravesmall.Iacutesmall.Icircumflexsmall.Idieresissmall.Ethsmall.Ntildesmall.Ogravesmall.Oacutesmall.Ocircumflexsmall.Otildesmall.Odieresissmall.OEsmall.Oslashsmall.Ugravesmall.Uacutesmall.Ucircumflexsmall.Udieresissmall.Yacutesmall.Thornsmall.Ydieresissmall`.split(`.`),Ie=`.notdef,.null,nonmarkingreturn,space,exclam,quotedbl,numbersign,dollar,percent,ampersand,quotesingle,parenleft,parenright,asterisk,plus,comma,hyphen,period,slash,zero,one,two,three,four,five,six,seven,eight,nine,colon,semicolon,less,equal,greater,question,at,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,bracketleft,backslash,bracketright,asciicircum,underscore,grave,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,braceleft,bar,braceright,asciitilde,Adieresis,Aring,Ccedilla,Eacute,Ntilde,Odieresis,Udieresis,aacute,agrave,acircumflex,adieresis,atilde,aring,ccedilla,eacute,egrave,ecircumflex,edieresis,iacute,igrave,icircumflex,idieresis,ntilde,oacute,ograve,ocircumflex,odieresis,otilde,uacute,ugrave,ucircumflex,udieresis,dagger,degree,cent,sterling,section,bullet,paragraph,germandbls,registered,copyright,trademark,acute,dieresis,notequal,AE,Oslash,infinity,plusminus,lessequal,greaterequal,yen,mu,partialdiff,summation,product,pi,integral,ordfeminine,ordmasculine,Omega,ae,oslash,questiondown,exclamdown,logicalnot,radical,florin,approxequal,Delta,guillemotleft,guillemotright,ellipsis,nonbreakingspace,Agrave,Atilde,Otilde,OE,oe,endash,emdash,quotedblleft,quotedblright,quoteleft,quoteright,divide,lozenge,ydieresis,Ydieresis,fraction,currency,guilsinglleft,guilsinglright,fi,fl,daggerdbl,periodcentered,quotesinglbase,quotedblbase,perthousand,Acircumflex,Ecircumflex,Aacute,Edieresis,Egrave,Iacute,Icircumflex,Idieresis,Igrave,Oacute,Ocircumflex,apple,Ograve,Uacute,Ucircumflex,Ugrave,dotlessi,circumflex,tilde,macron,breve,dotaccent,ring,cedilla,hungarumlaut,ogonek,caron,Lslash,lslash,Scaron,scaron,Zcaron,zcaron,brokenbar,Eth,eth,Yacute,yacute,Thorn,thorn,minus,multiply,onesuperior,twosuperior,threesuperior,onehalf,onequarter,threequarters,franc,Gbreve,gbreve,Idotaccent,Scedilla,scedilla,Cacute,cacute,Ccaron,ccaron,dcroat`.split(`,`);function Le(e){this.font=e}Le.prototype.charToGlyphIndex=function(e){var t=e.codePointAt(0),n=this.font.glyphs;if(n){for(var r=0;r<n.length;r+=1)for(var i=n.get(r),a=0;a<i.unicodes.length;a+=1)if(i.unicodes[a]===t)return r}return null};function Re(e){this.cmap=e}Re.prototype.charToGlyphIndex=function(e){return this.cmap.glyphIndexMap[e.codePointAt(0)]||0};function ze(e,t){this.encoding=e,this.charset=t}ze.prototype.charToGlyphIndex=function(e){var t=e.codePointAt(0),n=this.encoding[t];return this.charset.indexOf(n)};function Be(e){switch(e.version){case 1:this.names=Ie.slice();break;case 2:this.names=Array(e.numberOfGlyphs);for(var t=0;t<e.numberOfGlyphs;t++)e.glyphNameIndex[t]<Ie.length?this.names[t]=Ie[e.glyphNameIndex[t]]:this.names[t]=e.names[e.glyphNameIndex[t]-Ie.length];break;case 2.5:this.names=Array(e.numberOfGlyphs);for(var n=0;n<e.numberOfGlyphs;n++)this.names[n]=Ie[n+e.glyphNameIndex[n]];break;case 3:this.names=[];break;default:this.names=[]}}Be.prototype.nameToGlyphIndex=function(e){return this.names.indexOf(e)},Be.prototype.glyphIndexToName=function(e){return this.names[e]};function Ve(e){for(var t,n=e.tables.cmap.glyphIndexMap,r=Object.keys(n),i=0;i<r.length;i+=1){var a=r[i],o=n[a];t=e.glyphs.get(o),t.addUnicode(parseInt(a))}for(var s=0;s<e.glyphs.length;s+=1)t=e.glyphs.get(s),e.cffEncoding?e.isCIDFont?t.name=`gid`+s:t.name=e.cffEncoding.charset[s]:e.glyphNames.names&&(t.name=e.glyphNames.glyphIndexToName(s))}function He(e){e._IndexToUnicodeMap={};for(var t=e.tables.cmap.glyphIndexMap,n=Object.keys(t),r=0;r<n.length;r+=1){var i=n[r],a=t[i];e._IndexToUnicodeMap[a]===void 0?e._IndexToUnicodeMap[a]={unicodes:[parseInt(i)]}:e._IndexToUnicodeMap[a].unicodes.push(parseInt(i))}}function Ue(e,t){t.lowMemory?He(e):Ve(e)}function We(e,t,n,r,i){e.beginPath(),e.moveTo(t,n),e.lineTo(r,i),e.stroke()}var Ge={line:We};function Ke(e,t){var n=t||new k;return{configurable:!0,get:function(){return typeof n==`function`&&(n=n()),n},set:function(e){n=e}}}function qe(e){this.bindConstructorValues(e)}qe.prototype.bindConstructorValues=function(e){this.index=e.index||0,this.name=e.name||null,this.unicode=e.unicode||void 0,this.unicodes=e.unicodes||e.unicode!==void 0?[e.unicode]:[],`xMin`in e&&(this.xMin=e.xMin),`yMin`in e&&(this.yMin=e.yMin),`xMax`in e&&(this.xMax=e.xMax),`yMax`in e&&(this.yMax=e.yMax),`advanceWidth`in e&&(this.advanceWidth=e.advanceWidth),Object.defineProperty(this,"path",Ke(this,e.path))},qe.prototype.addUnicode=function(e){this.unicodes.length===0&&(this.unicode=e),this.unicodes.push(e)},qe.prototype.getBoundingBox=function(){return this.path.getBoundingBox()},qe.prototype.getPath=function(e,t,n,r,i){e=e===void 0?0:e,t=t===void 0?0:t,n=n===void 0?72:n;var a,o;r||={};var s=r.xScale,c=r.yScale;if(r.hinting&&i&&i.hinting&&(o=this.path&&i.hinting.exec(this,n)),o)a=i.hinting.getCommands(o),e=Math.round(e),t=Math.round(t),s=c=1;else{a=this.path.commands;var l=1/(this.path.unitsPerEm||1e3)*n;s===void 0&&(s=l),c===void 0&&(c=l)}for(var u=new k,d=0;d<a.length;d+=1){var f=a[d];f.type===`M`?u.moveTo(e+f.x*s,t+-f.y*c):f.type===`L`?u.lineTo(e+f.x*s,t+-f.y*c):f.type===`Q`?u.quadraticCurveTo(e+f.x1*s,t+-f.y1*c,e+f.x*s,t+-f.y*c):f.type===`C`?u.curveTo(e+f.x1*s,t+-f.y1*c,e+f.x2*s,t+-f.y2*c,e+f.x*s,t+-f.y*c):f.type===`Z`&&u.closePath()}return u},qe.prototype.getContours=function(){if(this.points===void 0)return[];for(var e=[],t=[],n=0;n<this.points.length;n+=1){var r=this.points[n];t.push(r),r.lastPointOfContour&&(e.push(t),t=[])}return M.argument(t.length===0,`There are still points left in the current contour.`),e},qe.prototype.getMetrics=function(){for(var e=this.path.commands,t=[],n=[],r=0;r<e.length;r+=1){var i=e[r];i.type!==`Z`&&(t.push(i.x),n.push(i.y)),(i.type===`Q`||i.type===`C`)&&(t.push(i.x1),n.push(i.y1)),i.type===`C`&&(t.push(i.x2),n.push(i.y2))}var a={xMin:Math.min.apply(null,t),yMin:Math.min.apply(null,n),xMax:Math.max.apply(null,t),yMax:Math.max.apply(null,n),leftSideBearing:this.leftSideBearing};return isFinite(a.xMin)||(a.xMin=0),isFinite(a.xMax)||(a.xMax=this.advanceWidth),isFinite(a.yMin)||(a.yMin=0),isFinite(a.yMax)||(a.yMax=0),a.rightSideBearing=this.advanceWidth-a.leftSideBearing-(a.xMax-a.xMin),a},qe.prototype.draw=function(e,t,n,r,i){this.getPath(t,n,r,i).draw(e)},qe.prototype.drawPoints=function(e,t,n,r){function i(t,n,r,i){e.beginPath();for(var a=0;a<t.length;a+=1)e.moveTo(n+t[a].x*i,r+t[a].y*i),e.arc(n+t[a].x*i,r+t[a].y*i,2,0,Math.PI*2,!1);e.closePath(),e.fill()}t=t===void 0?0:t,n=n===void 0?0:n,r=r===void 0?24:r;for(var a=1/this.path.unitsPerEm*r,o=[],s=[],c=this.path,l=0;l<c.commands.length;l+=1){var u=c.commands[l];u.x!==void 0&&o.push({x:u.x,y:-u.y}),u.x1!==void 0&&s.push({x:u.x1,y:-u.y1}),u.x2!==void 0&&s.push({x:u.x2,y:-u.y2})}e.fillStyle=`blue`,i(o,t,n,a),e.fillStyle=`red`,i(s,t,n,a)},qe.prototype.drawMetrics=function(e,t,n,r){var i;t=t===void 0?0:t,n=n===void 0?0:n,r=r===void 0?24:r,i=1/this.path.unitsPerEm*r,e.lineWidth=1,e.strokeStyle=`black`,Ge.line(e,t,-1e4,t,1e4),Ge.line(e,-1e4,n,1e4,n);var a=this.xMin||0,o=this.yMin||0,s=this.xMax||0,c=this.yMax||0,l=this.advanceWidth||0;e.strokeStyle=`blue`,Ge.line(e,t+a*i,-1e4,t+a*i,1e4),Ge.line(e,t+s*i,-1e4,t+s*i,1e4),Ge.line(e,-1e4,n+-o*i,1e4,n+-o*i),Ge.line(e,-1e4,n+-c*i,1e4,n+-c*i),e.strokeStyle=`green`,Ge.line(e,t+l*i,-1e4,t+l*i,1e4)};function Je(e,t,n){Object.defineProperty(e,t,{get:function(){return e.path,e[n]},set:function(t){e[n]=t},enumerable:!0,configurable:!0})}function Ye(e,t){if(this.font=e,this.glyphs={},Array.isArray(t))for(var n=0;n<t.length;n++){var r=t[n];r.path.unitsPerEm=e.unitsPerEm,this.glyphs[n]=r}this.length=t&&t.length||0}Ye.prototype.get=function(e){if(this.glyphs[e]===void 0){this.font._push(e),typeof this.glyphs[e]==`function`&&(this.glyphs[e]=this.glyphs[e]());var t=this.glyphs[e],n=this.font._IndexToUnicodeMap[e];if(n)for(var r=0;r<n.unicodes.length;r++)t.addUnicode(n.unicodes[r]);this.font.cffEncoding?t.name=this.font.isCIDFont?`gid`+e:this.font.cffEncoding.charset[e]:this.font.glyphNames.names&&(t.name=this.font.glyphNames.glyphIndexToName(e)),this.glyphs[e].advanceWidth=this.font._hmtxTableData[e].advanceWidth,this.glyphs[e].leftSideBearing=this.font._hmtxTableData[e].leftSideBearing}else typeof this.glyphs[e]==`function`&&(this.glyphs[e]=this.glyphs[e]());return this.glyphs[e]},Ye.prototype.push=function(e,t){this.glyphs[e]=t,this.length++};function Xe(e,t){return new qe({index:t,font:e})}function Ze(e,t,n,r,i,a){return function(){var o=new qe({index:t,font:e});return o.path=function(){n(o,r,i);var t=a(e.glyphs,o);return t.unitsPerEm=e.unitsPerEm,t},Je(o,`xMin`,`_xMin`),Je(o,`xMax`,`_xMax`),Je(o,`yMin`,`_yMin`),Je(o,`yMax`,`_yMax`),o}}function Qe(e,t,n,r){return function(){var i=new qe({index:t,font:e});return i.path=function(){var t=n(e,i,r);return t.unitsPerEm=e.unitsPerEm,t},i}}var $e={GlyphSet:Ye,glyphLoader:Xe,ttfGlyphLoader:Ze,cffGlyphLoader:Qe};function et(e,t){if(e===t)return!0;if(Array.isArray(e)&&Array.isArray(t)){if(e.length!==t.length)return!1;for(var n=0;n<e.length;n+=1)if(!et(e[n],t[n]))return!1;return!0}return!1}function tt(e){return e.length<1240?107:e.length<33900?1131:32768}function nt(e,t,n){var r=[],i=[],a=U.getCard16(e,t),o,s;if(a!==0){var c=U.getByte(e,t+2);o=t+(a+1)*c+2;for(var l=t+3,u=0;u<a+1;u+=1)r.push(U.getOffset(e,l,c)),l+=c;s=o+r[a]}else s=t+2;for(var d=0;d<r.length-1;d+=1){var f=U.getBytes(e,o+r[d],o+r[d+1]);n&&(f=n(f)),i.push(f)}return{objects:i,startOffset:t,endOffset:s}}function rt(e,t){var n=[],r=U.getCard16(e,t),i,a;if(r!==0){var o=U.getByte(e,t+2);i=t+(r+1)*o+2;for(var s=t+3,c=0;c<r+1;c+=1)n.push(U.getOffset(e,s,o)),s+=o;a=i+n[r]}else a=t+2;return{offsets:n,startOffset:t,endOffset:a}}function it(e,t,n,r,i){var a=U.getCard16(n,r),o=0;if(a!==0){var s=U.getByte(n,r+2);o=r+(a+1)*s+2}var c=U.getBytes(n,o+t[e],o+t[e+1]);return i&&(c=i(c)),c}function at(e){for(var t=``,n=15,r=[`0`,`1`,`2`,`3`,`4`,`5`,`6`,`7`,`8`,`9`,`.`,`E`,`E-`,null,`-`];;){var i=e.parseByte(),a=i>>4,o=i&15;if(a===n||(t+=r[a],o===n))break;t+=r[o]}return parseFloat(t)}function ot(e,t){var n,r,i,a;if(t===28)return n=e.parseByte(),r=e.parseByte(),n<<8|r;if(t===29)return n=e.parseByte(),r=e.parseByte(),i=e.parseByte(),a=e.parseByte(),n<<24|r<<16|i<<8|a;if(t===30)return at(e);if(t>=32&&t<=246)return t-139;if(t>=247&&t<=250)return n=e.parseByte(),(t-247)*256+n+108;if(t>=251&&t<=254)return n=e.parseByte(),-(t-251)*256-n-108;throw Error(`Invalid b0 `+t)}function st(e){for(var t={},n=0;n<e.length;n+=1){var r=e[n][0],i=e[n][1],a=void 0;if(a=i.length===1?i[0]:i,t.hasOwnProperty(r)&&!isNaN(t[r]))throw Error(`Object `+t+` already has key `+r);t[r]=a}return t}function ct(e,t,n){t=t===void 0?0:t;var r=new U.Parser(e,t),i=[],a=[];for(n=n===void 0?e.length:n;r.relativeOffset<n;){var o=r.parseByte();o<=21?(o===12&&(o=1200+r.parseByte()),i.push([o,a]),a=[]):a.push(ot(r,o))}return st(i)}function lt(e,t){return t=t<=390?Ne[t]:e[t-391],t}function ut(e,t,n){for(var r={},i,a=0;a<t.length;a+=1){var o=t[a];if(Array.isArray(o.type)){var s=[];s.length=o.type.length;for(var c=0;c<o.type.length;c++)i=e[o.op]===void 0?void 0:e[o.op][c],i===void 0&&(i=o.value!==void 0&&o.value[c]!==void 0?o.value[c]:null),o.type[c]===`SID`&&(i=lt(n,i)),s[c]=i;r[o.name]=s}else i=e[o.op],i===void 0&&(i=o.value===void 0?null:o.value),o.type===`SID`&&(i=lt(n,i)),r[o.name]=i}return r}function dt(e,t){var n={};return n.formatMajor=U.getCard8(e,t),n.formatMinor=U.getCard8(e,t+1),n.size=U.getCard8(e,t+2),n.offsetSize=U.getCard8(e,t+3),n.startOffset=t,n.endOffset=t+4,n}var ft=[{name:`version`,op:0,type:`SID`},{name:`notice`,op:1,type:`SID`},{name:`copyright`,op:1200,type:`SID`},{name:`fullName`,op:2,type:`SID`},{name:`familyName`,op:3,type:`SID`},{name:`weight`,op:4,type:`SID`},{name:`isFixedPitch`,op:1201,type:`number`,value:0},{name:`italicAngle`,op:1202,type:`number`,value:0},{name:`underlinePosition`,op:1203,type:`number`,value:-100},{name:`underlineThickness`,op:1204,type:`number`,value:50},{name:`paintType`,op:1205,type:`number`,value:0},{name:`charstringType`,op:1206,type:`number`,value:2},{name:`fontMatrix`,op:1207,type:[`real`,`real`,`real`,`real`,`real`,`real`],value:[.001,0,0,.001,0,0]},{name:`uniqueId`,op:13,type:`number`},{name:`fontBBox`,op:5,type:[`number`,`number`,`number`,`number`],value:[0,0,0,0]},{name:`strokeWidth`,op:1208,type:`number`,value:0},{name:`xuid`,op:14,type:[],value:null},{name:`charset`,op:15,type:`offset`,value:0},{name:`encoding`,op:16,type:`offset`,value:0},{name:`charStrings`,op:17,type:`offset`,value:0},{name:`private`,op:18,type:[`number`,`offset`],value:[0,0]},{name:`ros`,op:1230,type:[`SID`,`SID`,`number`]},{name:`cidFontVersion`,op:1231,type:`number`,value:0},{name:`cidFontRevision`,op:1232,type:`number`,value:0},{name:`cidFontType`,op:1233,type:`number`,value:0},{name:`cidCount`,op:1234,type:`number`,value:8720},{name:`uidBase`,op:1235,type:`number`},{name:`fdArray`,op:1236,type:`offset`},{name:`fdSelect`,op:1237,type:`offset`},{name:`fontName`,op:1238,type:`SID`}],pt=[{name:`subrs`,op:19,type:`offset`,value:0},{name:`defaultWidthX`,op:20,type:`number`,value:0},{name:`nominalWidthX`,op:21,type:`number`,value:0}];function mt(e,t){return ut(ct(e,0,e.byteLength),ft,t)}function ht(e,t,n,r){return ut(ct(e,t,n),pt,r)}function gt(e,t,n,r){for(var i=[],a=0;a<n.length;a+=1){var o=mt(new DataView(new Uint8Array(n[a]).buffer),r);o._subrs=[],o._subrsBias=0,o._defaultWidthX=0,o._nominalWidthX=0;var s=o.private[0],c=o.private[1];if(s!==0&&c!==0){var l=ht(e,c+t,s,r);o._defaultWidthX=l.defaultWidthX,o._nominalWidthX=l.nominalWidthX,l.subrs!==0&&(o._subrs=nt(e,c+l.subrs+t).objects,o._subrsBias=tt(o._subrs)),o._privateDict=l}i.push(o)}return i}function _t(e,t,n,r){var i,a,o=new U.Parser(e,t);--n;var s=[`.notdef`],c=o.parseCard8();if(c===0)for(var l=0;l<n;l+=1)i=o.parseSID(),s.push(lt(r,i));else if(c===1)for(;s.length<=n;){i=o.parseSID(),a=o.parseCard8();for(var u=0;u<=a;u+=1)s.push(lt(r,i)),i+=1}else if(c===2)for(;s.length<=n;){i=o.parseSID(),a=o.parseCard16();for(var d=0;d<=a;d+=1)s.push(lt(r,i)),i+=1}else throw Error(`Unknown charset format `+c);return s}function vt(e,t,n){var r,i={},a=new U.Parser(e,t),o=a.parseCard8();if(o===0)for(var s=a.parseCard8(),c=0;c<s;c+=1)r=a.parseCard8(),i[r]=c;else if(o===1){var l=a.parseCard8();r=1;for(var u=0;u<l;u+=1)for(var d=a.parseCard8(),f=a.parseCard8(),p=d;p<=d+f;p+=1)i[p]=r,r+=1}else throw Error(`Unknown encoding format `+o);return new ze(i,n)}function yt(e,t,n){var r,i,a,o,s=new k,c=[],l=0,u=!1,d=!1,f=0,p=0,m,h,g,_;if(e.isCIDFont){var v=e.tables.cff.topDict._fdSelect[t.index],y=e.tables.cff.topDict._fdArray[v];m=y._subrs,h=y._subrsBias,g=y._defaultWidthX,_=y._nominalWidthX}else m=e.tables.cff.topDict._subrs,h=e.tables.cff.topDict._subrsBias,g=e.tables.cff.topDict._defaultWidthX,_=e.tables.cff.topDict._nominalWidthX;var b=g;function x(e,t){d&&s.closePath(),s.moveTo(e,t),d=!0}function S(){c.length%2!=0&&!u&&(b=c.shift()+_),l+=c.length>>1,c.length=0,u=!0}function C(n){for(var g,v,y,w,T,E,D,O,k,A,j,M,N=0;N<n.length;){var P=n[N];switch(N+=1,P){case 1:S();break;case 3:S();break;case 4:c.length>1&&!u&&(b=c.shift()+_,u=!0),p+=c.pop(),x(f,p);break;case 5:for(;c.length>0;)f+=c.shift(),p+=c.shift(),s.lineTo(f,p);break;case 6:for(;c.length>0&&(f+=c.shift(),s.lineTo(f,p),c.length!==0);)p+=c.shift(),s.lineTo(f,p);break;case 7:for(;c.length>0&&(p+=c.shift(),s.lineTo(f,p),c.length!==0);)f+=c.shift(),s.lineTo(f,p);break;case 8:for(;c.length>0;)r=f+c.shift(),i=p+c.shift(),a=r+c.shift(),o=i+c.shift(),f=a+c.shift(),p=o+c.shift(),s.curveTo(r,i,a,o,f,p);break;case 10:T=c.pop()+h,E=m[T],E&&C(E);break;case 11:return;case 12:switch(P=n[N],N+=1,P){case 35:r=f+c.shift(),i=p+c.shift(),a=r+c.shift(),o=i+c.shift(),D=a+c.shift(),O=o+c.shift(),k=D+c.shift(),A=O+c.shift(),j=k+c.shift(),M=A+c.shift(),f=j+c.shift(),p=M+c.shift(),c.shift(),s.curveTo(r,i,a,o,D,O),s.curveTo(k,A,j,M,f,p);break;case 34:r=f+c.shift(),i=p,a=r+c.shift(),o=i+c.shift(),D=a+c.shift(),O=o,k=D+c.shift(),A=o,j=k+c.shift(),M=p,f=j+c.shift(),s.curveTo(r,i,a,o,D,O),s.curveTo(k,A,j,M,f,p);break;case 36:r=f+c.shift(),i=p+c.shift(),a=r+c.shift(),o=i+c.shift(),D=a+c.shift(),O=o,k=D+c.shift(),A=o,j=k+c.shift(),M=A+c.shift(),f=j+c.shift(),s.curveTo(r,i,a,o,D,O),s.curveTo(k,A,j,M,f,p);break;case 37:r=f+c.shift(),i=p+c.shift(),a=r+c.shift(),o=i+c.shift(),D=a+c.shift(),O=o+c.shift(),k=D+c.shift(),A=O+c.shift(),j=k+c.shift(),M=A+c.shift(),Math.abs(j-f)>Math.abs(M-p)?f=j+c.shift():p=M+c.shift(),s.curveTo(r,i,a,o,D,O),s.curveTo(k,A,j,M,f,p);break;default:console.log(`Glyph `+t.index+`: unknown operator 1200`+P),c.length=0}break;case 14:c.length>0&&!u&&(b=c.shift()+_,u=!0),d&&=(s.closePath(),!1);break;case 18:S();break;case 19:case 20:S(),N+=l+7>>3;break;case 21:c.length>2&&!u&&(b=c.shift()+_,u=!0),p+=c.pop(),f+=c.pop(),x(f,p);break;case 22:c.length>1&&!u&&(b=c.shift()+_,u=!0),f+=c.pop(),x(f,p);break;case 23:S();break;case 24:for(;c.length>2;)r=f+c.shift(),i=p+c.shift(),a=r+c.shift(),o=i+c.shift(),f=a+c.shift(),p=o+c.shift(),s.curveTo(r,i,a,o,f,p);f+=c.shift(),p+=c.shift(),s.lineTo(f,p);break;case 25:for(;c.length>6;)f+=c.shift(),p+=c.shift(),s.lineTo(f,p);r=f+c.shift(),i=p+c.shift(),a=r+c.shift(),o=i+c.shift(),f=a+c.shift(),p=o+c.shift(),s.curveTo(r,i,a,o,f,p);break;case 26:for(c.length%2&&(f+=c.shift());c.length>0;)r=f,i=p+c.shift(),a=r+c.shift(),o=i+c.shift(),f=a,p=o+c.shift(),s.curveTo(r,i,a,o,f,p);break;case 27:for(c.length%2&&(p+=c.shift());c.length>0;)r=f+c.shift(),i=p,a=r+c.shift(),o=i+c.shift(),f=a+c.shift(),p=o,s.curveTo(r,i,a,o,f,p);break;case 28:g=n[N],v=n[N+1],c.push((g<<24|v<<16)>>16),N+=2;break;case 29:T=c.pop()+e.gsubrsBias,E=e.gsubrs[T],E&&C(E);break;case 30:for(;c.length>0&&(r=f,i=p+c.shift(),a=r+c.shift(),o=i+c.shift(),f=a+c.shift(),p=o+(c.length===1?c.shift():0),s.curveTo(r,i,a,o,f,p),c.length!==0);)r=f+c.shift(),i=p,a=r+c.shift(),o=i+c.shift(),p=o+c.shift(),f=a+(c.length===1?c.shift():0),s.curveTo(r,i,a,o,f,p);break;case 31:for(;c.length>0&&(r=f+c.shift(),i=p,a=r+c.shift(),o=i+c.shift(),p=o+c.shift(),f=a+(c.length===1?c.shift():0),s.curveTo(r,i,a,o,f,p),c.length!==0);)r=f,i=p+c.shift(),a=r+c.shift(),o=i+c.shift(),f=a+c.shift(),p=o+(c.length===1?c.shift():0),s.curveTo(r,i,a,o,f,p);break;default:P<32?console.log(`Glyph `+t.index+`: unknown operator `+P):P<247?c.push(P-139):P<251?(g=n[N],N+=1,c.push((P-247)*256+g+108)):P<255?(g=n[N],N+=1,c.push(-(P-251)*256-g-108)):(g=n[N],v=n[N+1],y=n[N+2],w=n[N+3],N+=4,c.push((g<<24|v<<16|y<<8|w)/65536))}}}return C(n),t.advanceWidth=b,s}function bt(e,t,n,r){var i=[],a,o=new U.Parser(e,t),s=o.parseCard8();if(s===0)for(var c=0;c<n;c++){if(a=o.parseCard8(),a>=r)throw Error(`CFF table CID Font FDSelect has bad FD index value `+a+` (FD count `+r+`)`);i.push(a)}else if(s===3){var l=o.parseCard16(),u=o.parseCard16();if(u!==0)throw Error(`CFF Table CID Font FDSelect format 3 range has bad initial GID `+u);for(var d,f=0;f<l;f++){if(a=o.parseCard8(),d=o.parseCard16(),a>=r)throw Error(`CFF table CID Font FDSelect has bad FD index value `+a+` (FD count `+r+`)`);if(d>n)throw Error(`CFF Table CID Font FDSelect format 3 range has bad GID `+d);for(;u<d;u++)i.push(a);u=d}if(d!==n)throw Error(`CFF Table CID Font FDSelect format 3 range has bad final GID `+d)}else throw Error(`CFF Table CID Font FDSelect table has unsupported format `+s);return i}function xt(e,t,n,r){n.tables.cff={};var i=nt(e,nt(e,dt(e,t).endOffset,U.bytesToString).endOffset),a=nt(e,i.endOffset,U.bytesToString);n.gsubrs=nt(e,a.endOffset).objects,n.gsubrsBias=tt(n.gsubrs);var o=gt(e,t,i.objects,a.objects);if(o.length!==1)throw Error(`CFF table has too many fonts in 'FontSet' - count of fonts NameIndex.length = `+o.length);var s=o[0];if(n.tables.cff.topDict=s,s._privateDict&&(n.defaultWidthX=s._privateDict.defaultWidthX,n.nominalWidthX=s._privateDict.nominalWidthX),s.ros[0]!==void 0&&s.ros[1]!==void 0&&(n.isCIDFont=!0),n.isCIDFont){var c=s.fdArray,l=s.fdSelect;if(c===0||l===0)throw Error(`Font is marked as a CID font, but FDArray and/or FDSelect information is missing`);c+=t;var u=gt(e,t,nt(e,c).objects,a.objects);s._fdArray=u,l+=t,s._fdSelect=bt(e,l,n.numGlyphs,u.length)}var d=t+s.private[1],f=ht(e,d,s.private[0],a.objects);n.defaultWidthX=f.defaultWidthX,n.nominalWidthX=f.nominalWidthX,f.subrs===0?(n.subrs=[],n.subrsBias=0):(n.subrs=nt(e,d+f.subrs).objects,n.subrsBias=tt(n.subrs));var p;r.lowMemory?(p=rt(e,t+s.charStrings),n.nGlyphs=p.offsets.length):(p=nt(e,t+s.charStrings),n.nGlyphs=p.objects.length);var m=_t(e,t+s.charset,n.nGlyphs,a.objects);if(n.cffEncoding=s.encoding===0?new ze(Pe,m):s.encoding===1?new ze(Fe,m):vt(e,t+s.encoding,m),n.encoding=n.encoding||n.cffEncoding,n.glyphs=new $e.GlyphSet(n),r.lowMemory)n._push=function(r){var i=it(r,p.offsets,e,t+s.charStrings);n.glyphs.push(r,$e.cffGlyphLoader(n,r,yt,i))};else for(var h=0;h<n.nGlyphs;h+=1){var g=p.objects[h];n.glyphs.push(h,$e.cffGlyphLoader(n,h,yt,g))}}function St(e,t){var n,r=Ne.indexOf(e);return r>=0&&(n=r),r=t.indexOf(e),r>=0?n=r+Ne.length:(n=Ne.length+t.length,t.push(e)),n}function Ct(){return new R.Record(`Header`,[{name:`major`,type:`Card8`,value:1},{name:`minor`,type:`Card8`,value:0},{name:`hdrSize`,type:`Card8`,value:4},{name:`major`,type:`Card8`,value:1}])}function wt(e){var t=new R.Record(`Name INDEX`,[{name:`names`,type:`INDEX`,value:[]}]);t.names=[];for(var n=0;n<e.length;n+=1)t.names.push({name:`name_`+n,type:`NAME`,value:e[n]});return t}function Tt(e,t,n){for(var r={},i=0;i<e.length;i+=1){var a=e[i],o=t[a.name];o!==void 0&&!et(o,a.value)&&(a.type===`SID`&&(o=St(o,n)),r[a.op]={name:a.name,type:a.type,value:o})}return r}function Et(e,t){var n=new R.Record(`Top DICT`,[{name:`dict`,type:`DICT`,value:{}}]);return n.dict=Tt(ft,e,t),n}function Dt(e){var t=new R.Record(`Top DICT INDEX`,[{name:`topDicts`,type:`INDEX`,value:[]}]);return t.topDicts=[{name:`topDict_0`,type:`TABLE`,value:e}],t}function Ot(e){var t=new R.Record(`String INDEX`,[{name:`strings`,type:`INDEX`,value:[]}]);t.strings=[];for(var n=0;n<e.length;n+=1)t.strings.push({name:`string_`+n,type:`STRING`,value:e[n]});return t}function kt(){return new R.Record(`Global Subr INDEX`,[{name:`subrs`,type:`INDEX`,value:[]}])}function At(e,t){for(var n=new R.Record(`Charsets`,[{name:`format`,type:`Card8`,value:0}]),r=0;r<e.length;r+=1){var i=e[r],a=St(i,t);n.fields.push({name:`glyph_`+r,type:`SID`,value:a})}return n}function jt(e){var t=[],n=e.path;t.push({name:`width`,type:`NUMBER`,value:e.advanceWidth});for(var r=0,i=0,a=0;a<n.commands.length;a+=1){var o=void 0,s=void 0,c=n.commands[a];if(c.type===`Q`){var l=1/3,u=2/3;c={type:`C`,x:c.x,y:c.y,x1:Math.round(l*r+u*c.x1),y1:Math.round(l*i+u*c.y1),x2:Math.round(l*c.x+u*c.x1),y2:Math.round(l*c.y+u*c.y1)}}if(c.type===`M`)o=Math.round(c.x-r),s=Math.round(c.y-i),t.push({name:`dx`,type:`NUMBER`,value:o}),t.push({name:`dy`,type:`NUMBER`,value:s}),t.push({name:`rmoveto`,type:`OP`,value:21}),r=Math.round(c.x),i=Math.round(c.y);else if(c.type===`L`)o=Math.round(c.x-r),s=Math.round(c.y-i),t.push({name:`dx`,type:`NUMBER`,value:o}),t.push({name:`dy`,type:`NUMBER`,value:s}),t.push({name:`rlineto`,type:`OP`,value:5}),r=Math.round(c.x),i=Math.round(c.y);else if(c.type===`C`){var d=Math.round(c.x1-r),f=Math.round(c.y1-i),p=Math.round(c.x2-c.x1),m=Math.round(c.y2-c.y1);o=Math.round(c.x-c.x2),s=Math.round(c.y-c.y2),t.push({name:`dx1`,type:`NUMBER`,value:d}),t.push({name:`dy1`,type:`NUMBER`,value:f}),t.push({name:`dx2`,type:`NUMBER`,value:p}),t.push({name:`dy2`,type:`NUMBER`,value:m}),t.push({name:`dx`,type:`NUMBER`,value:o}),t.push({name:`dy`,type:`NUMBER`,value:s}),t.push({name:`rrcurveto`,type:`OP`,value:8}),r=Math.round(c.x),i=Math.round(c.y)}}return t.push({name:`endchar`,type:`OP`,value:14}),t}function Mt(e){for(var t=new R.Record(`CharStrings INDEX`,[{name:`charStrings`,type:`INDEX`,value:[]}]),n=0;n<e.length;n+=1){var r=e.get(n),i=jt(r);t.charStrings.push({name:r.name,type:`CHARSTRING`,value:i})}return t}function Nt(e,t){var n=new R.Record(`Private DICT`,[{name:`dict`,type:`DICT`,value:{}}]);return n.dict=Tt(pt,e,t),n}function Pt(e,t){for(var n=new R.Table(`CFF `,[{name:`header`,type:`RECORD`},{name:`nameIndex`,type:`RECORD`},{name:`topDictIndex`,type:`RECORD`},{name:`stringIndex`,type:`RECORD`},{name:`globalSubrIndex`,type:`RECORD`},{name:`charsets`,type:`RECORD`},{name:`charStringsIndex`,type:`RECORD`},{name:`privateDict`,type:`RECORD`}]),r=1/t.unitsPerEm,i={version:t.version,fullName:t.fullName,familyName:t.familyName,weight:t.weightName,fontBBox:t.fontBBox||[0,0,0,0],fontMatrix:[r,0,0,r,0,0],charset:999,encoding:0,charStrings:999,private:[0,999]},a={},o=[],s,c=1;c<e.length;c+=1)s=e.get(c),o.push(s.name);var l=[];n.header=Ct(),n.nameIndex=wt([t.postScriptName]);var u=Et(i,l);return n.topDictIndex=Dt(u),n.globalSubrIndex=kt(),n.charsets=At(o,l),n.charStringsIndex=Mt(e),n.privateDict=Nt(a,l),n.stringIndex=Ot(l),i.charset=n.header.sizeOf()+n.nameIndex.sizeOf()+n.topDictIndex.sizeOf()+n.stringIndex.sizeOf()+n.globalSubrIndex.sizeOf(),i.encoding=0,i.charStrings=i.charset+n.charsets.sizeOf(),i.private[1]=i.charStrings+n.charStringsIndex.sizeOf(),u=Et(i,l),n.topDictIndex=Dt(u),n}var Ft={parse:xt,make:Pt};function It(e,t){var n={},r=new U.Parser(e,t);return n.version=r.parseVersion(),n.fontRevision=Math.round(r.parseFixed()*1e3)/1e3,n.checkSumAdjustment=r.parseULong(),n.magicNumber=r.parseULong(),M.argument(n.magicNumber===1594834165,`Font header has wrong magic number.`),n.flags=r.parseUShort(),n.unitsPerEm=r.parseUShort(),n.created=r.parseLongDateTime(),n.modified=r.parseLongDateTime(),n.xMin=r.parseShort(),n.yMin=r.parseShort(),n.xMax=r.parseShort(),n.yMax=r.parseShort(),n.macStyle=r.parseUShort(),n.lowestRecPPEM=r.parseUShort(),n.fontDirectionHint=r.parseShort(),n.indexToLocFormat=r.parseShort(),n.glyphDataFormat=r.parseShort(),n}function Lt(e){var t=Math.round(new Date().getTime()/1e3)+2082844800,n=t;return e.createdTimestamp&&(n=e.createdTimestamp+2082844800),new R.Table(`head`,[{name:`version`,type:`FIXED`,value:65536},{name:`fontRevision`,type:`FIXED`,value:65536},{name:`checkSumAdjustment`,type:`ULONG`,value:0},{name:`magicNumber`,type:`ULONG`,value:1594834165},{name:`flags`,type:`USHORT`,value:0},{name:`unitsPerEm`,type:`USHORT`,value:1e3},{name:`created`,type:`LONGDATETIME`,value:n},{name:`modified`,type:`LONGDATETIME`,value:t},{name:`xMin`,type:`SHORT`,value:0},{name:`yMin`,type:`SHORT`,value:0},{name:`xMax`,type:`SHORT`,value:0},{name:`yMax`,type:`SHORT`,value:0},{name:`macStyle`,type:`USHORT`,value:0},{name:`lowestRecPPEM`,type:`USHORT`,value:0},{name:`fontDirectionHint`,type:`SHORT`,value:2},{name:`indexToLocFormat`,type:`SHORT`,value:0},{name:`glyphDataFormat`,type:`SHORT`,value:0}],e)}var Rt={parse:It,make:Lt};function zt(e,t){var n={},r=new U.Parser(e,t);return n.version=r.parseVersion(),n.ascender=r.parseShort(),n.descender=r.parseShort(),n.lineGap=r.parseShort(),n.advanceWidthMax=r.parseUShort(),n.minLeftSideBearing=r.parseShort(),n.minRightSideBearing=r.parseShort(),n.xMaxExtent=r.parseShort(),n.caretSlopeRise=r.parseShort(),n.caretSlopeRun=r.parseShort(),n.caretOffset=r.parseShort(),r.relativeOffset+=8,n.metricDataFormat=r.parseShort(),n.numberOfHMetrics=r.parseUShort(),n}function Bt(e){return new R.Table(`hhea`,[{name:`version`,type:`FIXED`,value:65536},{name:`ascender`,type:`FWORD`,value:0},{name:`descender`,type:`FWORD`,value:0},{name:`lineGap`,type:`FWORD`,value:0},{name:`advanceWidthMax`,type:`UFWORD`,value:0},{name:`minLeftSideBearing`,type:`FWORD`,value:0},{name:`minRightSideBearing`,type:`FWORD`,value:0},{name:`xMaxExtent`,type:`FWORD`,value:0},{name:`caretSlopeRise`,type:`SHORT`,value:1},{name:`caretSlopeRun`,type:`SHORT`,value:0},{name:`caretOffset`,type:`SHORT`,value:0},{name:`reserved1`,type:`SHORT`,value:0},{name:`reserved2`,type:`SHORT`,value:0},{name:`reserved3`,type:`SHORT`,value:0},{name:`reserved4`,type:`SHORT`,value:0},{name:`metricDataFormat`,type:`SHORT`,value:0},{name:`numberOfHMetrics`,type:`USHORT`,value:0}],e)}var Vt={parse:zt,make:Bt};function Ht(e,t,n,r,i){for(var a,o,s=new U.Parser(e,t),c=0;c<r;c+=1){c<n&&(a=s.parseUShort(),o=s.parseShort());var l=i.get(c);l.advanceWidth=a,l.leftSideBearing=o}}function Ut(e,t,n,r,i){e._hmtxTableData={};for(var a,o,s=new U.Parser(t,n),c=0;c<i;c+=1)c<r&&(a=s.parseUShort(),o=s.parseShort()),e._hmtxTableData[c]={advanceWidth:a,leftSideBearing:o}}function Wt(e,t,n,r,i,a,o){o.lowMemory?Ut(e,t,n,r,i):Ht(t,n,r,i,a)}function Gt(e){for(var t=new R.Table(`hmtx`,[]),n=0;n<e.length;n+=1){var r=e.get(n),i=r.advanceWidth||0,a=r.leftSideBearing||0;t.fields.push({name:`advanceWidth_`+n,type:`USHORT`,value:i}),t.fields.push({name:`leftSideBearing_`+n,type:`SHORT`,value:a})}return t}var Kt={parse:Wt,make:Gt};function qt(e){for(var t=new R.Table(`ltag`,[{name:`version`,type:`ULONG`,value:1},{name:`flags`,type:`ULONG`,value:0},{name:`numTags`,type:`ULONG`,value:e.length}]),n=``,r=12+e.length*4,i=0;i<e.length;++i){var a=n.indexOf(e[i]);a<0&&(a=n.length,n+=e[i]),t.fields.push({name:`offset `+i,type:`USHORT`,value:r+a}),t.fields.push({name:`length `+i,type:`USHORT`,value:e[i].length})}return t.fields.push({name:`stringPool`,type:`CHARARRAY`,value:n}),t}function Jt(e,t){var n=new U.Parser(e,t),r=n.parseULong();M.argument(r===1,`Unsupported ltag table version.`),n.skip(`uLong`,1);for(var i=n.parseULong(),a=[],o=0;o<i;o++){for(var s=``,c=t+n.parseUShort(),l=n.parseUShort(),u=c;u<c+l;++u)s+=String.fromCharCode(e.getInt8(u));a.push(s)}return a}var Yt={make:qt,parse:Jt};function Xt(e,t){var n={},r=new U.Parser(e,t);return n.version=r.parseVersion(),n.numGlyphs=r.parseUShort(),n.version===1&&(n.maxPoints=r.parseUShort(),n.maxContours=r.parseUShort(),n.maxCompositePoints=r.parseUShort(),n.maxCompositeContours=r.parseUShort(),n.maxZones=r.parseUShort(),n.maxTwilightPoints=r.parseUShort(),n.maxStorage=r.parseUShort(),n.maxFunctionDefs=r.parseUShort(),n.maxInstructionDefs=r.parseUShort(),n.maxStackElements=r.parseUShort(),n.maxSizeOfInstructions=r.parseUShort(),n.maxComponentElements=r.parseUShort(),n.maxComponentDepth=r.parseUShort()),n}function Zt(e){return new R.Table(`maxp`,[{name:`version`,type:`FIXED`,value:20480},{name:`numGlyphs`,type:`USHORT`,value:e}])}var Qt={parse:Xt,make:Zt},$t=[`copyright`,`fontFamily`,`fontSubfamily`,`uniqueID`,`fullName`,`version`,`postScriptName`,`trademark`,`manufacturer`,`designer`,`description`,`manufacturerURL`,`designerURL`,`license`,`licenseURL`,`reserved`,`preferredFamily`,`preferredSubfamily`,`compatibleFullName`,`sampleText`,`postScriptFindFontName`,`wwsFamily`,`wwsSubfamily`],en={0:`en`,1:`fr`,2:`de`,3:`it`,4:`nl`,5:`sv`,6:`es`,7:`da`,8:`pt`,9:`no`,10:`he`,11:`ja`,12:`ar`,13:`fi`,14:`el`,15:`is`,16:`mt`,17:`tr`,18:`hr`,19:`zh-Hant`,20:`ur`,21:`hi`,22:`th`,23:`ko`,24:`lt`,25:`pl`,26:`hu`,27:`es`,28:`lv`,29:`se`,30:`fo`,31:`fa`,32:`ru`,33:`zh`,34:`nl-BE`,35:`ga`,36:`sq`,37:`ro`,38:`cz`,39:`sk`,40:`si`,41:`yi`,42:`sr`,43:`mk`,44:`bg`,45:`uk`,46:`be`,47:`uz`,48:`kk`,49:`az-Cyrl`,50:`az-Arab`,51:`hy`,52:`ka`,53:`mo`,54:`ky`,55:`tg`,56:`tk`,57:`mn-CN`,58:`mn`,59:`ps`,60:`ks`,61:`ku`,62:`sd`,63:`bo`,64:`ne`,65:`sa`,66:`mr`,67:`bn`,68:`as`,69:`gu`,70:`pa`,71:`or`,72:`ml`,73:`kn`,74:`ta`,75:`te`,76:`si`,77:`my`,78:`km`,79:`lo`,80:`vi`,81:`id`,82:`tl`,83:`ms`,84:`ms-Arab`,85:`am`,86:`ti`,87:`om`,88:`so`,89:`sw`,90:`rw`,91:`rn`,92:`ny`,93:`mg`,94:`eo`,128:`cy`,129:`eu`,130:`ca`,131:`la`,132:`qu`,133:`gn`,134:`ay`,135:`tt`,136:`ug`,137:`dz`,138:`jv`,139:`su`,140:`gl`,141:`af`,142:`br`,143:`iu`,144:`gd`,145:`gv`,146:`ga`,147:`to`,148:`el-polyton`,149:`kl`,150:`az`,151:`nn`},tn={0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:5,11:1,12:4,13:0,14:6,15:0,16:0,17:0,18:0,19:2,20:4,21:9,22:21,23:3,24:29,25:29,26:29,27:29,28:29,29:0,30:0,31:4,32:7,33:25,34:0,35:0,36:0,37:0,38:29,39:29,40:0,41:5,42:7,43:7,44:7,45:7,46:7,47:7,48:7,49:7,50:4,51:24,52:23,53:7,54:7,55:7,56:7,57:27,58:7,59:4,60:4,61:4,62:4,63:26,64:9,65:9,66:9,67:13,68:13,69:11,70:10,71:12,72:17,73:16,74:14,75:15,76:18,77:19,78:20,79:22,80:30,81:0,82:0,83:0,84:4,85:28,86:28,87:28,88:0,89:0,90:0,91:0,92:0,93:0,94:0,128:0,129:0,130:0,131:0,132:0,133:0,134:0,135:7,136:4,137:26,138:0,139:0,140:0,141:0,142:0,143:28,144:0,145:0,146:0,147:0,148:6,149:0,150:0,151:0},nn={1078:`af`,1052:`sq`,1156:`gsw`,1118:`am`,5121:`ar-DZ`,15361:`ar-BH`,3073:`ar`,2049:`ar-IQ`,11265:`ar-JO`,13313:`ar-KW`,12289:`ar-LB`,4097:`ar-LY`,6145:`ary`,8193:`ar-OM`,16385:`ar-QA`,1025:`ar-SA`,10241:`ar-SY`,7169:`aeb`,14337:`ar-AE`,9217:`ar-YE`,1067:`hy`,1101:`as`,2092:`az-Cyrl`,1068:`az`,1133:`ba`,1069:`eu`,1059:`be`,2117:`bn`,1093:`bn-IN`,8218:`bs-Cyrl`,5146:`bs`,1150:`br`,1026:`bg`,1027:`ca`,3076:`zh-HK`,5124:`zh-MO`,2052:`zh`,4100:`zh-SG`,1028:`zh-TW`,1155:`co`,1050:`hr`,4122:`hr-BA`,1029:`cs`,1030:`da`,1164:`prs`,1125:`dv`,2067:`nl-BE`,1043:`nl`,3081:`en-AU`,10249:`en-BZ`,4105:`en-CA`,9225:`en-029`,16393:`en-IN`,6153:`en-IE`,8201:`en-JM`,17417:`en-MY`,5129:`en-NZ`,13321:`en-PH`,18441:`en-SG`,7177:`en-ZA`,11273:`en-TT`,2057:`en-GB`,1033:`en`,12297:`en-ZW`,1061:`et`,1080:`fo`,1124:`fil`,1035:`fi`,2060:`fr-BE`,3084:`fr-CA`,1036:`fr`,5132:`fr-LU`,6156:`fr-MC`,4108:`fr-CH`,1122:`fy`,1110:`gl`,1079:`ka`,3079:`de-AT`,1031:`de`,5127:`de-LI`,4103:`de-LU`,2055:`de-CH`,1032:`el`,1135:`kl`,1095:`gu`,1128:`ha`,1037:`he`,1081:`hi`,1038:`hu`,1039:`is`,1136:`ig`,1057:`id`,1117:`iu`,2141:`iu-Latn`,2108:`ga`,1076:`xh`,1077:`zu`,1040:`it`,2064:`it-CH`,1041:`ja`,1099:`kn`,1087:`kk`,1107:`km`,1158:`quc`,1159:`rw`,1089:`sw`,1111:`kok`,1042:`ko`,1088:`ky`,1108:`lo`,1062:`lv`,1063:`lt`,2094:`dsb`,1134:`lb`,1071:`mk`,2110:`ms-BN`,1086:`ms`,1100:`ml`,1082:`mt`,1153:`mi`,1146:`arn`,1102:`mr`,1148:`moh`,1104:`mn`,2128:`mn-CN`,1121:`ne`,1044:`nb`,2068:`nn`,1154:`oc`,1096:`or`,1123:`ps`,1045:`pl`,1046:`pt`,2070:`pt-PT`,1094:`pa`,1131:`qu-BO`,2155:`qu-EC`,3179:`qu`,1048:`ro`,1047:`rm`,1049:`ru`,9275:`smn`,4155:`smj-NO`,5179:`smj`,3131:`se-FI`,1083:`se`,2107:`se-SE`,8251:`sms`,6203:`sma-NO`,7227:`sms`,1103:`sa`,7194:`sr-Cyrl-BA`,3098:`sr`,6170:`sr-Latn-BA`,2074:`sr-Latn`,1132:`nso`,1074:`tn`,1115:`si`,1051:`sk`,1060:`sl`,11274:`es-AR`,16394:`es-BO`,13322:`es-CL`,9226:`es-CO`,5130:`es-CR`,7178:`es-DO`,12298:`es-EC`,17418:`es-SV`,4106:`es-GT`,18442:`es-HN`,2058:`es-MX`,19466:`es-NI`,6154:`es-PA`,15370:`es-PY`,10250:`es-PE`,20490:`es-PR`,3082:`es`,1034:`es`,21514:`es-US`,14346:`es-UY`,8202:`es-VE`,2077:`sv-FI`,1053:`sv`,1114:`syr`,1064:`tg`,2143:`tzm`,1097:`ta`,1092:`tt`,1098:`te`,1054:`th`,1105:`bo`,1055:`tr`,1090:`tk`,1152:`ug`,1058:`uk`,1070:`hsb`,1056:`ur`,2115:`uz-Cyrl`,1091:`uz`,1066:`vi`,1106:`cy`,1160:`wo`,1157:`sah`,1144:`ii`,1130:`yo`};function rn(e,t,n){switch(e){case 0:if(t===65535)return`und`;if(n)return n[t];break;case 1:return en[t];case 3:return nn[t]}}var an=`utf-16`,on={0:`macintosh`,1:`x-mac-japanese`,2:`x-mac-chinesetrad`,3:`x-mac-korean`,6:`x-mac-greek`,7:`x-mac-cyrillic`,9:`x-mac-devanagai`,10:`x-mac-gurmukhi`,11:`x-mac-gujarati`,12:`x-mac-oriya`,13:`x-mac-bengali`,14:`x-mac-tamil`,15:`x-mac-telugu`,16:`x-mac-kannada`,17:`x-mac-malayalam`,18:`x-mac-sinhalese`,19:`x-mac-burmese`,20:`x-mac-khmer`,21:`x-mac-thai`,22:`x-mac-lao`,23:`x-mac-georgian`,24:`x-mac-armenian`,25:`x-mac-chinesesimp`,26:`x-mac-tibetan`,27:`x-mac-mongolian`,28:`x-mac-ethiopic`,29:`x-mac-ce`,30:`x-mac-vietnamese`,31:`x-mac-extarabic`},sn={15:`x-mac-icelandic`,17:`x-mac-turkish`,18:`x-mac-croatian`,24:`x-mac-ce`,25:`x-mac-ce`,26:`x-mac-ce`,27:`x-mac-ce`,28:`x-mac-ce`,30:`x-mac-icelandic`,37:`x-mac-romanian`,38:`x-mac-ce`,39:`x-mac-ce`,40:`x-mac-ce`,143:`x-mac-inuit`,146:`x-mac-gaelic`};function cn(e,t,n){switch(e){case 0:return an;case 1:return sn[n]||on[t];case 3:if(t===1||t===10)return an}}function ln(e,t,n){for(var r={},i=new U.Parser(e,t),a=i.parseUShort(),o=i.parseUShort(),s=i.offset+i.parseUShort(),c=0;c<o;c++){var l=i.parseUShort(),u=i.parseUShort(),d=i.parseUShort(),f=i.parseUShort(),p=$t[f]||f,m=i.parseUShort(),h=i.parseUShort(),g=rn(l,d,n),_=cn(l,u,d);if(_!==void 0&&g!==void 0){var v=void 0;if(v=_===an?ee.UTF16(e,s+h,m):ee.MACSTRING(e,s+h,m,_),v){var y=r[p];y===void 0&&(y=r[p]={}),y[g]=v}}}return a===1&&i.parseUShort(),r}function un(e){var t={};for(var n in e)t[e[n]]=parseInt(n);return t}function dn(e,t,n,r,i,a){return new R.Record(`NameRecord`,[{name:`platformID`,type:`USHORT`,value:e},{name:`encodingID`,type:`USHORT`,value:t},{name:`languageID`,type:`USHORT`,value:n},{name:`nameID`,type:`USHORT`,value:r},{name:`length`,type:`USHORT`,value:i},{name:`offset`,type:`USHORT`,value:a}])}function fn(e,t){var n=e.length,r=t.length-n+1;loop:for(var i=0;i<r;i++)for(;i<r;i++){for(var a=0;a<n;a++)if(t[i+a]!==e[a])continue loop;return i}return-1}function pn(e,t){var n=fn(e,t);if(n<0){n=t.length;for(var r=0,i=e.length;r<i;++r)t.push(e[r])}return n}function mn(e,t){var n,r=[],i={},a=un($t);for(var o in e){var s=a[o];if(s===void 0&&(s=o),n=parseInt(s),isNaN(n))throw Error(`Name table entry "`+o+`" does not exist, see nameTableNames for complete list.`);i[n]=e[o],r.push(n)}for(var c=un(en),l=un(nn),u=[],d=[],f=0;f<r.length;f++){n=r[f];var p=i[n];for(var m in p){var h=p[m],g=1,_=c[m],v=tn[_],y=cn(g,v,_),b=F.MACSTRING(h,y);b===void 0&&(g=0,_=t.indexOf(m),_<0&&(_=t.length,t.push(m)),v=4,b=F.UTF16(h));var x=pn(b,d);u.push(dn(g,v,_,n,b.length,x));var S=l[m];if(S!==void 0){var C=F.UTF16(h),w=pn(C,d);u.push(dn(3,1,S,n,C.length,w))}}}u.sort(function(e,t){return e.platformID-t.platformID||e.encodingID-t.encodingID||e.languageID-t.languageID||e.nameID-t.nameID});for(var T=new R.Table(`name`,[{name:`format`,type:`USHORT`,value:0},{name:`count`,type:`USHORT`,value:u.length},{name:`stringOffset`,type:`USHORT`,value:6+u.length*12}]),E=0;E<u.length;E++)T.fields.push({name:`record_`+E,type:`RECORD`,value:u[E]});return T.fields.push({name:`strings`,type:`LITERAL`,value:d}),T}var hn={parse:ln,make:mn},gn=[{begin:0,end:127},{begin:128,end:255},{begin:256,end:383},{begin:384,end:591},{begin:592,end:687},{begin:688,end:767},{begin:768,end:879},{begin:880,end:1023},{begin:11392,end:11519},{begin:1024,end:1279},{begin:1328,end:1423},{begin:1424,end:1535},{begin:42240,end:42559},{begin:1536,end:1791},{begin:1984,end:2047},{begin:2304,end:2431},{begin:2432,end:2559},{begin:2560,end:2687},{begin:2688,end:2815},{begin:2816,end:2943},{begin:2944,end:3071},{begin:3072,end:3199},{begin:3200,end:3327},{begin:3328,end:3455},{begin:3584,end:3711},{begin:3712,end:3839},{begin:4256,end:4351},{begin:6912,end:7039},{begin:4352,end:4607},{begin:7680,end:7935},{begin:7936,end:8191},{begin:8192,end:8303},{begin:8304,end:8351},{begin:8352,end:8399},{begin:8400,end:8447},{begin:8448,end:8527},{begin:8528,end:8591},{begin:8592,end:8703},{begin:8704,end:8959},{begin:8960,end:9215},{begin:9216,end:9279},{begin:9280,end:9311},{begin:9312,end:9471},{begin:9472,end:9599},{begin:9600,end:9631},{begin:9632,end:9727},{begin:9728,end:9983},{begin:9984,end:10175},{begin:12288,end:12351},{begin:12352,end:12447},{begin:12448,end:12543},{begin:12544,end:12591},{begin:12592,end:12687},{begin:43072,end:43135},{begin:12800,end:13055},{begin:13056,end:13311},{begin:44032,end:55215},{begin:55296,end:57343},{begin:67840,end:67871},{begin:19968,end:40959},{begin:57344,end:63743},{begin:12736,end:12783},{begin:64256,end:64335},{begin:64336,end:65023},{begin:65056,end:65071},{begin:65040,end:65055},{begin:65104,end:65135},{begin:65136,end:65279},{begin:65280,end:65519},{begin:65520,end:65535},{begin:3840,end:4095},{begin:1792,end:1871},{begin:1920,end:1983},{begin:3456,end:3583},{begin:4096,end:4255},{begin:4608,end:4991},{begin:5024,end:5119},{begin:5120,end:5759},{begin:5760,end:5791},{begin:5792,end:5887},{begin:6016,end:6143},{begin:6144,end:6319},{begin:10240,end:10495},{begin:40960,end:42127},{begin:5888,end:5919},{begin:66304,end:66351},{begin:66352,end:66383},{begin:66560,end:66639},{begin:118784,end:119039},{begin:119808,end:120831},{begin:1044480,end:1048573},{begin:65024,end:65039},{begin:917504,end:917631},{begin:6400,end:6479},{begin:6480,end:6527},{begin:6528,end:6623},{begin:6656,end:6687},{begin:11264,end:11359},{begin:11568,end:11647},{begin:19904,end:19967},{begin:43008,end:43055},{begin:65536,end:65663},{begin:65856,end:65935},{begin:66432,end:66463},{begin:66464,end:66527},{begin:66640,end:66687},{begin:66688,end:66735},{begin:67584,end:67647},{begin:68096,end:68191},{begin:119552,end:119647},{begin:73728,end:74751},{begin:119648,end:119679},{begin:7040,end:7103},{begin:7168,end:7247},{begin:7248,end:7295},{begin:43136,end:43231},{begin:43264,end:43311},{begin:43312,end:43359},{begin:43520,end:43615},{begin:65936,end:65999},{begin:66e3,end:66047},{begin:66208,end:66271},{begin:127024,end:127135}];function _n(e){for(var t=0;t<gn.length;t+=1){var n=gn[t];if(e>=n.begin&&e<n.end)return t}return-1}function vn(e,t){var n={},r=new U.Parser(e,t);n.version=r.parseUShort(),n.xAvgCharWidth=r.parseShort(),n.usWeightClass=r.parseUShort(),n.usWidthClass=r.parseUShort(),n.fsType=r.parseUShort(),n.ySubscriptXSize=r.parseShort(),n.ySubscriptYSize=r.parseShort(),n.ySubscriptXOffset=r.parseShort(),n.ySubscriptYOffset=r.parseShort(),n.ySuperscriptXSize=r.parseShort(),n.ySuperscriptYSize=r.parseShort(),n.ySuperscriptXOffset=r.parseShort(),n.ySuperscriptYOffset=r.parseShort(),n.yStrikeoutSize=r.parseShort(),n.yStrikeoutPosition=r.parseShort(),n.sFamilyClass=r.parseShort(),n.panose=[];for(var i=0;i<10;i++)n.panose[i]=r.parseByte();return n.ulUnicodeRange1=r.parseULong(),n.ulUnicodeRange2=r.parseULong(),n.ulUnicodeRange3=r.parseULong(),n.ulUnicodeRange4=r.parseULong(),n.achVendID=String.fromCharCode(r.parseByte(),r.parseByte(),r.parseByte(),r.parseByte()),n.fsSelection=r.parseUShort(),n.usFirstCharIndex=r.parseUShort(),n.usLastCharIndex=r.parseUShort(),n.sTypoAscender=r.parseShort(),n.sTypoDescender=r.parseShort(),n.sTypoLineGap=r.parseShort(),n.usWinAscent=r.parseUShort(),n.usWinDescent=r.parseUShort(),n.version>=1&&(n.ulCodePageRange1=r.parseULong(),n.ulCodePageRange2=r.parseULong()),n.version>=2&&(n.sxHeight=r.parseShort(),n.sCapHeight=r.parseShort(),n.usDefaultChar=r.parseUShort(),n.usBreakChar=r.parseUShort(),n.usMaxContent=r.parseUShort()),n}function yn(e){return new R.Table(`OS/2`,[{name:`version`,type:`USHORT`,value:3},{name:`xAvgCharWidth`,type:`SHORT`,value:0},{name:`usWeightClass`,type:`USHORT`,value:0},{name:`usWidthClass`,type:`USHORT`,value:0},{name:`fsType`,type:`USHORT`,value:0},{name:`ySubscriptXSize`,type:`SHORT`,value:650},{name:`ySubscriptYSize`,type:`SHORT`,value:699},{name:`ySubscriptXOffset`,type:`SHORT`,value:0},{name:`ySubscriptYOffset`,type:`SHORT`,value:140},{name:`ySuperscriptXSize`,type:`SHORT`,value:650},{name:`ySuperscriptYSize`,type:`SHORT`,value:699},{name:`ySuperscriptXOffset`,type:`SHORT`,value:0},{name:`ySuperscriptYOffset`,type:`SHORT`,value:479},{name:`yStrikeoutSize`,type:`SHORT`,value:49},{name:`yStrikeoutPosition`,type:`SHORT`,value:258},{name:`sFamilyClass`,type:`SHORT`,value:0},{name:`bFamilyType`,type:`BYTE`,value:0},{name:`bSerifStyle`,type:`BYTE`,value:0},{name:`bWeight`,type:`BYTE`,value:0},{name:`bProportion`,type:`BYTE`,value:0},{name:`bContrast`,type:`BYTE`,value:0},{name:`bStrokeVariation`,type:`BYTE`,value:0},{name:`bArmStyle`,type:`BYTE`,value:0},{name:`bLetterform`,type:`BYTE`,value:0},{name:`bMidline`,type:`BYTE`,value:0},{name:`bXHeight`,type:`BYTE`,value:0},{name:`ulUnicodeRange1`,type:`ULONG`,value:0},{name:`ulUnicodeRange2`,type:`ULONG`,value:0},{name:`ulUnicodeRange3`,type:`ULONG`,value:0},{name:`ulUnicodeRange4`,type:`ULONG`,value:0},{name:`achVendID`,type:`CHARARRAY`,value:`XXXX`},{name:`fsSelection`,type:`USHORT`,value:0},{name:`usFirstCharIndex`,type:`USHORT`,value:0},{name:`usLastCharIndex`,type:`USHORT`,value:0},{name:`sTypoAscender`,type:`SHORT`,value:0},{name:`sTypoDescender`,type:`SHORT`,value:0},{name:`sTypoLineGap`,type:`SHORT`,value:0},{name:`usWinAscent`,type:`USHORT`,value:0},{name:`usWinDescent`,type:`USHORT`,value:0},{name:`ulCodePageRange1`,type:`ULONG`,value:0},{name:`ulCodePageRange2`,type:`ULONG`,value:0},{name:`sxHeight`,type:`SHORT`,value:0},{name:`sCapHeight`,type:`SHORT`,value:0},{name:`usDefaultChar`,type:`USHORT`,value:0},{name:`usBreakChar`,type:`USHORT`,value:0},{name:`usMaxContext`,type:`USHORT`,value:0}],e)}var bn={parse:vn,make:yn,unicodeRanges:gn,getUnicodeRange:_n};function xn(e,t){var n={},r=new U.Parser(e,t);switch(n.version=r.parseVersion(),n.italicAngle=r.parseFixed(),n.underlinePosition=r.parseShort(),n.underlineThickness=r.parseShort(),n.isFixedPitch=r.parseULong(),n.minMemType42=r.parseULong(),n.maxMemType42=r.parseULong(),n.minMemType1=r.parseULong(),n.maxMemType1=r.parseULong(),n.version){case 1:n.names=Ie.slice();break;case 2:n.numberOfGlyphs=r.parseUShort(),n.glyphNameIndex=Array(n.numberOfGlyphs);for(var i=0;i<n.numberOfGlyphs;i++)n.glyphNameIndex[i]=r.parseUShort();n.names=[];for(var a=0;a<n.numberOfGlyphs;a++)if(n.glyphNameIndex[a]>=Ie.length){var o=r.parseChar();n.names.push(r.parseString(o))}break;case 2.5:n.numberOfGlyphs=r.parseUShort(),n.offset=Array(n.numberOfGlyphs);for(var s=0;s<n.numberOfGlyphs;s++)n.offset[s]=r.parseChar()}return n}function Sn(){return new R.Table(`post`,[{name:`version`,type:`FIXED`,value:196608},{name:`italicAngle`,type:`FIXED`,value:0},{name:`underlinePosition`,type:`FWORD`,value:0},{name:`underlineThickness`,type:`FWORD`,value:0},{name:`isFixedPitch`,type:`ULONG`,value:0},{name:`minMemType42`,type:`ULONG`,value:0},{name:`maxMemType42`,type:`ULONG`,value:0},{name:`minMemType1`,type:`ULONG`,value:0},{name:`maxMemType1`,type:`ULONG`,value:0}])}var Cn={parse:xn,make:Sn},wn=Array(9);wn[1]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();if(t===1)return{substFormat:1,coverage:this.parsePointer(H.coverage),deltaGlyphId:this.parseUShort()};if(t===2)return{substFormat:2,coverage:this.parsePointer(H.coverage),substitute:this.parseOffset16List()};M.assert(!1,`0x`+e.toString(16)+`: lookup type 1 format must be 1 or 2.`)},wn[2]=function(){var e=this.parseUShort();return M.argument(e===1,`GSUB Multiple Substitution Subtable identifier-format must be 1`),{substFormat:e,coverage:this.parsePointer(H.coverage),sequences:this.parseListOfLists()}},wn[3]=function(){var e=this.parseUShort();return M.argument(e===1,`GSUB Alternate Substitution Subtable identifier-format must be 1`),{substFormat:e,coverage:this.parsePointer(H.coverage),alternateSets:this.parseListOfLists()}},wn[4]=function(){var e=this.parseUShort();return M.argument(e===1,`GSUB ligature table identifier-format must be 1`),{substFormat:e,coverage:this.parsePointer(H.coverage),ligatureSets:this.parseListOfLists(function(){return{ligGlyph:this.parseUShort(),components:this.parseUShortList(this.parseUShort()-1)}})}};var Tn={sequenceIndex:H.uShort,lookupListIndex:H.uShort};wn[5]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();if(t===1)return{substFormat:t,coverage:this.parsePointer(H.coverage),ruleSets:this.parseListOfLists(function(){var e=this.parseUShort(),t=this.parseUShort();return{input:this.parseUShortList(e-1),lookupRecords:this.parseRecordList(t,Tn)}})};if(t===2)return{substFormat:t,coverage:this.parsePointer(H.coverage),classDef:this.parsePointer(H.classDef),classSets:this.parseListOfLists(function(){var e=this.parseUShort(),t=this.parseUShort();return{classes:this.parseUShortList(e-1),lookupRecords:this.parseRecordList(t,Tn)}})};if(t===3){var n=this.parseUShort(),r=this.parseUShort();return{substFormat:t,coverages:this.parseList(n,H.pointer(H.coverage)),lookupRecords:this.parseRecordList(r,Tn)}}M.assert(!1,`0x`+e.toString(16)+`: lookup type 5 format must be 1, 2 or 3.`)},wn[6]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();if(t===1)return{substFormat:1,coverage:this.parsePointer(H.coverage),chainRuleSets:this.parseListOfLists(function(){return{backtrack:this.parseUShortList(),input:this.parseUShortList(this.parseShort()-1),lookahead:this.parseUShortList(),lookupRecords:this.parseRecordList(Tn)}})};if(t===2)return{substFormat:2,coverage:this.parsePointer(H.coverage),backtrackClassDef:this.parsePointer(H.classDef),inputClassDef:this.parsePointer(H.classDef),lookaheadClassDef:this.parsePointer(H.classDef),chainClassSet:this.parseListOfLists(function(){return{backtrack:this.parseUShortList(),input:this.parseUShortList(this.parseShort()-1),lookahead:this.parseUShortList(),lookupRecords:this.parseRecordList(Tn)}})};if(t===3)return{substFormat:3,backtrackCoverage:this.parseList(H.pointer(H.coverage)),inputCoverage:this.parseList(H.pointer(H.coverage)),lookaheadCoverage:this.parseList(H.pointer(H.coverage)),lookupRecords:this.parseRecordList(Tn)};M.assert(!1,`0x`+e.toString(16)+`: lookup type 6 format must be 1, 2 or 3.`)},wn[7]=function(){var e=this.parseUShort();M.argument(e===1,`GSUB Extension Substitution subtable identifier-format must be 1`);var t=this.parseUShort(),n=new H(this.data,this.offset+this.parseULong());return{substFormat:1,lookupType:t,extension:wn[t].call(n)}},wn[8]=function(){var e=this.parseUShort();return M.argument(e===1,`GSUB Reverse Chaining Contextual Single Substitution Subtable identifier-format must be 1`),{substFormat:e,coverage:this.parsePointer(H.coverage),backtrackCoverage:this.parseList(H.pointer(H.coverage)),lookaheadCoverage:this.parseList(H.pointer(H.coverage)),substitutes:this.parseUShortList()}};function En(e,t){t||=0;var n=new H(e,t),r=n.parseVersion(1);return M.argument(r===1||r===1.1,`Unsupported GSUB table version.`),r===1?{version:r,scripts:n.parseScriptList(),features:n.parseFeatureList(),lookups:n.parseLookupList(wn)}:{version:r,scripts:n.parseScriptList(),features:n.parseFeatureList(),lookups:n.parseLookupList(wn),variations:n.parseFeatureVariationsList()}}var Dn=Array(9);Dn[1]=function(e){return e.substFormat===1?new R.Table(`substitutionTable`,[{name:`substFormat`,type:`USHORT`,value:1},{name:`coverage`,type:`TABLE`,value:new R.Coverage(e.coverage)},{name:`deltaGlyphID`,type:`USHORT`,value:e.deltaGlyphId}]):new R.Table(`substitutionTable`,[{name:`substFormat`,type:`USHORT`,value:2},{name:`coverage`,type:`TABLE`,value:new R.Coverage(e.coverage)}].concat(R.ushortList(`substitute`,e.substitute)))},Dn[2]=function(e){return M.assert(e.substFormat===1,`Lookup type 2 substFormat must be 1.`),new R.Table(`substitutionTable`,[{name:`substFormat`,type:`USHORT`,value:1},{name:`coverage`,type:`TABLE`,value:new R.Coverage(e.coverage)}].concat(R.tableList(`seqSet`,e.sequences,function(e){return new R.Table(`sequenceSetTable`,R.ushortList(`sequence`,e))})))},Dn[3]=function(e){return M.assert(e.substFormat===1,`Lookup type 3 substFormat must be 1.`),new R.Table(`substitutionTable`,[{name:`substFormat`,type:`USHORT`,value:1},{name:`coverage`,type:`TABLE`,value:new R.Coverage(e.coverage)}].concat(R.tableList(`altSet`,e.alternateSets,function(e){return new R.Table(`alternateSetTable`,R.ushortList(`alternate`,e))})))},Dn[4]=function(e){return M.assert(e.substFormat===1,`Lookup type 4 substFormat must be 1.`),new R.Table(`substitutionTable`,[{name:`substFormat`,type:`USHORT`,value:1},{name:`coverage`,type:`TABLE`,value:new R.Coverage(e.coverage)}].concat(R.tableList(`ligSet`,e.ligatureSets,function(e){return new R.Table(`ligatureSetTable`,R.tableList(`ligature`,e,function(e){return new R.Table(`ligatureTable`,[{name:`ligGlyph`,type:`USHORT`,value:e.ligGlyph}].concat(R.ushortList(`component`,e.components,e.components.length+1)))}))})))},Dn[6]=function(e){if(e.substFormat===1)return new R.Table(`chainContextTable`,[{name:`substFormat`,type:`USHORT`,value:e.substFormat},{name:`coverage`,type:`TABLE`,value:new R.Coverage(e.coverage)}].concat(R.tableList(`chainRuleSet`,e.chainRuleSets,function(e){return new R.Table(`chainRuleSetTable`,R.tableList(`chainRule`,e,function(e){var t=R.ushortList(`backtrackGlyph`,e.backtrack,e.backtrack.length).concat(R.ushortList(`inputGlyph`,e.input,e.input.length+1)).concat(R.ushortList(`lookaheadGlyph`,e.lookahead,e.lookahead.length)).concat(R.ushortList(`substitution`,[],e.lookupRecords.length));return e.lookupRecords.forEach(function(e,n){t=t.concat({name:`sequenceIndex`+n,type:`USHORT`,value:e.sequenceIndex}).concat({name:`lookupListIndex`+n,type:`USHORT`,value:e.lookupListIndex})}),new R.Table(`chainRuleTable`,t)}))})));if(e.substFormat===2)M.assert(!1,`lookup type 6 format 2 is not yet supported.`);else if(e.substFormat===3){var t=[{name:`substFormat`,type:`USHORT`,value:e.substFormat}];return t.push({name:`backtrackGlyphCount`,type:`USHORT`,value:e.backtrackCoverage.length}),e.backtrackCoverage.forEach(function(e,n){t.push({name:`backtrackCoverage`+n,type:`TABLE`,value:new R.Coverage(e)})}),t.push({name:`inputGlyphCount`,type:`USHORT`,value:e.inputCoverage.length}),e.inputCoverage.forEach(function(e,n){t.push({name:`inputCoverage`+n,type:`TABLE`,value:new R.Coverage(e)})}),t.push({name:`lookaheadGlyphCount`,type:`USHORT`,value:e.lookaheadCoverage.length}),e.lookaheadCoverage.forEach(function(e,n){t.push({name:`lookaheadCoverage`+n,type:`TABLE`,value:new R.Coverage(e)})}),t.push({name:`substitutionCount`,type:`USHORT`,value:e.lookupRecords.length}),e.lookupRecords.forEach(function(e,n){t=t.concat({name:`sequenceIndex`+n,type:`USHORT`,value:e.sequenceIndex}).concat({name:`lookupListIndex`+n,type:`USHORT`,value:e.lookupListIndex})}),new R.Table(`chainContextTable`,t)}M.assert(!1,`lookup type 6 format must be 1, 2 or 3.`)};function On(e){return new R.Table(`GSUB`,[{name:`version`,type:`ULONG`,value:65536},{name:`scripts`,type:`TABLE`,value:new R.ScriptList(e.scripts)},{name:`features`,type:`TABLE`,value:new R.FeatureList(e.features)},{name:`lookups`,type:`TABLE`,value:new R.LookupList(e.lookups,Dn)}])}var kn={parse:En,make:On};function An(e,t){var n=new U.Parser(e,t),r=n.parseULong();M.argument(r===1,`Unsupported META table version.`),n.parseULong(),n.parseULong();for(var i=n.parseULong(),a={},o=0;o<i;o++){var s=n.parseTag(),c=n.parseULong(),l=n.parseULong();a[s]=ee.UTF8(e,t+c,l)}return a}function jn(e){var t=Object.keys(e).length,n=``,r=16+t*12,i=new R.Table(`meta`,[{name:`version`,type:`ULONG`,value:1},{name:`flags`,type:`ULONG`,value:0},{name:`offset`,type:`ULONG`,value:r},{name:`numTags`,type:`ULONG`,value:t}]);for(var a in e){var o=n.length;n+=e[a],i.fields.push({name:`tag `+a,type:`TAG`,value:a}),i.fields.push({name:`offset `+a,type:`ULONG`,value:r+o}),i.fields.push({name:`length `+a,type:`ULONG`,value:e[a].length})}return i.fields.push({name:`stringPool`,type:`CHARARRAY`,value:n}),i}var Mn={parse:An,make:jn};function Nn(e){return Math.log(e)/Math.log(2)|0}function Pn(e){for(;e.length%4!=0;)e.push(0);for(var t=0,n=0;n<e.length;n+=4)t+=(e[n]<<24)+(e[n+1]<<16)+(e[n+2]<<8)+e[n+3];return t%=2**32,t}function Fn(e,t,n,r){return new R.Record(`Table Record`,[{name:`tag`,type:`TAG`,value:e===void 0?``:e},{name:`checkSum`,type:`ULONG`,value:t===void 0?0:t},{name:`offset`,type:`ULONG`,value:n===void 0?0:n},{name:`length`,type:`ULONG`,value:r===void 0?0:r}])}function In(e){var t=new R.Table(`sfnt`,[{name:`version`,type:`TAG`,value:`OTTO`},{name:`numTables`,type:`USHORT`,value:0},{name:`searchRange`,type:`USHORT`,value:0},{name:`entrySelector`,type:`USHORT`,value:0},{name:`rangeShift`,type:`USHORT`,value:0}]);t.tables=e,t.numTables=e.length;var n=2**Nn(t.numTables);t.searchRange=16*n,t.entrySelector=Nn(n),t.rangeShift=t.numTables*16-t.searchRange;for(var r=[],i=[],a=t.sizeOf()+Fn().sizeOf()*t.numTables;a%4!=0;)a+=1,i.push({name:`padding`,type:`BYTE`,value:0});for(var o=0;o<e.length;o+=1){var s=e[o];M.argument(s.tableName.length===4,`Table name`+s.tableName+` is invalid.`);var c=s.sizeOf(),l=Fn(s.tableName,Pn(s.encode()),a,c);for(r.push({name:l.tag+` Table Record`,type:`RECORD`,value:l}),i.push({name:s.tableName+` table`,type:`RECORD`,value:s}),a+=c,M.argument(!isNaN(a),`Something went wrong calculating the offset.`);a%4!=0;)a+=1,i.push({name:`padding`,type:`BYTE`,value:0})}return r.sort(function(e,t){return e.value.tag>t.value.tag?1:-1}),t.fields=t.fields.concat(r),t.fields=t.fields.concat(i),t}function Ln(e,t,n){for(var r=0;r<t.length;r+=1){var i=e.charToGlyphIndex(t[r]);if(i>0)return e.glyphs.get(i).getMetrics()}return n}function Rn(e){for(var t=0,n=0;n<e.length;n+=1)t+=e[n];return t/e.length}function zn(e){for(var t=[],n=[],r=[],i=[],a=[],o=[],s=[],c,l=0,u=0,d=0,f=0,p=0,m=0;m<e.glyphs.length;m+=1){var h=e.glyphs.get(m),g=h.unicode|0;if(isNaN(h.advanceWidth))throw Error(`Glyph `+h.name+` (`+m+`): advanceWidth is not a number.`);(c>g||c===void 0)&&g>0&&(c=g),l<g&&(l=g);var _=bn.getUnicodeRange(g);if(_<32)u|=1<<_;else if(_<64)d|=1<<_-32;else if(_<96)f|=1<<_-64;else if(_<123)p|=1<<_-96;else throw Error(`Unicode ranges bits > 123 are reserved for internal usage`);if(h.name!==`.notdef`){var v=h.getMetrics();t.push(v.xMin),n.push(v.yMin),r.push(v.xMax),i.push(v.yMax),o.push(v.leftSideBearing),s.push(v.rightSideBearing),a.push(h.advanceWidth)}}var y={xMin:Math.min.apply(null,t),yMin:Math.min.apply(null,n),xMax:Math.max.apply(null,r),yMax:Math.max.apply(null,i),advanceWidthMax:Math.max.apply(null,a),advanceWidthAvg:Rn(a),minLeftSideBearing:Math.min.apply(null,o),maxLeftSideBearing:Math.max.apply(null,o),minRightSideBearing:Math.min.apply(null,s)};y.ascender=e.ascender,y.descender=e.descender;var b=Rt.make({flags:3,unitsPerEm:e.unitsPerEm,xMin:y.xMin,yMin:y.yMin,xMax:y.xMax,yMax:y.yMax,lowestRecPPEM:3,createdTimestamp:e.createdTimestamp}),x=Vt.make({ascender:y.ascender,descender:y.descender,advanceWidthMax:y.advanceWidthMax,minLeftSideBearing:y.minLeftSideBearing,minRightSideBearing:y.minRightSideBearing,xMaxExtent:y.maxLeftSideBearing+(y.xMax-y.xMin),numberOfHMetrics:e.glyphs.length}),S=Qt.make(e.glyphs.length),C=bn.make(Object.assign({xAvgCharWidth:Math.round(y.advanceWidthAvg),usFirstCharIndex:c,usLastCharIndex:l,ulUnicodeRange1:u,ulUnicodeRange2:d,ulUnicodeRange3:f,ulUnicodeRange4:p,sTypoAscender:y.ascender,sTypoDescender:y.descender,sTypoLineGap:0,usWinAscent:y.yMax,usWinDescent:Math.abs(y.yMin),ulCodePageRange1:1,sxHeight:Ln(e,`xyvw`,{yMax:Math.round(y.ascender/2)}).yMax,sCapHeight:Ln(e,`HIKLEFJMNTZBDPRAGOQSUVWXY`,y).yMax,usDefaultChar:e.hasChar(` `)?32:0,usBreakChar:e.hasChar(` `)?32:0},e.tables.os2)),w=Kt.make(e.glyphs),T=Me.make(e.glyphs),E=e.getEnglishName(`fontFamily`),D=e.getEnglishName(`fontSubfamily`),O=E+` `+D,k=e.getEnglishName(`postScriptName`);k||=E.replace(/\s/g,``)+`-`+D;var A={};for(var j in e.names)A[j]=e.names[j];A.uniqueID||={en:e.getEnglishName(`manufacturer`)+`:`+O},A.postScriptName||={en:k},A.preferredFamily||=e.names.fontFamily,A.preferredSubfamily||=e.names.fontSubfamily;var M=[],N=hn.make(A,M),P=M.length>0?Yt.make(M):void 0,ee=Cn.make(),F=Ft.make(e.glyphs,{version:e.getEnglishName(`version`),fullName:O,familyName:E,weightName:D,postScriptName:k,unitsPerEm:e.unitsPerEm,fontBBox:[0,y.yMin,y.ascender,y.advanceWidthMax]}),I=e.metas&&Object.keys(e.metas).length>0?Mn.make(e.metas):void 0,te=[b,x,S,C,N,T,ee,F,w];P&&te.push(P),e.tables.gsub&&te.push(kn.make(e.tables.gsub)),I&&te.push(I);for(var ne=In(te),re=Pn(ne.encode()),L=ne.fields,ie=!1,ae=0;ae<L.length;ae+=1)if(L[ae].name===`head table`){L[ae].value.checkSumAdjustment=2981146554-re,ie=!0;break}if(!ie)throw Error(`Could not find head table with checkSum to adjust.`);return ne}var Bn={make:In,fontToTable:zn,computeCheckSum:Pn};function Vn(e,t){for(var n=0,r=e.length-1;n<=r;){var i=n+r>>>1,a=e[i].tag;if(a===t)return i;a<t?n=i+1:r=i-1}return-n-1}function Hn(e,t){for(var n=0,r=e.length-1;n<=r;){var i=n+r>>>1,a=e[i];if(a===t)return i;a<t?n=i+1:r=i-1}return-n-1}function Un(e,t){for(var n,r=0,i=e.length-1;r<=i;){var a=r+i>>>1;n=e[a];var o=n.start;if(o===t)return n;o<t?r=a+1:i=a-1}if(r>0)return n=e[r-1],t>n.end?0:n}function Wn(e,t){this.font=e,this.tableName=t}Wn.prototype={searchTag:Vn,binSearch:Hn,getTable:function(e){var t=this.font.tables[this.tableName];return!t&&e&&(t=this.font.tables[this.tableName]=this.createDefaultTable()),t},getScriptNames:function(){var e=this.getTable();return e?e.scripts.map(function(e){return e.tag}):[]},getDefaultScriptName:function(){var e=this.getTable();if(e){for(var t=!1,n=0;n<e.scripts.length;n++){var r=e.scripts[n].tag;if(r===`DFLT`)return r;r===`latn`&&(t=!0)}if(t)return`latn`}},getScriptTable:function(e,t){var n=this.getTable(t);if(n){e||=`DFLT`;var r=n.scripts,i=Vn(n.scripts,e);if(i>=0)return r[i].script;if(t){var a={tag:e,script:{defaultLangSys:{reserved:0,reqFeatureIndex:65535,featureIndexes:[]},langSysRecords:[]}};return r.splice(-1-i,0,a),a.script}}},getLangSysTable:function(e,t,n){var r=this.getScriptTable(e,n);if(r){if(!t||t===`dflt`||t===`DFLT`)return r.defaultLangSys;var i=Vn(r.langSysRecords,t);if(i>=0)return r.langSysRecords[i].langSys;if(n){var a={tag:t,langSys:{reserved:0,reqFeatureIndex:65535,featureIndexes:[]}};return r.langSysRecords.splice(-1-i,0,a),a.langSys}}},getFeatureTable:function(e,t,n,r){var i=this.getLangSysTable(e,t,r);if(i){for(var a,o=i.featureIndexes,s=this.font.tables[this.tableName].features,c=0;c<o.length;c++)if(a=s[o[c]],a.tag===n)return a.feature;if(r){var l=s.length;return M.assert(l===0||n>=s[l-1].tag,`Features must be added in alphabetical order.`),a={tag:n,feature:{params:0,lookupListIndexes:[]}},s.push(a),o.push(l),a.feature}}},getLookupTables:function(e,t,n,r,i){var a=this.getFeatureTable(e,t,n,i),o=[];if(a){for(var s,c=a.lookupListIndexes,l=this.font.tables[this.tableName].lookups,u=0;u<c.length;u++)s=l[c[u]],s.lookupType===r&&o.push(s);if(o.length===0&&i){s={lookupType:r,lookupFlag:0,subtables:[],markFilteringSet:void 0};var d=l.length;return l.push(s),c.push(d),[s]}}return o},getGlyphClass:function(e,t){switch(e.format){case 1:return e.startGlyph<=t&&t<e.startGlyph+e.classes.length?e.classes[t-e.startGlyph]:0;case 2:var n=Un(e.ranges,t);return n?n.classId:0}},getCoverageIndex:function(e,t){switch(e.format){case 1:var n=Hn(e.glyphs,t);return n>=0?n:-1;case 2:var r=Un(e.ranges,t);return r?r.index+t-r.start:-1}},expandCoverage:function(e){if(e.format===1)return e.glyphs;for(var t=[],n=e.ranges,r=0;r<n.length;r++)for(var i=n[r],a=i.start,o=i.end,s=a;s<=o;s++)t.push(s);return t}};function Gn(e){Wn.call(this,e,`gpos`)}Gn.prototype=Wn.prototype,Gn.prototype.init=function(){var e=this.getDefaultScriptName();this.defaultKerningTables=this.getKerningTables(e)},Gn.prototype.getKerningValue=function(e,t,n){for(var r=0;r<e.length;r++)for(var i=e[r].subtables,a=0;a<i.length;a++){var o=i[a],s=this.getCoverageIndex(o.coverage,t);if(!(s<0))switch(o.posFormat){case 1:for(var c=o.pairSets[s],l=0;l<c.length;l++){var u=c[l];if(u.secondGlyph===n)return u.value1&&u.value1.xAdvance||0}break;case 2:var d=this.getGlyphClass(o.classDef1,t),f=this.getGlyphClass(o.classDef2,n),p=o.classRecords[d][f];return p.value1&&p.value1.xAdvance||0}}return 0},Gn.prototype.getKerningTables=function(e,t){if(this.font.tables.gpos)return this.getLookupTables(e,t,`kern`,2)};function Kn(e){Wn.call(this,e,`gsub`)}function qn(e,t){var n=e.length;if(n!==t.length)return!1;for(var r=0;r<n;r++)if(e[r]!==t[r])return!1;return!0}function Jn(e,t,n){for(var r=e.subtables,i=0;i<r.length;i++){var a=r[i];if(a.substFormat===t)return a}if(n)return r.push(n),n}Kn.prototype=Wn.prototype,Kn.prototype.createDefaultTable=function(){return{version:1,scripts:[{tag:`DFLT`,script:{defaultLangSys:{reserved:0,reqFeatureIndex:65535,featureIndexes:[]},langSysRecords:[]}}],features:[],lookups:[]}},Kn.prototype.getSingle=function(e,t,n){for(var r=[],i=this.getLookupTables(t,n,e,1),a=0;a<i.length;a++)for(var o=i[a].subtables,s=0;s<o.length;s++){var c=o[s],l=this.expandCoverage(c.coverage),u=void 0;if(c.substFormat===1){var d=c.deltaGlyphId;for(u=0;u<l.length;u++){var f=l[u];r.push({sub:f,by:f+d})}}else{var p=c.substitute;for(u=0;u<l.length;u++)r.push({sub:l[u],by:p[u]})}}return r},Kn.prototype.getMultiple=function(e,t,n){for(var r=[],i=this.getLookupTables(t,n,e,2),a=0;a<i.length;a++)for(var o=i[a].subtables,s=0;s<o.length;s++){var c=o[s],l=this.expandCoverage(c.coverage),u=void 0;for(u=0;u<l.length;u++){var d=l[u],f=c.sequences[u];r.push({sub:d,by:f})}}return r},Kn.prototype.getAlternates=function(e,t,n){for(var r=[],i=this.getLookupTables(t,n,e,3),a=0;a<i.length;a++)for(var o=i[a].subtables,s=0;s<o.length;s++)for(var c=o[s],l=this.expandCoverage(c.coverage),u=c.alternateSets,d=0;d<l.length;d++)r.push({sub:l[d],by:u[d]});return r},Kn.prototype.getLigatures=function(e,t,n){for(var r=[],i=this.getLookupTables(t,n,e,4),a=0;a<i.length;a++)for(var o=i[a].subtables,s=0;s<o.length;s++)for(var c=o[s],l=this.expandCoverage(c.coverage),u=c.ligatureSets,d=0;d<l.length;d++)for(var f=l[d],p=u[d],m=0;m<p.length;m++){var h=p[m];r.push({sub:[f].concat(h.components),by:h.ligGlyph})}return r},Kn.prototype.addSingle=function(e,t,n,r){var i=this.getLookupTables(n,r,e,1,!0)[0],a=Jn(i,2,{substFormat:2,coverage:{format:1,glyphs:[]},substitute:[]});M.assert(a.coverage.format===1,`Single: unable to modify coverage table format `+a.coverage.format);var o=t.sub,s=this.binSearch(a.coverage.glyphs,o);s<0&&(s=-1-s,a.coverage.glyphs.splice(s,0,o),a.substitute.splice(s,0,0)),a.substitute[s]=t.by},Kn.prototype.addMultiple=function(e,t,n,r){M.assert(t.by instanceof Array&&t.by.length>1,`Multiple: "by" must be an array of two or more ids`);var i=this.getLookupTables(n,r,e,2,!0)[0],a=Jn(i,1,{substFormat:1,coverage:{format:1,glyphs:[]},sequences:[]});M.assert(a.coverage.format===1,`Multiple: unable to modify coverage table format `+a.coverage.format);var o=t.sub,s=this.binSearch(a.coverage.glyphs,o);s<0&&(s=-1-s,a.coverage.glyphs.splice(s,0,o),a.sequences.splice(s,0,0)),a.sequences[s]=t.by},Kn.prototype.addAlternate=function(e,t,n,r){var i=this.getLookupTables(n,r,e,3,!0)[0],a=Jn(i,1,{substFormat:1,coverage:{format:1,glyphs:[]},alternateSets:[]});M.assert(a.coverage.format===1,`Alternate: unable to modify coverage table format `+a.coverage.format);var o=t.sub,s=this.binSearch(a.coverage.glyphs,o);s<0&&(s=-1-s,a.coverage.glyphs.splice(s,0,o),a.alternateSets.splice(s,0,0)),a.alternateSets[s]=t.by},Kn.prototype.addLigature=function(e,t,n,r){var i=this.getLookupTables(n,r,e,4,!0)[0],a=i.subtables[0];a||(a={substFormat:1,coverage:{format:1,glyphs:[]},ligatureSets:[]},i.subtables[0]=a),M.assert(a.coverage.format===1,`Ligature: unable to modify coverage table format `+a.coverage.format);var o=t.sub[0],s=t.sub.slice(1),c={ligGlyph:t.by,components:s},l=this.binSearch(a.coverage.glyphs,o);if(l>=0){for(var u=a.ligatureSets[l],d=0;d<u.length;d++)if(qn(u[d].components,s))return;u.push(c)}else l=-1-l,a.coverage.glyphs.splice(l,0,o),a.ligatureSets.splice(l,0,[c])},Kn.prototype.getFeature=function(e,t,n){if(/ss\d\d/.test(e))return this.getSingle(e,t,n);switch(e){case`aalt`:case`salt`:return this.getSingle(e,t,n).concat(this.getAlternates(e,t,n));case`dlig`:case`liga`:case`rlig`:return this.getLigatures(e,t,n);case`ccmp`:return this.getMultiple(e,t,n).concat(this.getLigatures(e,t,n));case`stch`:return this.getMultiple(e,t,n)}},Kn.prototype.add=function(e,t,n,r){if(/ss\d\d/.test(e))return this.addSingle(e,t,n,r);switch(e){case`aalt`:case`salt`:return typeof t.by==`number`?this.addSingle(e,t,n,r):this.addAlternate(e,t,n,r);case`dlig`:case`liga`:case`rlig`:return this.addLigature(e,t,n,r);case`ccmp`:return t.by instanceof Array?this.addMultiple(e,t,n,r):this.addLigature(e,t,n,r)}};function Yn(){return typeof window<`u`}function Xn(e){for(var t=new ArrayBuffer(e.length),n=new Uint8Array(t),r=0;r<e.length;++r)n[r]=e[r];return t}function Zn(e){for(var t=new Buffer(e.byteLength),n=new Uint8Array(e),r=0;r<t.length;++r)t[r]=n[r];return t}function Qn(e,t){if(!e)throw t}function $n(e,t,n,r,i){var a;return(t&r)>0?(a=e.parseByte(),(t&i)===0&&(a=-a),a=n+a):a=(t&i)>0?n:n+e.parseShort(),a}function er(e,t,n){var r=new U.Parser(t,n);e.numberOfContours=r.parseShort(),e._xMin=r.parseShort(),e._yMin=r.parseShort(),e._xMax=r.parseShort(),e._yMax=r.parseShort();var i,a;if(e.numberOfContours>0){for(var o=e.endPointIndices=[],s=0;s<e.numberOfContours;s+=1)o.push(r.parseUShort());e.instructionLength=r.parseUShort(),e.instructions=[];for(var c=0;c<e.instructionLength;c+=1)e.instructions.push(r.parseByte());var l=o[o.length-1]+1;i=[];for(var u=0;u<l;u+=1)if(a=r.parseByte(),i.push(a),(a&8)>0)for(var d=r.parseByte(),f=0;f<d;f+=1)i.push(a),u+=1;if(M.argument(i.length===l,`Bad flags.`),o.length>0){var p=[],m;if(l>0){for(var h=0;h<l;h+=1)a=i[h],m={},m.onCurve=!!(a&1),m.lastPointOfContour=o.indexOf(h)>=0,p.push(m);for(var g=0,_=0;_<l;_+=1)a=i[_],m=p[_],m.x=$n(r,a,g,2,16),g=m.x;for(var v=0,y=0;y<l;y+=1)a=i[y],m=p[y],m.y=$n(r,a,v,4,32),v=m.y}e.points=p}else e.points=[]}else if(e.numberOfContours===0)e.points=[];else{e.isComposite=!0,e.points=[],e.components=[];for(var b=!0;b;){i=r.parseUShort();var x={glyphIndex:r.parseUShort(),xScale:1,scale01:0,scale10:0,yScale:1,dx:0,dy:0};(i&1)>0?(i&2)>0?(x.dx=r.parseShort(),x.dy=r.parseShort()):x.matchedPoints=[r.parseUShort(),r.parseUShort()]:(i&2)>0?(x.dx=r.parseChar(),x.dy=r.parseChar()):x.matchedPoints=[r.parseByte(),r.parseByte()],(i&8)>0?x.xScale=x.yScale=r.parseF2Dot14():(i&64)>0?(x.xScale=r.parseF2Dot14(),x.yScale=r.parseF2Dot14()):(i&128)>0&&(x.xScale=r.parseF2Dot14(),x.scale01=r.parseF2Dot14(),x.scale10=r.parseF2Dot14(),x.yScale=r.parseF2Dot14()),e.components.push(x),b=!!(i&32)}if(i&256){e.instructionLength=r.parseUShort(),e.instructions=[];for(var S=0;S<e.instructionLength;S+=1)e.instructions.push(r.parseByte())}}}function tr(e,t){for(var n=[],r=0;r<e.length;r+=1){var i=e[r],a={x:t.xScale*i.x+t.scale01*i.y+t.dx,y:t.scale10*i.x+t.yScale*i.y+t.dy,onCurve:i.onCurve,lastPointOfContour:i.lastPointOfContour};n.push(a)}return n}function nr(e){for(var t=[],n=[],r=0;r<e.length;r+=1){var i=e[r];n.push(i),i.lastPointOfContour&&(t.push(n),n=[])}return M.argument(n.length===0,`There are still points left in the current contour.`),t}function rr(e){var t=new k;if(!e)return t;for(var n=nr(e),r=0;r<n.length;++r){var i=n[r],a=null,o=i[i.length-1],s=i[0];if(o.onCurve)t.moveTo(o.x,o.y);else if(s.onCurve)t.moveTo(s.x,s.y);else{var c={x:(o.x+s.x)*.5,y:(o.y+s.y)*.5};t.moveTo(c.x,c.y)}for(var l=0;l<i.length;++l)if(a=o,o=s,s=i[(l+1)%i.length],o.onCurve)t.lineTo(o.x,o.y);else{var u=s;a.onCurve||((o.x+a.x)*.5,(o.y+a.y)*.5),s.onCurve||(u={x:(o.x+s.x)*.5,y:(o.y+s.y)*.5}),t.quadraticCurveTo(o.x,o.y,u.x,u.y)}t.closePath()}return t}function ir(e,t){if(t.isComposite)for(var n=0;n<t.components.length;n+=1){var r=t.components[n],i=e.get(r.glyphIndex);if(i.getPath(),i.points){var a=void 0;if(r.matchedPoints===void 0)a=tr(i.points,r);else{if(r.matchedPoints[0]>t.points.length-1||r.matchedPoints[1]>i.points.length-1)throw Error(`Matched points out of range in `+t.name);var o=t.points[r.matchedPoints[0]],s=i.points[r.matchedPoints[1]],c={xScale:r.xScale,scale01:r.scale01,scale10:r.scale10,yScale:r.yScale,dx:0,dy:0};s=tr([s],c)[0],c.dx=o.x-s.x,c.dy=o.y-s.y,a=tr(i.points,c)}t.points=t.points.concat(a)}}return rr(t.points)}function ar(e,t,n,r){for(var i=new $e.GlyphSet(r),a=0;a<n.length-1;a+=1){var o=n[a];o===n[a+1]?i.push(a,$e.glyphLoader(r,a)):i.push(a,$e.ttfGlyphLoader(r,a,er,e,t+o,ir))}return i}function or(e,t,n,r){var i=new $e.GlyphSet(r);return r._push=function(a){var o=n[a];o===n[a+1]?i.push(a,$e.glyphLoader(r,a)):i.push(a,$e.ttfGlyphLoader(r,a,er,e,t+o,ir))},i}function sr(e,t,n,r,i){return i.lowMemory?or(e,t,n,r):ar(e,t,n,r)}var cr={getPath:rr,parse:sr},lr,ur,dr,fr;function pr(e){this.font=e,this.getCommands=function(e){return cr.getPath(e).commands},this._fpgmState=this._prepState=void 0,this._errorState=0}function mr(e){return e}function hr(e){return Math.sign(e)*Math.round(Math.abs(e))}function gr(e){return Math.sign(e)*Math.round(Math.abs(e*2))/2}function _r(e){return Math.sign(e)*(Math.round(Math.abs(e)+.5)-.5)}function vr(e){return Math.sign(e)*Math.ceil(Math.abs(e))}function yr(e){return Math.sign(e)*Math.floor(Math.abs(e))}var br=function(e){var t=this.srPeriod,n=this.srPhase,r=this.srThreshold,i=1;return e<0&&(e=-e,i=-1),e+=r-n,e=Math.trunc(e/t)*t,e+=n,e<0?n*i:e*i},xr={x:1,y:0,axis:`x`,distance:function(e,t,n,r){return(n?e.xo:e.x)-(r?t.xo:t.x)},interpolate:function(e,t,n,r){var i,a,o,s,c,l,u;if(!r||r===this){if(i=e.xo-t.xo,a=e.xo-n.xo,c=t.x-t.xo,l=n.x-n.xo,o=Math.abs(i),s=Math.abs(a),u=o+s,u===0){e.x=e.xo+(c+l)/2;return}e.x=e.xo+(c*s+l*o)/u;return}if(i=r.distance(e,t,!0,!0),a=r.distance(e,n,!0,!0),c=r.distance(t,t,!1,!0),l=r.distance(n,n,!1,!0),o=Math.abs(i),s=Math.abs(a),u=o+s,u===0){xr.setRelative(e,e,(c+l)/2,r,!0);return}xr.setRelative(e,e,(c*s+l*o)/u,r,!0)},normalSlope:-1/0,setRelative:function(e,t,n,r,i){if(!r||r===this){e.x=(i?t.xo:t.x)+n;return}var a=i?t.xo:t.x,o=i?t.yo:t.y,s=a+n*r.x,c=o+n*r.y;e.x=s+(e.y-c)/r.normalSlope},slope:0,touch:function(e){e.xTouched=!0},touched:function(e){return e.xTouched},untouch:function(e){e.xTouched=!1}},Sr={x:0,y:1,axis:`y`,distance:function(e,t,n,r){return(n?e.yo:e.y)-(r?t.yo:t.y)},interpolate:function(e,t,n,r){var i,a,o,s,c,l,u;if(!r||r===this){if(i=e.yo-t.yo,a=e.yo-n.yo,c=t.y-t.yo,l=n.y-n.yo,o=Math.abs(i),s=Math.abs(a),u=o+s,u===0){e.y=e.yo+(c+l)/2;return}e.y=e.yo+(c*s+l*o)/u;return}if(i=r.distance(e,t,!0,!0),a=r.distance(e,n,!0,!0),c=r.distance(t,t,!1,!0),l=r.distance(n,n,!1,!0),o=Math.abs(i),s=Math.abs(a),u=o+s,u===0){Sr.setRelative(e,e,(c+l)/2,r,!0);return}Sr.setRelative(e,e,(c*s+l*o)/u,r,!0)},normalSlope:0,setRelative:function(e,t,n,r,i){if(!r||r===this){e.y=(i?t.yo:t.y)+n;return}var a=i?t.xo:t.x,o=i?t.yo:t.y,s=a+n*r.x;e.y=o+n*r.y+r.normalSlope*(e.x-s)},slope:1/0,touch:function(e){e.yTouched=!0},touched:function(e){return e.yTouched},untouch:function(e){e.yTouched=!1}};Object.freeze(xr),Object.freeze(Sr);function Cr(e,t){this.x=e,this.y=t,this.axis=void 0,this.slope=t/e,this.normalSlope=-e/t,Object.freeze(this)}Cr.prototype.distance=function(e,t,n,r){return this.x*xr.distance(e,t,n,r)+this.y*Sr.distance(e,t,n,r)},Cr.prototype.interpolate=function(e,t,n,r){var i,a,o=r.distance(e,t,!0,!0),s=r.distance(e,n,!0,!0),c,l,u;if(i=r.distance(t,t,!1,!0),a=r.distance(n,n,!1,!0),c=Math.abs(o),l=Math.abs(s),u=c+l,u===0){this.setRelative(e,e,(i+a)/2,r,!0);return}this.setRelative(e,e,(i*l+a*c)/u,r,!0)},Cr.prototype.setRelative=function(e,t,n,r,i){r||=this;var a=i?t.xo:t.x,o=i?t.yo:t.y,s=a+n*r.x,c=o+n*r.y,l=r.normalSlope,u=this.slope,d=e.x,f=e.y;e.x=(u*d-l*s+c-f)/(u-l),e.y=u*(e.x-d)+f},Cr.prototype.touch=function(e){e.xTouched=!0,e.yTouched=!0};function wr(e,t){var n=Math.sqrt(e*e+t*t);return e/=n,t/=n,e===1&&t===0?xr:e===0&&t===1?Sr:new Cr(e,t)}function Tr(e,t,n,r){this.x=this.xo=Math.round(e*64)/64,this.y=this.yo=Math.round(t*64)/64,this.lastPointOfContour=n,this.onCurve=r,this.prevPointOnContour=void 0,this.nextPointOnContour=void 0,this.xTouched=!1,this.yTouched=!1,Object.preventExtensions(this)}Tr.prototype.nextTouched=function(e){for(var t=this.nextPointOnContour;!e.touched(t)&&t!==this;)t=t.nextPointOnContour;return t},Tr.prototype.prevTouched=function(e){for(var t=this.prevPointOnContour;!e.touched(t)&&t!==this;)t=t.prevPointOnContour;return t};var Er=Object.freeze(new Tr(0,0)),Dr={cvCutIn:17/16,deltaBase:9,deltaShift:.125,loop:1,minDis:1,autoFlip:!0};function Or(e,t){switch(this.env=e,this.stack=[],this.prog=t,e){case`glyf`:this.zp0=this.zp1=this.zp2=1,this.rp0=this.rp1=this.rp2=0;case`prep`:this.fv=this.pv=this.dpv=xr,this.round=hr}}pr.prototype.exec=function(e,t){if(typeof t!=`number`)throw Error(`Point size is not a number!`);if(!(this._errorState>2)){var n=this.font,r=this._prepState;if(!r||r.ppem!==t){var i=this._fpgmState;if(!i){Or.prototype=Dr,i=this._fpgmState=new Or(`fpgm`,n.tables.fpgm),i.funcs=[],i.font=n,exports.DEBUG&&(console.log(`---EXEC FPGM---`),i.step=-1);try{ur(i)}catch(e){console.log(`Hinting error in FPGM:`+e),this._errorState=3;return}}Or.prototype=i,r=this._prepState=new Or(`prep`,n.tables.prep),r.ppem=t;var a=n.tables.cvt;if(a)for(var o=r.cvt=Array(a.length),s=t/n.unitsPerEm,c=0;c<a.length;c++)o[c]=a[c]*s;else r.cvt=[];exports.DEBUG&&(console.log(`---EXEC PREP---`),r.step=-1);try{ur(r)}catch(e){this._errorState<2&&console.log(`Hinting error in PREP:`+e),this._errorState=2}}if(!(this._errorState>1))try{return dr(e,r)}catch(e){this._errorState<1&&(console.log(`Hinting error:`+e),console.log(`Note: further hinting errors are silenced`)),this._errorState=1;return}}},dr=function(e,t){var n=t.ppem/t.font.unitsPerEm,r=n,i=e.components,a,o,s;if(Or.prototype=t,!i)s=new Or(`glyf`,e.instructions),exports.DEBUG&&(console.log(`---EXEC GLYPH---`),s.step=-1),fr(e,s,n,r),o=s.gZone;else{var c=t.font;o=[],a=[];for(var l=0;l<i.length;l++){var u=i[l],d=c.glyphs.get(u.glyphIndex);s=new Or(`glyf`,d.instructions),exports.DEBUG&&(console.log(`---EXEC COMP `+l+`---`),s.step=-1),fr(d,s,n,r);for(var f=Math.round(u.dx*n),p=Math.round(u.dy*r),m=s.gZone,h=s.contours,g=0;g<m.length;g++){var _=m[g];_.xTouched=_.yTouched=!1,_.xo=_.x+=f,_.yo=_.y+=p}var v=o.length;o.push.apply(o,m);for(var y=0;y<h.length;y++)a.push(h[y]+v)}e.instructions&&!s.inhibitGridFit&&(s=new Or(`glyf`,e.instructions),s.gZone=s.z0=s.z1=s.z2=o,s.contours=a,o.push(new Tr(0,0),new Tr(Math.round(e.advanceWidth*n),0)),exports.DEBUG&&(console.log(`---EXEC COMPOSITE---`),s.step=-1),ur(s),o.length-=2)}return o},fr=function(e,t,n,r){for(var i=e.points||[],a=i.length,o=t.gZone=t.z0=t.z1=t.z2=[],s=t.contours=[],c,l=0;l<a;l++)c=i[l],o[l]=new Tr(c.x*n,c.y*r,c.lastPointOfContour,c.onCurve);for(var u,d,f=0;f<a;f++)c=o[f],u||(u=c,s.push(f)),c.lastPointOfContour?(c.nextPointOnContour=u,u.prevPointOnContour=c,u=void 0):(d=o[f+1],c.nextPointOnContour=d,d.prevPointOnContour=c);if(!t.inhibitGridFit){if(exports.DEBUG){console.log(`PROCESSING GLYPH`,t.stack);for(var p=0;p<a;p++)console.log(p,o[p].x,o[p].y)}if(o.push(new Tr(0,0),new Tr(Math.round(e.advanceWidth*n),0)),ur(t),o.length-=2,exports.DEBUG){console.log(`FINISHED GLYPH`,t.stack);for(var m=0;m<a;m++)console.log(m,o[m].x,o[m].y)}}},ur=function(e){var t=e.prog;if(t){var n=t.length,r;for(e.ip=0;e.ip<n;e.ip++){if(exports.DEBUG&&e.step++,r=lr[t[e.ip]],!r)throw Error(`unknown instruction: 0x`+Number(t[e.ip]).toString(16));r(e)}}};function kr(e){for(var t=e.tZone=Array(e.gZone.length),n=0;n<t.length;n++)t[n]=new Tr(0,0)}function Ar(e,t){var n=e.prog,r=e.ip,i=1,a;do if(a=n[++r],a===88)i++;else if(a===89)i--;else if(a===64)r+=n[r+1]+1;else if(a===65)r+=2*n[r+1]+1;else if(a>=176&&a<=183)r+=a-176+1;else if(a>=184&&a<=191)r+=(a-184+1)*2;else if(t&&i===1&&a===27)break;while(i>0);e.ip=r}function jr(e,t){exports.DEBUG&&console.log(t.step,`SVTCA[`+e.axis+`]`),t.fv=t.pv=t.dpv=e}function Mr(e,t){exports.DEBUG&&console.log(t.step,`SPVTCA[`+e.axis+`]`),t.pv=t.dpv=e}function Nr(e,t){exports.DEBUG&&console.log(t.step,`SFVTCA[`+e.axis+`]`),t.fv=e}function Pr(e,t){var n=t.stack,r=n.pop(),i=n.pop(),a=t.z2[r],o=t.z1[i];exports.DEBUG&&console.log(`SPVTL[`+e+`]`,r,i);var s,c;e?(s=a.y-o.y,c=o.x-a.x):(s=o.x-a.x,c=o.y-a.y),t.pv=t.dpv=wr(s,c)}function Fr(e,t){var n=t.stack,r=n.pop(),i=n.pop(),a=t.z2[r],o=t.z1[i];exports.DEBUG&&console.log(`SFVTL[`+e+`]`,r,i);var s,c;e?(s=a.y-o.y,c=o.x-a.x):(s=o.x-a.x,c=o.y-a.y),t.fv=wr(s,c)}function Ir(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`SPVFS[]`,n,r),e.pv=e.dpv=wr(r,n)}function Lr(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`SPVFS[]`,n,r),e.fv=wr(r,n)}function Rr(e){var t=e.stack,n=e.pv;exports.DEBUG&&console.log(e.step,`GPV[]`),t.push(n.x*16384),t.push(n.y*16384)}function zr(e){var t=e.stack,n=e.fv;exports.DEBUG&&console.log(e.step,`GFV[]`),t.push(n.x*16384),t.push(n.y*16384)}function Br(e){e.fv=e.pv,exports.DEBUG&&console.log(e.step,`SFVTPV[]`)}function Vr(e){var t=e.stack,n=t.pop(),r=t.pop(),i=t.pop(),a=t.pop(),o=t.pop(),s=e.z0,c=e.z1,l=s[n],u=s[r],d=c[i],f=c[a],p=e.z2[o];exports.DEBUG&&console.log(`ISECT[], `,n,r,i,a,o);var m=l.x,h=l.y,g=u.x,_=u.y,v=d.x,y=d.y,b=f.x,x=f.y,S=(m-g)*(y-x)-(h-_)*(v-b),C=m*_-h*g,w=v*x-y*b;p.x=(C*(v-b)-w*(m-g))/S,p.y=(C*(y-x)-w*(h-_))/S}function Hr(e){e.rp0=e.stack.pop(),exports.DEBUG&&console.log(e.step,`SRP0[]`,e.rp0)}function Ur(e){e.rp1=e.stack.pop(),exports.DEBUG&&console.log(e.step,`SRP1[]`,e.rp1)}function Wr(e){e.rp2=e.stack.pop(),exports.DEBUG&&console.log(e.step,`SRP2[]`,e.rp2)}function Gr(e){var t=e.stack.pop();switch(exports.DEBUG&&console.log(e.step,`SZP0[]`,t),e.zp0=t,t){case 0:e.tZone||kr(e),e.z0=e.tZone;break;case 1:e.z0=e.gZone;break;default:throw Error(`Invalid zone pointer`)}}function Kr(e){var t=e.stack.pop();switch(exports.DEBUG&&console.log(e.step,`SZP1[]`,t),e.zp1=t,t){case 0:e.tZone||kr(e),e.z1=e.tZone;break;case 1:e.z1=e.gZone;break;default:throw Error(`Invalid zone pointer`)}}function qr(e){var t=e.stack.pop();switch(exports.DEBUG&&console.log(e.step,`SZP2[]`,t),e.zp2=t,t){case 0:e.tZone||kr(e),e.z2=e.tZone;break;case 1:e.z2=e.gZone;break;default:throw Error(`Invalid zone pointer`)}}function Jr(e){var t=e.stack.pop();switch(exports.DEBUG&&console.log(e.step,`SZPS[]`,t),e.zp0=e.zp1=e.zp2=t,t){case 0:e.tZone||kr(e),e.z0=e.z1=e.z2=e.tZone;break;case 1:e.z0=e.z1=e.z2=e.gZone;break;default:throw Error(`Invalid zone pointer`)}}function Yr(e){e.loop=e.stack.pop(),exports.DEBUG&&console.log(e.step,`SLOOP[]`,e.loop)}function Xr(e){exports.DEBUG&&console.log(e.step,`RTG[]`),e.round=hr}function Zr(e){exports.DEBUG&&console.log(e.step,`RTHG[]`),e.round=_r}function Qr(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`SMD[]`,t),e.minDis=t/64}function $r(e){exports.DEBUG&&console.log(e.step,`ELSE[]`),Ar(e,!1)}function ei(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`JMPR[]`,t),e.ip+=t-1}function ti(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`SCVTCI[]`,t),e.cvCutIn=t/64}function ni(e){var t=e.stack;exports.DEBUG&&console.log(e.step,`DUP[]`),t.push(t[t.length-1])}function ri(e){exports.DEBUG&&console.log(e.step,`POP[]`),e.stack.pop()}function ii(e){exports.DEBUG&&console.log(e.step,`CLEAR[]`),e.stack.length=0}function ai(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`SWAP[]`),t.push(n),t.push(r)}function oi(e){var t=e.stack;exports.DEBUG&&console.log(e.step,`DEPTH[]`),t.push(t.length)}function si(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`LOOPCALL[]`,n,r);var i=e.ip,a=e.prog;e.prog=e.funcs[n];for(var o=0;o<r;o++)ur(e),exports.DEBUG&&console.log(++e.step,o+1<r?`next loopcall`:`done loopcall`,o);e.ip=i,e.prog=a}function ci(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`CALL[]`,t);var n=e.ip,r=e.prog;e.prog=e.funcs[t],ur(e),e.ip=n,e.prog=r,exports.DEBUG&&console.log(++e.step,`returning from`,t)}function li(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`CINDEX[]`,n),t.push(t[t.length-n])}function ui(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`MINDEX[]`,n),t.push(t.splice(t.length-n,1)[0])}function di(e){if(e.env!==`fpgm`)throw Error(`FDEF not allowed here`);var t=e.stack,n=e.prog,r=e.ip,i=t.pop(),a=r;for(exports.DEBUG&&console.log(e.step,`FDEF[]`,i);n[++r]!==45;);e.ip=r,e.funcs[i]=n.slice(a+1,r)}function fi(e,t){var n=t.stack.pop(),r=t.z0[n],i=t.fv,a=t.pv;exports.DEBUG&&console.log(t.step,`MDAP[`+e+`]`,n);var o=a.distance(r,Er);e&&(o=t.round(o)),i.setRelative(r,Er,o,a),i.touch(r),t.rp0=t.rp1=n}function pi(e,t){var n=t.z2,r=n.length-2,i,a,o;exports.DEBUG&&console.log(t.step,`IUP[`+e.axis+`]`);for(var s=0;s<r;s++)i=n[s],!e.touched(i)&&(a=i.prevTouched(e),a!==i&&(o=i.nextTouched(e),a===o&&e.setRelative(i,i,e.distance(a,a,!1,!0),e,!0),e.interpolate(i,a,o,e)))}function mi(e,t){for(var n=t.stack,r=e?t.rp1:t.rp2,i=(e?t.z0:t.z1)[r],a=t.fv,o=t.pv,s=t.loop,c=t.z2;s--;){var l=n.pop(),u=c[l],d=o.distance(i,i,!1,!0);a.setRelative(u,u,d,o),a.touch(u),exports.DEBUG&&console.log(t.step,(t.loop>1?`loop `+(t.loop-s)+`: `:``)+`SHP[`+(e?`rp1`:`rp2`)+`]`,l)}t.loop=1}function hi(e,t){var n=t.stack,r=e?t.rp1:t.rp2,i=(e?t.z0:t.z1)[r],a=t.fv,o=t.pv,s=n.pop(),c=t.z2[t.contours[s]],l=c;exports.DEBUG&&console.log(t.step,`SHC[`+e+`]`,s);var u=o.distance(i,i,!1,!0);do l!==i&&a.setRelative(l,l,u,o),l=l.nextPointOnContour;while(l!==c)}function gi(e,t){var n=t.stack,r=e?t.rp1:t.rp2,i=(e?t.z0:t.z1)[r],a=t.fv,o=t.pv,s=n.pop();exports.DEBUG&&console.log(t.step,`SHZ[`+e+`]`,s);var c;switch(s){case 0:c=t.tZone;break;case 1:c=t.gZone;break;default:throw Error(`Invalid zone`)}for(var l,u=o.distance(i,i,!1,!0),d=c.length-2,f=0;f<d;f++)l=c[f],a.setRelative(l,l,u,o)}function _i(e){for(var t=e.stack,n=e.loop,r=e.fv,i=t.pop()/64,a=e.z2;n--;){var o=t.pop(),s=a[o];exports.DEBUG&&console.log(e.step,(e.loop>1?`loop `+(e.loop-n)+`: `:``)+`SHPIX[]`,o,i),r.setRelative(s,s,i),r.touch(s)}e.loop=1}function vi(e){for(var t=e.stack,n=e.rp1,r=e.rp2,i=e.loop,a=e.z0[n],o=e.z1[r],s=e.fv,c=e.dpv,l=e.z2;i--;){var u=t.pop(),d=l[u];exports.DEBUG&&console.log(e.step,(e.loop>1?`loop `+(e.loop-i)+`: `:``)+`IP[]`,u,n,`<->`,r),s.interpolate(d,a,o,c),s.touch(d)}e.loop=1}function yi(e,t){var n=t.stack,r=n.pop()/64,i=n.pop(),a=t.z1[i],o=t.z0[t.rp0],s=t.fv,c=t.pv;s.setRelative(a,o,r,c),s.touch(a),exports.DEBUG&&console.log(t.step,`MSIRP[`+e+`]`,r,i),t.rp1=t.rp0,t.rp2=i,e&&(t.rp0=i)}function bi(e){for(var t=e.stack,n=e.rp0,r=e.z0[n],i=e.loop,a=e.fv,o=e.pv,s=e.z1;i--;){var c=t.pop(),l=s[c];exports.DEBUG&&console.log(e.step,(e.loop>1?`loop `+(e.loop-i)+`: `:``)+`ALIGNRP[]`,c),a.setRelative(l,r,0,o),a.touch(l)}e.loop=1}function xi(e){exports.DEBUG&&console.log(e.step,`RTDG[]`),e.round=gr}function Si(e,t){var n=t.stack,r=n.pop(),i=n.pop(),a=t.z0[i],o=t.fv,s=t.pv,c=t.cvt[r];exports.DEBUG&&console.log(t.step,`MIAP[`+e+`]`,r,`(`,c,`)`,i);var l=s.distance(a,Er);e&&(Math.abs(l-c)<t.cvCutIn&&(l=c),l=t.round(l)),o.setRelative(a,Er,l,s),t.zp0===0&&(a.xo=a.x,a.yo=a.y),o.touch(a),t.rp0=t.rp1=i}function Ci(e){var t=e.prog,n=e.ip,r=e.stack,i=t[++n];exports.DEBUG&&console.log(e.step,`NPUSHB[]`,i);for(var a=0;a<i;a++)r.push(t[++n]);e.ip=n}function wi(e){var t=e.ip,n=e.prog,r=e.stack,i=n[++t];exports.DEBUG&&console.log(e.step,`NPUSHW[]`,i);for(var a=0;a<i;a++){var o=n[++t]<<8|n[++t];o&32768&&(o=-((o^65535)+1)),r.push(o)}e.ip=t}function Ti(e){var t=e.stack,n=e.store;n||=e.store=[];var r=t.pop(),i=t.pop();exports.DEBUG&&console.log(e.step,`WS`,r,i),n[i]=r}function Ei(e){var t=e.stack,n=e.store,r=t.pop();exports.DEBUG&&console.log(e.step,`RS`,r);var i=n&&n[r]||0;t.push(i)}function Di(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`WCVTP`,n,r),e.cvt[r]=n/64}function Oi(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`RCVT`,n),t.push(e.cvt[n]*64)}function ki(e,t){var n=t.stack,r=n.pop(),i=t.z2[r];exports.DEBUG&&console.log(t.step,`GC[`+e+`]`,r),n.push(t.dpv.distance(i,Er,e,!1)*64)}function Ai(e,t){var n=t.stack,r=n.pop(),i=n.pop(),a=t.z1[r],o=t.z0[i],s=t.dpv.distance(o,a,e,e);exports.DEBUG&&console.log(t.step,`MD[`+e+`]`,r,i,`->`,s),t.stack.push(Math.round(s*64))}function ji(e){exports.DEBUG&&console.log(e.step,`MPPEM[]`),e.stack.push(e.ppem)}function Mi(e){exports.DEBUG&&console.log(e.step,`FLIPON[]`),e.autoFlip=!0}function Ni(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`LT[]`,n,r),t.push(+(r<n))}function Pi(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`LTEQ[]`,n,r),t.push(+(r<=n))}function Fi(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`GT[]`,n,r),t.push(+(r>n))}function Ii(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`GTEQ[]`,n,r),t.push(+(r>=n))}function Li(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`EQ[]`,n,r),t.push(+(n===r))}function Ri(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`NEQ[]`,n,r),t.push(n===r?0:1)}function zi(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`ODD[]`,n),t.push(Math.trunc(n)%2?1:0)}function Bi(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`EVEN[]`,n),t.push(Math.trunc(n)%2?0:1)}function Vi(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`IF[]`,t),t||(Ar(e,!0),exports.DEBUG&&console.log(e.step,`EIF[]`))}function Hi(e){exports.DEBUG&&console.log(e.step,`EIF[]`)}function Ui(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`AND[]`,n,r),t.push(n&&r?1:0)}function Wi(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`OR[]`,n,r),t.push(n||r?1:0)}function Gi(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`NOT[]`,n),t.push(+!n)}function Ki(e,t){var n=t.stack,r=n.pop(),i=t.fv,a=t.pv,o=t.ppem,s=t.deltaBase+(e-1)*16,c=t.deltaShift,l=t.z0;exports.DEBUG&&console.log(t.step,`DELTAP[`+e+`]`,r,n);for(var u=0;u<r;u++){var d=n.pop(),f=n.pop();if(s+((f&240)>>4)===o){var p=(f&15)-8;p>=0&&p++,exports.DEBUG&&console.log(t.step,`DELTAPFIX`,d,`by`,p*c);var m=l[d];i.setRelative(m,m,p*c,a)}}}function qi(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`SDB[]`,t),e.deltaBase=t}function Ji(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`SDS[]`,t),e.deltaShift=.5**t}function Yi(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`ADD[]`,n,r),t.push(r+n)}function Xi(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`SUB[]`,n,r),t.push(r-n)}function Zi(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`DIV[]`,n,r),t.push(r*64/n)}function Qi(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`MUL[]`,n,r),t.push(r*n/64)}function $i(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`ABS[]`,n),t.push(Math.abs(n))}function ea(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`NEG[]`,n),t.push(-n)}function ta(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`FLOOR[]`,n),t.push(Math.floor(n/64)*64)}function na(e){var t=e.stack,n=t.pop();exports.DEBUG&&console.log(e.step,`CEILING[]`,n),t.push(Math.ceil(n/64)*64)}function ra(e,t){var n=t.stack,r=n.pop();exports.DEBUG&&console.log(t.step,`ROUND[]`),n.push(t.round(r/64)*64)}function ia(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`WCVTF[]`,n,r),e.cvt[r]=n*e.ppem/e.font.unitsPerEm}function aa(e,t){var n=t.stack,r=n.pop(),i=t.ppem,a=t.deltaBase+(e-1)*16,o=t.deltaShift;exports.DEBUG&&console.log(t.step,`DELTAC[`+e+`]`,r,n);for(var s=0;s<r;s++){var c=n.pop(),l=n.pop();if(a+((l&240)>>4)===i){var u=(l&15)-8;u>=0&&u++;var d=u*o;exports.DEBUG&&console.log(t.step,`DELTACFIX`,c,`by`,d),t.cvt[c]+=d}}}function oa(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`SROUND[]`,t),e.round=br;var n;switch(t&192){case 0:n=.5;break;case 64:n=1;break;case 128:n=2;break;default:throw Error(`invalid SROUND value`)}switch(e.srPeriod=n,t&48){case 0:e.srPhase=0;break;case 16:e.srPhase=.25*n;break;case 32:e.srPhase=.5*n;break;case 48:e.srPhase=.75*n;break;default:throw Error(`invalid SROUND value`)}t&=15,e.srThreshold=t===0?0:(t/8-.5)*n}function sa(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`S45ROUND[]`,t),e.round=br;var n;switch(t&192){case 0:n=Math.sqrt(2)/2;break;case 64:n=Math.sqrt(2);break;case 128:n=2*Math.sqrt(2);break;default:throw Error(`invalid S45ROUND value`)}switch(e.srPeriod=n,t&48){case 0:e.srPhase=0;break;case 16:e.srPhase=.25*n;break;case 32:e.srPhase=.5*n;break;case 48:e.srPhase=.75*n;break;default:throw Error(`invalid S45ROUND value`)}t&=15,e.srThreshold=t===0?0:(t/8-.5)*n}function ca(e){exports.DEBUG&&console.log(e.step,`ROFF[]`),e.round=mr}function la(e){exports.DEBUG&&console.log(e.step,`RUTG[]`),e.round=vr}function ua(e){exports.DEBUG&&console.log(e.step,`RDTG[]`),e.round=yr}function da(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`SCANCTRL[]`,t)}function fa(e,t){var n=t.stack,r=n.pop(),i=n.pop(),a=t.z2[r],o=t.z1[i];exports.DEBUG&&console.log(t.step,`SDPVTL[`+e+`]`,r,i);var s,c;e?(s=a.y-o.y,c=o.x-a.x):(s=o.x-a.x,c=o.y-a.y),t.dpv=wr(s,c)}function pa(e){var t=e.stack,n=t.pop(),r=0;exports.DEBUG&&console.log(e.step,`GETINFO[]`,n),n&1&&(r=35),n&32&&(r|=4096),t.push(r)}function ma(e){var t=e.stack,n=t.pop(),r=t.pop(),i=t.pop();exports.DEBUG&&console.log(e.step,`ROLL[]`),t.push(r),t.push(n),t.push(i)}function ha(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`MAX[]`,n,r),t.push(Math.max(r,n))}function ga(e){var t=e.stack,n=t.pop(),r=t.pop();exports.DEBUG&&console.log(e.step,`MIN[]`,n,r),t.push(Math.min(r,n))}function _a(e){var t=e.stack.pop();exports.DEBUG&&console.log(e.step,`SCANTYPE[]`,t)}function va(e){var t=e.stack.pop(),n=e.stack.pop();switch(exports.DEBUG&&console.log(e.step,`INSTCTRL[]`,t,n),t){case 1:e.inhibitGridFit=!!n;return;case 2:e.ignoreCvt=!!n;return;default:throw Error(`invalid INSTCTRL[] selector`)}}function ya(e,t){var n=t.stack,r=t.prog,i=t.ip;exports.DEBUG&&console.log(t.step,`PUSHB[`+e+`]`);for(var a=0;a<e;a++)n.push(r[++i]);t.ip=i}function ba(e,t){var n=t.ip,r=t.prog,i=t.stack;exports.DEBUG&&console.log(t.ip,`PUSHW[`+e+`]`);for(var a=0;a<e;a++){var o=r[++n]<<8|r[++n];o&32768&&(o=-((o^65535)+1)),i.push(o)}t.ip=n}function W(e,t,n,r,i,a){var o=a.stack,s=e&&o.pop(),c=o.pop(),l=a.rp0,u=a.z0[l],d=a.z1[c],f=a.minDis,p=a.fv,m=a.dpv,h,g=h=m.distance(d,u,!0,!0),_=g>=0?1:-1,v;g=Math.abs(g),e&&(v=a.cvt[s],r&&Math.abs(g-v)<a.cvCutIn&&(g=v)),n&&g<f&&(g=f),r&&(g=a.round(g)),p.setRelative(d,u,_*g,m),p.touch(d),exports.DEBUG&&console.log(a.step,(e?`MIRP[`:`MDRP[`)+(t?`M`:`m`)+(n?`>`:`_`)+(r?`R`:`_`)+(i===0?`Gr`:i===1?`Bl`:i===2?`Wh`:``)+`]`,e?s+`(`+a.cvt[s]+`,`+v+`)`:``,c,`(d =`,h,`->`,_*g,`)`),a.rp1=a.rp0,a.rp2=c,t&&(a.rp0=c)}lr=[jr.bind(void 0,Sr),jr.bind(void 0,xr),Mr.bind(void 0,Sr),Mr.bind(void 0,xr),Nr.bind(void 0,Sr),Nr.bind(void 0,xr),Pr.bind(void 0,0),Pr.bind(void 0,1),Fr.bind(void 0,0),Fr.bind(void 0,1),Ir,Lr,Rr,zr,Br,Vr,Hr,Ur,Wr,Gr,Kr,qr,Jr,Yr,Xr,Zr,Qr,$r,ei,ti,void 0,void 0,ni,ri,ii,ai,oi,li,ui,void 0,void 0,void 0,si,ci,di,void 0,fi.bind(void 0,0),fi.bind(void 0,1),pi.bind(void 0,Sr),pi.bind(void 0,xr),mi.bind(void 0,0),mi.bind(void 0,1),hi.bind(void 0,0),hi.bind(void 0,1),gi.bind(void 0,0),gi.bind(void 0,1),_i,vi,yi.bind(void 0,0),yi.bind(void 0,1),bi,xi,Si.bind(void 0,0),Si.bind(void 0,1),Ci,wi,Ti,Ei,Di,Oi,ki.bind(void 0,0),ki.bind(void 0,1),void 0,Ai.bind(void 0,0),Ai.bind(void 0,1),ji,void 0,Mi,void 0,void 0,Ni,Pi,Fi,Ii,Li,Ri,zi,Bi,Vi,Hi,Ui,Wi,Gi,Ki.bind(void 0,1),qi,Ji,Yi,Xi,Zi,Qi,$i,ea,ta,na,ra.bind(void 0,0),ra.bind(void 0,1),ra.bind(void 0,2),ra.bind(void 0,3),void 0,void 0,void 0,void 0,ia,Ki.bind(void 0,2),Ki.bind(void 0,3),aa.bind(void 0,1),aa.bind(void 0,2),aa.bind(void 0,3),oa,sa,void 0,void 0,ca,void 0,la,ua,ri,ri,void 0,void 0,void 0,void 0,void 0,da,fa.bind(void 0,0),fa.bind(void 0,1),pa,void 0,ma,ha,ga,_a,va,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0,ya.bind(void 0,1),ya.bind(void 0,2),ya.bind(void 0,3),ya.bind(void 0,4),ya.bind(void 0,5),ya.bind(void 0,6),ya.bind(void 0,7),ya.bind(void 0,8),ba.bind(void 0,1),ba.bind(void 0,2),ba.bind(void 0,3),ba.bind(void 0,4),ba.bind(void 0,5),ba.bind(void 0,6),ba.bind(void 0,7),ba.bind(void 0,8),W.bind(void 0,0,0,0,0,0),W.bind(void 0,0,0,0,0,1),W.bind(void 0,0,0,0,0,2),W.bind(void 0,0,0,0,0,3),W.bind(void 0,0,0,0,1,0),W.bind(void 0,0,0,0,1,1),W.bind(void 0,0,0,0,1,2),W.bind(void 0,0,0,0,1,3),W.bind(void 0,0,0,1,0,0),W.bind(void 0,0,0,1,0,1),W.bind(void 0,0,0,1,0,2),W.bind(void 0,0,0,1,0,3),W.bind(void 0,0,0,1,1,0),W.bind(void 0,0,0,1,1,1),W.bind(void 0,0,0,1,1,2),W.bind(void 0,0,0,1,1,3),W.bind(void 0,0,1,0,0,0),W.bind(void 0,0,1,0,0,1),W.bind(void 0,0,1,0,0,2),W.bind(void 0,0,1,0,0,3),W.bind(void 0,0,1,0,1,0),W.bind(void 0,0,1,0,1,1),W.bind(void 0,0,1,0,1,2),W.bind(void 0,0,1,0,1,3),W.bind(void 0,0,1,1,0,0),W.bind(void 0,0,1,1,0,1),W.bind(void 0,0,1,1,0,2),W.bind(void 0,0,1,1,0,3),W.bind(void 0,0,1,1,1,0),W.bind(void 0,0,1,1,1,1),W.bind(void 0,0,1,1,1,2),W.bind(void 0,0,1,1,1,3),W.bind(void 0,1,0,0,0,0),W.bind(void 0,1,0,0,0,1),W.bind(void 0,1,0,0,0,2),W.bind(void 0,1,0,0,0,3),W.bind(void 0,1,0,0,1,0),W.bind(void 0,1,0,0,1,1),W.bind(void 0,1,0,0,1,2),W.bind(void 0,1,0,0,1,3),W.bind(void 0,1,0,1,0,0),W.bind(void 0,1,0,1,0,1),W.bind(void 0,1,0,1,0,2),W.bind(void 0,1,0,1,0,3),W.bind(void 0,1,0,1,1,0),W.bind(void 0,1,0,1,1,1),W.bind(void 0,1,0,1,1,2),W.bind(void 0,1,0,1,1,3),W.bind(void 0,1,1,0,0,0),W.bind(void 0,1,1,0,0,1),W.bind(void 0,1,1,0,0,2),W.bind(void 0,1,1,0,0,3),W.bind(void 0,1,1,0,1,0),W.bind(void 0,1,1,0,1,1),W.bind(void 0,1,1,0,1,2),W.bind(void 0,1,1,0,1,3),W.bind(void 0,1,1,1,0,0),W.bind(void 0,1,1,1,0,1),W.bind(void 0,1,1,1,0,2),W.bind(void 0,1,1,1,0,3),W.bind(void 0,1,1,1,1,0),W.bind(void 0,1,1,1,1,1),W.bind(void 0,1,1,1,1,2),W.bind(void 0,1,1,1,1,3)];function xa(e){this.char=e,this.state={},this.activeState=null}function Sa(e,t,n){this.contextName=n,this.startIndex=e,this.endOffset=t}function Ca(e,t,n){this.contextName=e,this.openRange=null,this.ranges=[],this.checkStart=t,this.checkEnd=n}function wa(e,t){this.context=e,this.index=t,this.length=e.length,this.current=e[t],this.backtrack=e.slice(0,t),this.lookahead=e.slice(t+1)}function Ta(e){this.eventId=e,this.subscribers=[]}function Ea(e){var t=this,n=[`start`,`end`,`next`,`newToken`,`contextStart`,`contextEnd`,`insertToken`,`removeToken`,`removeRange`,`replaceToken`,`replaceRange`,`composeRUD`,`updateContextsRanges`];n.forEach(function(e){Object.defineProperty(t.events,e,{value:new Ta(e)})}),e&&n.forEach(function(n){var r=e[n];typeof r==`function`&&t.events[n].subscribe(r)}),[`insertToken`,`removeToken`,`removeRange`,`replaceToken`,`replaceRange`,`composeRUD`].forEach(function(e){t.events[e].subscribe(t.updateContextsRanges)})}function Da(e){this.tokens=[],this.registeredContexts={},this.contextCheckers=[],this.events={},this.registeredModifiers=[],Ea.call(this,e)}xa.prototype.setState=function(e,t){return this.state[e]=t,this.activeState={key:e,value:this.state[e]},this.activeState},xa.prototype.getState=function(e){return this.state[e]||null},Da.prototype.inboundIndex=function(e){return e>=0&&e<this.tokens.length},Da.prototype.composeRUD=function(e){var t=this,n=!0,r=e.map(function(e){return t[e[0]].apply(t,e.slice(1).concat(n))}),i=function(e){return typeof e==`object`&&e.hasOwnProperty(`FAIL`)};if(r.every(i))return{FAIL:`composeRUD: one or more operations hasn't completed successfully`,report:r.filter(i)};this.dispatch(`composeRUD`,[r.filter(function(e){return!i(e)})])},Da.prototype.replaceRange=function(e,t,n,r){t=t===null?this.tokens.length:t;var i=n.every(function(e){return e instanceof xa});if(!isNaN(e)&&this.inboundIndex(e)&&i){var a=this.tokens.splice.apply(this.tokens,[e,t].concat(n));return r||this.dispatch(`replaceToken`,[e,t,n]),[a,n]}return{FAIL:`replaceRange: invalid tokens or startIndex.`}},Da.prototype.replaceToken=function(e,t,n){if(!isNaN(e)&&this.inboundIndex(e)&&t instanceof xa){var r=this.tokens.splice(e,1,t);return n||this.dispatch(`replaceToken`,[e,t]),[r[0],t]}return{FAIL:`replaceToken: invalid token or index.`}},Da.prototype.removeRange=function(e,t,n){t=isNaN(t)?this.tokens.length:t;var r=this.tokens.splice(e,t);return n||this.dispatch(`removeRange`,[r,e,t]),r},Da.prototype.removeToken=function(e,t){if(!isNaN(e)&&this.inboundIndex(e)){var n=this.tokens.splice(e,1);return t||this.dispatch(`removeToken`,[n,e]),n}return{FAIL:`removeToken: invalid token index.`}},Da.prototype.insertToken=function(e,t,n){return e.every(function(e){return e instanceof xa})?(this.tokens.splice.apply(this.tokens,[t,0].concat(e)),n||this.dispatch(`insertToken`,[e,t]),e):{FAIL:`insertToken: invalid token(s).`}},Da.prototype.registerModifier=function(e,t,n){this.events.newToken.subscribe(function(r,i){var a=[r,i],o=t===null||t.apply(this,a)===!0,s=[r,i];if(o){var c=n.apply(this,s);r.setState(e,c)}}),this.registeredModifiers.push(e)},Ta.prototype.subscribe=function(e){return typeof e==`function`?this.subscribers.push(e)-1:{FAIL:`invalid '`+this.eventId+`' event handler`}},Ta.prototype.unsubscribe=function(e){this.subscribers.splice(e,1)},wa.prototype.setCurrentIndex=function(e){this.index=e,this.current=this.context[e],this.backtrack=this.context.slice(0,e),this.lookahead=this.context.slice(e+1)},wa.prototype.get=function(e){switch(!0){case e===0:return this.current;case e<0&&Math.abs(e)<=this.backtrack.length:return this.backtrack.slice(e)[0];case e>0&&e<=this.lookahead.length:return this.lookahead[e-1];default:return null}},Da.prototype.rangeToText=function(e){if(e instanceof Sa)return this.getRangeTokens(e).map(function(e){return e.char}).join(``)},Da.prototype.getText=function(){return this.tokens.map(function(e){return e.char}).join(``)},Da.prototype.getContext=function(e){return this.registeredContexts[e]||null},Da.prototype.on=function(e,t){var n=this.events[e];return n?n.subscribe(t):null},Da.prototype.dispatch=function(e,t){var n=this,r=this.events[e];r instanceof Ta&&r.subscribers.forEach(function(e){e.apply(n,t||[])})},Da.prototype.registerContextChecker=function(e,t,n){if(this.getContext(e))return{FAIL:`context name '`+e+`' is already registered.`};if(typeof t!=`function`)return{FAIL:`missing context start check.`};if(typeof n!=`function`)return{FAIL:`missing context end check.`};var r=new Ca(e,t,n);return this.registeredContexts[e]=r,this.contextCheckers.push(r),r},Da.prototype.getRangeTokens=function(e){var t=e.startIndex+e.endOffset;return[].concat(this.tokens.slice(e.startIndex,t))},Da.prototype.getContextRanges=function(e){var t=this.getContext(e);return t?t.ranges:{FAIL:`context checker '`+e+`' is not registered.`}},Da.prototype.resetContextsRanges=function(){var e=this.registeredContexts;for(var t in e)if(e.hasOwnProperty(t)){var n=e[t];n.ranges=[]}},Da.prototype.updateContextsRanges=function(){this.resetContextsRanges();for(var e=this.tokens.map(function(e){return e.char}),t=0;t<e.length;t++){var n=new wa(e,t);this.runContextCheck(n)}this.dispatch(`updateContextsRanges`,[this.registeredContexts])},Da.prototype.setEndOffset=function(e,t){var n=this.getContext(t).openRange.startIndex,r=new Sa(n,e,t),i=this.getContext(t).ranges;return r.rangeId=t+`.`+i.length,i.push(r),this.getContext(t).openRange=null,r},Da.prototype.runContextCheck=function(e){var t=this,n=e.index;this.contextCheckers.forEach(function(r){var i=r.contextName,a=t.getContext(i).openRange;if(!a&&r.checkStart(e)&&(a=new Sa(n,null,i),t.getContext(i).openRange=a,t.dispatch(`contextStart`,[i,n])),a&&r.checkEnd(e)){var o=n-a.startIndex+1,s=t.setEndOffset(o,i);t.dispatch(`contextEnd`,[i,s])}})},Da.prototype.tokenize=function(e){this.tokens=[],this.resetContextsRanges();var t=Array.from(e);this.dispatch(`start`);for(var n=0;n<t.length;n++){var r=t[n],i=new wa(t,n);this.dispatch(`next`,[i]),this.runContextCheck(i);var a=new xa(r);this.tokens.push(a),this.dispatch(`newToken`,[a,i])}return this.dispatch(`end`,[this.tokens]),this.tokens};function Oa(e){return/[\u0600-\u065F\u066A-\u06D2\u06FA-\u06FF]/.test(e)}function ka(e){return/[\u0630\u0690\u0621\u0631\u0661\u0671\u0622\u0632\u0672\u0692\u06C2\u0623\u0673\u0693\u06C3\u0624\u0694\u06C4\u0625\u0675\u0695\u06C5\u06E5\u0676\u0696\u06C6\u0627\u0677\u0697\u06C7\u0648\u0688\u0698\u06C8\u0689\u0699\u06C9\u068A\u06CA\u066B\u068B\u06CB\u068C\u068D\u06CD\u06FD\u068E\u06EE\u06FE\u062F\u068F\u06CF\u06EF]/.test(e)}function Aa(e){return/[\u0600-\u0605\u060C-\u060E\u0610-\u061B\u061E\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/.test(e)}function ja(e){return/[A-z]/.test(e)}function Ma(e){return/\s/.test(e)}function Na(e){this.font=e,this.features={}}function Pa(e){this.id=e.id,this.tag=e.tag,this.substitution=e.substitution}function Fa(e,t){if(!e)return-1;switch(t.format){case 1:return t.glyphs.indexOf(e);case 2:for(var n=t.ranges,r=0;r<n.length;r++){var i=n[r];if(e>=i.start&&e<=i.end){var a=e-i.start;return i.index+a}}break;default:return-1}return-1}function Ia(e,t){return Fa(e,t.coverage)===-1?null:e+t.deltaGlyphId}function La(e,t){var n=Fa(e,t.coverage);return n===-1?null:t.substitute[n]}function Ra(e,t){for(var n=[],r=0;r<e.length;r++){var i=e[r],a=t.current;a=Array.isArray(a)?a[0]:a;var o=Fa(a,i);o!==-1&&n.push(o)}return n.length===e.length?n:-1}function za(e,t){var n=t.inputCoverage.length+t.lookaheadCoverage.length+t.backtrackCoverage.length;if(e.context.length<n)return[];var r=Ra(t.inputCoverage,e);if(r===-1)return[];var i=t.inputCoverage.length-1;if(e.lookahead.length<t.lookaheadCoverage.length)return[];for(var a=e.lookahead.slice(i);a.length&&Aa(a[0].char);)a.shift();var o=new wa(a,0),s=Ra(t.lookaheadCoverage,o),c=[].concat(e.backtrack);for(c.reverse();c.length&&Aa(c[0].char);)c.shift();if(c.length<t.backtrackCoverage.length)return[];var l=new wa(c,0),u=Ra(t.backtrackCoverage,l),d=r.length===t.inputCoverage.length&&s.length===t.lookaheadCoverage.length&&u.length===t.backtrackCoverage.length,f=[];if(d)for(var p=0;p<t.lookupRecords.length;p++)for(var m=t.lookupRecords[p].lookupListIndex,h=this.getLookupByIndex(m),g=0;g<h.subtables.length;g++){var _=h.subtables[g],v=this.getLookupMethod(h,_);if(this.getSubstitutionType(h,_)===`12`)for(var y=0;y<r.length;y++){var b=v(e.get(y));b&&f.push(b)}}return f}function Ba(e,t){var n=e.current,r=Fa(n,t.coverage);if(r===-1)return null;for(var i,a=t.ligatureSets[r],o=0;o<a.length;o++){i=a[o];for(var s=0;s<i.components.length&&e.lookahead[s]===i.components[s];s++)if(s===i.components.length-1)return i}return null}function Va(e,t){var n=Fa(e,t.coverage);return n===-1?null:t.sequences[n]}Na.prototype.getDefaultScriptFeaturesIndexes=function(){for(var e=this.font.tables.gsub.scripts,t=0;t<e.length;t++){var n=e[t];if(n.tag===`DFLT`)return n.script.defaultLangSys.featureIndexes}return[]},Na.prototype.getScriptFeaturesIndexes=function(e){if(!this.font.tables.gsub)return[];if(!e)return this.getDefaultScriptFeaturesIndexes();for(var t=this.font.tables.gsub.scripts,n=0;n<t.length;n++){var r=t[n];if(r.tag===e&&r.script.defaultLangSys)return r.script.defaultLangSys.featureIndexes;var i=r.langSysRecords;if(i)for(var a=0;a<i.length;a++){var o=i[a];if(o.tag===e)return o.langSys.featureIndexes}}return this.getDefaultScriptFeaturesIndexes()},Na.prototype.mapTagsToFeatures=function(e,t){for(var n={},r=0;r<e.length;r++){var i=e[r].tag;n[i]=e[r].feature}this.features[t].tags=n},Na.prototype.getScriptFeatures=function(e){var t=this.features[e];if(this.features.hasOwnProperty(e))return t;var n=this.getScriptFeaturesIndexes(e);if(!n)return null;var r=this.font.tables.gsub;return t=n.map(function(e){return r.features[e]}),this.features[e]=t,this.mapTagsToFeatures(t,e),t},Na.prototype.getSubstitutionType=function(e,t){return e.lookupType.toString()+t.substFormat.toString()},Na.prototype.getLookupMethod=function(e,t){var n=this;switch(this.getSubstitutionType(e,t)){case`11`:return function(e){return Ia.apply(n,[e,t])};case`12`:return function(e){return La.apply(n,[e,t])};case`63`:return function(e){return za.apply(n,[e,t])};case`41`:return function(e){return Ba.apply(n,[e,t])};case`21`:return function(e){return Va.apply(n,[e,t])};default:throw Error(`lookupType: `+e.lookupType+` - substFormat: `+t.substFormat+` is not yet supported`)}},Na.prototype.lookupFeature=function(e){var t=e.contextParams,n=t.index,r=this.getFeature({tag:e.tag,script:e.script});if(!r)return Error(`font '`+this.font.names.fullName.en+`' doesn't support feature '`+e.tag+`' for script '`+e.script+`'.`);for(var i=this.getFeatureLookups(r),a=[].concat(t.context),o=0;o<i.length;o++)for(var s=i[o],c=this.getLookupSubtables(s),l=0;l<c.length;l++){var u=c[l],d=this.getSubstitutionType(s,u),f=this.getLookupMethod(s,u),p=void 0;switch(d){case`11`:p=f(t.current),p&&a.splice(n,1,new Pa({id:11,tag:e.tag,substitution:p}));break;case`12`:p=f(t.current),p&&a.splice(n,1,new Pa({id:12,tag:e.tag,substitution:p}));break;case`63`:p=f(t),Array.isArray(p)&&p.length&&a.splice(n,1,new Pa({id:63,tag:e.tag,substitution:p}));break;case`41`:p=f(t),p&&a.splice(n,1,new Pa({id:41,tag:e.tag,substitution:p}));break;case`21`:p=f(t.current),p&&a.splice(n,1,new Pa({id:21,tag:e.tag,substitution:p}))}t=new wa(a,n),(!Array.isArray(p)||p.length)&&(p=null)}return a.length?a:null},Na.prototype.supports=function(e){if(!e.script)return!1;this.getScriptFeatures(e.script);var t=this.features.hasOwnProperty(e.script);if(!e.tag)return t;var n=this.features[e.script].some(function(t){return t.tag===e.tag});return t&&n},Na.prototype.getLookupSubtables=function(e){return e.subtables||null},Na.prototype.getLookupByIndex=function(e){return this.font.tables.gsub.lookups[e]||null},Na.prototype.getFeatureLookups=function(e){return e.lookupListIndexes.map(this.getLookupByIndex.bind(this))},Na.prototype.getFeature=function(e){if(!this.font)return{FAIL:`No font was found`};this.features.hasOwnProperty(e.script)||this.getScriptFeatures(e.script);var t=this.features[e.script];return t?t.tags[e.tag]?this.features[e.script].tags[e.tag]:null:{FAIL:`No feature for script `+e.script}};function Ha(e){var t=e.current,n=e.get(-1);return n===null&&Oa(t)||!Oa(n)&&Oa(t)}function Ua(e){var t=e.get(1);return t===null||!Oa(t)}var Wa={startCheck:Ha,endCheck:Ua};function Ga(e){var t=e.current,n=e.get(-1);return(Oa(t)||Aa(t))&&!Oa(n)}function Ka(e){var t=e.get(1);switch(!0){case t===null:return!0;case!Oa(t)&&!Aa(t):var n=Ma(t);if(!n)return!0;if(n){var r=!1;if(r=e.lookahead.some(function(e){return Oa(e)||Aa(e)}),!r)return!0}break;default:return!1}}var qa={startCheck:Ga,endCheck:Ka};function Ja(e,t,n){t[n].setState(e.tag,e.substitution)}function Ya(e,t,n){t[n].setState(e.tag,e.substitution)}function Xa(e,t,n){e.substitution.forEach(function(r,i){t[n+i].setState(e.tag,r)})}function Za(e,t,n){var r=t[n];r.setState(e.tag,e.substitution.ligGlyph);for(var i=e.substitution.components.length,a=0;a<i;a++)r=t[n+a+1],r.setState(`deleted`,!0)}var Qa={11:Ja,12:Ya,63:Xa,41:Za};function $a(e,t,n){e instanceof Pa&&Qa[e.id]&&Qa[e.id](e,t,n)}function eo(e){for(var t=[].concat(e.backtrack),n=t.length-1;n>=0;n--){var r=t[n],i=ka(r),a=Aa(r);if(!i&&!a)return!0;if(i)return!1}return!1}function to(e){if(ka(e.current))return!1;for(var t=0;t<e.lookahead.length;t++){var n=e.lookahead[t];if(!Aa(n))return!0}return!1}function no(e){var t=this,n=`arab`,r=this.featuresTags[n],i=this.tokenizer.getRangeTokens(e);if(i.length!==1){var a=new wa(i.map(function(e){return e.getState(`glyphIndex`)}),0),o=new wa(i.map(function(e){return e.char}),0);i.forEach(function(e,s){if(!Aa(e.char)){a.setCurrentIndex(s),o.setCurrentIndex(s);var c=0;eo(o)&&(c|=1),to(o)&&(c|=2);var l;switch(c){case 1:l=`fina`;break;case 2:l=`init`;break;case 3:l=`medi`}if(r.indexOf(l)!==-1){var u=t.query.lookupFeature({tag:l,script:n,contextParams:a});if(u instanceof Error)return console.info(u.message);u.forEach(function(e,t){e instanceof Pa&&($a(e,i,t),a.context[t]=e.substitution)})}}})}}function ro(e,t){return new wa(e.map(function(e){return e.activeState.value}),t||0)}function io(e){var t=this,n=`arab`,r=this.tokenizer.getRangeTokens(e),i=ro(r);i.context.forEach(function(e,a){i.setCurrentIndex(a);var o=t.query.lookupFeature({tag:`rlig`,script:n,contextParams:i});o.length&&(o.forEach(function(e){return $a(e,r,a)}),i=ro(r))})}function ao(e){var t=e.current,n=e.get(-1);return n===null&&ja(t)||!ja(n)&&ja(t)}function oo(e){var t=e.get(1);return t===null||!ja(t)}var so={startCheck:ao,endCheck:oo};function co(e,t){return new wa(e.map(function(e){return e.activeState.value}),t||0)}function lo(e){var t=this,n=`latn`,r=this.tokenizer.getRangeTokens(e),i=co(r);i.context.forEach(function(e,a){i.setCurrentIndex(a);var o=t.query.lookupFeature({tag:`liga`,script:n,contextParams:i});o.length&&(o.forEach(function(e){return $a(e,r,a)}),i=co(r))})}function uo(e){this.baseDir=e||`ltr`,this.tokenizer=new Da,this.featuresTags={}}uo.prototype.setText=function(e){this.text=e},uo.prototype.contextChecks={latinWordCheck:so,arabicWordCheck:Wa,arabicSentenceCheck:qa};function fo(e){var t=this.contextChecks[e+`Check`];return this.tokenizer.registerContextChecker(e,t.startCheck,t.endCheck)}function po(){return fo.call(this,`latinWord`),fo.call(this,`arabicWord`),fo.call(this,`arabicSentence`),this.tokenizer.tokenize(this.text)}function mo(){var e=this;this.tokenizer.getContextRanges(`arabicSentence`).forEach(function(t){var n=e.tokenizer.getRangeTokens(t);e.tokenizer.replaceRange(t.startIndex,t.endOffset,n.reverse())})}uo.prototype.registerFeatures=function(e,t){var n=this,r=t.filter(function(t){return n.query.supports({script:e,tag:t})});this.featuresTags.hasOwnProperty(e)?this.featuresTags[e]=this.featuresTags[e].concat(r):this.featuresTags[e]=r},uo.prototype.applyFeatures=function(e,t){if(!e)throw Error(`No valid font was provided to apply features`);this.query||=new Na(e);for(var n=0;n<t.length;n++){var r=t[n];this.query.supports({script:r.script})&&this.registerFeatures(r.script,r.tags)}},uo.prototype.registerModifier=function(e,t,n){this.tokenizer.registerModifier(e,t,n)};function ho(){if(this.tokenizer.registeredModifiers.indexOf(`glyphIndex`)===-1)throw Error(`glyphIndex modifier is required to apply arabic presentation features.`)}function go(){var e=this;this.featuresTags.hasOwnProperty(`arab`)&&(ho.call(this),this.tokenizer.getContextRanges(`arabicWord`).forEach(function(t){no.call(e,t)}))}function _o(){var e=this,t=`arab`;this.featuresTags.hasOwnProperty(t)&&this.featuresTags[t].indexOf(`rlig`)!==-1&&(ho.call(this),this.tokenizer.getContextRanges(`arabicWord`).forEach(function(t){io.call(e,t)}))}function vo(){var e=this,t=`latn`;this.featuresTags.hasOwnProperty(t)&&this.featuresTags[t].indexOf(`liga`)!==-1&&(ho.call(this),this.tokenizer.getContextRanges(`latinWord`).forEach(function(t){lo.call(e,t)}))}uo.prototype.checkContextReady=function(e){return!!this.tokenizer.getContext(e)},uo.prototype.applyFeaturesToContexts=function(){this.checkContextReady(`arabicWord`)&&(go.call(this),_o.call(this)),this.checkContextReady(`latinWord`)&&vo.call(this),this.checkContextReady(`arabicSentence`)&&mo.call(this)},uo.prototype.processText=function(e){(!this.text||this.text!==e)&&(this.setText(e),po.call(this),this.applyFeaturesToContexts())},uo.prototype.getBidiText=function(e){return this.processText(e),this.tokenizer.getText()},uo.prototype.getTextGlyphs=function(e){this.processText(e);for(var t=[],n=0;n<this.tokenizer.tokens.length;n++){var r=this.tokenizer.tokens[n];if(!r.state.deleted){var i=r.activeState.value;t.push(Array.isArray(i)?i[0]:i)}}return t};function yo(e){e||={},e.tables=e.tables||{},e.empty||(Qn(e.familyName,`When creating a new Font object, familyName is required.`),Qn(e.styleName,`When creating a new Font object, styleName is required.`),Qn(e.unitsPerEm,`When creating a new Font object, unitsPerEm is required.`),Qn(e.ascender,`When creating a new Font object, ascender is required.`),Qn(e.descender<=0,`When creating a new Font object, negative descender value is required.`),this.names={fontFamily:{en:e.familyName||` `},fontSubfamily:{en:e.styleName||` `},fullName:{en:e.fullName||e.familyName+` `+e.styleName},postScriptName:{en:e.postScriptName||(e.familyName+e.styleName).replace(/\s/g,``)},designer:{en:e.designer||` `},designerURL:{en:e.designerURL||` `},manufacturer:{en:e.manufacturer||` `},manufacturerURL:{en:e.manufacturerURL||` `},license:{en:e.license||` `},licenseURL:{en:e.licenseURL||` `},version:{en:e.version||`Version 0.1`},description:{en:e.description||` `},copyright:{en:e.copyright||` `},trademark:{en:e.trademark||` `}},this.unitsPerEm=e.unitsPerEm||1e3,this.ascender=e.ascender,this.descender=e.descender,this.createdTimestamp=e.createdTimestamp,this.tables=Object.assign(e.tables,{os2:Object.assign({usWeightClass:e.weightClass||this.usWeightClasses.MEDIUM,usWidthClass:e.widthClass||this.usWidthClasses.MEDIUM,fsSelection:e.fsSelection||this.fsSelectionValues.REGULAR},e.tables.os2)})),this.supported=!0,this.glyphs=new $e.GlyphSet(this,e.glyphs||[]),this.encoding=new Le(this),this.position=new Gn(this),this.substitution=new Kn(this),this.tables=this.tables||{},this._push=null,this._hmtxTableData={},Object.defineProperty(this,"hinting",{get:function(){if(this._hinting)return this._hinting;if(this.outlinesFormat===`truetype`)return this._hinting=new pr(this)}})}yo.prototype.hasChar=function(e){return this.encoding.charToGlyphIndex(e)!==null},yo.prototype.charToGlyphIndex=function(e){return this.encoding.charToGlyphIndex(e)},yo.prototype.charToGlyph=function(e){var t=this.charToGlyphIndex(e),n=this.glyphs.get(t);return n||=this.glyphs.get(0),n},yo.prototype.updateFeatures=function(e){return this.defaultRenderOptions.features.map(function(t){return t.script===`latn`?{script:`latn`,tags:t.tags.filter(function(t){return e[t]})}:t})},yo.prototype.stringToGlyphs=function(e,t){var n=this,r=new uo;r.registerModifier(`glyphIndex`,null,function(e){return n.charToGlyphIndex(e.char)});var i=t?this.updateFeatures(t.features):this.defaultRenderOptions.features;r.applyFeatures(this,i);for(var a=r.getTextGlyphs(e),o=a.length,s=Array(o),c=this.glyphs.get(0),l=0;l<o;l+=1)s[l]=this.glyphs.get(a[l])||c;return s},yo.prototype.nameToGlyphIndex=function(e){return this.glyphNames.nameToGlyphIndex(e)},yo.prototype.nameToGlyph=function(e){var t=this.nameToGlyphIndex(e),n=this.glyphs.get(t);return n||=this.glyphs.get(0),n},yo.prototype.glyphIndexToName=function(e){return this.glyphNames.glyphIndexToName?this.glyphNames.glyphIndexToName(e):``},yo.prototype.getKerningValue=function(e,t){e=e.index||e,t=t.index||t;var n=this.position.defaultKerningTables;return n?this.position.getKerningValue(n,e,t):this.kerningPairs[e+`,`+t]||0},yo.prototype.defaultRenderOptions={kerning:!0,features:[{script:`arab`,tags:[`init`,`medi`,`fina`,`rlig`]},{script:`latn`,tags:[`liga`,`rlig`]}]},yo.prototype.forEachGlyph=function(e,t,n,r,i,a){t=t===void 0?0:t,n=n===void 0?0:n,r=r===void 0?72:r,i=Object.assign({},this.defaultRenderOptions,i);var o=1/this.unitsPerEm*r,s=this.stringToGlyphs(e,i),c;if(i.kerning){var l=i.script||this.position.getDefaultScriptName();c=this.position.getKerningTables(l,i.language)}for(var u=0;u<s.length;u+=1){var d=s[u];if(a.call(this,d,t,n,r,i),d.advanceWidth&&(t+=d.advanceWidth*o),i.kerning&&u<s.length-1){var f=c?this.position.getKerningValue(c,d.index,s[u+1].index):this.getKerningValue(d,s[u+1]);t+=f*o}i.letterSpacing?t+=i.letterSpacing*r:i.tracking&&(t+=i.tracking/1e3*r)}return t},yo.prototype.getPath=function(e,t,n,r,i){var a=new k;return this.forEachGlyph(e,t,n,r,i,function(e,t,n,r){var o=e.getPath(t,n,r,i,this);a.extend(o)}),a},yo.prototype.getPaths=function(e,t,n,r,i){var a=[];return this.forEachGlyph(e,t,n,r,i,function(e,t,n,r){var o=e.getPath(t,n,r,i,this);a.push(o)}),a},yo.prototype.getAdvanceWidth=function(e,t,n){return this.forEachGlyph(e,0,0,t,n,function(){})},yo.prototype.draw=function(e,t,n,r,i,a){this.getPath(t,n,r,i,a).draw(e)},yo.prototype.drawPoints=function(e,t,n,r,i,a){this.forEachGlyph(t,n,r,i,a,function(t,n,r,i){t.drawPoints(e,n,r,i)})},yo.prototype.drawMetrics=function(e,t,n,r,i,a){this.forEachGlyph(t,n,r,i,a,function(t,n,r,i){t.drawMetrics(e,n,r,i)})},yo.prototype.getEnglishName=function(e){var t=this.names[e];if(t)return t.en},yo.prototype.validate=function(){var e=this;function t(t){var n=e.getEnglishName(t);n&&n.trim().length}t(`fontFamily`),t(`weightName`),t(`manufacturer`),t(`copyright`),t(`version`),this.unitsPerEm},yo.prototype.toTables=function(){return Bn.fontToTable(this)},yo.prototype.toBuffer=function(){return console.warn(`Font.toBuffer is deprecated. Use Font.toArrayBuffer instead.`),this.toArrayBuffer()},yo.prototype.toArrayBuffer=function(){for(var e=this.toTables().encode(),t=new ArrayBuffer(e.length),n=new Uint8Array(t),r=0;r<e.length;r++)n[r]=e[r];return t},yo.prototype.download=function(e){var n=this.getEnglishName(`fontFamily`),r=this.getEnglishName(`fontSubfamily`);e||=n.replace(/\s/g,``)+`-`+r+`.otf`;var i=this.toArrayBuffer();if(Yn()){if(window.URL=window.URL||window.webkitURL,window.URL){var a=new DataView(i),o=new Blob([a],{type:`font/opentype`}),s=document.createElement(`a`);s.href=window.URL.createObjectURL(o),s.download=e;var c=document.createEvent(`MouseEvents`);c.initEvent(`click`,!0,!1),s.dispatchEvent(c)}else console.warn(`Font file could not be downloaded. Try using a different browser.`)}else{var l=t(),u=Zn(i);l.writeFileSync(e,u)}},yo.prototype.fsSelectionValues={ITALIC:1,UNDERSCORE:2,NEGATIVE:4,OUTLINED:8,STRIKEOUT:16,BOLD:32,REGULAR:64,USER_TYPO_METRICS:128,WWS:256,OBLIQUE:512},yo.prototype.usWidthClasses={ULTRA_CONDENSED:1,EXTRA_CONDENSED:2,CONDENSED:3,SEMI_CONDENSED:4,MEDIUM:5,SEMI_EXPANDED:6,EXPANDED:7,EXTRA_EXPANDED:8,ULTRA_EXPANDED:9},yo.prototype.usWeightClasses={THIN:100,EXTRA_LIGHT:200,LIGHT:300,NORMAL:400,MEDIUM:500,SEMI_BOLD:600,BOLD:700,EXTRA_BOLD:800,BLACK:900};function bo(e,t){var n=JSON.stringify(e),r=256;for(var i in t){var a=parseInt(i);if(!(!a||a<256)){if(JSON.stringify(t[i])===n)return a;r<=a&&(r=a+1)}}return t[r]=e,r}function xo(e,t,n){var r=bo(t.name,n);return[{name:`tag_`+e,type:`TAG`,value:t.tag},{name:`minValue_`+e,type:`FIXED`,value:t.minValue<<16},{name:`defaultValue_`+e,type:`FIXED`,value:t.defaultValue<<16},{name:`maxValue_`+e,type:`FIXED`,value:t.maxValue<<16},{name:`flags_`+e,type:`USHORT`,value:0},{name:`nameID_`+e,type:`USHORT`,value:r}]}function So(e,t,n){var r={},i=new U.Parser(e,t);return r.tag=i.parseTag(),r.minValue=i.parseFixed(),r.defaultValue=i.parseFixed(),r.maxValue=i.parseFixed(),i.skip(`uShort`,1),r.name=n[i.parseUShort()]||{},r}function Co(e,t,n,r){for(var i=bo(t.name,r),a=[{name:`nameID_`+e,type:`USHORT`,value:i},{name:`flags_`+e,type:`USHORT`,value:0}],o=0;o<n.length;++o){var s=n[o].tag;a.push({name:`axis_`+e+` `+s,type:`FIXED`,value:t.coordinates[s]<<16})}return a}function wo(e,t,n,r){var i={},a=new U.Parser(e,t);i.name=r[a.parseUShort()]||{},a.skip(`uShort`,1),i.coordinates={};for(var o=0;o<n.length;++o)i.coordinates[n[o].tag]=a.parseFixed();return i}function To(e,t){var n=new R.Table(`fvar`,[{name:`version`,type:`ULONG`,value:65536},{name:`offsetToData`,type:`USHORT`,value:0},{name:`countSizePairs`,type:`USHORT`,value:2},{name:`axisCount`,type:`USHORT`,value:e.axes.length},{name:`axisSize`,type:`USHORT`,value:20},{name:`instanceCount`,type:`USHORT`,value:e.instances.length},{name:`instanceSize`,type:`USHORT`,value:4+e.axes.length*4}]);n.offsetToData=n.sizeOf();for(var r=0;r<e.axes.length;r++)n.fields=n.fields.concat(xo(r,e.axes[r],t));for(var i=0;i<e.instances.length;i++)n.fields=n.fields.concat(Co(i,e.instances[i],e.axes,t));return n}function Eo(e,t,n){var r=new U.Parser(e,t),i=r.parseULong();M.argument(i===65536,`Unsupported fvar table version.`);var a=r.parseOffset16();r.skip(`uShort`,1);for(var o=r.parseUShort(),s=r.parseUShort(),c=r.parseUShort(),l=r.parseUShort(),u=[],d=0;d<o;d++)u.push(So(e,t+a+d*s,n));for(var f=[],p=t+a+o*s,m=0;m<c;m++)f.push(wo(e,p+m*l,u,n));return{axes:u,instances:f}}var Do={make:To,parse:Eo},Oo=function(){return{coverage:this.parsePointer(H.coverage),attachPoints:this.parseList(H.pointer(H.uShortList))}},ko=function(){var e=this.parseUShort();if(M.argument(e===1||e===2||e===3,`Unsupported CaretValue table version.`),e===1)return{coordinate:this.parseShort()};if(e===2)return{pointindex:this.parseShort()};if(e===3)return{coordinate:this.parseShort()}},Ao=function(){return this.parseList(H.pointer(ko))},jo=function(){return{coverage:this.parsePointer(H.coverage),ligGlyphs:this.parseList(H.pointer(Ao))}},Mo=function(){return this.parseUShort(),this.parseList(H.pointer(H.coverage))};function No(e,t){t||=0;var n=new H(e,t),r=n.parseVersion(1);M.argument(r===1||r===1.2||r===1.3,`Unsupported GDEF table version.`);var i={version:r,classDef:n.parsePointer(H.classDef),attachList:n.parsePointer(Oo),ligCaretList:n.parsePointer(jo),markAttachClassDef:n.parsePointer(H.classDef)};return r>=1.2&&(i.markGlyphSets=n.parsePointer(Mo)),i}var Po={parse:No},Fo=Array(10);Fo[1]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();if(t===1)return{posFormat:1,coverage:this.parsePointer(H.coverage),value:this.parseValueRecord()};if(t===2)return{posFormat:2,coverage:this.parsePointer(H.coverage),values:this.parseValueRecordList()};M.assert(!1,`0x`+e.toString(16)+`: GPOS lookup type 1 format must be 1 or 2.`)},Fo[2]=function(){var e=this.offset+this.relativeOffset,t=this.parseUShort();M.assert(t===1||t===2,`0x`+e.toString(16)+`: GPOS lookup type 2 format must be 1 or 2.`);var n=this.parsePointer(H.coverage),r=this.parseUShort(),i=this.parseUShort();if(t===1)return{posFormat:t,coverage:n,valueFormat1:r,valueFormat2:i,pairSets:this.parseList(H.pointer(H.list(function(){return{secondGlyph:this.parseUShort(),value1:this.parseValueRecord(r),value2:this.parseValueRecord(i)}})))};if(t===2){var a=this.parsePointer(H.classDef),o=this.parsePointer(H.classDef),s=this.parseUShort(),c=this.parseUShort();return{posFormat:t,coverage:n,valueFormat1:r,valueFormat2:i,classDef1:a,classDef2:o,class1Count:s,class2Count:c,classRecords:this.parseList(s,H.list(c,function(){return{value1:this.parseValueRecord(r),value2:this.parseValueRecord(i)}}))}}},Fo[3]=function(){return{error:`GPOS Lookup 3 not supported`}},Fo[4]=function(){return{error:`GPOS Lookup 4 not supported`}},Fo[5]=function(){return{error:`GPOS Lookup 5 not supported`}},Fo[6]=function(){return{error:`GPOS Lookup 6 not supported`}},Fo[7]=function(){return{error:`GPOS Lookup 7 not supported`}},Fo[8]=function(){return{error:`GPOS Lookup 8 not supported`}},Fo[9]=function(){return{error:`GPOS Lookup 9 not supported`}};function Io(e,t){t||=0;var n=new H(e,t),r=n.parseVersion(1);return M.argument(r===1||r===1.1,`Unsupported GPOS table version `+r),r===1?{version:r,scripts:n.parseScriptList(),features:n.parseFeatureList(),lookups:n.parseLookupList(Fo)}:{version:r,scripts:n.parseScriptList(),features:n.parseFeatureList(),lookups:n.parseLookupList(Fo),variations:n.parseFeatureVariationsList()}}var Lo=Array(10);function Ro(e){return new R.Table(`GPOS`,[{name:`version`,type:`ULONG`,value:65536},{name:`scripts`,type:`TABLE`,value:new R.ScriptList(e.scripts)},{name:`features`,type:`TABLE`,value:new R.FeatureList(e.features)},{name:`lookups`,type:`TABLE`,value:new R.LookupList(e.lookups,Lo)}])}var zo={parse:Io,make:Ro};function Bo(e){var t={};e.skip(`uShort`);var n=e.parseUShort();M.argument(n===0,`Unsupported kern sub-table version.`),e.skip(`uShort`,2);var r=e.parseUShort();e.skip(`uShort`,3);for(var i=0;i<r;i+=1){var a=e.parseUShort(),o=e.parseUShort(),s=e.parseShort();t[a+`,`+o]=s}return t}function Vo(e){var t={};e.skip(`uShort`),e.parseULong()>1&&console.warn(`Only the first kern subtable is supported.`),e.skip(`uLong`);var n=e.parseUShort()&255;if(e.skip(`uShort`),n===0){var r=e.parseUShort();e.skip(`uShort`,3);for(var i=0;i<r;i+=1){var a=e.parseUShort(),o=e.parseUShort(),s=e.parseShort();t[a+`,`+o]=s}}return t}function Ho(e,t){var n=new U.Parser(e,t),r=n.parseUShort();if(r===0)return Bo(n);if(r===1)return Vo(n);throw Error(`Unsupported kern table version (`+r+`).`)}var Uo={parse:Ho};function Wo(e,t,n,r){for(var i=new U.Parser(e,t),a=r?i.parseUShort:i.parseULong,o=[],s=0;s<n+1;s+=1){var c=a.call(i);r&&(c*=2),o.push(c)}return o}var Go={parse:Wo};function Ko(e,n){t().readFile(e,function(e,t){if(e)return n(e.message);n(null,Xn(t))})}function qo(e,t){var n=new XMLHttpRequest;n.open(`get`,e,!0),n.responseType=`arraybuffer`,n.onload=function(){return n.response?t(null,n.response):t(`Font could not be loaded: `+n.statusText)},n.onerror=function(){t(`Font could not be loaded`)},n.send()}function Jo(e,t){for(var n=[],r=12,i=0;i<t;i+=1){var a=U.getTag(e,r),o=U.getULong(e,r+4),s=U.getULong(e,r+8),c=U.getULong(e,r+12);n.push({tag:a,checksum:o,offset:s,length:c,compression:!1}),r+=16}return n}function Yo(e,t){for(var n=[],r=44,i=0;i<t;i+=1){var a=U.getTag(e,r),o=U.getULong(e,r+4),s=U.getULong(e,r+8),c=U.getULong(e,r+12),l=void 0;l=s<c&&`WOFF`,n.push({tag:a,offset:o,compression:l,compressedLength:s,length:c}),r+=20}return n}function Xo(e,t){if(t.compression===`WOFF`){var n=new Uint8Array(e.buffer,t.offset+2,t.compressedLength-2),r=new Uint8Array(t.length);if(E(n,r),r.byteLength!==t.length)throw Error(`Decompression error: `+t.tag+` decompressed length doesn't match recorded length`);return{data:new DataView(r.buffer,0),offset:0}}return{data:e,offset:t.offset}}function Zo(e,t){t??={};var n,r,i=new yo({empty:!0}),a=new DataView(e,0),o,s=[],c=U.getTag(a,0);if(c===`\0\0\0`||c===`true`||c===`typ1`)i.outlinesFormat=`truetype`,o=U.getUShort(a,4),s=Jo(a,o);else if(c===`OTTO`)i.outlinesFormat=`cff`,o=U.getUShort(a,4),s=Jo(a,o);else if(c===`wOFF`){var l=U.getTag(a,4);if(l===`\0\0\0`)i.outlinesFormat=`truetype`;else if(l===`OTTO`)i.outlinesFormat=`cff`;else throw Error(`Unsupported OpenType flavor `+c);o=U.getUShort(a,12),s=Yo(a,o)}else throw Error(`Unsupported OpenType signature `+c);for(var u,d,f,p,m,h,g,_,v,y,b,x,S=0;S<o;S+=1){var C=s[S],w=void 0;switch(C.tag){case`cmap`:w=Xo(a,C),i.tables.cmap=Me.parse(w.data,w.offset),i.encoding=new Re(i.tables.cmap);break;case`cvt `:w=Xo(a,C),x=new U.Parser(w.data,w.offset),i.tables.cvt=x.parseShortList(C.length/2);break;case`fvar`:d=C;break;case`fpgm`:w=Xo(a,C),x=new U.Parser(w.data,w.offset),i.tables.fpgm=x.parseByteList(C.length);break;case`head`:w=Xo(a,C),i.tables.head=Rt.parse(w.data,w.offset),i.unitsPerEm=i.tables.head.unitsPerEm,n=i.tables.head.indexToLocFormat;break;case`hhea`:w=Xo(a,C),i.tables.hhea=Vt.parse(w.data,w.offset),i.ascender=i.tables.hhea.ascender,i.descender=i.tables.hhea.descender,i.numberOfHMetrics=i.tables.hhea.numberOfHMetrics;break;case`hmtx`:g=C;break;case`ltag`:w=Xo(a,C),r=Yt.parse(w.data,w.offset);break;case`maxp`:w=Xo(a,C),i.tables.maxp=Qt.parse(w.data,w.offset),i.numGlyphs=i.tables.maxp.numGlyphs;break;case`name`:y=C;break;case`OS/2`:w=Xo(a,C),i.tables.os2=bn.parse(w.data,w.offset);break;case`post`:w=Xo(a,C),i.tables.post=Cn.parse(w.data,w.offset),i.glyphNames=new Be(i.tables.post);break;case`prep`:w=Xo(a,C),x=new U.Parser(w.data,w.offset),i.tables.prep=x.parseByteList(C.length);break;case`glyf`:f=C;break;case`loca`:v=C;break;case`CFF `:u=C;break;case`kern`:_=C;break;case`GDEF`:p=C;break;case`GPOS`:m=C;break;case`GSUB`:h=C;break;case`meta`:b=C}}var T=Xo(a,y);if(i.tables.name=hn.parse(T.data,T.offset,r),i.names=i.tables.name,f&&v){var E=n===0,D=Xo(a,v),O=Go.parse(D.data,D.offset,i.numGlyphs,E),k=Xo(a,f);i.glyphs=cr.parse(k.data,k.offset,O,i,t)}else if(u){var A=Xo(a,u);Ft.parse(A.data,A.offset,i,t)}else throw Error(`Font doesn't contain TrueType or CFF outlines.`);var j=Xo(a,g);if(Kt.parse(i,j.data,j.offset,i.numberOfHMetrics,i.numGlyphs,i.glyphs,t),Ue(i,t),_){var M=Xo(a,_);i.kerningPairs=Uo.parse(M.data,M.offset)}else i.kerningPairs={};if(p){var N=Xo(a,p);i.tables.gdef=Po.parse(N.data,N.offset)}if(m){var P=Xo(a,m);i.tables.gpos=zo.parse(P.data,P.offset),i.position.init()}if(h){var ee=Xo(a,h);i.tables.gsub=kn.parse(ee.data,ee.offset)}if(d){var F=Xo(a,d);i.tables.fvar=Do.parse(F.data,F.offset,i.names)}if(b){var I=Xo(a,b);i.tables.meta=Mn.parse(I.data,I.offset),i.metas=i.tables.meta}return i}function Qo(e,t,n){n??={};var r=typeof window>`u`&&!n.isUrl?Ko:qo;return new Promise(function(i,a){r(e,function(e,r){if(e){if(t)return t(e);a(e)}var o;try{o=Zo(r,n)}catch(e){if(t)return t(e,null);a(e)}if(t)return t(null,o);i(o)})})}function $o(e,n){return Zo(Xn(t().readFileSync(e)),n)}var es=Object.freeze({__proto__:null,Font:yo,Glyph:qe,Path:k,BoundingBox:O,_parse:U,parse:Zo,load:Qo,loadSync:$o}),ts=1e3,ns=1001,rs=1002,is=1003,as=1004,os=1005,ss=1006,cs=1007,ls=1008,us=1009,ds=1010,fs=1011,ps=1012,ms=1013,hs=1014,gs=1015,_s=1016,vs=1017,ys=1018,bs=1020,xs=35902,Ss=35899,Cs=1021,ws=1022,Ts=1023,Es=1026,Ds=1027,Os=1028,ks=1029,As=1030,js=1031,Ms=1033,Ns=33776,Ps=33777,Fs=33778,Is=33779,Ls=35840,Rs=35841,zs=35842,Bs=35843,Vs=36196,Hs=37492,Us=37496,Ws=37488,Gs=37489,Ks=37490,qs=37491,Js=37808,Ys=37809,Xs=37810,Zs=37811,Qs=37812,$s=37813,ec=37814,tc=37815,nc=37816,rc=37817,ic=37818,ac=37819,oc=37820,sc=37821,cc=36492,lc=36494,uc=36495,dc=36283,fc=36284,pc=36285,mc=36286,hc=2300,gc=2301,_c=2302,vc=2303,yc=2400,bc=2401,xc=2402,Sc=3200,Cc=`srgb`,wc=`srgb-linear`,Tc=`linear`,Ec=`srgb`,Dc=7680,Oc=35044,kc=35048,Ac=2e3;function jc(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Mc(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Nc(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Pc(){let e=Nc(`canvas`);return e.style.display=`block`,e}var Fc={};function Ic(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Lc(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function G(...e){e=Lc(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function K(...e){e=Lc(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Rc(...e){let t=e.join(` `);t in Fc||(Fc[t]=!0,G(...e))}function zc(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Bc={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},Vc=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Hc=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Uc=1234567,Wc=Math.PI/180,Gc=180/Math.PI;function Kc(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Hc[e&255]+Hc[e>>8&255]+Hc[e>>16&255]+Hc[e>>24&255]+`-`+Hc[t&255]+Hc[t>>8&255]+`-`+Hc[t>>16&15|64]+Hc[t>>24&255]+`-`+Hc[n&63|128]+Hc[n>>8&255]+`-`+Hc[n>>16&255]+Hc[n>>24&255]+Hc[r&255]+Hc[r>>8&255]+Hc[r>>16&255]+Hc[r>>24&255]).toLowerCase()}function qc(e,t,n){return Math.max(t,Math.min(n,e))}function Jc(e,t){return(e%t+t)%t}function Yc(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function Xc(e,t,n){return e===t?0:(n-e)/(t-e)}function Zc(e,t,n){return(1-n)*e+n*t}function Qc(e,t,n,r){return Zc(e,t,1-Math.exp(-n*r))}function $c(e,t=1){return t-Math.abs(Jc(e,t*2)-t)}function el(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function tl(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function nl(e,t){return e+Math.floor(Math.random()*(t-e+1))}function rl(e,t){return e+Math.random()*(t-e)}function il(e){return e*(.5-Math.random())}function al(e){e!==void 0&&(Uc=e);let t=Uc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function ol(e){return e*Wc}function sl(e){return e*Gc}function cl(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function ll(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function ul(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function dl(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:G(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function fl(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function pl(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var ml={DEG2RAD:Wc,RAD2DEG:Gc,generateUUID:Kc,clamp:qc,euclideanModulo:Jc,mapLinear:Yc,inverseLerp:Xc,lerp:Zc,damp:Qc,pingpong:$c,smoothstep:el,smootherstep:tl,randInt:nl,randFloat:rl,randFloatSpread:il,seededRandom:al,degToRad:ol,radToDeg:sl,isPowerOfTwo:cl,ceilPowerOfTwo:ll,floorPowerOfTwo:ul,setQuaternionFromProperEuler:dl,normalize:pl,denormalize:fl},q=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=qc(this.x,e.x,t.x),this.y=qc(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=qc(this.x,e,t),this.y=qc(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(qc(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(qc(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},hl=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:G(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(qc(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},J=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(_l.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(_l.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=qc(this.x,e.x,t.x),this.y=qc(this.y,e.y,t.y),this.z=qc(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=qc(this.x,e,t),this.y=qc(this.y,e,t),this.z=qc(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(qc(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return gl.copy(this).projectOnVector(e),this.sub(gl)}reflect(e){return this.sub(gl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(qc(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},gl=new J,_l=new hl,Y=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return Rc(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(vl.makeScale(e,t)),this}rotate(e){return Rc(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(vl.makeRotation(-e)),this}translate(e,t){return Rc(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(vl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},vl=new Y,yl=new Y().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),bl=new Y().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function xl(){let e={enabled:!0,workingColorSpace:wc,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=Cl(e.r),e.g=Cl(e.g),e.b=Cl(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=wl(e.r),e.g=wl(e.g),e.b=wl(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Tc:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Rc(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Rc(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[wc]:{primaries:t,whitePoint:r,transfer:Tc,toXYZ:yl,fromXYZ:bl,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Cc},outputColorSpaceConfig:{drawingBufferColorSpace:Cc}},[Cc]:{primaries:t,whitePoint:r,transfer:Ec,toXYZ:yl,fromXYZ:bl,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Cc}}}),e}var Sl=xl();function Cl(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function wl(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Tl,El=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Tl===void 0&&(Tl=Nc(`canvas`)),Tl.width=e.width,Tl.height=e.height;let t=Tl.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Tl}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Nc(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Cl(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Cl(t[e]/255)*255):t[e]=Cl(t[e]);return{data:t,width:e.width,height:e.height}}return G(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Dl=0,Ol=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Dl++}),this.uuid=Kc(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(kl(r[t].image)):e.push(kl(r[t]))}else e=kl(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function kl(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?El.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(G(`Texture: Unable to serialize Texture.`),{})}var Al=0,jl=new J,Ml=class e extends Vc{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=ns,i=ns,a=ss,o=ls,s=Ts,c=us,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Al++}),this.uuid=Kc(),this.name=``,this.source=new Ol(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new q(0,0),this.repeat=new q(1,1),this.center=new q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Y,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(jl).x}get height(){return this.source.getSize(jl).y}get depth(){return this.source.getSize(jl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){G(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){G(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ts:e.x-=Math.floor(e.x);break;case ns:e.x=e.x<0?0:1;break;case rs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case ts:e.y-=Math.floor(e.y);break;case ns:e.y=e.y<0?0:1;break;case rs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ml.DEFAULT_IMAGE=null,Ml.DEFAULT_MAPPING=300,Ml.DEFAULT_ANISOTROPY=1;var Nl=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=qc(this.x,e.x,t.x),this.y=qc(this.y,e.y,t.y),this.z=qc(this.z,e.z,t.z),this.w=qc(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=qc(this.x,e,t),this.y=qc(this.y,e,t),this.z=qc(this.z,e,t),this.w=qc(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(qc(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Pl=class extends Vc{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ss,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Nl(0,0,e,t),this.scissorTest=!1,this.viewport=new Nl(0,0,e,t),this.textures=[];let r=new Ml({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:ss,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Ol(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Fl=class extends Pl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Il=class extends Ml{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=is,this.minFilter=is,this.wrapR=ns,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Ll=class extends Ml{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=is,this.minFilter=is,this.wrapR=ns,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Rl=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/zl.setFromMatrixColumn(e,0).length(),i=1/zl.setFromMatrixColumn(e,1).length(),a=1/zl.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Vl,e,Hl)}lookAt(e,t,n){let r=this.elements;return Gl.subVectors(e,t),Gl.lengthSq()===0&&(Gl.z=1),Gl.normalize(),Ul.crossVectors(n,Gl),Ul.lengthSq()===0&&(Math.abs(n.z)===1?Gl.x+=1e-4:Gl.z+=1e-4,Gl.normalize(),Ul.crossVectors(n,Gl)),Ul.normalize(),Wl.crossVectors(Gl,Ul),r[0]=Ul.x,r[4]=Wl.x,r[8]=Gl.x,r[1]=Ul.y,r[5]=Wl.y,r[9]=Gl.y,r[2]=Ul.z,r[6]=Wl.z,r[10]=Gl.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],P=r[7],ee=r[11],F=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*P,i[8]=a*C+o*D+s*j+c*ee,i[12]=a*w+o*O+s*M+c*F,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*P,i[9]=l*C+u*D+d*j+f*ee,i[13]=l*w+u*O+d*M+f*F,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*P,i[10]=p*C+m*D+h*j+g*ee,i[14]=p*w+m*O+h*M+g*F,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*P,i[11]=_*C+v*D+y*j+b*ee,i[15]=_*w+v*O+y*M+b*F,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=zl.set(r[0],r[1],r[2]).length(),o=zl.set(r[4],r[5],r[6]).length(),s=zl.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Bl.copy(this);let c=1/a,l=1/o,u=1/s;return Bl.elements[0]*=c,Bl.elements[1]*=c,Bl.elements[2]*=c,Bl.elements[4]*=l,Bl.elements[5]*=l,Bl.elements[6]*=l,Bl.elements[8]*=u,Bl.elements[9]*=u,Bl.elements[10]*=u,t.setFromRotationMatrix(Bl),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Ac,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Ac,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},zl=new J,Bl=new Rl,Vl=new J(0,0,0),Hl=new J(1,1,1),Ul=new J,Wl=new J,Gl=new J,Kl=new Rl,ql=new hl,Jl=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(qc(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-qc(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(qc(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-qc(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(qc(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-qc(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:G(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Kl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Kl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ql.setFromEuler(this),this.setFromQuaternion(ql,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Jl.DEFAULT_ORDER=`XYZ`;var Yl=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},Xl=0,Zl=new J,Ql=new hl,$l=new Rl,eu=new J,tu=new J,nu=new J,ru=new hl,iu=new J(1,0,0),au=new J(0,1,0),ou=new J(0,0,1),su={type:`added`},cu={type:`removed`},lu={type:`childadded`,child:null},uu={type:`childremoved`,child:null},du=class e extends Vc{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Xl++}),this.uuid=Kc(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new J,n=new Jl,r=new hl,i=new J(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Rl},normalMatrix:{value:new Y}}),this.matrix=new Rl,this.matrixWorld=new Rl,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ql.setFromAxisAngle(e,t),this.quaternion.multiply(Ql),this}rotateOnWorldAxis(e,t){return Ql.setFromAxisAngle(e,t),this.quaternion.premultiply(Ql),this}rotateX(e){return this.rotateOnAxis(iu,e)}rotateY(e){return this.rotateOnAxis(au,e)}rotateZ(e){return this.rotateOnAxis(ou,e)}translateOnAxis(e,t){return Zl.copy(e).applyQuaternion(this.quaternion),this.position.add(Zl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(iu,e)}translateY(e){return this.translateOnAxis(au,e)}translateZ(e){return this.translateOnAxis(ou,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4($l.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?eu.copy(e):eu.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),tu.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$l.lookAt(tu,eu,this.up):$l.lookAt(eu,tu,this.up),this.quaternion.setFromRotationMatrix($l),r&&($l.extractRotation(r.matrixWorld),Ql.setFromRotationMatrix($l),this.quaternion.premultiply(Ql.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(K(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(su),lu.child=e,this.dispatchEvent(lu),lu.child=null):K(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(cu),uu.child=e,this.dispatchEvent(uu),uu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),$l.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),$l.multiply(e.parent.matrixWorld)),e.applyMatrix4($l),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(su),lu.child=e,this.dispatchEvent(lu),lu.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tu,e,nu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tu,ru,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};du.DEFAULT_UP=new J(0,1,0),du.DEFAULT_MATRIX_AUTO_UPDATE=!0,du.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var fu=class extends du{constructor(){super(),this.isGroup=!0,this.type=`Group`}},pu={type:`move`},mu=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new fu,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new fu,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new J,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new J),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new fu,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new J,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new J,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(pu)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new fu;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},hu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},gu={h:0,s:0,l:0},_u={h:0,s:0,l:0};function vu(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var X=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Cc){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Sl.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Sl.workingColorSpace){return this.r=e,this.g=t,this.b=n,Sl.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Sl.workingColorSpace){if(e=Jc(e,1),t=qc(t,0,1),n=qc(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=vu(i,r,e+1/3),this.g=vu(i,r,e),this.b=vu(i,r,e-1/3)}return Sl.colorSpaceToWorking(this,r),this}setStyle(e,t=Cc){function n(t){t!==void 0&&parseFloat(t)<1&&G(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:G(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);G(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Cc){let n=hu[e.toLowerCase()];return n===void 0?G(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Cl(e.r),this.g=Cl(e.g),this.b=Cl(e.b),this}copyLinearToSRGB(e){return this.r=wl(e.r),this.g=wl(e.g),this.b=wl(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Cc){return Sl.workingToColorSpace(yu.copy(this),e),Math.round(qc(yu.r*255,0,255))*65536+Math.round(qc(yu.g*255,0,255))*256+Math.round(qc(yu.b*255,0,255))}getHexString(e=Cc){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Sl.workingColorSpace){Sl.workingToColorSpace(yu.copy(this),t);let n=yu.r,r=yu.g,i=yu.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Sl.workingColorSpace){return Sl.workingToColorSpace(yu.copy(this),t),e.r=yu.r,e.g=yu.g,e.b=yu.b,e}getStyle(e=Cc){Sl.workingToColorSpace(yu.copy(this),e);let t=yu.r,n=yu.g,r=yu.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(gu),this.setHSL(gu.h+e,gu.s+t,gu.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(gu),e.getHSL(_u);let n=Zc(gu.h,_u.h,t),r=Zc(gu.s,_u.s,t),i=Zc(gu.l,_u.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},yu=new X;X.NAMES=hu;var bu=class extends du{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Jl,this.environmentIntensity=1,this.environmentRotation=new Jl,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},xu=new J,Su=new J,Cu=new J,wu=new J,Tu=new J,Eu=new J,Du=new J,Ou=new J,ku=new J,Au=new J,ju=new Nl,Mu=new Nl,Nu=new Nl,Pu=class e{constructor(e=new J,t=new J,n=new J){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),xu.subVectors(e,t),r.cross(xu);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){xu.subVectors(r,t),Su.subVectors(n,t),Cu.subVectors(e,t);let a=xu.dot(xu),o=xu.dot(Su),s=xu.dot(Cu),c=Su.dot(Su),l=Su.dot(Cu),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,wu)!==null&&wu.x>=0&&wu.y>=0&&wu.x+wu.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,wu)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,wu.x),s.addScaledVector(a,wu.y),s.addScaledVector(o,wu.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return ju.setScalar(0),Mu.setScalar(0),Nu.setScalar(0),ju.fromBufferAttribute(e,t),Mu.fromBufferAttribute(e,n),Nu.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(ju,i.x),a.addScaledVector(Mu,i.y),a.addScaledVector(Nu,i.z),a}static isFrontFacing(e,t,n,r){return xu.subVectors(n,t),Su.subVectors(e,t),xu.cross(Su).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return xu.subVectors(this.c,this.b),Su.subVectors(this.a,this.b),xu.cross(Su).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Tu.subVectors(r,n),Eu.subVectors(i,n),Ou.subVectors(e,n);let s=Tu.dot(Ou),c=Eu.dot(Ou);if(s<=0&&c<=0)return t.copy(n);ku.subVectors(e,r);let l=Tu.dot(ku),u=Eu.dot(ku);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Tu,a);Au.subVectors(e,i);let f=Tu.dot(Au),p=Eu.dot(Au);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Eu,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Du.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Du,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Tu,a).addScaledVector(Eu,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Fu=class{constructor(e=new J(1/0,1/0,1/0),t=new J(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Lu.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Lu.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Lu.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Lu):Lu.fromBufferAttribute(r,t),Lu.applyMatrix4(e.matrixWorld),this.expandByPoint(Lu);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Ru.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Ru.copy(e.boundingBox)),Ru.applyMatrix4(e.matrixWorld),this.union(Ru)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Lu),Lu.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Gu),Ku.subVectors(this.max,Gu),zu.subVectors(e.a,Gu),Bu.subVectors(e.b,Gu),Vu.subVectors(e.c,Gu),Hu.subVectors(Bu,zu),Uu.subVectors(Vu,Bu),Wu.subVectors(zu,Vu);let t=[0,-Hu.z,Hu.y,0,-Uu.z,Uu.y,0,-Wu.z,Wu.y,Hu.z,0,-Hu.x,Uu.z,0,-Uu.x,Wu.z,0,-Wu.x,-Hu.y,Hu.x,0,-Uu.y,Uu.x,0,-Wu.y,Wu.x,0];return!Yu(t,zu,Bu,Vu,Ku)||(t=[1,0,0,0,1,0,0,0,1],!Yu(t,zu,Bu,Vu,Ku))?!1:(qu.crossVectors(Hu,Uu),t=[qu.x,qu.y,qu.z],Yu(t,zu,Bu,Vu,Ku))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Lu).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Lu).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Iu[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Iu[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Iu[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Iu[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Iu[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Iu[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Iu[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Iu[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Iu),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Iu=[new J,new J,new J,new J,new J,new J,new J,new J],Lu=new J,Ru=new Fu,zu=new J,Bu=new J,Vu=new J,Hu=new J,Uu=new J,Wu=new J,Gu=new J,Ku=new J,qu=new J,Ju=new J;function Yu(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){Ju.fromArray(e,a);let o=i.x*Math.abs(Ju.x)+i.y*Math.abs(Ju.y)+i.z*Math.abs(Ju.z),s=t.dot(Ju),c=n.dot(Ju),l=r.dot(Ju);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Xu=new J,Zu=new q,Qu=0,$u=class extends Vc{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Qu++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Oc,this.updateRanges=[],this.gpuType=gs,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Zu.fromBufferAttribute(this,t),Zu.applyMatrix3(e),this.setXY(t,Zu.x,Zu.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Xu.fromBufferAttribute(this,t),Xu.applyMatrix3(e),this.setXYZ(t,Xu.x,Xu.y,Xu.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Xu.fromBufferAttribute(this,t),Xu.applyMatrix4(e),this.setXYZ(t,Xu.x,Xu.y,Xu.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Xu.fromBufferAttribute(this,t),Xu.applyNormalMatrix(e),this.setXYZ(t,Xu.x,Xu.y,Xu.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Xu.fromBufferAttribute(this,t),Xu.transformDirection(e),this.setXYZ(t,Xu.x,Xu.y,Xu.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=fl(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pl(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=fl(t,this.array)),t}setX(e,t){return this.normalized&&(t=pl(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=fl(t,this.array)),t}setY(e,t){return this.normalized&&(t=pl(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=fl(t,this.array)),t}setZ(e,t){return this.normalized&&(t=pl(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=fl(t,this.array)),t}setW(e,t){return this.normalized&&(t=pl(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=pl(t,this.array),n=pl(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=pl(t,this.array),n=pl(n,this.array),r=pl(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=pl(t,this.array),n=pl(n,this.array),r=pl(r,this.array),i=pl(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},ed=class extends $u{constructor(e,t,n){super(new Uint16Array(e),t,n)}},td=class extends $u{constructor(e,t,n){super(new Uint32Array(e),t,n)}},nd=class extends $u{constructor(e,t,n){super(new Float32Array(e),t,n)}},rd=new Fu,id=new J,ad=new J,od=class{constructor(e=new J,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?rd.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;id.subVectors(e,this.center);let t=id.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(id,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ad.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(id.copy(e.center).add(ad)),this.expandByPoint(id.copy(e.center).sub(ad))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},sd=0,cd=new Rl,ld=new du,ud=new J,dd=new Fu,fd=new Fu,pd=new J,md=class e extends Vc{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:sd++}),this.uuid=Kc(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(jc(e)?td:ed)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new Y().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return cd.makeRotationFromQuaternion(e),this.applyMatrix4(cd),this}rotateX(e){return cd.makeRotationX(e),this.applyMatrix4(cd),this}rotateY(e){return cd.makeRotationY(e),this.applyMatrix4(cd),this}rotateZ(e){return cd.makeRotationZ(e),this.applyMatrix4(cd),this}translate(e,t,n){return cd.makeTranslation(e,t,n),this.applyMatrix4(cd),this}scale(e,t,n){return cd.makeScale(e,t,n),this.applyMatrix4(cd),this}lookAt(e){return ld.lookAt(e),ld.updateMatrix(),this.applyMatrix4(ld.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ud).negate(),this.translate(ud.x,ud.y,ud.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new nd(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&G(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fu);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){K(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new J(-1/0,-1/0,-1/0),new J(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];dd.setFromBufferAttribute(n),this.morphTargetsRelative?(pd.addVectors(this.boundingBox.min,dd.min),this.boundingBox.expandByPoint(pd),pd.addVectors(this.boundingBox.max,dd.max),this.boundingBox.expandByPoint(pd)):(this.boundingBox.expandByPoint(dd.min),this.boundingBox.expandByPoint(dd.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&K(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new od);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){K(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new J,1/0);return}if(e){let n=this.boundingSphere.center;if(dd.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];fd.setFromBufferAttribute(n),this.morphTargetsRelative?(pd.addVectors(dd.min,fd.min),dd.expandByPoint(pd),pd.addVectors(dd.max,fd.max),dd.expandByPoint(pd)):(dd.expandByPoint(fd.min),dd.expandByPoint(fd.max))}dd.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)pd.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(pd));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)pd.fromBufferAttribute(a,t),o&&(ud.fromBufferAttribute(e,t),pd.add(ud)),r=Math.max(r,n.distanceToSquared(pd))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&K(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){K(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new $u(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new J,s[e]=new J;let c=new J,l=new J,u=new J,d=new q,f=new q,p=new q,m=new J,h=new J;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new J,y=new J,b=new J,x=new J;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new $u(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new J,i=new J,a=new J,o=new J,s=new J,c=new J,l=new J,u=new J;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)pd.fromBufferAttribute(e,t),pd.normalize(),e.setXYZ(t,pd.x,pd.y,pd.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new $u(a,r,i)}if(this.index===null)return G(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},hd=new J,gd=new J,_d=new Y,vd=class{constructor(e=new J(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=hd.subVectors(n,t).cross(gd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(hd),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||_d.getNormalMatrix(e),r=this.coplanarPoint(hd).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},yd=0,bd=class extends Vc{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:yd++}),this.uuid=Kc(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new X(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Dc,this.stencilZFail=Dc,this.stencilZPass=Dc,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){G(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){G(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new X().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new vd().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new q().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new q().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},xd=new J,Sd=new J,Cd=new J,wd=new J,Td=class{constructor(e=new J,t=new J(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,xd)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=xd.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(xd.copy(this.origin).addScaledVector(this.direction,t),xd.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Sd.copy(e).add(t).multiplyScalar(.5),Cd.copy(t).sub(e).normalize(),wd.copy(this.origin).sub(Sd);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Cd),o=wd.dot(this.direction),s=-wd.dot(Cd),c=wd.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Sd).addScaledVector(Cd,d),f}intersectSphere(e,t){if(e.radius<0)return null;xd.subVectors(e.center,this.origin);let n=xd.dot(this.direction),r=xd.dot(xd)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,xd)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,M,N;if(y>=b&&y>=x?(w=s,D=u,A=p,N=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,M=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,M=_)):b>=x?(w=c,D=d,A=m,N=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,M=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,M=v)):(w=l,D=f,A=h,N=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,M=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,M=g)),w===0)return null;let P=S/w,ee=C/w,F=1/w,I=T-P*D,te=E-ee*D,ne=O-P*A,re=k-ee*A,L=j-P*N,ie=M-ee*N,ae=L*re-ie*ne,oe=I*ie-te*L,se=ne*te-re*I;if(r){if(ae<0||oe<0||se<0)return null}else if((ae<0||oe<0||se<0)&&(ae>0||oe>0||se>0))return null;let ce=ae+oe+se;if(ce===0)return null;let le=F*(ae*D+oe*A+se*N);return(ce>0?le<0:le>0)?null:this.at(le/ce,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ed=class extends bd{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new X(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Jl,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Dd=new Rl,Od=new Td,kd=new od,Ad=new J,jd=new J,Md=new J,Nd=new J,Pd=new J,Fd=new J,Id=new J,Ld=new J,Rd=class extends du{constructor(e=new md,t=new Ed){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Fd.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Pd.fromBufferAttribute(s,e),a?Fd.addScaledVector(Pd,r):Fd.addScaledVector(Pd.sub(t),r))}t.add(Fd)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),kd.copy(n.boundingSphere),kd.applyMatrix4(i),Od.copy(e.ray).recast(e.near),!(kd.containsPoint(Od.origin)===!1&&(Od.intersectSphere(kd,Ad)===null||Od.origin.distanceToSquared(Ad)>(e.far-e.near)**2))&&(Dd.copy(i).invert(),Od.copy(e.ray).applyMatrix4(Dd),(n.boundingBox===null||Od.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Od)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Bd(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Bd(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Bd(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Bd(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function zd(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Ld.copy(s),Ld.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Ld);return l<n.near||l>n.far?null:{distance:l,point:Ld.clone(),object:e}}function Bd(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,jd),e.getVertexPosition(c,Md),e.getVertexPosition(l,Nd);let u=zd(e,t,n,r,jd,Md,Nd,Id);if(u){let e=new J;Pu.getBarycoord(Id,jd,Md,Nd,e),i&&(u.uv=Pu.getInterpolatedAttribute(i,s,c,l,e,new q)),a&&(u.uv1=Pu.getInterpolatedAttribute(a,s,c,l,e,new q)),o&&(u.normal=Pu.getInterpolatedAttribute(o,s,c,l,e,new J),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new J,materialIndex:0};Pu.getNormal(jd,Md,Nd,t.normal),u.face=t,u.barycoord=e}return u}var Vd=class extends Ml{constructor(e=null,t=1,n=1,r,i,a,o,s,c=is,l=is,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Hd=class extends $u{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ud=new od,Wd=new q(.5,.5),Gd=new J,Kd=class{constructor(e=new vd,t=new vd,n=new vd,r=new vd,i=new vd,a=new vd){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ac,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ud.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ud.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ud)}intersectsSprite(e){return Ud.center.set(0,0,0),Ud.radius=.7071067811865476+Wd.distanceTo(e.center),Ud.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ud)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Gd.x=r.normal.x>0?e.max.x:e.min.x,Gd.y=r.normal.y>0?e.max.y:e.min.y,Gd.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Gd)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},qd=class extends bd{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new X(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Jd=new Rl,Yd=new Td,Xd=new od,Zd=new J,Qd=class extends du{constructor(e=new md,t=new qd){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Xd.copy(n.boundingSphere),Xd.applyMatrix4(r),Xd.radius+=i,e.ray.intersectsSphere(Xd)===!1)return;Jd.copy(r).invert(),Yd.copy(e.ray).applyMatrix4(Jd);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Zd.fromBufferAttribute(l,n),$d(Zd,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Zd.fromBufferAttribute(l,a),$d(Zd,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function $d(e,t,n,r,i,a,o){let s=Yd.distanceSqToPoint(e);if(s<n){let n=new J;Yd.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var ef=class extends Ml{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},tf=class extends Ml{constructor(e,t,n=hs,r,i,a,o=is,s=is,c,l=Es,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ol(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},nf=class extends tf{constructor(e,t=hs,n=301,r,i,a=is,o=is,s,c=Es){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},rf=class extends Ml{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},af=class e extends md{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new nd(c,3)),this.setAttribute(`normal`,new nd(l,3)),this.setAttribute(`uv`,new nd(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new J;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},of=class e extends md{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new J,l=new q;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new nd(a,3)),this.setAttribute(`normal`,new nd(o,3)),this.setAttribute(`uv`,new nd(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},sf=class e extends md{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new nd(u,3)),this.setAttribute(`normal`,new nd(d,3)),this.setAttribute(`uv`,new nd(f,2));function _(){let a=new J,_=new J,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new q,m=new J,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},cf=class e extends sf{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},lf=class e extends md{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new nd(i,3)),this.setAttribute(`normal`,new nd(i.slice(),3)),this.setAttribute(`uv`,new nd(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new J,r=new J,i=new J;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new J;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new J;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new J,t=new J,n=new J,r=new J,o=new q,s=new q,c=new q;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},uf=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){G(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new q:new J);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new J,r=[],i=[],a=[],o=new J,s=new Rl;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new J)}i[0]=new J,a[0]=new J;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(qc(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(qc(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},df=class extends uf{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new q){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ff=class extends df{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function pf(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var mf=new J,hf=new J,gf=new pf,_f=new pf,vf=new pf,yf=class extends uf{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new J){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(hf.subVectors(r[0],r[1]).add(r[0]),c=hf);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(mf.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=mf),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),gf.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),_f.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),vf.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(gf.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),_f.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),vf.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(gf.calc(s),_f.calc(s),vf.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new J().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function bf(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function xf(e,t){let n=1-e;return n*n*t}function Sf(e,t){return 2*(1-e)*e*t}function Cf(e,t){return e*e*t}function wf(e,t,n,r){return xf(e,t)+Sf(e,n)+Cf(e,r)}function Tf(e,t){let n=1-e;return n*n*n*t}function Ef(e,t){let n=1-e;return 3*n*n*e*t}function Df(e,t){return 3*(1-e)*e*e*t}function Of(e,t){return e*e*e*t}function kf(e,t,n,r,i){return Tf(e,t)+Ef(e,n)+Df(e,r)+Of(e,i)}var Af=class extends uf{constructor(e=new q,t=new q,n=new q,r=new q){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new q){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(kf(e,r.x,i.x,a.x,o.x),kf(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},jf=class extends uf{constructor(e=new J,t=new J,n=new J,r=new J){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new J){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(kf(e,r.x,i.x,a.x,o.x),kf(e,r.y,i.y,a.y,o.y),kf(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Mf=class extends uf{constructor(e=new q,t=new q){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new q){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new q){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Nf=class extends uf{constructor(e=new J,t=new J){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new J){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new J){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Pf=class extends uf{constructor(e=new q,t=new q,n=new q){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new q){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(wf(e,r.x,i.x,a.x),wf(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ff=class extends uf{constructor(e=new J,t=new J,n=new J){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new J){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(wf(e,r.x,i.x,a.x),wf(e,r.y,i.y,a.y),wf(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},If=class extends uf{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new q){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(bf(o,s.x,c.x,l.x,u.x),bf(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new q().fromArray(n))}return this}},Lf=Object.freeze({__proto__:null,ArcCurve:ff,CatmullRomCurve3:yf,CubicBezierCurve:Af,CubicBezierCurve3:jf,EllipseCurve:df,LineCurve:Mf,LineCurve3:Nf,QuadraticBezierCurve:Pf,QuadraticBezierCurve3:Ff,SplineCurve:If}),Rf=class extends uf{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new Lf[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new Lf[n.type]().fromJSON(n))}return this}},zf=class extends Rf{constructor(e){super(),this.type=`Path`,this.currentPoint=new q,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Mf(this.currentPoint.clone(),new q(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new Pf(this.currentPoint.clone(),new q(e,t),new q(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new Af(this.currentPoint.clone(),new q(e,t),new q(n,r),new q(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new If([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new df(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Bf=class extends zf{constructor(e){super(e),this.uuid=Kc(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new zf().fromJSON(n))}return this}};function Vf(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=Hf(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=Yf(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return Wf(a,o,n,s,c,l,0),o}function Hf(e,t,n,r,i){let a;if(i===yp(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=gp(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=gp(i/r|0,e[i],e[i+1],a);return a&&cp(a,a.next)&&(_p(a),a=a.next),a}function Uf(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(cp(n,n.next)||sp(n.prev,n,n.next)===0)){if(_p(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function Wf(e,t,n,r,i,a,o){if(!e)return;!o&&a&&ep(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?Kf(e,r,i,a):Gf(e)){t.push(c.i,e.i,l.i),_p(e),e=l.next,s=l.next;continue}if(e=l,e===s){o?o===1?(e=qf(Uf(e),t),Wf(e,t,n,r,i,a,2)):o===2&&Jf(e,t,n,r,i,a):Wf(Uf(e),t,n,r,i,a,1);break}}}function Gf(e){let t=e.prev,n=e,r=e.next;if(sp(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&ap(i,s,a,c,o,l,m.x,m.y)&&sp(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function Kf(e,t,n,r){let i=e.prev,a=e,o=e.next;if(sp(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=np(p,m,t,n,r),v=np(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&ap(s,u,c,d,l,f,y.x,y.y)&&sp(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&ap(s,u,c,d,l,f,b.x,b.y)&&sp(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&ap(s,u,c,d,l,f,y.x,y.y)&&sp(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&ap(s,u,c,d,l,f,b.x,b.y)&&sp(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function qf(e,t){let n=e;do{let r=n.prev,i=n.next.next;!cp(r,i)&&lp(r,n,n.next,i)&&pp(r,i)&&pp(i,r)&&(t.push(r.i,n.i,i.i),_p(n),_p(n.next),n=e=i),n=n.next}while(n!==e);return Uf(n)}function Jf(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&op(o,e)){let s=hp(o,e);o=Uf(o,o.next),s=Uf(s,s.next),Wf(o,t,n,r,i,a,0),Wf(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function Yf(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=Hf(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(rp(o))}i.sort(Xf);for(let e=0;e<i.length;e++)n=Zf(i[e],n);return n}function Xf(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function Zf(e,t){let n=Qf(e,t);if(!n)return t;let r=hp(n,e);return Uf(r,r.next),Uf(n,n.next)}function Qf(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(cp(e,n))return n;do{if(cp(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&ip(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);pp(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&$f(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function $f(e,t){return sp(e.prev,e,t.prev)<0&&sp(t.next,e,e.next)<0}function ep(e,t,n,r){let i=e;do i.z===0&&(i.z=np(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,tp(i)}function tp(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function np(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function rp(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function ip(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function ap(e,t,n,r,i,a,o,s){return(e!==o||t!==s)&&ip(e,t,n,r,i,a,o,s)}function op(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!fp(e,t)&&(pp(e,t)&&pp(t,e)&&mp(e,t)&&(sp(e.prev,e,t.prev)||sp(e,t.prev,t))||cp(e,t)&&sp(e.prev,e,e.next)>0&&sp(t.prev,t,t.next)>0)}function sp(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function cp(e,t){return e.x===t.x&&e.y===t.y}function lp(e,t,n,r){let i=dp(sp(e,t,n)),a=dp(sp(e,t,r)),o=dp(sp(n,r,e)),s=dp(sp(n,r,t));return!!(i!==a&&o!==s||i===0&&up(e,n,t)||a===0&&up(e,r,t)||o===0&&up(n,e,r)||s===0&&up(n,t,r))}function up(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function dp(e){return e>0?1:e<0?-1:0}function fp(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&lp(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function pp(e,t){return sp(e.prev,e,e.next)<0?sp(e,t,e.next)>=0&&sp(e,e.prev,t)>=0:sp(e,t,e.prev)<0||sp(e,e.next,t)<0}function mp(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function hp(e,t){let n=vp(e.i,e.x,e.y),r=vp(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function gp(e,t,n,r){let i=vp(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function _p(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function vp(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function yp(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var bp=class{static triangulate(e,t,n=2){return Vf(e,t,n)}},xp=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];Sp(e),Cp(n,e);let a=e.length;t.forEach(Sp);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,Cp(n,t[e]);let o=bp.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function Sp(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function Cp(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var wp=class e extends md{constructor(e=new Bf([new q(.5,.5),new q(-.5,.5),new q(-.5,-.5),new q(.5,-.5)]),t={}){super(),this.type=`ExtrudeGeometry`,this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],i=[];for(let t=0,n=e.length;t<n;t++){let n=e[t];a(n)}this.setAttribute(`position`,new nd(r,3)),this.setAttribute(`uv`,new nd(i,2)),this.computeVertexNormals();function a(e){let a=[],o=t.curveSegments===void 0?12:t.curveSegments,s=t.steps===void 0?1:t.steps,c=t.depth===void 0?1:t.depth,l=t.bevelEnabled===void 0||t.bevelEnabled,u=t.bevelThickness===void 0?.2:t.bevelThickness,d=t.bevelSize===void 0?u-.1:t.bevelSize,f=t.bevelOffset===void 0?0:t.bevelOffset,p=t.bevelSegments===void 0?3:t.bevelSegments,m=t.extrudePath,h=t.UVGenerator===void 0?Tp:t.UVGenerator,g,_=!1,v,y,b,x;if(m){g=m.getSpacedPoints(s),_=!0,l=!1;let e=m.isCatmullRomCurve3?m.closed:!1;v=m.computeFrenetFrames(s,e),y=new J,b=new J,x=new J}l||(p=0,u=0,d=0,f=0);let S=e.extractPoints(o),C=S.shape,w=S.holes;if(!xp.isClockWise(C)){C=C.reverse();for(let e=0,t=w.length;e<t;e++){let t=w[e];xp.isClockWise(t)&&(w[e]=t.reverse())}}function T(e){let t=e[0];for(let n=1;n<=e.length;n++){let r=n%e.length,i=e[r],a=i.x-t.x,o=i.y-t.y,s=a*a+o*o,c=Math.max(Math.abs(i.x),Math.abs(i.y),Math.abs(t.x),Math.abs(t.y));if(s<=10000000000000001e-36*c*c){e.splice(r,1),n--;continue}t=i}}T(C),w.forEach(T);let E=w.length,D=C;for(let e=0;e<E;e++){let t=w[e];C=C.concat(t)}function O(e,t,n){return t||K(`ExtrudeGeometry: vec does not exist`),e.clone().addScaledVector(t,n)}let k=C.length;function A(e,t,n){let r,i,a,o=e.x-t.x,s=e.y-t.y,c=n.x-e.x,l=n.y-e.y,u=o*o+s*s,d=o*l-s*c;if(Math.abs(d)>2**-52){let d=Math.sqrt(u),f=Math.sqrt(c*c+l*l),p=t.x-s/d,m=t.y+o/d,h=n.x-l/f,g=n.y+c/f,_=((h-p)*l-(g-m)*c)/(o*l-s*c);r=p+o*_-e.x,i=m+s*_-e.y;let v=r*r+i*i;if(v<=2)return new q(r,i);a=Math.sqrt(v/2)}else{let e=!1;o>2**-52?c>2**-52&&(e=!0):o<-(2**-52)?c<-(2**-52)&&(e=!0):Math.sign(s)===Math.sign(l)&&(e=!0),e?(r=-s,i=o,a=Math.sqrt(u)):(r=o,i=s,a=Math.sqrt(u/2))}return new q(r/a,i/a)}let j=[];for(let e=0,t=D.length,n=t-1,r=e+1;e<t;e++,n++,r++)n===t&&(n=0),r===t&&(r=0),j[e]=A(D[e],D[n],D[r]);let M=[],N,P=j.concat();for(let e=0,t=E;e<t;e++){let t=w[e];N=[];for(let e=0,n=t.length,r=n-1,i=e+1;e<n;e++,r++,i++)r===n&&(r=0),i===n&&(i=0),N[e]=A(t[e],t[r],t[i]);M.push(N),P=P.concat(N)}let ee;if(p===0)ee=xp.triangulateShape(D,w);else{let e=[],t=[];for(let n=0;n<p;n++){let r=n/p,i=u*Math.cos(r*Math.PI/2),a=d*Math.sin(r*Math.PI/2)+f;for(let t=0,n=D.length;t<n;t++){let n=O(D[t],j[t],a);L(n.x,n.y,-i),r===0&&e.push(n)}for(let e=0,n=E;e<n;e++){let n=w[e];N=M[e];let o=[];for(let e=0,t=n.length;e<t;e++){let t=O(n[e],N[e],a);L(t.x,t.y,-i),r===0&&o.push(t)}r===0&&t.push(o)}}ee=xp.triangulateShape(e,t)}let F=ee.length,I=d+f;for(let e=0;e<k;e++){let t=l?O(C[e],P[e],I):C[e];_?(b.copy(v.normals[0]).multiplyScalar(t.x),y.copy(v.binormals[0]).multiplyScalar(t.y),x.copy(g[0]).add(b).add(y),L(x.x,x.y,x.z)):L(t.x,t.y,0)}for(let e=1;e<=s;e++)for(let t=0;t<k;t++){let n=l?O(C[t],P[t],I):C[t];_?(b.copy(v.normals[e]).multiplyScalar(n.x),y.copy(v.binormals[e]).multiplyScalar(n.y),x.copy(g[e]).add(b).add(y),L(x.x,x.y,x.z)):L(n.x,n.y,c/s*e)}for(let e=p-1;e>=0;e--){let t=e/p,n=u*Math.cos(t*Math.PI/2),r=d*Math.sin(t*Math.PI/2)+f;for(let e=0,t=D.length;e<t;e++){let t=O(D[e],j[e],r);L(t.x,t.y,c+n)}for(let e=0,t=w.length;e<t;e++){let t=w[e];N=M[e];for(let e=0,i=t.length;e<i;e++){let i=O(t[e],N[e],r);_?L(i.x,i.y+g[s-1].y,g[s-1].x+n):L(i.x,i.y,c+n)}}}te(),ne();function te(){let e=r.length/3;if(l){let e=0,t=k*e;for(let e=0;e<F;e++){let n=ee[e];ie(n[2]+t,n[1]+t,n[0]+t)}e=s+p*2,t=k*e;for(let e=0;e<F;e++){let n=ee[e];ie(n[0]+t,n[1]+t,n[2]+t)}}else{for(let e=0;e<F;e++){let t=ee[e];ie(t[2],t[1],t[0])}for(let e=0;e<F;e++){let t=ee[e];ie(t[0]+k*s,t[1]+k*s,t[2]+k*s)}}n.addGroup(e,r.length/3-e,0)}function ne(){let e=r.length/3,t=0;re(D,t),t+=D.length;for(let e=0,n=w.length;e<n;e++){let n=w[e];re(n,t),t+=n.length}n.addGroup(e,r.length/3-e,1)}function re(e,t){let n=e.length;for(;--n>=0;){let r=n,i=n-1;i<0&&(i=e.length-1);for(let e=0,n=s+p*2;e<n;e++){let n=k*e,a=k*(e+1);ae(t+r+n,t+i+n,t+i+a,t+r+a)}}}function L(e,t,n){a.push(e),a.push(t),a.push(n)}function ie(e,t,i){oe(e),oe(t),oe(i);let a=r.length/3,o=h.generateTopUV(n,r,a-3,a-2,a-1);se(o[0]),se(o[1]),se(o[2])}function ae(e,t,i,a){oe(e),oe(t),oe(a),oe(t),oe(i),oe(a);let o=r.length/3,s=h.generateSideWallUV(n,r,o-6,o-3,o-2,o-1);se(s[0]),se(s[1]),se(s[3]),se(s[1]),se(s[2]),se(s[3])}function oe(e){r.push(a[e*3+0]),r.push(a[e*3+1]),r.push(a[e*3+2])}function se(e){i.push(e.x),i.push(e.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Ep(t,n,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new Lf[i.type]().fromJSON(i)),new e(r,t.options)}},Tp={generateTopUV:function(e,t,n,r,i){let a=t[n*3],o=t[n*3+1],s=t[r*3],c=t[r*3+1],l=t[i*3],u=t[i*3+1];return[new q(a,o),new q(s,c),new q(l,u)]},generateSideWallUV:function(e,t,n,r,i,a){let o=t[n*3],s=t[n*3+1],c=t[n*3+2],l=t[r*3],u=t[r*3+1],d=t[r*3+2],f=t[i*3],p=t[i*3+1],m=t[i*3+2],h=t[a*3],g=t[a*3+1],_=t[a*3+2];return Math.abs(s-u)<Math.abs(o-l)?[new q(o,1-c),new q(l,1-d),new q(f,1-m),new q(h,1-_)]:[new q(s,1-c),new q(u,1-d),new q(p,1-m),new q(g,1-_)]}};function Ep(e,t,n){if(n.shapes=[],Array.isArray(e))for(let t=0,r=e.length;t<r;t++){let r=e[t];n.shapes.push(r.uuid)}else n.shapes.push(e.uuid);return n.options=Object.assign({},t),t.extrudePath!==void 0&&(n.options.extrudePath=t.extrudePath.toJSON()),n}var Dp=class e extends lf{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Op=class e extends md{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new nd(p,3)),this.setAttribute(`normal`,new nd(m,3)),this.setAttribute(`uv`,new nd(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},kp=class e extends md{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new J,d=new J,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new nd(p,3)),this.setAttribute(`normal`,new nd(m,3)),this.setAttribute(`uv`,new nd(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function Ap(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Mp(i))i.isRenderTargetTexture?(G(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Mp(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function jp(e){let t={};for(let n=0;n<e.length;n++){let r=Ap(e[n]);for(let e in r)t[e]=r[e]}return t}function Mp(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Np(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Pp(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Sl.workingColorSpace}var Fp={clone:Ap,merge:jp},Ip=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Lp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Rp=class extends bd{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ip,this.fragmentShader=Lp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ap(e.uniforms),this.uniformsGroups=Np(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new X().setHex(r.value);break;case`v2`:this.uniforms[n].value=new q().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new J().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Nl().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new Y().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Rl().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},zp=class extends Rp{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Bp=class extends bd{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new X(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new X(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Jl,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Vp=class extends bd{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Sc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Hp=class extends bd{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Up(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Wp(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Gp=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Kp=class extends Gp{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:yc,endingEnd:yc}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case bc:i=e,o=2*t-n;break;case xc:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case bc:a=e,s=2*n-t;break;case xc:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},qp=class extends Gp{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Jp=class extends Gp{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Yp=class extends Gp{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Qp(n,t,g,y,r);i[p]=Xp(x,o,_,b,m)}return i}};function Xp(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Zp(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Qp(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Xp(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Zp(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var $p=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Up(t,this.TimeBufferType),this.values=Up(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Up(e.times,Array),values:Up(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Wp(e.settings)&&(n.settings={inTangents:Up(e.settings.inTangents,Array),outTangents:Up(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Jp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new qp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Kp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Yp(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case hc:t=this.InterpolantFactoryMethodDiscrete;break;case gc:t=this.InterpolantFactoryMethodLinear;break;case _c:t=this.InterpolantFactoryMethodSmooth;break;case vc:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return G(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return hc;case this.InterpolantFactoryMethodLinear:return gc;case this.InterpolantFactoryMethodSmooth:return _c;case this.InterpolantFactoryMethodBezier:return vc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Wp(this.settings)&&(em(this.settings.inTangents,e),em(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(K(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(K(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){K(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){K(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Mc(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){K(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===_c,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Wp(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function em(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}$p.prototype.ValueTypeName=``,$p.prototype.TimeBufferType=Float32Array,$p.prototype.ValueBufferType=Float32Array,$p.prototype.DefaultInterpolation=gc;var tm=class extends $p{constructor(e,t,n){super(e,t,n)}};tm.prototype.ValueTypeName=`bool`,tm.prototype.ValueBufferType=Array,tm.prototype.DefaultInterpolation=hc,tm.prototype.InterpolantFactoryMethodLinear=void 0,tm.prototype.InterpolantFactoryMethodSmooth=void 0;var nm=class extends $p{constructor(e,t,n,r){super(e,t,n,r)}};nm.prototype.ValueTypeName=`color`;var rm=class extends $p{constructor(e,t,n,r){super(e,t,n,r)}};rm.prototype.ValueTypeName=`number`;var im=class extends Gp{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)hl.slerpFlat(i,0,a,c-o,a,c,s);return i}},am=class extends $p{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new im(this.times,this.values,this.getValueSize(),e)}};am.prototype.ValueTypeName=`quaternion`,am.prototype.InterpolantFactoryMethodSmooth=void 0;var om=class extends $p{constructor(e,t,n){super(e,t,n)}};om.prototype.ValueTypeName=`string`,om.prototype.ValueBufferType=Array,om.prototype.DefaultInterpolation=hc,om.prototype.InterpolantFactoryMethodLinear=void 0,om.prototype.InterpolantFactoryMethodSmooth=void 0;var sm=class extends $p{constructor(e,t,n,r){super(e,t,n,r)}};sm.prototype.ValueTypeName=`vector`;var cm=class extends du{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new X(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},lm=class extends cm{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(du.DEFAULT_UP),this.updateMatrix(),this.groundColor=new X(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},um=new Rl,dm=new J,fm=new J,pm=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new q(512,512),this.mapType=us,this.map=null,this.mapPass=null,this.matrix=new Rl,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Kd,this._frameExtents=new q(1,1),this._viewportCount=1,this._viewports=[new Nl(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;dm.setFromMatrixPosition(e.matrixWorld),t.position.copy(dm),fm.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(fm),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){um.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(um,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(um)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},mm=new J,hm=new hl,gm=new J,_m=class extends du{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Rl,this.projectionMatrix=new Rl,this.projectionMatrixInverse=new Rl,this.coordinateSystem=Ac,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(mm,hm,gm),gm.x===1&&gm.y===1&&gm.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(mm,hm,gm.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(mm,hm,gm),gm.x===1&&gm.y===1&&gm.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(mm,hm,gm.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},vm=new J,ym=new q,bm=new q,xm=class extends _m{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Gc*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Wc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Gc*2*Math.atan(Math.tan(Wc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){vm.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(vm.x,vm.y).multiplyScalar(-e/vm.z),vm.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(vm.x,vm.y).multiplyScalar(-e/vm.z)}getViewSize(e,t){return this.getViewBounds(e,ym,bm),t.subVectors(bm,ym)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Wc*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Sm=class extends _m{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Cm=class extends pm{constructor(){super(new Sm(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},wm=class extends cm{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(du.DEFAULT_UP),this.updateMatrix(),this.target=new du,this.shadow=new Cm}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Tm=class extends md{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type=`InstancedBufferGeometry`,this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}},Em=-90,Dm=1,Om=class extends du{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new xm(Em,Dm,e,t);r.layers=this.layers,this.add(r);let i=new xm(Em,Dm,e,t);i.layers=this.layers,this.add(i);let a=new xm(Em,Dm,e,t);a.layers=this.layers,this.add(a);let o=new xm(Em,Dm,e,t);o.layers=this.layers,this.add(o);let s=new xm(Em,Dm,e,t);s.layers=this.layers,this.add(s);let c=new xm(Em,Dm,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},km=class extends xm{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Am=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=jm.bind(this),e.addEventListener(`visibilitychange`,this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener(`visibilitychange`,this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e===void 0?performance.now():e)-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function jm(){this._document.hidden===!1&&this.reset()}var Mm=`\\[\\]\\.:\\/`,Nm=RegExp(`[\\[\\]\\.:\\/]`,`g`),Pm=`[^\\[\\]\\.:\\/]`,Fm=`[^`+Mm.replace(`\\.`,``)+`]`,Im=`((?:WC+[\\/:])*)`.replace(`WC`,Pm),Lm=`(WCOD+)?`.replace(`WCOD`,Fm),Rm=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Pm),zm=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Pm),Bm=RegExp(`^`+Im+Lm+Rm+zm+`$`),Vm=[`material`,`materials`,`bones`,`map`],Hm=class{constructor(e,t,n){let r=n||Um.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Um=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Nm,``)}static parseTrackName(e){let t=Bm.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Vm.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){G(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){K(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){K(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){K(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){K(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){K(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){K(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){K(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;K(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){K(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){K(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Um.Composite=Hm,Um.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Um.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Um.prototype.GetterByBindingType=[Um.prototype._getValue_direct,Um.prototype._getValue_array,Um.prototype._getValue_arrayElement,Um.prototype._getValue_toArray],Um.prototype.SetterByBindingTypeAndVersioning=[[Um.prototype._setValue_direct,Um.prototype._setValue_direct_setNeedsUpdate,Um.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Um.prototype._setValue_array,Um.prototype._setValue_array_setNeedsUpdate,Um.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Um.prototype._setValue_arrayElement,Um.prototype._setValue_arrayElement_setNeedsUpdate,Um.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Um.prototype._setValue_fromArray,Um.prototype._setValue_fromArray_setNeedsUpdate,Um.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Wm=new Rl,Gm=class{constructor(e,t,n=0,r=1/0){this.ray=new Td(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Yl,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):K(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Wm.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Wm),this}intersectObject(e,t=!0,n=[]){return qm(e,this,n,t),n.sort(Km),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)qm(e[r],this,n,t);return n.sort(Km),n}};function Km(e,t){return e.distance-t.distance}function qm(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)qm(r[e],t,n,!0)}}(class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});var Jm=new q,Ym=class{constructor(e=new q(1/0,1/0),t=new q(-1/0,-1/0)){this.isBox2=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Jm.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=1/0,this.max.x=this.max.y=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y}getCenter(e){return this.isEmpty()?e.set(0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Jm).distanceTo(e)}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Xm=class{constructor(){this.type=`ShapePath`,this.color=new X,this.subPaths=[],this.currentPath=null,this.userData={}}moveTo(e,t){return this.currentPath=new zf,this.subPaths.push(this.currentPath),this.currentPath.moveTo(e,t),this}lineTo(e,t){return this.currentPath.lineTo(e,t),this}quadraticCurveTo(e,t,n,r){return this.currentPath.quadraticCurveTo(e,t,n,r),this}bezierCurveTo(e,t,n,r,i,a){return this.currentPath.bezierCurveTo(e,t,n,r,i,a),this}splineThru(e){return this.currentPath.splineThru(e),this}toShapes(){function e(e,t){let n=!1,r=t.length;for(let i=0,a=r-1;i<r;a=i++){let r=t[i],o=t[a];r.y>e.y!=o.y>e.y&&e.x<(o.x-r.x)*(e.y-r.y)/(o.y-r.y)+r.x&&(n=!n)}return n}function t(t,n){let r=n.getCenter(new q);if(e(r,t))return r;let i=r.y,a=[],o=t.length;for(let e=0;e<o;e++){let n=t[e],r=t[(e+1)%o];if(n.y>i!=r.y>i){let e=n.x+(i-n.y)*(r.x-n.x)/(r.y-n.y);a.push(e)}}return a.length>1&&(a.sort((e,t)=>e-t),r.x=(a[0]+a[1])/2),r}let n=this.userData.style&&this.userData.style.fillRule||`nonzero`;n!==`nonzero`&&n!==`evenodd`&&(G(`Fill-rule "`+n+`" is not supported, falling back to "nonzero".`),n=`nonzero`);let r=n===`nonzero`?(e=>e!==0):(e=>!!(e&1)),i=[];for(let e of this.subPaths){let n=e.getPoints();if(n.length<3)continue;let r=xp.area(n);if(r===0)continue;let a=new Ym;for(let e=0;e<n.length;e++)a.expandByPoint(n[e]);i.push({subPath:e,points:n,boundingBox:a,interiorPoint:t(n,a),absArea:Math.abs(r),winding:r<0?-1:1,container:null,exclude:!1,role:null})}i.sort((e,t)=>t.absArea-e.absArea);for(let t=0;t<i.length;t++){let n=i[t],a=0;for(let r=t-1;r>=0;r--){let t=i[r];if(t.boundingBox.containsBox(n.boundingBox)&&e(n.interiorPoint,t.points)){n.container=t.exclude?t.container:t,a=t.winding,n.winding+=a;break}}r(n.winding)===r(a)&&(n.exclude=!0)}for(let e of i)e.exclude||(e.role=e.container===null||e.container.role===`hole`?`outer`:`hole`);let a=[],o=new Map;for(let e of i){if(e.exclude||e.role!==`outer`)continue;let t=new Bf;t.curves=e.subPath.curves,a.push(t),o.set(e,t)}for(let e of i){if(e.exclude||e.role!==`hole`)continue;let t=o.get(e.container);if(!t)continue;let n=new zf;n.curves=e.subPath.curves,t.holes.push(n)}return a}};function Zm(e,t,n,r){let i=Qm(r);switch(n){case Cs:return e*t;case Os:return e*t/i.components*i.byteLength;case ks:return e*t/i.components*i.byteLength;case As:return e*t*2/i.components*i.byteLength;case js:return e*t*2/i.components*i.byteLength;case ws:return e*t*3/i.components*i.byteLength;case Ts:return e*t*4/i.components*i.byteLength;case Ms:return e*t*4/i.components*i.byteLength;case Ns:case Ps:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Fs:case Is:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Rs:case Bs:return Math.max(e,16)*Math.max(t,8)/4;case Ls:case zs:return Math.max(e,8)*Math.max(t,8)/2;case Vs:case Hs:case Ws:case Gs:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Us:case Ks:case qs:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Js:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ys:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Xs:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Zs:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Qs:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case $s:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case ec:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case tc:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case nc:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case rc:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case ic:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case ac:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case oc:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case sc:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case cc:case lc:case uc:return Math.ceil(e/4)*Math.ceil(t/4)*16;case dc:case fc:return Math.ceil(e/4)*Math.ceil(t/4)*8;case pc:case mc:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Qm(e){switch(e){case us:case ds:return{byteLength:1,components:1};case ps:case fs:case _s:return{byteLength:2,components:1};case vs:case ys:return{byteLength:2,components:4};case hs:case ms:case gs:return{byteLength:4,components:1};case xs:case Ss:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?G(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function $m(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function eh(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Z={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Q={common:{diffuse:{value:new X(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Y}},envmap:{envMap:{value:null},envMapRotation:{value:new Y},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Y}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Y}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Y},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Y},normalScale:{value:new q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Y},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Y}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Y}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Y}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new X(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new J},probesMax:{value:new J},probesResolution:{value:new J}},points:{diffuse:{value:new X(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0},uvTransform:{value:new Y}},sprite:{diffuse:{value:new X(16777215)},opacity:{value:1},center:{value:new q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}}},th={basic:{uniforms:jp([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.fog]),vertexShader:Z.meshbasic_vert,fragmentShader:Z.meshbasic_frag},lambert:{uniforms:jp([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new X(0)},envMapIntensity:{value:1}}]),vertexShader:Z.meshlambert_vert,fragmentShader:Z.meshlambert_frag},phong:{uniforms:jp([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new X(0)},specular:{value:new X(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Z.meshphong_vert,fragmentShader:Z.meshphong_frag},standard:{uniforms:jp([Q.common,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.roughnessmap,Q.metalnessmap,Q.fog,Q.lights,{emissive:{value:new X(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Z.meshphysical_vert,fragmentShader:Z.meshphysical_frag},toon:{uniforms:jp([Q.common,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.gradientmap,Q.fog,Q.lights,{emissive:{value:new X(0)}}]),vertexShader:Z.meshtoon_vert,fragmentShader:Z.meshtoon_frag},matcap:{uniforms:jp([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,{matcap:{value:null}}]),vertexShader:Z.meshmatcap_vert,fragmentShader:Z.meshmatcap_frag},points:{uniforms:jp([Q.points,Q.fog]),vertexShader:Z.points_vert,fragmentShader:Z.points_frag},dashed:{uniforms:jp([Q.common,Q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Z.linedashed_vert,fragmentShader:Z.linedashed_frag},depth:{uniforms:jp([Q.common,Q.displacementmap]),vertexShader:Z.depth_vert,fragmentShader:Z.depth_frag},normal:{uniforms:jp([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,{opacity:{value:1}}]),vertexShader:Z.meshnormal_vert,fragmentShader:Z.meshnormal_frag},sprite:{uniforms:jp([Q.sprite,Q.fog]),vertexShader:Z.sprite_vert,fragmentShader:Z.sprite_frag},background:{uniforms:{uvTransform:{value:new Y},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Z.background_vert,fragmentShader:Z.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Y}},vertexShader:Z.backgroundCube_vert,fragmentShader:Z.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Z.cube_vert,fragmentShader:Z.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Z.equirect_vert,fragmentShader:Z.equirect_frag},distance:{uniforms:jp([Q.common,Q.displacementmap,{referencePosition:{value:new J},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Z.distance_vert,fragmentShader:Z.distance_frag},shadow:{uniforms:jp([Q.lights,Q.fog,{color:{value:new X(0)},opacity:{value:1}}]),vertexShader:Z.shadow_vert,fragmentShader:Z.shadow_frag}};th.physical={uniforms:jp([th.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Y},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Y},clearcoatNormalScale:{value:new q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Y},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Y},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Y},sheen:{value:0},sheenColor:{value:new X(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Y},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Y},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Y},transmissionSamplerSize:{value:new q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Y},attenuationDistance:{value:0},attenuationColor:{value:new X(0)},specularColor:{value:new X(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Y},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Y},anisotropyVector:{value:new q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Y}}]),vertexShader:Z.meshphysical_vert,fragmentShader:Z.meshphysical_frag};var nh={r:0,b:0,g:0},rh=new Rl,ih=new Y;ih.set(-1,0,0,0,1,0,0,0,1);function ah(e,t,n,r,i,a){let o=new X(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new Rd(new af(1,1,1),new Rp({name:`BackgroundCubeMaterial`,uniforms:Ap(th.backgroundCube.uniforms),vertexShader:th.backgroundCube.vertexShader,fragmentShader:th.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(rh.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(ih),l.material.toneMapped=Sl.getTransfer(i.colorSpace)!==Ec,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new Rd(new Op(2,2),new Rp({name:`BackgroundMaterial`,uniforms:Ap(th.background.uniforms),vertexShader:th.background.vertexShader,fragmentShader:th.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=Sl.getTransfer(i.colorSpace)!==Ec,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(nh,Pp(e)),n.buffers.color.setClear(nh.r,nh.g,nh.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function oh(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function sh(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function ch(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(G(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&G(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function lh(e){let t=this,n=null,r=0,i=!1,a=!1,o=new vd,s=new Y,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var uh=4,dh=6,fh=20,ph=256,mh=new Sm,hh=new X,gh=null,_h=0,vh=0,yh=!1,bh=new J,xh=new J,Sh=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=bh}=i;gh=this._renderer.getRenderTarget(),_h=this._renderer.getActiveCubeFace(),vh=this._renderer.getActiveMipmapLevel(),yh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Oh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(gh,_h,vh),this._renderer.xr.enabled=yh,e.scissorTest=!1,Th(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),gh=this._renderer.getRenderTarget(),_h=this._renderer.getActiveCubeFace(),vh=this._renderer.getActiveMipmapLevel(),yh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:ss,minFilter:ss,generateMipmaps:!1,type:_s,format:Ts,colorSpace:wc,depthBuffer:!1},r=wh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=wh(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Ch(r)),this._blurMaterial=Dh(r,e,t),this._ggxMaterial=Eh(r,e,t)}return r}_compileMaterial(e){let t=new Rd(new md,e);this._renderer.compile(t,mh)}_sceneToCubeUV(e,t,n,r,i){let a=new xm(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(hh),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Rd(new af,new Ed({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(hh),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Th(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=kh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Oh());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Th(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,mh)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-uh?n-d+uh:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,Th(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,mh),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,Th(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,mh)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];Th(t,3*l*(r>this._lodMax-uh?r-this._lodMax+uh:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,mh)}};function Ch(e){let t=[],n=[],r=e,i=e-uh+1+dh;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?xh.set(1,r,n):e===1?xh.set(-n,1,-r):e===2?xh.set(-n,r,1):e===3?xh.set(-1,r,-n):e===4?xh.set(-n,-1,r):xh.set(n,r,-1),xh.toArray(l,(e*6+t)*3)}}let u=new md;u.setAttribute(`position`,new $u(c,3)),u.setAttribute(`outputDirection`,new $u(l,3)),n.push(new Rd(u,null)),r>uh&&r--}return{lodMeshes:n,sizeLods:t}}function wh(e,t,n){let r=new Fl(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Th(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Eh(e,t,n){return new Rp({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:ph,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ah(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Dh(e,t,n){return new Rp({name:`SphericalGaussianBlur`,defines:{SAMPLES:fh,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Ah(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Oh(){return new Rp({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Ah(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function kh(){return new Rp({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ah(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ah(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var jh=class extends Fl{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new ef(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new af(5,5,5),i=new Rp({name:`CubemapFromEquirect`,uniforms:Ap(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new Rd(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=ss),new Om(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function Mh(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new jh(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Sh(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Sh(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Nh(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Rc(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Ph(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?td:ed)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Fh(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Ih(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:K(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Lh(e,t,n){let r=new WeakMap,i=new Nl;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new Il(h,p,m,u);g.type=gs,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new q(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Rh(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var zh={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Bh(e,t,n,r,i,a){let o=new Fl(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new md;l.setAttribute(`position`,new nd([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new nd([0,2,0,0,2,0],2));let u=new zp({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Rd(l,u),f=new Sm(-1,1,1,-1,0,1),p=null,m=null,h=!1,g,_=null,v=[],y=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<v.length;n++){let r=v[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){v=e,y=v.length>0&&v[0].isRenderPass===!0;let t=o.width,n=o.height;v.length>0&&s===null&&(s=new Fl(t,n,{type:_s,depthBuffer:!1,stencilBuffer:!1}),c=new Fl(t,n,{type:_s,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<v.length;e++){let r=v[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&v.length===0)return!1;if(_=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return y===!1&&e.setRenderTarget(o),g=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return y},this.end=function(e,t){e.toneMapping=g,h=!0;let n=o,r=s;for(let i=0;i<v.length;i++){let a=v[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},Sl.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=zh[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(_),e.render(d,f),_=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var Vh=new Ml,Hh=new tf(1,1),Uh=new Il,Wh=new Ll,Gh=new ef,Kh=[],qh=[],Jh=new Float32Array(16),Yh=new Float32Array(9),Xh=new Float32Array(4);function Zh(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Kh[i];if(a===void 0&&(a=new Float32Array(i),Kh[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Qh(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function $h(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function eg(e,t){let n=qh[t];n===void 0&&(n=new Int32Array(t),qh[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function tg(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function ng(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Qh(n,t))return;e.uniform2fv(this.addr,t),$h(n,t)}}function rg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Qh(n,t))return;e.uniform3fv(this.addr,t),$h(n,t)}}function ig(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Qh(n,t))return;e.uniform4fv(this.addr,t),$h(n,t)}}function ag(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Qh(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),$h(n,t)}else{if(Qh(n,r))return;Xh.set(r),e.uniformMatrix2fv(this.addr,!1,Xh),$h(n,r)}}function og(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Qh(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),$h(n,t)}else{if(Qh(n,r))return;Yh.set(r),e.uniformMatrix3fv(this.addr,!1,Yh),$h(n,r)}}function sg(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Qh(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),$h(n,t)}else{if(Qh(n,r))return;Jh.set(r),e.uniformMatrix4fv(this.addr,!1,Jh),$h(n,r)}}function cg(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function lg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Qh(n,t))return;e.uniform2iv(this.addr,t),$h(n,t)}}function ug(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Qh(n,t))return;e.uniform3iv(this.addr,t),$h(n,t)}}function dg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Qh(n,t))return;e.uniform4iv(this.addr,t),$h(n,t)}}function fg(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function pg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Qh(n,t))return;e.uniform2uiv(this.addr,t),$h(n,t)}}function mg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Qh(n,t))return;e.uniform3uiv(this.addr,t),$h(n,t)}}function hg(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Qh(n,t))return;e.uniform4uiv(this.addr,t),$h(n,t)}}function gg(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Hh.compareFunction=n.isReversedDepthBuffer()?518:515,a=Hh):a=Vh,n.setTexture2D(t||a,i)}function _g(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Wh,i)}function vg(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Gh,i)}function yg(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Uh,i)}function bg(e){switch(e){case 5126:return tg;case 35664:return ng;case 35665:return rg;case 35666:return ig;case 35674:return ag;case 35675:return og;case 35676:return sg;case 5124:case 35670:return cg;case 35667:case 35671:return lg;case 35668:case 35672:return ug;case 35669:case 35673:return dg;case 5125:return fg;case 36294:return pg;case 36295:return mg;case 36296:return hg;case 35678:case 36198:case 36298:case 36306:case 35682:return gg;case 35679:case 36299:case 36307:return _g;case 35680:case 36300:case 36308:case 36293:return vg;case 36289:case 36303:case 36311:case 36292:return yg}}function xg(e,t){e.uniform1fv(this.addr,t)}function Sg(e,t){let n=Zh(t,this.size,2);e.uniform2fv(this.addr,n)}function Cg(e,t){let n=Zh(t,this.size,3);e.uniform3fv(this.addr,n)}function wg(e,t){let n=Zh(t,this.size,4);e.uniform4fv(this.addr,n)}function Tg(e,t){let n=Zh(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Eg(e,t){let n=Zh(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Dg(e,t){let n=Zh(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Og(e,t){e.uniform1iv(this.addr,t)}function kg(e,t){e.uniform2iv(this.addr,t)}function Ag(e,t){e.uniform3iv(this.addr,t)}function jg(e,t){e.uniform4iv(this.addr,t)}function Mg(e,t){e.uniform1uiv(this.addr,t)}function Ng(e,t){e.uniform2uiv(this.addr,t)}function Pg(e,t){e.uniform3uiv(this.addr,t)}function Fg(e,t){e.uniform4uiv(this.addr,t)}function Ig(e,t,n){let r=this.cache,i=t.length,a=eg(n,i);Qh(r,a)||(e.uniform1iv(this.addr,a),$h(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Hh:Vh;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Lg(e,t,n){let r=this.cache,i=t.length,a=eg(n,i);Qh(r,a)||(e.uniform1iv(this.addr,a),$h(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Wh,a[e])}function Rg(e,t,n){let r=this.cache,i=t.length,a=eg(n,i);Qh(r,a)||(e.uniform1iv(this.addr,a),$h(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Gh,a[e])}function zg(e,t,n){let r=this.cache,i=t.length,a=eg(n,i);Qh(r,a)||(e.uniform1iv(this.addr,a),$h(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Uh,a[e])}function Bg(e){switch(e){case 5126:return xg;case 35664:return Sg;case 35665:return Cg;case 35666:return wg;case 35674:return Tg;case 35675:return Eg;case 35676:return Dg;case 5124:case 35670:return Og;case 35667:case 35671:return kg;case 35668:case 35672:return Ag;case 35669:case 35673:return jg;case 5125:return Mg;case 36294:return Ng;case 36295:return Pg;case 36296:return Fg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ig;case 35679:case 36299:case 36307:return Lg;case 35680:case 36300:case 36308:case 36293:return Rg;case 36289:case 36303:case 36311:case 36292:return zg}}var Vg=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=bg(t.type)}},Hg=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Bg(t.type)}},Ug=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Wg=/(\w+)(\])?(\[|\.)?/g;function Gg(e,t){e.seq.push(t),e.map[t.id]=t}function Kg(e,t,n){let r=e.name,i=r.length;for(Wg.lastIndex=0;;){let a=Wg.exec(r),o=Wg.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Gg(n,l===void 0?new Vg(s,e,t):new Hg(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Ug(s),Gg(n,e)),n=e}}}var qg=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Kg(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Jg(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Yg=37297,Xg=0;function Zg(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Qg=new Y;function $g(e){Sl._getMatrix(Qg,Sl.workingColorSpace,e);let t=`mat3( ${Qg.elements.map(e=>e.toFixed(4))} )`;switch(Sl.getTransfer(e)){case Tc:return[t,`LinearTransferOETF`];case Ec:return[t,`sRGBTransferOETF`];default:return G(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function e_(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Zg(e.getShaderSource(t),r)}return i}function t_(e,t){let n=$g(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var n_={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function r_(e,t){let n=n_[t];return n===void 0?(G(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var i_=new J;function a_(){return Sl.getLuminanceCoefficients(i_),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${i_.x.toFixed(4)}, ${i_.y.toFixed(4)}, ${i_.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function o_(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(l_).join(`
`)}function s_(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function c_(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function l_(e){return e!==``}function u_(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function d_(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var f_=/^[ \t]*#include +<([\w\d./]+)>/gm;function p_(e){return e.replace(f_,h_)}var m_=new Map;function h_(e,t){let n=Z[t];if(n===void 0){let e=m_.get(t);if(e!==void 0)n=Z[e],G(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return p_(n)}var g_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function __(e){return e.replace(g_,v_)}function v_(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function y_(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var b_={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function x_(e){return b_[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var S_={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function C_(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:S_[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var w_={302:`ENVMAP_MODE_REFRACTION`};function T_(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:w_[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var E_={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function D_(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:E_[e.combine]||`ENVMAP_BLENDING_NONE`}function O_(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function k_(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=x_(n),l=C_(n),u=T_(n),d=D_(n),f=O_(n),p=o_(n),m=s_(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(l_).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(l_).join(`
`),_.length>0&&(_+=`
`)):(g=[y_(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(l_).join(`
`),_=[y_(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Z.tonemapping_pars_fragment,n.toneMapping===0?``:r_(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Z.colorspace_pars_fragment,t_(`linearToOutputTexel`,n.outputColorSpace),a_(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(l_).join(`
`)),o=p_(o),o=u_(o,n),o=d_(o,n),s=p_(s),s=u_(s,n),s=d_(s,n),o=__(o),s=__(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Jg(i,i.VERTEX_SHADER,y),S=Jg(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=e_(i,x,`vertex`),n=e_(i,S,`fragment`);K(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):G(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new qg(i,h),T=c_(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Yg)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Xg++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var A_=0,j_=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new M_(e),t.set(e,n)),n}},M_=class{constructor(e){this.id=A_++,this.code=e,this.usedTimes=0}};function N_(e){return e===1030||e===37490||e===36285}function P_(e,t,n,r,i,a){let o=new Yl,s=new j_,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&G(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=th[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let j=e.getRenderTarget(),M=e.state.buffers.depth.getReversed(),N=h.isInstancedMesh===!0,P=h.isBatchedMesh===!0,ee=!!i.map,F=!!i.matcap,I=!!x,te=!!i.aoMap,ne=!!i.lightMap,re=!!i.bumpMap&&i.wireframe===!1,L=!!i.normalMap,ie=!!i.displacementMap,ae=!!i.emissiveMap,oe=!!i.metalnessMap,se=!!i.roughnessMap,ce=i.anisotropy>0,le=i.clearcoat>0,ue=i.dispersion>0,de=i.retroreflectivity>0,fe=i.iridescence>0,pe=i.sheen>0,me=i.transmission>0,he=ce&&!!i.anisotropyMap,ge=le&&!!i.clearcoatMap,_e=le&&!!i.clearcoatNormalMap,R=le&&!!i.clearcoatRoughnessMap,ve=fe&&!!i.iridescenceMap,z=fe&&!!i.iridescenceThicknessMap,ye=pe&&!!i.sheenColorMap,be=pe&&!!i.sheenRoughnessMap,xe=!!i.specularMap,B=!!i.specularColorMap,Se=!!i.specularIntensityMap,V=me&&!!i.transmissionMap,Ce=me&&!!i.thicknessMap,we=!!i.gradientMap,H=!!i.alphaMap,Te=i.alphaTest>0,U=!!i.alphaHash,Ee=!!i.extensions,De=0;i.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(De=e.toneMapping);let Oe={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:P,batchingColor:P&&h._colorsTexture!==null,instancing:N,instancingColor:N&&h.instanceColor!==null,instancingMorph:N&&h.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Sl.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:ee,matcap:F,envMap:I,envMapMode:I&&x.mapping,envMapCubeUVHeight:S,aoMap:te,lightMap:ne,bumpMap:re,normalMap:L,displacementMap:ie,emissiveMap:ae,normalMapObjectSpace:L&&i.normalMapType===1,normalMapTangentSpace:L&&i.normalMapType===0,packedNormalMap:L&&i.normalMapType===0&&N_(i.normalMap.format),metalnessMap:oe,roughnessMap:se,anisotropy:ce,anisotropyMap:he,clearcoat:le,clearcoatMap:ge,clearcoatNormalMap:_e,clearcoatRoughnessMap:R,dispersion:ue,retroreflection:de,iridescence:fe,iridescenceMap:ve,iridescenceThicknessMap:z,sheen:pe,sheenColorMap:ye,sheenRoughnessMap:be,specularMap:xe,specularColorMap:B,specularIntensityMap:Se,transmission:me,transmissionMap:V,thicknessMap:Ce,gradientMap:we,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:H,alphaTest:Te,alphaHash:U,combine:i.combine,mapUv:ee&&m(i.map.channel),aoMapUv:te&&m(i.aoMap.channel),lightMapUv:ne&&m(i.lightMap.channel),bumpMapUv:re&&m(i.bumpMap.channel),normalMapUv:L&&m(i.normalMap.channel),displacementMapUv:ie&&m(i.displacementMap.channel),emissiveMapUv:ae&&m(i.emissiveMap.channel),metalnessMapUv:oe&&m(i.metalnessMap.channel),roughnessMapUv:se&&m(i.roughnessMap.channel),anisotropyMapUv:he&&m(i.anisotropyMap.channel),clearcoatMapUv:ge&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:_e&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:R&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:z&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:ye&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:be&&m(i.sheenRoughnessMap.channel),specularMapUv:xe&&m(i.specularMap.channel),specularColorMapUv:B&&m(i.specularColorMap.channel),specularIntensityMapUv:Se&&m(i.specularIntensityMap.channel),transmissionMapUv:V&&m(i.transmissionMap.channel),thicknessMapUv:Ce&&m(i.thicknessMap.channel),alphaMapUv:H&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(L||ce),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(ee||H),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&L===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:M,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:De,decodeVideoTexture:ee&&i.map.isVideoTexture===!0&&Sl.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ae&&i.emissiveMap.isVideoTexture===!0&&Sl.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Ee&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ee&&i.extensions.multiDraw===!0||P)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Oe.vertexUv1s=c.has(1),Oe.vertexUv2s=c.has(2),Oe.vertexUv3s=c.has(3),c.clear(),Oe}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=th[t];n=Fp.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new k_(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function F_(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function I_(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function L_(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function R_(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||I_),r.length>1&&r.sort(t||L_),i.length>1&&i.sort(t||L_)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function z_(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new R_,e.set(t,[i])):n>=r.length?(i=new R_,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function B_(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new J,color:new X};break;case`SpotLight`:n={position:new J,direction:new J,color:new X,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new J,color:new X,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new J,skyColor:new X,groundColor:new X};break;case`RectAreaLight`:n={color:new X,position:new J,halfWidth:new J,halfHeight:new J}}return e[t.id]=n,n}}}function V_(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var H_=0;function U_(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function W_(e){let t=new B_,n=V_(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new J);let i=new J,a=new Rl,o=new Rl;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(U_);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Q.LTC_FLOAT_1,r.rectAreaLTC2=Q.LTC_FLOAT_2):(r.rectAreaLTC1=Q.LTC_HALF_1,r.rectAreaLTC2=Q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=H_++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function G_(e){let t=new W_(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function K_(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new G_(e),t.set(n,[a])):r>=i.length?(a=new G_(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var q_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,J_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Y_=[new J(1,0,0),new J(-1,0,0),new J(0,1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1)],X_=[new J(0,-1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1),new J(0,-1,0),new J(0,-1,0)],Z_=new Rl,Q_=new J,$_=new J;function ev(e,t,n){let r=new Kd,i=new q,a=new q,o=new Nl,s=new Vp,c=new Hp,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Rp({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new q},radius:{value:4}},vertexShader:q_,fragmentShader:J_}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new md;m.setAttribute(`position`,new $u(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new Rd(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(G(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){G(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){G(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new Fl(i.x,i.y,{format:As,type:_s,minFilter:ss,magFilter:ss,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new tf(i.x,i.y,gs),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Es,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=is,d.map.depthTexture.magFilter=is}else l.isPointLight?(d.map=new jh(i.x),d.map.depthTexture=new nf(i.x,hs)):(d.map=new Fl(i.x,i.y),d.map.depthTexture=new tf(i.x,i.y,hs)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Es,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=ss,d.map.depthTexture.magFilter=ss):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=is,d.map.depthTexture.magFilter=is);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Q_.setFromMatrixPosition(l.matrixWorld),e.position.copy(Q_),$_.copy(e.position),$_.add(Y_[t]),e.up.copy(X_[t]),e.lookAt($_),e.updateMatrixWorld(),n.makeTranslation(-Q_.x,-Q_.y,-Q_.z),Z_.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(Z_,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new Fl(i.x,i.y,{format:As,type:_s}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function tv(e,t){function n(){let t=!1,n=new Nl,r=null,i=new Nl(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?oe(e.DEPTH_TEST):se(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Bc[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?oe(e.STENCIL_TEST):se(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new X(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,M=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),N=!1,P=0,ee=e.getParameter(e.VERSION);ee.indexOf(`WebGL`)===-1?ee.indexOf(`OpenGL ES`)!==-1&&(P=parseFloat(/^OpenGL ES (\d)/.exec(ee)[1]),N=P>=2):(P=parseFloat(/^WebGL (\d)/.exec(ee)[1]),N=P>=1);let F=null,I={},te=e.getParameter(e.SCISSOR_BOX),ne=e.getParameter(e.VIEWPORT),re=new Nl().fromArray(te),L=new Nl().fromArray(ne);function ie(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ae={};ae[e.TEXTURE_2D]=ie(e.TEXTURE_2D,e.TEXTURE_2D,1),ae[e.TEXTURE_CUBE_MAP]=ie(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ae[e.TEXTURE_2D_ARRAY]=ie(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ae[e.TEXTURE_3D]=ie(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),oe(e.DEPTH_TEST),o.setFunc(3),he(!1),ge(1),oe(e.CULL_FACE),pe(0);function oe(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function se(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ce(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function le(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ue(t){return h!==t&&(e.useProgram(t),h=t,!0)}let de={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};de[103]=e.MIN,de[104]=e.MAX;let fe={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function pe(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(se(e.BLEND),g=!1);return}if(g===!1&&(oe(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:K(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:K(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:K(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:K(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(de[n],de[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(fe[r],fe[i],fe[o],fe[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function me(t,n){t.side===2?se(e.CULL_FACE):oe(e.CULL_FACE);let r=t.side===1;n&&(r=!r),he(r),t.blending===1&&t.transparent===!1?pe(0):pe(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),R(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?oe(e.SAMPLE_ALPHA_TO_COVERAGE):se(e.SAMPLE_ALPHA_TO_COVERAGE)}function he(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ge(t){t===0?se(e.CULL_FACE):(oe(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function _e(t){t!==k&&(N&&e.lineWidth(t),k=t)}function R(t,n,r){t?(oe(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):se(e.POLYGON_OFFSET_FILL)}function ve(t){t?oe(e.SCISSOR_TEST):se(e.SCISSOR_TEST)}function z(t){t===void 0&&(t=e.TEXTURE0+M-1),F!==t&&(e.activeTexture(t),F=t)}function ye(t,n,r){r===void 0&&(r=F===null?e.TEXTURE0+M-1:F);let i=I[r];i===void 0&&(i={type:void 0,texture:void 0},I[r]=i),(i.type!==t||i.texture!==n)&&(F!==r&&(e.activeTexture(r),F=r),e.bindTexture(t,n||ae[t]),i.type=t,i.texture=n)}function be(){let t=I[F];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function xe(){try{e.compressedTexImage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function B(){try{e.compressedTexImage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function Se(){try{e.texSubImage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function V(){try{e.texSubImage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function Ce(){try{e.compressedTexSubImage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function we(){try{e.compressedTexSubImage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function H(){try{e.texStorage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function Te(){try{e.texStorage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function U(){try{e.texImage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function Ee(){try{e.texImage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function De(t){return d[t]===void 0?e.getParameter(t):d[t]}function Oe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function ke(t){re.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),re.copy(t))}function Ae(t){L.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),L.copy(t))}function je(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Me(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Ne(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},F=null,I={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new X(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,re.set(0,0,e.canvas.width,e.canvas.height),L.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:oe,disable:se,bindFramebuffer:ce,drawBuffers:le,useProgram:ue,setBlending:pe,setMaterial:me,setFlipSided:he,setCullFace:ge,setLineWidth:_e,setPolygonOffset:R,setScissorTest:ve,activeTexture:z,bindTexture:ye,unbindTexture:be,compressedTexImage2D:xe,compressedTexImage3D:B,texImage2D:U,texImage3D:Ee,pixelStorei:Oe,getParameter:De,updateUBOMapping:je,uniformBlockBinding:Me,texStorage2D:H,texStorage3D:Te,texSubImage2D:Se,texSubImage3D:V,compressedTexSubImage2D:Ce,compressedTexSubImage3D:we,scissor:ke,viewport:Ae,reset:Ne}}function nv(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new q,u=new WeakMap,d=new Set,f,p=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function h(e,t){return m?new OffscreenCanvas(e,t):Nc(`canvas`)}function g(e,t,n){let r=1,i=xe(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=h(n,a));let o=t?h(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),G(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&G(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function _(e){return e.generateMipmaps}function v(t){e.generateMipmap(t)}function y(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function b(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];G(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||G(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Tc:Sl.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function x(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,G(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function S(e,t){return _(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),T(t),t.isVideoTexture&&u.delete(t),t.isHTMLTexture&&d.delete(t)}function w(e){let t=e.target;t.removeEventListener(`dispose`,w),D(t)}function T(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&E(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function E(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function D(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let O=0;function k(){O=0}function A(){return O}function j(e){O=e}function M(){let e=O;return e>=i.maxTextures&&G(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),O+=1,e}function N(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function P(t,i){let a=r.get(t);if(t.isVideoTexture&&ye(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)G(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)G(`WebGLRenderer: Texture marked for update but image is incomplete`);else{se(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ee(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){se(a,t,i);return}t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function F(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){se(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function I(t,i){let a=r.get(t);if(t.isCubeDepthTexture!==!0&&t.version>0&&a.__version!==t.version){ce(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let te={[ts]:e.REPEAT,[ns]:e.CLAMP_TO_EDGE,[rs]:e.MIRRORED_REPEAT},ne={[is]:e.NEAREST,[as]:e.NEAREST_MIPMAP_NEAREST,[os]:e.NEAREST_MIPMAP_LINEAR,[ss]:e.LINEAR,[cs]:e.LINEAR_MIPMAP_NEAREST,[ls]:e.LINEAR_MIPMAP_LINEAR},re={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function L(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&G(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,te[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,te[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,te[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,ne[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,ne[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,re[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ie(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,C));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=N(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&E(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ae(e,t,n){return Math.floor(Math.floor(e/n)/t)}function oe(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ae(n.start,r.width,4),c=ae(t.start,r.width,4);n.start<=i+1&&a===c&&ae(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function se(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=ie(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=Sl.getPrimaries(Sl.workingColorSpace),r=o.colorSpace===``?null:Sl.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=g(o.image,!1,i.maxTextureSize);t=be(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=b(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);L(c,o);let h,y=o.mipmaps,C=o.isVideoTexture!==!0,w=f.__version===void 0||l===!0,T=u.dataReady,E=S(o,t);if(o.isDepthTexture)m=x(o.format===Ds,o.type),w&&(C?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(y.length>0){C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else C?(w&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&oe(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){C&&w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,y[0].width,y[0].height,t.depth);for(let i=0,a=y.length;i<a;i++)if(h=y[i],o.format!==1023){if(r!==null){if(C){if(T){if(o.layerUpdates.size>0){let t=Zm(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else G(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else C?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],o.format===1023?C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?G(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):C?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(C){if(w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=Zm(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)C?(w&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(w){if(C)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(y.length>0){if(C&&w){let t=xe(y[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(C){if(w){let r=xe(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);_(o)&&v(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ce(t,o,s){if(o.image.length!==6)return;let c=ie(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=Sl.getPrimaries(Sl.workingColorSpace),r=o.colorSpace===``?null:Sl.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=g(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=be(o,m[e]);let h=m[0],y=a.convert(o.format,o.colorSpace),x=a.convert(o.type),C=b(o.internalFormat,y,x,o.normalized,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=S(o,h);L(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,h.width,h.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,y,x,i.data):y===null?G(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=xe(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,y,x,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,y,x,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,y,x,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,y,x,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,y,x,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,y,x,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,y,x,i.image[t])}}}_(o)&&v(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function le(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=b(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,ve(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function ue(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=x(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;z(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ve(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ve(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=b(o.internalFormat,c,l,o.normalized,o.colorSpace);z(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ve(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ve(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function de(t,i,o){let c=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let l=r.get(i.depthTexture);if(l.__renderTarget=i,(!l.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),c){if(l.__webglInit===void 0&&(l.__webglInit=!0,i.depthTexture.addEventListener(`dispose`,C)),l.__webglTexture===void 0){l.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,l.__webglTexture),L(e.TEXTURE_CUBE_MAP,i.depthTexture);let t=a.convert(i.depthTexture.format),r=a.convert(i.depthTexture.type),o;i.depthTexture.format===1026?o=e.DEPTH_COMPONENT24:i.depthTexture.format===1027&&(o=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,o,i.width,i.height,0,t,r,null)}}else P(i.depthTexture,0);let u=l.__webglTexture,d=ve(i),f=c?e.TEXTURE_CUBE_MAP_POSITIVE_X+o:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function fe(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)de(i.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?de(i.__webglFramebuffer[0],t,0):de(i.__webglFramebuffer,t,0)}}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),ue(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),ue(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function pe(t,n,i){let a=r.get(t);n!==void 0&&le(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&fe(t)}function me(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,w);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&z(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=b(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=ve(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),ue(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),L(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)le(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else le(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);_(i)&&v(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),L(c,a),le(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),_(a)&&v(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),L(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)le(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else le(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);_(i)&&v(r),n.unbindTexture()}t.depthBuffer&&fe(t)}function he(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(_(a)){let t=y(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),v(t),n.unbindTexture()}}}let ge=[],_e=[];function R(t){if(t.samples>0){if(z(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(ge.length=0,_e.length=0,ge.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&(ge.push(l),_e.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,_e)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ge))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function ve(e){return Math.min(i.maxSamples,e.samples)}function z(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function ye(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function be(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Sl.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&G(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):K(`WebGLTextures: Unsupported texture color space:`,n)),t}function xe(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=M,this.resetTextureUnits=k,this.getTextureUnits=A,this.setTextureUnits=j,this.setTexture2D=P,this.setTexture2DArray=ee,this.setTexture3D=F,this.setTextureCube=I,this.rebindTextures=pe,this.setupRenderTarget=me,this.updateRenderTargetMipmap=he,this.updateMultisampleRenderTarget=R,this.setupDepthRenderbuffer=fe,this.setupFrameBufferTexture=le,this.useMultisampledRTT=z,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function rv(e,t){function n(n,r=``){let i,a=Sl.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var iv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,av=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,ov=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new rf(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Rp({vertexShader:iv,fragmentShader:av,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Rd(new Op(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},sv=class extends Vc{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new ov,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new q,C=null,w=null,T=new xm;T.viewport=new Nl;let E=new xm;E.viewport=new Nl;let D=[T,E],O=new km,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new mu,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new mu,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new mu,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function M(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,M),r.removeEventListener(`inputsourceschange`,N);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,L.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&G(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&G(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,M),r.addEventListener(`inputsourceschange`,N),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Ds:Es,a=_.stencil?bs:hs);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new Fl(d.textureWidth,d.textureHeight,{format:Ts,type:us,depthTexture:new tf(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Fl(f.framebufferWidth,f.framebufferHeight,{format:Ts,type:us,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),L.setContext(r),L.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function N(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let P=new J,ee=new J;function F(e,t,n){P.setFromMatrixPosition(t.matrixWorld),ee.setFromMatrixPosition(n.matrixWorld);let r=P.distanceTo(ee),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function I(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;I(O,i);for(let e=0;e<a.length;e++)I(a[e],i);a.length===2?F(O,T,E):O.projectionMatrix.copy(T.projectionMatrix),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),te(e,O,i)};function te(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Gc*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let ne=null;function re(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new xm,o.layers.enable(n),o.viewport=new Nl,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new rf,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}ne&&ne(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let L=new $m;L.setAnimationLoop(re),this.setAnimationLoop=function(e){ne=e},this.dispose=function(){}}},cv=new Rl,lv=new Y;lv.set(-1,0,0,0,1,0,0,0,1);function uv(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Pp(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(cv.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(lv),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function dv(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return K(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?G(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):G(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var fv=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),pv=null;function mv(){return pv===null&&(pv=new Vd(fv,16,16,As,_s),pv.name=`DFG_LUT`,pv.minFilter=ss,pv.magFilter=ss,pv.wrapS=ns,pv.wrapT=ns,pv.generateMipmaps=!1,pv.needsUpdate=!0),pv}var hv=class{constructor(e={}){let{canvas:t=Pc(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=us}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([Ms,js,ks]),g=new Set([us,hs,ps,bs,vs,ys]),_=new Uint32Array(4),v=new Int32Array(4),y=new J,b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=Cc;let j=0,M=0,N=null,P=-1,ee=null,F=new Nl,I=new Nl,te=null,ne=new X(0),re=0,L=t.width,ie=t.height,ae=1,oe=null,se=null,ce=new Nl(0,0,L,ie),le=new Nl(0,0,L,ie),ue=!1,de=new Kd,fe=!1,pe=!1,me=new Rl,he=new J,ge=new Nl,_e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},R=!1;function ve(){return N===null?ae:1}let z=n;function ye(e,n){return t.getContext(e,n)}let be,xe,B,Se,V,Ce,we,H,Te,U,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,Ve,!1),t.addEventListener(`webglcontextrestored`,He,!1),t.addEventListener(`webglcontextcreationerror`,Ue,!1),z===null){let t=`webgl2`;if(z=ye(t,e),z===null)throw ye(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}ze()}catch(e){throw t.removeEventListener(`webglcontextlost`,Ve,!1),t.removeEventListener(`webglcontextrestored`,He,!1),t.removeEventListener(`webglcontextcreationerror`,Ue,!1),K(`WebGLRenderer: `+e.message),e}function ze(){be=new Nh(z),be.init(),Ie=new rv(z,be),xe=new ch(z,be,e,Ie),B=new tv(z,be),xe.reversedDepthBuffer&&d&&B.buffers.depth.setReversed(!0),O=z.createFramebuffer(),k=z.createFramebuffer(),A=z.createFramebuffer(),Se=new Ih(z),V=new F_,Ce=new nv(z,be,B,V,xe,Ie,Se),we=new Mh(T),H=new eh(z),Le=new oh(z,H),Te=new Ph(z,H,Se,Le),U=new Rh(z,Te,H,Le,Se),Ne=new Lh(z,xe,Ce),Ae=new lh(V),Ee=new P_(T,we,be,xe,Le,Ae),De=new uv(T,V),Oe=new z_,ke=new K_(be),Me=new ah(T,we,B,U,p,s),je=new ev(T,U,xe),Re=new dv(z,Se,xe,B),Pe=new sh(z,be,Se),Fe=new Fh(z,be,Se),Se.programs=Ee.programs,T.capabilities=xe,T.extensions=be,T.properties=V,T.renderLists=Oe,T.shadowMap=je,T.state=B,T.info=Se}m!==1009&&(w=new Bh(m,t.width,t.height,o,r,i));let Be=new sv(T,z);this.xr=Be,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let e=be.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=be.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ae},this.setPixelRatio=function(e){e!==void 0&&(ae=e,this.setSize(L,ie,!1))},this.getSize=function(e){return e.set(L,ie)},this.setSize=function(e,n,r=!0){if(Be.isPresenting){G(`WebGLRenderer: Can't change size while VR device is presenting.`);return}L=e,ie=n,t.width=Math.floor(e*ae),t.height=Math.floor(n*ae),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(L*ae,ie*ae).floor()},this.setDrawingBufferSize=function(e,n,r){L=e,ie=n,ae=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009){K(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){G(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(F)},this.getViewport=function(e){return e.copy(ce)},this.setViewport=function(e,t,n,r){e.isVector4?ce.set(e.x,e.y,e.z,e.w):ce.set(e,t,n,r),B.viewport(F.copy(ce).multiplyScalar(ae).round())},this.getScissor=function(e){return e.copy(le)},this.setScissor=function(e,t,n,r){e.isVector4?le.set(e.x,e.y,e.z,e.w):le.set(e,t,n,r),B.scissor(I.copy(le).multiplyScalar(ae).round())},this.getScissorTest=function(){return ue},this.setScissorTest=function(e){B.setScissorTest(ue=e)},this.setOpaqueSort=function(e){oe=e},this.setTransparentSort=function(e){se=e},this.getClearColor=function(e){return e.copy(Me.getClearColor())},this.setClearColor=function(){Me.setClearColor(...arguments)},this.getClearAlpha=function(){return Me.getClearAlpha()},this.setClearAlpha=function(){Me.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=h.has(t)}if(e){let e=N.texture.type,t=g.has(e),n=Me.getClearColor(),r=Me.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,z.clearBufferuiv(z.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,z.clearBufferiv(z.COLOR,0,v))}else r|=z.COLOR_BUFFER_BIT}t&&(r|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&z.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Ve,!1),t.removeEventListener(`webglcontextrestored`,He,!1),t.removeEventListener(`webglcontextcreationerror`,Ue,!1),Me.dispose(),Oe.dispose(),ke.dispose(),V.dispose(),we.dispose(),U.dispose(),Le.dispose(),Re.dispose(),Ee.dispose(),Be.dispose(),Be.removeEventListener(`sessionstart`,Xe),Be.removeEventListener(`sessionend`,Ze),Qe.stop()};function Ve(e){e.preventDefault(),Ic(`WebGLRenderer: Context Lost.`),E=!0}function He(){Ic(`WebGLRenderer: Context Restored.`),E=!1;let e=Se.autoReset,t=je.enabled,n=je.autoUpdate,r=je.needsUpdate,i=je.type;ze(),Se.autoReset=e,je.enabled=t,je.autoUpdate=n,je.needsUpdate=r,je.type=i}function Ue(e){K(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function We(e){let t=e.target;t.removeEventListener(`dispose`,We),Ge(t)}function Ge(e){Ke(e),V.remove(e)}function Ke(e){let t=V.get(e).programs;t!==void 0&&(t.forEach(function(e){Ee.releaseProgram(e)}),e.isShaderMaterial&&Ee.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=_e);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=ct(e,t,n,r,i);B.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Te.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Le.setup(i,r,s,n,c);let h,g=Pe;if(c!==null&&(h=H.get(c),g=Fe,g.setIndex(h)),i.isMesh)r.wireframe===!0?(B.setLineWidth(r.wireframeLinewidth*ve()),g.setMode(z.LINES)):g.setMode(z.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),B.setLineWidth(e*ve()),i.isLineSegments?g.setMode(z.LINES):i.isLineLoop?g.setMode(z.LINE_LOOP):g.setMode(z.LINE_STRIP)}else i.isPoints?g.setMode(z.POINTS):i.isSprite&&g.setMode(z.TRIANGLES);if(i.isBatchedMesh){if(be.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?H.get(c).bytesPerElement:1,o=V.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(z,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function qe(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),fe===!0&&Ae.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,it(e,t,r),e.side=0,e.needsUpdate=!0,it(e,t,r),e.side=2):it(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=ke.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),pe=this.localClippingEnabled,fe=Ae.init(this.clippingPlanes,pe),fe===!0&&Ae.setGlobalState(this.clippingPlanes,t),D!==null&&je.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];qe(o,n,t,e),r.add(o)}else qe(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){let t=V.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}be.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Je=null;function Ye(e){Je&&Je(e)}function Xe(){Qe.stop()}function Ze(){Qe.start()}let Qe=new $m;Qe.setAnimationLoop(Ye),typeof self<`u`&&Qe.setContext(self),this.setAnimationLoop=function(e){Je=e,Be.setAnimationLoop(e),e===null?Qe.stop():Qe.start()},Be.addEventListener(`sessionstart`,Xe),Be.addEventListener(`sessionend`,Ze),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){K(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=Be.enabled===!0&&Be.isPresenting===!0,r=w!==null&&(N===null||n)&&w.begin(T,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Be.enabled===!0&&Be.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Be.cameraAutoUpdate===!0&&Be.updateCamera(t),t=Be.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,N),x=ke.get(e,C.length),x.init(t),x.state.textureUnits=Ce.getTextureUnits(),C.push(x),me.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),de.setFromProjectionMatrix(me,Ac,t.reversedDepth),pe=this.localClippingEnabled,fe=Ae.init(this.clippingPlanes,pe),b=Oe.get(e,S.length),b.init(),S.push(b),Be.enabled===!0&&Be.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&$e(e,t,-1/0,T.sortObjects)}$e(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(oe,se),R=Be.enabled===!1||Be.isPresenting===!1||Be.hasDepthSensing()===!1,R&&Me.addToRenderList(b,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),fe===!0&&Ae.beginShadows();let i=x.state.shadowsArray;if(je.render(i,e,t),fe===!0&&Ae.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];tt(n,r,e,a)}R&&Me.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];et(b,e,n,n.viewport)}}else r.length>0&&tt(n,r,e,t),R&&Me.render(e),et(b,e,t)}N!==null&&M===0&&(Ce.updateMultisampleRenderTarget(N),Ce.updateRenderTargetMipmap(N)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),Le.resetDefaultState(),P=-1,ee=null,C.pop(),C.length>0?(x=C[C.length-1],Ce.setTextureUnits(x.state.textureUnits),fe===!0&&Ae.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function $e(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)x.pushLightProbeGrid(e);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(de)){r&&ge.setFromMatrixPosition(e.matrixWorld).applyMatrix4(me);let i=U.update(e),a=e.material;a.visible&&b.push(e,i,a,n,ge.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(de))){let i=U.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),ge.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ge.copy(e.boundingSphere.center)),ge.applyMatrix4(e.matrixWorld).applyMatrix4(me)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,ge.z,s,t)}}else a.visible&&b.push(e,i,a,n,ge.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)$e(i[e],t,n,r)}function et(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),fe===!0&&Ae.setGlobalState(T.clippingPlanes,n),r&&B.viewport(F.copy(r)),i.length>0&&nt(i,t,n),a.length>0&&nt(a,t,n),o.length>0&&nt(o,t,n),B.buffers.depth.setTest(!0),B.buffers.depth.setMask(!0),B.buffers.color.setMask(!0),B.setPolygonOffset(!1)}function tt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=be.has(`EXT_color_buffer_half_float`)||be.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new Fl(1,1,{generateMipmaps:!0,type:e?_s:us,minFilter:ls,samples:Math.max(4,xe.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Sl.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||F;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(ne),re=T.getClearAlpha(),re<1&&T.setClearColor(16777215,.5),T.clear(),R&&Me.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),fe===!0&&Ae.setGlobalState(T.clippingPlanes,r),nt(e,n,r),Ce.updateMultisampleRenderTarget(a),Ce.updateRenderTargetMipmap(a),be.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,rt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(Ce.updateMultisampleRenderTarget(a),Ce.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(ne,re),d!==void 0&&(r.viewport=d),T.toneMapping=u}function nt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&rt(o,t,n,s,l,c)}}function rt(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function it(e,t,n){t.isScene!==!0&&(t=_e);let r=V.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=Ee.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=Ee.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=we.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,We),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return ot(e,s),d}else s.uniforms=Ee.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=Ee.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ae.uniform),ot(e,s),r.needsLights=ut(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=x.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function at(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=qg.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function ot(e,t){let n=V.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function st(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];y.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(y))return n}return null}function ct(e,t,n,r,i){t.isScene!==!0&&(t=_e),Ce.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?T.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:Sl.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=we.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=V.get(r),y=x.state.lights;if(fe===!0&&(pe===!0||e!==ee)){let t=e===ee&&r.id===P;Ae.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ae.numPlanes||v.numIntersection!==Ae.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=x.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;b===!0&&(S=it(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,S,v));let C=!1,w=!1,E=!1,O=S.getUniforms(),k=v.uniforms;if(B.useProgram(S.program)&&(C=!0,w=!0,E=!0),r.id!==P&&(P=r.id,w=!0),v.needsLights){let e=st(x.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,w=!0)}if(C||ee!==e){B.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(z,`projectionMatrix`,e.projectionMatrix),O.setValue(z,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(z,he.setFromMatrixPosition(e.matrixWorld)),xe.logarithmicDepthBuffer&&O.setValue(z,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(z,`isOrthographic`,e.isOrthographicCamera===!0),ee!==e&&(ee=e,w=!0,E=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&O.setValue(z,`sunShadowMap`,y.state.sunShadowMap,Ce),y.state.directionalShadowMap.length>0&&O.setValue(z,`directionalShadowMap`,y.state.directionalShadowMap,Ce),y.state.spotShadowMap.length>0&&O.setValue(z,`spotShadowMap`,y.state.spotShadowMap,Ce),y.state.pointShadowMap.length>0&&O.setValue(z,`pointShadowMap`,y.state.pointShadowMap,Ce)),i.isSkinnedMesh){O.setOptional(z,i,`bindMatrix`),O.setOptional(z,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(z,`boneTexture`,e.boneTexture,Ce))}i.isBatchedMesh&&(O.setOptional(z,i,`batchingTexture`),O.setValue(z,`batchingTexture`,i._matricesTexture,Ce),O.setOptional(z,i,`batchingIdTexture`),O.setValue(z,`batchingIdTexture`,i._indirectTexture,Ce),O.setOptional(z,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(z,`batchingColorTexture`,i._colorsTexture,Ce));let A=n.morphAttributes;if((A.position!==void 0||A.normal!==void 0||A.color!==void 0)&&Ne.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,O.setValue(z,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),k.dfgLUT!==void 0&&(k.dfgLUT.value=mv()),w){if(O.setValue(z,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&lt(k,E),a&&r.fog===!0&&De.refreshFogUniforms(k,a),De.refreshMaterialUniforms(k,r,ae,ie,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;k.probesSH.value=e.texture,k.probesMin.value.copy(e.boundingBox.min),k.probesMax.value.copy(e.boundingBox.max),k.probesResolution.value.copy(e.resolution)}qg.upload(z,at(v),k,Ce)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(qg.upload(z,at(v),k,Ce),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(z,`center`,i.center),O.setValue(z,`modelViewMatrix`,i.modelViewMatrix),O.setValue(z,`normalMatrix`,i.normalMatrix),O.setValue(z,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Re.update(n,S),Re.bind(n,S)}}return S}function lt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function ut(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return M},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=V.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),V.get(e.texture).__webglTexture=t,V.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=V.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,j=t,M=n;let r=null,i=!1,a=!1;if(e){let o=V.get(e);if(o.__useDefaultFramebuffer!==void 0){B.bindFramebuffer(z.FRAMEBUFFER,o.__webglFramebuffer),F.copy(e.viewport),I.copy(e.scissor),te=e.scissorTest,B.viewport(F),B.scissor(I),B.setScissorTest(te),P=-1;return}if(o.__webglFramebuffer===void 0)Ce.setupRenderTarget(e);else if(o.__hasExternalTextures)Ce.rebindTextures(e,V.get(e.texture).__webglTexture,V.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&V.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);Ce.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=V.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&Ce.useMultisampledRTT(e)===!1?V.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,F.copy(e.viewport),I.copy(e.scissor),te=e.scissorTest}else F.copy(ce).multiplyScalar(ae).floor(),I.copy(le).multiplyScalar(ae).floor(),te=ue;if(n!==0&&(r=O),B.bindFramebuffer(z.FRAMEBUFFER,r)&&B.drawBuffers(e,r),B.viewport(F),B.scissor(I),B.setScissorTest(te),i){let r=V.get(e.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=V.get(e.textures[t]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=V.get(e.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,t.__webglTexture,n)}P=-1};function dt(e){let t=V.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=xe.textureFormatReadable(e.format),t.__typeReadable=xe.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){K(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=V.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){B.bindFramebuffer(z.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+s);let u=dt(o);if(u.__formatReadable===!1){K(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){K(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&z.readPixels(t,n,r,i,Ie.convert(c),Ie.convert(l),a)}finally{let e=N===null?null:V.get(N).__webglFramebuffer;B.bindFramebuffer(z.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=V.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){B.bindFramebuffer(z.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+s);let d=dt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,f),z.bufferData(z.PIXEL_PACK_BUFFER,a.byteLength,z.STREAM_READ),z.readPixels(t,n,r,i,Ie.convert(l),Ie.convert(u),0),z.bindBuffer(z.PIXEL_PACK_BUFFER,null);let p=N===null?null:V.get(N).__webglFramebuffer;B.bindFramebuffer(z.FRAMEBUFFER,p);let m=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await zc(z,m,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,f),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,a),z.bindBuffer(z.PIXEL_PACK_BUFFER,null),z.deleteBuffer(f),z.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;Ce.setTexture2D(e,0),z.copyTexSubImage2D(z.TEXTURE_2D,n,0,0,o,s,i,a),B.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Ie.convert(t.format),_=Ie.convert(t.type),v;t.isData3DTexture?(Ce.setTexture3D(t,0),v=z.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(Ce.setTexture2DArray(t,0),v=z.TEXTURE_2D_ARRAY):(Ce.setTexture2D(t,0),v=z.TEXTURE_2D),B.activeTexture(z.TEXTURE0),B.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,t.flipY),B.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),B.pixelStorei(z.UNPACK_ALIGNMENT,t.unpackAlignment);let y=B.getParameter(z.UNPACK_ROW_LENGTH),b=B.getParameter(z.UNPACK_IMAGE_HEIGHT),x=B.getParameter(z.UNPACK_SKIP_PIXELS),S=B.getParameter(z.UNPACK_SKIP_ROWS),C=B.getParameter(z.UNPACK_SKIP_IMAGES);B.pixelStorei(z.UNPACK_ROW_LENGTH,h.width),B.pixelStorei(z.UNPACK_IMAGE_HEIGHT,h.height),B.pixelStorei(z.UNPACK_SKIP_PIXELS,l),B.pixelStorei(z.UNPACK_SKIP_ROWS,u),B.pixelStorei(z.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=V.get(e),r=V.get(t),h=V.get(n.__renderTarget),g=V.get(r.__renderTarget);B.bindFramebuffer(z.READ_FRAMEBUFFER,h.__webglFramebuffer),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,V.get(e).__webglTexture,i,d+n),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,V.get(t).__webglTexture,a,m+n)),z.blitFramebuffer(l,u,o,s,f,p,o,s,z.DEPTH_BUFFER_BIT,z.NEAREST);B.bindFramebuffer(z.READ_FRAMEBUFFER,null),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||V.has(e)){let n=V.get(e),r=V.get(t);B.bindFramebuffer(z.READ_FRAMEBUFFER,k),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,n.__webglTexture,i),T?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,r.__webglTexture,a),i===0?T?z.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):z.copyTexSubImage2D(v,a,f,p,l,u,o,s):z.blitFramebuffer(l,u,o,s,f,p,o,s,z.COLOR_BUFFER_BIT,z.NEAREST);B.bindFramebuffer(z.READ_FRAMEBUFFER,null),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?z.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?z.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):z.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):z.texSubImage2D(z.TEXTURE_2D,a,f,p,o,s,g,_,h);B.pixelStorei(z.UNPACK_ROW_LENGTH,y),B.pixelStorei(z.UNPACK_IMAGE_HEIGHT,b),B.pixelStorei(z.UNPACK_SKIP_PIXELS,x),B.pixelStorei(z.UNPACK_SKIP_ROWS,S),B.pixelStorei(z.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&z.generateMipmap(v),B.unbindTexture()},this.initRenderTarget=function(e){V.get(e).__webglFramebuffer===void 0&&Ce.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?Ce.setTextureCube(e,0):e.isData3DTexture?Ce.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?Ce.setTexture2DArray(e,0):Ce.setTexture2D(e,0),B.unbindTexture()},this.resetState=function(){j=0,M=0,N=null,B.reset(),Le.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Ac}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Sl._getDrawingBufferColorSpace(e),t.unpackColorSpace=Sl._getUnpackColorSpace()}},gv=class e{font;cache=new Map;constructor(e){this.font=e}static async load(t){let n=await(await fetch(t)).arrayBuffer();return new e(es.parse(n))}get ascender(){return this.font.ascender/this.font.unitsPerEm}get descender(){return this.font.descender/this.font.unitsPerEm}get capHeight(){let e=this.font.tables.os2;return e?.sCapHeight?e.sCapHeight/this.font.unitsPerEm:.7}kerning(e,t){let n=this.font.charToGlyph(e),r=this.font.charToGlyph(t);return this.font.getKerningValue(n,r)/this.font.unitsPerEm}glyph(e){let t=this.cache.get(e);if(t)return t;let n=this.font.charToGlyph(e);if(e===`
`||n.index===0){let t={char:e,shapes:[],advance:e===`
`?0:.3,center:new q,empty:!0};return this.cache.set(e,t),t}let r=(n.advanceWidth??this.font.unitsPerEm*.3)/this.font.unitsPerEm,i=n.getPath(0,0,1),a=new Xm,o=0;for(let e of i.commands)switch(e.type){case`M`:a.moveTo(e.x,-e.y),o++;break;case`L`:a.lineTo(e.x,-e.y);break;case`Q`:a.quadraticCurveTo(e.x1,-e.y1,e.x,-e.y);break;case`C`:a.bezierCurveTo(e.x1,-e.y1,e.x2,-e.y2,e.x,-e.y);break;case`Z`:a.currentPath?.closePath()}let s=o>0?a.toShapes():[],c=new Ym;for(let e of s)for(let t of e.getPoints())c.expandByPoint(t);let l={char:e,shapes:s,advance:r,center:s.length?c.getCenter(new q):new q(r/2,.35),empty:s.length===0};return this.cache.set(e,l),l}},_v=[{id:`instrument`,label:`Instrument Serif`,file:`instrument-serif-latin-400-normal.woff`,weight:400},{id:`dmserif`,label:`DM Serif Display`,file:`dm-serif-display-latin-400-normal.woff`,weight:400},{id:`playfair`,label:`Playfair Display`,file:`playfair-display-latin-700-normal.woff`,weight:700},{id:`archivo`,label:`Archivo Black`,file:`archivo-black-latin-400-normal.woff`,weight:400},{id:`pacifico`,label:`Pacifico`,file:`pacifico-latin-400-normal.woff`,weight:400}],vv=new Map,yv=e=>`./fonts/${e.file}`;function bv(e){let t=vv.get(e.id);return t||vv.set(e.id,t=gv.load(yv(e))),t}function xv(){for(let e of _v){let t=new FontFace(`MossMenu-${e.id}`,`url(${yv(e)})`,{weight:String(e.weight)});document.fonts.add(t),t.load().catch(()=>{})}}var Sv={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Cv=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},wv=new Sm(-1,1,1,-1,0,1),Tv=new class extends md{constructor(){super(),this.setAttribute(`position`,new nd([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new nd([0,2,0,0,2,0],2))}},Ev=class{constructor(e){this._mesh=new Rd(Tv,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,wv)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},Dv=class extends Cv{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Rp?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Fp.clone(e.uniforms),this.material=new Rp({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Ev(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Ov=class extends Cv{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},kv=class extends Cv{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},Av=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new q);this._width=n.width,this._height=n.height,t=new Fl(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:_s}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Dv(Sv),this.copyPass.material.blending=0,this.timer=new Am}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}Ov!==void 0&&(r instanceof Ov?n=!0:r instanceof kv&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new q);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},jv=class extends Cv{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new X}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},Mv={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},Nv=class extends Cv{constructor(){super(),this.isOutputPass=!0,this.uniforms=Fp.clone(Mv.uniforms),this.material=new zp({name:Mv.name,uniforms:this.uniforms,vertexShader:Mv.vertexShader,fragmentShader:Mv.fragmentShader}),this._fsQuad=new Ev(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Sl.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Pv=`
uniform float uTime;
uniform float uBirth;
uniform float uDeath;
// per-glyph death timing (fast on Clear) and per-layer size/property from the panel
uniform float uDeathDur;
uniform float uDeathStagger;
uniform vec2 uLayer;
uniform float uGrowDur;
// scales the outward growth stagger (0: every part appears at once)
uniform float uDelayScale;
uniform float uWind;
uniform float uBreath;
uniform vec3 uPointer;
uniform float uPointerStrength;
uniform float uPointerAmount;
uniform vec3 uLightDir;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}


float easeOutBack(float a){
  float c1=1.70158; float c3=c1+1.0; float b=a-1.0;
  return 1.0+c3*b*b*b+c1*b*b;
}

// 0 → 1 with a small overshoot, staggered by the instance's delay.
float growth(float delay){
  float a=clamp((uTime-uBirth-delay*uDelayScale)/uGrowDur,0.0,1.0);
  return easeOutBack(a);
}

// 1 → 0 when the glyph is deleted. Shrinks outer instances first.
uniform float uFadeMode;
varying float vFade;

float deathT(float delay){
  return clamp((uTime-uDeath-delay*0.15*uDeathStagger)/uDeathDur,0.0,1.0);
}

// Scale while dying: backspace shrinks away; Clear (fade mode) only eases down a little.
float survival(float delay){
  float d=deathT(delay);
  return uFadeMode>0.5 ? 1.0-0.12*d : 1.0-d*d;
}

// Opacity while dying (Clear only); fragments dissolve against a dither.
float fadeAlpha(float delay){
  return uFadeMode>0.5 ? 1.0-smoothstep(0.0,1.0,deathT(delay)) : 1.0;
}

// Rolling breeze: correlated in space, so gusts travel across the letters as waves.
vec3 windSway(vec3 w){
  float t=uTime;
  vec2 p=w.xy*1.3;
  float nx=snoise(vec3(p+vec2(-t*0.55,0.0),t*0.22));
  float ny=snoise(vec3(p+vec2(13.7,-t*0.35),t*0.22+9.1));
  // A stronger gust rolls through every ~7–9s.
  float gust=pow(0.5+0.5*sin(t*0.8-w.x*0.9),10.0)*(0.6+0.4*sin(t*0.13));
  return vec3(nx+0.35+gust*1.6,ny*0.8,0.0)*uWind;
}

// Moss leans away from the pointer with a soft falloff.
vec2 pointerPush(vec3 w){
  vec2 d=w.xy-uPointer.xy;
  float r=0.35;
  float f=uPointerStrength*uPointerAmount*exp(-dot(d,d)/(r*r));
  return normalize(d+vec2(1e-4))*f;
}

mat3 basisFromNormal(vec3 n){
  vec3 up=abs(n.y)<0.98?vec3(0.0,1.0,0.0):vec3(1.0,0.0,0.0);
  vec3 t=normalize(cross(up,n));
  vec3 b=cross(n,t);
  return mat3(t,n,b); // columns: x→t, y→n, z→b
}
`,Fv=`
float wrapLight(vec3 n){
  return clamp((dot(normalize(n),uLightDir)+0.55)/1.55,0.0,1.0);
}
`,Iv=`
uniform float uContrast;
vec3 grade(vec3 c){
  vec3 g=pow(max(c,0.0),vec3(1.0/2.2));
  return pow(max((g-0.5)*uContrast+0.5,0.0),vec3(2.2));
}
`,Lv=`
varying float vFade;
float ign(vec2 p){ return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715)))); }
`,Rv=`if(vFade<1.0 && vFade<=ign(gl_FragCoord.xy)) discard;`,zv=`
#include <tonemapping_fragment>
#include <colorspace_fragment>
`,Bv=`
${Pv}
${Fv}
uniform float uHeight;
uniform float uShimmer;
attribute float aH;
attribute vec3 iPos;
attribute vec3 iNormal;
attribute vec4 iData; // x: scale, y: rotation, z: delay, w: seed
varying float vH;
varying float vLight;
varying float vJit;

void main(){
  float g=growth(iData.z)*survival(iData.z);
  vFade=fadeAlpha(iData.z);
  float seed=iData.w;
  float breath=1.0+0.035*uBreath*sin(uTime*1.15+seed*43.0);

  vec3 p=position;
  float c=cos(iData.y), s=sin(iData.y);
  p.xz=mat2(c,-s,s,c)*p.xz;
  p*=iData.x*g*breath*uLayer.x;
  p.y*=uHeight*uLayer.y;

  mat3 B=basisFromNormal(normalize(iNormal));
  vec3 local=iPos+B*p;

  vec4 world=modelMatrix*vec4(iPos,1.0);
  float scale=length(modelMatrix[0].xyz);
  float hh=aH*aH;
  local+=windSway(world.xyz)*hh*iData.x*0.45*uHeight*g;
  local.xy+=pointerPush(world.xyz)*hh*iData.x*1.2*g;

  gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(local,1.0);

  float shimmer=1.0+uShimmer*snoise(vec3(world.xy*0.8,uTime*0.12));
  vLight=wrapLight(iNormal+B*normalize(position+vec3(0.0,0.01,0.0))*0.6)*shimmer;
  vH=aH;
  vJit=fract(seed*13.37);
}
`,Vv=`
${Lv}
uniform vec3 uMossBase;
uniform vec3 uMossMid;
uniform vec3 uMossTip;
uniform float uGlow;
varying float vH;
varying float vLight;
varying float vJit;

void main(){
  ${Rv}
  vec3 col=mix(uMossBase,uMossMid,smoothstep(0.0,0.6,vH));
  col=mix(col,uMossTip,smoothstep(0.5,1.0,vH)*(0.55+0.45*vJit));
  col*=0.82+0.36*vJit;
  float ao=mix(0.42,1.0,smoothstep(0.0,0.8,vH));
  vec3 lit=col*ao*(0.42+0.95*vLight);
  // Fake subsurface glow at the thin tips.
  lit+=uMossTip*(0.12+uGlow*0.9*vJit)*smoothstep(0.7,1.0,vH);
  gl_FragColor=vec4(lit,1.0);
  ${zv}
}
`,Hv=`
attribute vec3 iPos;
attribute vec3 iDir;
attribute vec4 iData; // x: stem length, y: head size, z: delay, w: seed

float stemGrowth(){ return growth(iData.z)*survival(iData.z*0.2); }

vec3 stemPoint(float h, float gs, vec3 sway){
  float len=iData.x*gs*uLayer.y;
  vec3 bend=sway*h*h*len*0.55;
  return iPos+normalize(iDir)*len*h+bend;
}

vec3 stemSway(){
  vec4 world=modelMatrix*vec4(iPos,1.0);
  // Slower, larger arc than the moss + a gentle individual nod.
  float t=uTime;
  vec3 s=windSway(world.xyz)*0.75;
  s.xy+=vec2(sin(t*0.9+iData.w*31.0),cos(t*0.7+iData.w*17.0))*0.18*uWind;
  s.xy+=pointerPush(world.xyz)*1.6;
  return s;
}
`,Uv=`
${Pv}
${Fv}
${Hv}
varying float vH;
varying float vLight;

void main(){
  float gs=stemGrowth();
  vFade=fadeAlpha(iData.z*0.2);
  vec3 sway=stemSway();
  float h=position.y;
  vec3 center=stemPoint(h,gs,sway);
  mat3 B=basisFromNormal(normalize(iDir));
  float r=0.0042*(1.0-0.35*h)*min(gs*1.5,1.0);
  vec3 local=center+B*vec3(position.x,0.0,position.z)*r;
  gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(local,1.0);
  vLight=wrapLight(B*vec3(position.x,0.0,position.z)+vec3(0.0,0.0,0.4));
  vH=h;
}
`,Wv=`
${Lv}
uniform vec3 uStem;
uniform vec3 uMossMid;
varying float vH;
varying float vLight;
void main(){
  ${Rv}
  vec3 col=mix(uMossMid,uStem,smoothstep(0.0,0.35,vH));
  gl_FragColor=vec4(col*(0.45+0.8*vLight),1.0);
  ${zv}
}
`,Gv=`
${Pv}
${Fv}
${Hv}
uniform float uFlowerScale;
attribute float aR;      // 0 centre → 1 petal tip
attribute float aCenter; // 1 for the pollen disc
varying float vR;
varying float vCenter;
varying float vLight;
varying float vJit;

void main(){
  float gs=stemGrowth();
  // Heads pop open right behind the stem.
  float gh=easeOutBack(clamp((uTime-uBirth-iData.z*uDelayScale-uGrowDur*0.25)/(uGrowDur*0.9),0.0,1.0))*survival(0.0);
  vFade=fadeAlpha(0.0);
  vec3 sway=stemSway();
  vec3 tip=stemPoint(1.0,gs,sway);

  vec3 face=normalize(normalize(iDir)+sway*0.35+vec3(0.0,0.0,0.6));
  mat3 B=basisFromNormal(face);

  vec3 p=position;
  float c=cos(iData.w*20.0), s=sin(iData.w*20.0);
  p.xz=mat2(c,-s,s,c)*p.xz;
  // Petals slowly open and relax.
  float open=1.0+0.09*sin(uTime*0.55+iData.w*29.0);
  p.xz*=mix(1.0,open,aR);
  p.y+=aR*aR*0.32*(1.25-open);
  p*=iData.y*gh*uFlowerScale*uLayer.x;

  vec3 local=tip+B*p;
  gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(local,1.0);
  vLight=wrapLight(face);
  vR=aR;
  vCenter=aCenter;
  vJit=fract(iData.w*7.31);
}
`,Kv=`
${Lv}
uniform vec3 uPetalInner;
uniform vec3 uPetalEdge;
uniform vec3 uFlowerCenter;
uniform float uGlow;
varying float vR;
varying float vCenter;
varying float vLight;
varying float vJit;
void main(){
  ${Rv}
  vec3 petal=mix(uPetalInner,uPetalEdge,smoothstep(0.15,1.0,vR)*(0.6+0.4*vJit));
  vec3 col=mix(petal,uFlowerCenter,step(0.5,vCenter));
  // Petals are thin: keep them bright even when facing away from the light.
  vec3 lit=col*(0.68+0.42*vLight+uGlow*0.35);
  gl_FragColor=vec4(lit,1.0);
  ${zv}
}
`,qv=`
${Pv}
${Fv}
attribute vec3 iPos;
attribute vec3 iDir;
attribute vec4 iData; // x: size, y: roll, z: delay, w: seed
varying float vMid;
varying float vLight;
varying float vH;

void main(){
  float g=growth(iData.z)*survival(iData.z);
  vFade=fadeAlpha(iData.z);
  vec4 world=modelMatrix*vec4(iPos,1.0);
  vec3 d=normalize(iDir);
  vec3 side=normalize(abs(d.z)<0.98?cross(d,vec3(0.0,0.0,1.0)):vec3(1.0,0.0,0.0));
  float c=cos(iData.y), s=sin(iData.y);
  vec3 n=cross(side,d);
  side=side*c+n*s;
  n=cross(side,d);

  vec3 p=position; // x: across, y: along
  float curl=(p.x*p.x*1.2-p.y*0.12)*uLayer.y;
  vec3 sway=windSway(world.xyz)*0.6+vec3(pointerPush(world.xyz)*1.4,0.0);
  vec3 local=iPos+(d*p.y+side*p.x+n*curl)*iData.x*uLayer.x*g+sway*p.y*p.y*iData.x*0.45*g;
  gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(local,1.0);
  vLight=wrapLight(n);
  vMid=abs(p.x);
  vH=p.y;
}
`,Jv=`
${Lv}
uniform vec3 uLeaf;
uniform vec3 uMossTip;
varying float vMid;
varying float vLight;
varying float vH;
void main(){
  ${Rv}
  vec3 col=uLeaf*(0.75+0.35*vH);
  col=mix(col,mix(uLeaf,uMossTip,0.4),(1.0-smoothstep(0.0,0.035,vMid))*0.6);
  gl_FragColor=vec4(col*(0.45+0.85*vLight),1.0);
  ${zv}
}
`,Yv=`
uniform float uTime;
uniform float uPixelRatio;
uniform vec3 uBox;
uniform float uFocus;
attribute vec4 aSeed;
varying float vAlpha;
varying float vBlur;

void main(){
  float t=uTime;
  vec3 p=(aSeed.xyz-0.5)*uBox;
  float speed=0.05+aSeed.w*0.08;
  p.y=mod(p.y+uBox.y*0.5+t*speed,uBox.y)-uBox.y*0.5;
  p.x+=sin(t*0.4+aSeed.w*30.0)*0.15;
  p.z+=cos(t*0.3+aSeed.y*20.0)*0.1;
  vec4 mv=viewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*mv;
  float dist=-mv.z;
  float blur=clamp(abs(dist-uFocus)*0.6,0.0,1.0);
  gl_PointSize=uPixelRatio*(2.0+blur*16.0+aSeed.w*2.0)*(6.0/dist);
  float edgeFade=smoothstep(0.5,0.35,abs(p.y/uBox.y));
  vAlpha=edgeFade*(0.9-blur*0.65)*(0.5+0.5*sin(t*1.7+aSeed.x*50.0));
  vBlur=blur;
}
`,Xv=`
uniform vec3 uSporeColor;
uniform float uSporeAmount;
varying float vAlpha;
varying float vBlur;
void main(){
  float d=length(gl_PointCoord-0.5)*2.0;
  float soft=mix(0.15,0.95,vBlur);
  float a=1.0-smoothstep(1.0-soft,1.0,d);
  gl_FragColor=vec4(uSporeColor,a*vAlpha*uSporeAmount);
  ${zv}
}
`,Zv={uniforms:{tDiffuse:{value:null},uDir:{value:[1,0]},uResolution:{value:[1,1]},uFocusCenter:{value:.5},uFocusBand:{value:.12},uAmount:{value:10}},vertexShader:`
    varying vec2 vUv;
    void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform vec2 uDir;
    uniform vec2 uResolution;
    uniform float uFocusCenter;
    uniform float uFocusBand;
    uniform float uAmount;
    varying vec2 vUv;
    void main(){
      float d=max(abs(vUv.y-uFocusCenter)-uFocusBand,0.0);
      float r=uAmount*smoothstep(0.0,0.35,d);
      vec2 step=uDir/uResolution*r/4.0;
      vec4 sum=texture2D(tDiffuse,vUv)*0.1633;
      sum+=texture2D(tDiffuse,vUv+step*1.0)*0.1531;
      sum+=texture2D(tDiffuse,vUv-step*1.0)*0.1531;
      sum+=texture2D(tDiffuse,vUv+step*2.0)*0.12245;
      sum+=texture2D(tDiffuse,vUv-step*2.0)*0.12245;
      sum+=texture2D(tDiffuse,vUv+step*3.0)*0.0918;
      sum+=texture2D(tDiffuse,vUv-step*3.0)*0.0918;
      sum+=texture2D(tDiffuse,vUv+step*4.0)*0.051;
      sum+=texture2D(tDiffuse,vUv-step*4.0)*0.051;
      gl_FragColor=sum;
    }
  `},Qv=`
${Pv}
uniform float uHeight;
uniform float uFlowerScale;
uniform float uShimmer;
attribute float aH;
attribute float aR;
attribute float aCenter;
attribute vec3 iPos;
attribute vec3 iDir;
attribute vec4 iData;
attribute vec4 iExtra;
attribute vec3 iColA;
attribute vec3 iColB;
attribute vec3 iColC;
varying vec3 vColA;
varying vec3 vColB;
varying vec3 vColC;
varying vec3 vNormal;
varying vec3 vView;
varying float vH;
varying float vR;
varying float vCenter;
varying float vJit;
varying float vHover;
varying float vShimmer;

mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c); }

void main(){
  float delay=iData.z;
  float g=growth(delay)*survival(delay);
  vFade=fadeAlpha(delay);
  vec4 world=modelMatrix*vec4(iPos,1.0);
  vec2 push=pointerPush(world.xyz);
  float hover=length(push);
  vec3 sway=windSway(world.xyz);
  vec3 dir=normalize(iDir);
  vec3 p=position;
  vec3 nrm=normal;
  vec3 local;

#if defined(PART_FLOWER)
  // Petals unfold as the flower grows, breathe slowly, and open wider near the pointer.
  float open=smoothstep(0.0,1.0,g);
  float breath=1.0+0.06*uBreath*sin(uTime*0.6+iData.w*31.0);
  float bloom=1.0+0.35*hover;
  p.xz*=mix(0.3,1.0,open)*mix(1.0,breath*bloom,aR)*uLayer.y;
  p.y+=(1.0-open)*aR*0.55;
  p=rotY(iData.y)*p;
  float s=iData.x*uFlowerScale*uLayer.x*g*(1.0+0.12*hover);
  vec3 face=normalize(dir+vec3(0.0,0.0,iExtra.y)+sway*0.12+vec3(push*0.6,0.0));
  mat3 B=basisFromNormal(face);
  vec3 sw=sway*iExtra.x*0.35;
  local=iPos+dir*iExtra.x*g+sw+B*(p*s);
  nrm=B*nrm;
#elif defined(PART_TUFT)
  float breath=1.0+0.035*uBreath*sin(uTime*1.15+iData.w*43.0);
  p=rotY(iData.y)*p;
  p*=iData.x*g*breath*uLayer.x;
  p.y*=uHeight*iExtra.x*uLayer.y;
  mat3 B=basisFromNormal(dir);
  local=iPos+B*p;
  float hh=aH*aH;
  local+=sway*hh*iData.x*0.5*uHeight*g;
  local.xy+=push*hh*iData.x*1.4*g;
  nrm=dir+B*normalize(position+vec3(0.0,0.01,0.0))*0.6;
#elif defined(PART_LEAF)
  vec3 side=normalize(abs(dir.z)<0.98?cross(dir,vec3(0.0,0.0,1.0)):vec3(1.0,0.0,0.0));
  float c=cos(iData.y), sn=sin(iData.y);
  vec3 n=cross(side,dir);
  side=side*c+n*sn;
  n=cross(side,dir);
  float curl=(p.x*p.x*iExtra.y-p.y*0.1)*uLayer.y;
  float s=iData.x*g*uLayer.x;
  local=iPos+(dir*p.y+side*p.x+n*curl)*s;
  local+=(sway*0.5+vec3(push*1.2,0.0))*p.y*p.y*s*0.6;
  nrm=n;
#elif defined(PART_CRYSTAL) || defined(PART_ROCK)
  p=rotY(iData.y)*p;
  p.y*=iExtra.x;
#ifdef PART_ROCK
  p.y*=uLayer.y;
#endif
  mat3 B=basisFromNormal(dir);
  local=iPos+B*(p*iData.x*g*uLayer.x);
  nrm=B*nrm;
#elif defined(PART_TWIG)
  // A gently curving tube along dir, thinning toward the tip.
  float h=position.y;
  float len=iExtra.x*g*uLayer.y;
  vec3 side=normalize(abs(dir.z)<0.98?cross(dir,vec3(0.0,0.0,1.0)):vec3(1.0,0.0,0.0));
  vec3 up=cross(side,dir);
  vec3 center=iPos+dir*len*h+side*sin(h*3.1416)*iExtra.y*len+up*sin(h*6.283+iData.w*9.0)*0.15*iExtra.y*len;
  center+=sway*h*h*len*0.25;
  float r=iExtra.z*uLayer.x*(1.0-0.55*h)*min(1.0,g*2.0);
  vec3 ring=side*position.x+up*position.z;
  local=center+ring*r;
  nrm=ring;
#endif

  vec4 mv=viewMatrix*modelMatrix*vec4(local,1.0);
  gl_Position=projectionMatrix*mv;
  vView=mv.xyz;
  vNormal=normalize(mat3(viewMatrix)*mat3(modelMatrix)*nrm);
  vColA=iColA;
  vColB=iColB;
  vColC=iColC;
  vH=aH;
  vR=aR;
  vCenter=aCenter;
  vJit=fract(iData.w*13.37);
  vHover=hover;
  vShimmer=1.0+uShimmer*snoise(vec3(world.xy*0.8,uTime*0.12));
}
`,$v=`
${Lv}
${Iv}
uniform vec3 uLightDir;
uniform float uGlow;
uniform vec2 uLayer;
varying vec3 vColA;
varying vec3 vColB;
varying vec3 vColC;
varying vec3 vNormal;
varying vec3 vView;
varying float vH;
varying float vR;
varying float vCenter;
varying float vJit;
varying float vHover;
varying float vShimmer;

void main(){
  if(vFade<1.0 && vFade<=ign(gl_FragCoord.xy)) discard;
  vec3 L=normalize((viewMatrix*vec4(uLightDir,0.0)).xyz);
  vec3 V=normalize(-vView);
  vec3 N=normalize(vNormal);
  if(!gl_FrontFacing) N=-N;
  float wrap=clamp((dot(N,L)+0.55)/1.55,0.0,1.0);
  vec3 col;
  vec3 lit;

#if defined(PART_FLOWER)
  col=mix(vColA,vColB,smoothstep(0.2,1.0,vR));
  col=mix(col,vColC,vCenter);
  // Thin petals: soft, mostly lit from both sides.
  lit=col*(0.72+0.38*wrap)*vShimmer;
  lit+=col*uGlow*0.25+vec3(0.06)*vHover;
#elif defined(PART_TUFT)
  col=mix(vColA,vColC,smoothstep(0.0,0.6,vH));
  col=mix(col,vColB,smoothstep(0.5,1.0,vH)*(0.55+0.45*vJit));
  col*=0.85+0.3*vJit;
  float ao=mix(0.45,1.0,smoothstep(0.0,0.8,vH));
  lit=col*ao*(0.45+0.9*wrap)*vShimmer+vColB*(0.1+uGlow*0.6)*smoothstep(0.7,1.0,vH);
#elif defined(PART_LEAF)
  col=mix(vColA,vColB,vH)*(0.88+0.24*vJit);
  lit=col*(0.5+0.75*wrap);
#elif defined(PART_CRYSTAL)
  vec3 F=normalize(cross(dFdx(vView),dFdy(vView)));
  float fres=pow(1.0-abs(dot(F,V)),2.0);
  float diff=clamp(dot(F,L)*0.5+0.5,0.0,1.0);
  float spec=pow(max(dot(reflect(-L,F),V),0.0),28.0);
  col=mix(vColA,vColB,smoothstep(0.0,1.0,vH));
  // Facets alternate light/dark like cut quartz; edges catch light (fresnel).
  lit=col*(0.55+0.5*diff)+vec3(1.0)*(fres*0.45+spec*0.9)*uLayer.y+vec3(0.25)*vHover;
#elif defined(PART_ROCK)
  vec3 F=normalize(cross(dFdx(vView),dFdy(vView)));
  float diff=clamp(dot(F,L)*0.6+0.45,0.0,1.0);
  col=mix(vColA,vColB,vJit)*(0.85+0.3*fract(vJit*7.1));
  lit=col*(0.35+0.75*diff);
#elif defined(PART_TWIG)
  col=mix(vColA,vColB,vJit);
  lit=col*(0.45+0.75*wrap);
#endif

  gl_FragColor=vec4(grade(lit),1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,ey=class{uTime={value:0};uGrowDur={value:.22};uDelayScale={value:.1};uWind={value:1};uBreath={value:1};uHeight={value:1};uShimmer={value:.18};uGlow={value:0};uContrast={value:1};uFlowerScale={value:1};uPointer={value:new J(1e3,1e3,0)};uPointerStrength={value:0};uPointerAmount={value:1};uLightDir={value:new J(-.4,.75,.6).normalize()};uMossBase={value:new X};uMossMid={value:new X};uMossTip={value:new X};uPetalInner={value:new X};uPetalEdge={value:new X};uFlowerCenter={value:new X};uStem={value:new X};uLeaf={value:new X};soilMaterial=new Bp({color:2761748,roughness:1,metalness:0});materials={moss:this.make(Bv,Vv),stem:this.make(Uv,Wv),head:this.make(Gv,Kv),leaf:this.make(qv,Jv)};blendTo(e,t,n){let r=(e,t)=>e.value.lerp(ty.set(t),n);r(this.uMossBase,e.mossBase),r(this.uMossMid,e.mossMid),r(this.uMossTip,e.mossTip),r(this.uPetalInner,e.petalInner),r(this.uPetalEdge,e.petalEdge),r(this.uFlowerCenter,e.flowerCenter),r(this.uStem,e.stem),r(this.uLeaf,e.leaf),this.soilMaterial.color.lerp(ty.set(e.soil),n);let i=(e,t)=>e.value+=(t-e.value)*n;i(this.uHeight,t.height),i(this.uGlow,t.glow),i(this.uContrast,t.contrast),i(this.uShimmer,t.shimmer),i(this.uFlowerScale,t.flowerSize),i(this.uPointerAmount,t.pointer)}parts=new Map;part(e){let t=this.parts.get(e);return t||(t=this.make(Qv,$v),t.defines={[`PART_${e.toUpperCase()}`]:``},this.parts.set(e,t)),t}material(e){return e.startsWith(`part:`)?this.part(e.slice(5)):this.materials[e]}all(){return[...Object.values(this.materials),...[`flower`,`tuft`,`leaf`,`crystal`,`rock`,`twig`].map(e=>this.part(e))]}make(e,t){return new Rp({vertexShader:e,fragmentShader:t,side:2,uniforms:{...Object.fromEntries(Object.entries(this).filter(([e])=>e.startsWith(`u`))),uBirth:{value:0},uDeath:{value:1e9},uDeathDur:{value:.35},uDeathStagger:{value:1},uFadeMode:{value:0},uLayer:{value:new q(1,1)}}})}},ty=new X;function ny(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function ry(e){let t=2166136261;for(let n=0;n<e.length;n++)t=Math.imul(t^e.charCodeAt(n),16777619);return t>>>0}var iy=class{depth;tris=[];triCdf=[];edges=[];edgeCdf=[];area;perimeter;constructor(e,t){this.depth=t;let n=0,r=0;for(let t of e){let{shape:e,holes:i}=t.extractPoints(6),a=ay(e),o=i.map(ay),s=[...a,...o.flat()],c=xp.triangulateShape(a,o);for(let[e,t,r]of c){let i=s[e],a=s[t],o=s[r],c=Math.abs((a.x-i.x)*(o.y-i.y)-(o.x-i.x)*(a.y-i.y))/2;c<=0||(n+=c,this.tris.push({a:i,b:a,c:o}),this.triCdf.push(n))}let l=(e,t)=>{let n=xp.area(e)>0,i=t?!n:n;for(let t=0;t<e.length;t++){let n=e[t],a=e[(t+1)%e.length],o=a.x-n.x,s=a.y-n.y,c=Math.hypot(o,s);if(c<1e-6)continue;let l=i?new q(s/c,-o/c):new q(-s/c,o/c);r+=c,this.edges.push({a:n,b:a,n:l}),this.edgeCdf.push(r)}};l(a,!1);for(let e of o)l(e,!0)}this.area=n,this.perimeter=r}sampleFace(e,t){let n=this.tris[oy(this.triCdf,e()*this.area)],r=e(),i=e();return r+i>1&&(r=1-r,i=1-i),t.pos.set(n.a.x+(n.b.x-n.a.x)*r+(n.c.x-n.a.x)*i,n.a.y+(n.b.y-n.a.y)*r+(n.c.y-n.a.y)*i,this.depth),t.normal.set(0,0,1),t.face=!0,t}sampleRim(e,t){let n=this.edges[oy(this.edgeCdf,e()*this.perimeter)],r=e(),i=this.depth*(1-e()**1.8*.9);t.pos.set(n.a.x+(n.b.x-n.a.x)*r,n.a.y+(n.b.y-n.a.y)*r,i);let a=.35+.5*(i/this.depth);return t.normal.set(n.n.x,n.n.y,a).normalize(),t.face=!1,t}};function ay(e){let t=[];for(let n of e){let e=t[t.length-1];(!e||e.distanceToSquared(n)>1e-10)&&t.push(n)}return t.length>2&&t[0].distanceToSquared(t[t.length-1])<1e-10&&t.pop(),t}function oy(e,t){let n=0,r=e.length-1;for(;n<r;){let i=n+r>>1;e[i]<t?n=i+1:r=i}return n}function sy(e=9,t=3){let n=ny(7),r=[],i=[],a=[];for(let o=0;o<e;o++){let s=o/e*Math.PI*2+n()*.5,c=o===0?.15:.6+n()*.75,l=o===0?.85:.55+n()*.4,u=.13+n()*.07,d=new J(Math.cos(s),0,Math.sin(s)),f=new J(-Math.sin(s),0,Math.cos(s)),p=r.length/3;for(let e=0;e<=t;e++){let n=e/t,a=c*(.4+.9*n),o=l*Math.sin(a)*n,s=l*Math.cos(c*.6*n)*n,p=d.clone().multiplyScalar(o).setY(s);if(e<t){let e=u*(1-n*.85),t=p.clone().addScaledVector(f,-e/2),a=p.clone().addScaledVector(f,e/2);r.push(t.x,t.y,t.z,a.x,a.y,a.z),i.push(n,n)}else r.push(p.x,p.y,p.z),i.push(1)}for(let e=0;e<t-1;e++){let t=p+e*2;a.push(t,t+1,t+2,t+1,t+3,t+2)}let m=p+(t-1)*2;a.push(m,m+1,m+2)}let o=new md;return o.setAttribute(`position`,new nd(r,3)),o.setAttribute(`aH`,new nd(i,1)),o.setIndex(a),o}function cy(){return new sf(1,1,1,5,5,!0).translate(0,.5,0)}function ly(e=5){let t=[],n=[],r=[],i=[];for(let a=0;a<e;a++){let o=a/e*Math.PI*2,s=t.length/3;t.push(0,0,0),n.push(0),r.push(0);for(let i=0;i<=7;i++){let a=i/7,s=o+(a-.5)*(Math.PI*2/e)*.95,c=1-.12*Math.exp(-(((a-.5)*9)**2)),l=Math.sin(a*Math.PI)**.45*c;t.push(Math.cos(s)*l,0,Math.sin(s)*l),n.push(l),r.push(0)}for(let e=0;e<7;e++)i.push(s,s+e+2,s+e+1)}let a=t.length/3;t.push(0,.08,0),n.push(0),r.push(1);for(let e=0;e<=10;e++){let i=e/10*Math.PI*2;t.push(Math.cos(i)*.22,.05,Math.sin(i)*.22),n.push(.1),r.push(1)}for(let e=0;e<10;e++)i.push(a,a+e+2,a+e+1);let o=new md;return o.setAttribute(`position`,new nd(t,3)),o.setAttribute(`aR`,new nd(n,1)),o.setAttribute(`aCenter`,new nd(r,1)),o.setIndex(i),o}function uy(){let e=[0,0,0],t=[];for(let t=0;t<=14;t++){let n=t/14,r=n*Math.PI,i=.5-Math.cos(r)*.5,a=Math.sin(r)*.38*(1-.25*n);e.push(a,i,0)}for(let t=14;t>=0;t--){let n=e.slice(3+t*3,6+t*3);e.push(-n[0],n[1],0)}let n=e.length/3;for(let e=1;e<n-1;e++)t.push(0,e,e+1);let r=new md;return r.setAttribute(`position`,new nd(e,3)),r.setIndex(t),r}function dy(e){return fy(e,()=>({h:0,r:0}))}function fy(e,t){let n=e.getAttribute(`position`),r=n.count,i=new Float32Array(r),a=new Float32Array(r),o=new Float32Array(r),s=new J;for(let e=0;e<r;e++){s.fromBufferAttribute(n,e);let r=t(s);i[e]=r.h,a[e]=r.r,o[e]=r.c??0}return e.hasAttribute(`aH`)||e.setAttribute(`aH`,new $u(i,1)),e.hasAttribute(`aR`)||e.setAttribute(`aR`,new $u(a,1)),e.hasAttribute(`aCenter`)||e.setAttribute(`aCenter`,new $u(o,1)),e.hasAttribute(`normal`)||e.computeVertexNormals(),e}function py(e,t,n={}){let r=new md;r.setAttribute(`position`,new nd(e,3));for(let[e,t]of Object.entries(n))r.setAttribute(e,new nd(t,1));return r.setIndex(t),r}function my(e){let t=ny(e.seed??11),n=[],r=[],i=[],a=[],o=e=>e[0]+t()*(e[1]-e[0]);for(let s=0;s<e.blades;s++){let c=s/e.blades*Math.PI*2+t()*.6,l=s===0?e.lean[0]*.3:o(e.lean),u=o(e.length),d=o(e.width),f=new J(Math.cos(c),0,Math.sin(c)),p=new J(-Math.sin(c),0,Math.cos(c)),m=n.length/3,h=new J;for(let t=0;t<=e.segments;t++){let a=t/e.segments,o=l*(.4+.9*a),s=f.clone().multiplyScalar(u*Math.sin(o)*a).setY(u*Math.cos(l*.6*a)*a);if(t<e.segments){let e=d*(1-a*.85),t=s.clone().addScaledVector(p,-e/2),o=s.clone().addScaledVector(p,e/2);n.push(t.x,t.y,t.z,o.x,o.y,o.z),r.push(a,a),i.push(0,0)}else n.push(s.x,s.y,s.z),r.push(1),i.push(0),h=s}for(let t=0;t<e.segments-1;t++){let e=m+t*2;a.push(e,e+1,e+2,e+1,e+3,e+2)}let g=m+(e.segments-1)*2;if(a.push(g,g+1,g+2),e.tipDot){let t=n.length/3;n.push(h.x,h.y+e.tipDot*.3,h.z),r.push(1),i.push(1);for(let t=0;t<=6;t++){let a=t/6*Math.PI*2,o=new J(Math.cos(a),0,Math.sin(a)).multiplyScalar(e.tipDot);n.push(h.x+o.x,h.y+o.y*.5+Math.sin(a)*e.tipDot*.4,h.z+o.z),r.push(1),i.push(1)}for(let e=0;e<6;e++)a.push(t,t+e+1,t+e+2)}}return fy(py(n,a,{aH:r,aR:i}),()=>({h:0,r:0}))}function hy(e=6){let t=[],n=[],r=[],i=[],a=(e,a,o,s,c)=>{for(let l=0;l<e;l++){let u=s+l/e*Math.PI*2,d=t.length/3;t.push(0,o,0),n.push(0),r.push(0);for(let i=0;i<=8;i++){let s=i/8,l=u+(s-.5)*(Math.PI*2/e)*c,d=a*Math.sin(s*Math.PI)**.35*(1-.06*Math.exp(-(((s-.5)*8)**2)));t.push(Math.cos(l)*d,o+d*d*.35,Math.sin(l)*d),n.push(d/a),r.push(0)}for(let e=0;e<8;e++)i.push(d,d+e+2,d+e+1)}};a(e,1,0,0,1.25),a(e-1,.7,.08,.5,1.2);let o=t.length/3;t.push(0,.2,0),n.push(0),r.push(1);for(let e=0;e<=12;e++){let i=e/12*Math.PI*2;t.push(Math.cos(i)*.2,.16,Math.sin(i)*.2),n.push(.1),r.push(1)}for(let e=0;e<12;e++)i.push(o,o+e+2,o+e+1);let s=ny(3);for(let e=0;e<22;e++){let a=e/22*Math.PI*2+s()*.2,o=.28+s()*.18,c=t.length/3,l=new J(Math.cos(a),0,Math.sin(a)),u=new J(-l.z,0,l.x).multiplyScalar(.025),d=l.clone().multiplyScalar(.12).setY(.18),f=l.clone().multiplyScalar(o).setY(.34+s()*.1);t.push(d.x-u.x,d.y,d.z-u.z,d.x+u.x,d.y,d.z+u.z,f.x,f.y,f.z),n.push(.1,.1,.2),r.push(1,1,1),i.push(c,c+1,c+2)}return fy(py(t,i,{aR:n,aCenter:r}),e=>({h:Math.min(1,Math.hypot(e.x,e.z)),r:0}))}function gy(e=18,t=.09){let n=[],r=[],i=[],a=[],o=ny(5);for(let s=0;s<e;s++){let c=s/e*Math.PI*2+o()*.08,l=.9+o()*.15,u=new J(Math.cos(c),0,Math.sin(c)),d=new J(-u.z,0,u.x),f=n.length/3;for(let e=0;e<=4;e++){let a=e/4,o=.22+a*(l-.22),s=t*Math.sin(Math.min(1,a*1.6+.15)*Math.PI*.5)*(1-a*.35),c=u.clone().multiplyScalar(o).setY(.05+a*a*.18);n.push(c.x-d.x*s,c.y,c.z-d.z*s,c.x+d.x*s,c.y,c.z+d.z*s),r.push(a,a),i.push(0,0)}for(let e=0;e<4;e++){let t=f+e*2;a.push(t,t+2,t+1,t+1,t+2,t+3)}}let s=new kp(.24,10,5,0,Math.PI*2,0,Math.PI/2);s.scale(1,.6,1).translate(0,.06,0);let c=n.length/3,l=s.getAttribute(`position`);for(let e=0;e<l.count;e++)n.push(l.getX(e),l.getY(e),l.getZ(e)),r.push(0),i.push(1);let u=s.getIndex();for(let e=0;e<u.count;e++)a.push(c+u.getX(e));return fy(py(n,a,{aR:r,aCenter:i}),()=>({h:0,r:0}))}function _y(e=46){let t=[],n=[],r=[],i=Math.PI*(3-Math.sqrt(5));for(let a=0;a<e;a++){let o=1-a/(e-1)*.85,s=Math.sqrt(1-o*o),c=a*i,l=new J(Math.cos(c)*s,o,Math.sin(c)*s).normalize(),u=new J().crossVectors(l,Math.abs(l.y)>.9?new J(1,0,0):new J(0,1,0)).normalize(),d=.09,f=t.length/3,p=l.clone().multiplyScalar(.15),m=l.clone().multiplyScalar(1);t.push(p.x-u.x*d,p.y-u.y*d,p.z-u.z*d),t.push(p.x+u.x*d,p.y+u.y*d,p.z+u.z*d),t.push(m.x,m.y,m.z),n.push(.1,.1,1),r.push(f,f+1,f+2)}let a=new kp(.42,8,6),o=t.length/3,s=a.getAttribute(`position`);for(let e=0;e<s.count;e++)t.push(s.getX(e),s.getY(e),s.getZ(e)),n.push(0);let c=a.getIndex();for(let e=0;e<c.count;e++)r.push(o+c.getX(e));return fy(py(t,r,{aR:n}),()=>({h:0,r:0}))}function vy(e=12){let t=[0,0,0],n=[0],r=[];for(let r=0;r<=e;r++){let i=r/e*Math.PI*2;t.push(Math.cos(i),.18,Math.sin(i)*.86),n.push(1)}for(let t=0;t<e;t++)r.push(0,t+2,t+1);return fy(py(t,r,{aR:n}),()=>({h:0,r:0}))}function yy(e=9){let t=ny(e),n=[];for(let e=0;e<4;e++){let r=e===0?1:.45+t()*.45,i=e===0?.2:.1+t()*.08,a=i*1.6,o=new sf(i,i*1.08,r-a,6,1,!1).translate(0,(r-a)/2,0),s=new cf(i,a,6,1).translate(0,r-a/2,0),c=e===0?.08:.35+t()*.45,l=t()*Math.PI*2,u=new Rl().makeRotationAxis(new J(Math.cos(l),0,Math.sin(l)),c);for(let e of[o,s])n.push(e.applyMatrix4(u).toNonIndexed())}return fy(wy(n),e=>({h:Math.max(0,Math.min(1,e.y)),r:0}))}function by(e=21){let t=ny(e),n=new Dp(1,1),r=n.getAttribute(`position`),i=new Map;for(let e=0;e<r.count;e++){let n=`${r.getX(e).toFixed(3)},${r.getY(e).toFixed(3)},${r.getZ(e).toFixed(3)}`,a=i.get(n);a===void 0&&i.set(n,a=.75+t()*.45),r.setXYZ(e,r.getX(e)*a,r.getY(e)*a*.55+.25,r.getZ(e)*a)}return n.deleteAttribute(`normal`),fy(n,e=>({h:Math.max(0,Math.min(1,e.y)),r:0}))}function xy(){return fy(new sf(1,1,1,5,8,!0).translate(0,.5,0),e=>({h:e.y,r:0}))}function Sy(e=.6){let t=[0,0,0],n=[0],r=[],i=[];for(let t=0;t<=12;t++){let n=t/12,r=Math.sin(n*Math.PI)**(1-e*.5)*.4*(1-n*e*.6);i.push([r,n])}for(let[e,r]of i)t.push(e,r,0),n.push(r);for(let e=i.length-1;e>=0;e--){let[r,a]=i[e];t.push(-r,a,0),n.push(a)}let a=t.length/3;for(let e=1;e<a-1;e++)r.push(0,e,e+1);return fy(py(t,r,{aH:n}),()=>({h:0,r:0}))}function Cy(){let e=new of(1,10);e.scale(1,.62,1);let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)t.setZ(e,t.getX(e)**2*.35);return e.deleteAttribute(`normal`),fy(e,e=>({h:0,r:Math.min(1,Math.hypot(e.x,e.y))}))}function wy(e){let t=0;for(let n of e)t+=n.getAttribute(`position`).count;let n=new Float32Array(t*3),r=0;for(let t of e){let e=t.getAttribute(`position`).array;n.set(e,r),r+=e.length}let i=new md;return i.setAttribute(`position`,new $u(n,3)),i}var Ty=new Map,$=e=>{let t=Ty.get(e);return t||Ty.set(e,t=new X(e)),t},Ey=(e,t)=>t[Math.floor(e()*t.length)],Dy=(e,t)=>{let n=0;for(let[e]of t)n+=e;let r=e()*n;for(let[e,n]of t)if((r-=e)<=0)return n;return t[t.length-1][1]},Oy=(e,t,n)=>t+e()*(n-t),ky=(e,t,n,r=0)=>t.clone().add(new J((e()-.5)*n,(e()-.5)*n,r)).normalize(),Ay=(e,t)=>{let n=new J().crossVectors(e,Math.abs(e.z)<.9?new J(0,0,1):new J(1,0,0)).normalize(),r=new J().crossVectors(e,n),i=t()*Math.PI*2;return n.multiplyScalar(Math.cos(i)).addScaledVector(r,Math.sin(i))},jy={springTuft:sy(),springStem:cy(),springHead:ly(),springLeaf:uy()},My={spring:{id:`spring`,layers:[{id:`moss`,label:`Moss`,base:()=>jy.springTuft,material:`moss`,category:`cover`},{id:`stem`,label:`Flowers`,control:`flowers`,base:()=>jy.springStem,material:`stem`,category:`flowers`},{id:`head`,label:`Flowers`,control:`flowers`,base:()=>jy.springHead,material:`head`,category:`flowers`},{id:`leaf`,label:`Leaves`,base:()=>jy.springLeaf,material:`leaf`,category:`leaves`}],build(e){let{rng:t}=e,n=e.count(6800),r=e.count(0,240);for(let i=0;i<n+r;i++){let r=i<n?e.point(1):e.point(0),a=ky(t,r.normal,.35),o=.75+.5*t()**1.5;e.add(`moss`,{pos:r.pos,dir:a,data:[.037*o*(r.face?1:.9),t()*Math.PI*2,e.delay(r.pos,r.face?0:.08),t()]})}let i=Math.max(2,e.count(85));for(let n=0;n<i;n++){let n=t()<.15,r=e.point(+!n);r.pos.z+=.012;let i=r.normal.clone();n&&(i.z+=1.2),i.x+=(t()-.5)*.7,i.y+=(t()-.5)*.7+.2,i.normalize();let a={pos:r.pos,dir:i,data:[.035+t()*.07,.032+t()*.024,e.delay(r.pos,.55),t()]};e.add(`stem`,a),e.add(`head`,a)}let a=Math.max(1,e.count(0,2.6));for(let n=0;n<a;n++){let n=e.point(0);n.pos.z=.07*(.6+t()*.4);let r=n.normal.clone();r.z+=.5,e.add(`leaf`,{pos:n.pos,dir:r.normalize(),data:[.04+t()*.035,(t()-.5)*1.2,e.delay(n.pos,.35),t()]})}}},blossom:{id:`blossom`,layers:[{id:`twig`,label:`Twigs`,base:()=>xy(),material:`part:twig`,category:`decor`},{id:`big`,label:`Big blossoms`,base:()=>hy(6),material:`part:flower`,category:`flowers`},{id:`small`,label:`Small blossoms`,base:()=>hy(5),material:`part:flower`,category:`cover`},{id:`sprig`,label:`Sprigs`,base:()=>my({blades:7,segments:3,lean:[.25,.75],length:[.7,1],width:[.03,.04],tipDot:.07,seed:4}),material:`part:tuft`,category:`leaves`},{id:`leaf`,label:`Leaves`,base:()=>Sy(.5),material:`part:leaf`,category:`leaves`}],petals:{rate:.9,colors:[`#f6a493`,`#f07f9c`,`#fcd3b2`,`#ffffff`,`#dc9fd6`],size:.028},build(e){let{rng:t}=e,n=[`#4a3a2c`,`#5e4a38`,`#3a2e25`,`#6b5644`];for(let r=0,i=e.count(200,22);r<i;r++){let r=e.point(.6),i=Ay(r.normal,t).addScaledVector(r.normal,-.1).normalize();e.add(`twig`,{pos:r.pos.clone().addScaledVector(r.normal,.01),dir:i,data:[1,0,e.delay(r.pos),t()],extra:[Oy(t,.06,.13),Oy(t,-.12,.12),Oy(t,.004,.007),0],a:$(Ey(t,n)),b:$(Ey(t,n))})}let r=[[4,[`#ffffff`,`#fff4ec`,`#f08a1e`]],[2.5,[`#e8705e`,`#f6a493`,`#e0662a`]],[2,[`#d63a64`,`#f07f9c`,`#b3243f`]],[2,[`#f2a46a`,`#fcd3b2`,`#e47a22`]],[1.4,[`#a557a6`,`#dc9fd6`,`#8a3486`]]];for(let n=0,i=e.count(66,2.2);n<i;n++){let n=e.point(.75),[i,a,o]=Dy(t,r);e.add(`big`,{pos:n.pos,dir:ky(t,n.normal,.9,.5),data:[Oy(t,.065,.135),t()*6.28,e.delay(n.pos,.35),t()],extra:[.02,.4,0,0],a:$(i),b:$(a),c:$(o)})}let i=[[3,[`#ffffff`,`#fff3ea`,`#f29a2a`]],[2.5,[`#f2a8a0`,`#fcd8d2`,`#e0703a`]],[2,[`#f4b27e`,`#fde0c6`,`#e8822a`]],[1.4,[`#c27fc0`,`#ecc9ea`,`#9c3f98`]]];for(let n=0,r=e.count(420,16);n<r;n++){let n=e.point(.7),[r,a,o]=Dy(t,i);e.add(`small`,{pos:n.pos,dir:ky(t,n.normal,1.1,.4),data:[Oy(t,.028,.05),t()*6.28,e.delay(n.pos,.2),t()],extra:[.01,.3,0,0],a:$(r),b:$(a),c:$(o)})}for(let n=0,r=e.count(0,4);n<r;n++){let n=e.point(0),r=ky(t,n.normal,.5,.2);e.add(`sprig`,{pos:n.pos,dir:r,data:[Oy(t,.06,.11),t()*6.28,e.delay(n.pos,.5),t()],extra:[1,0,0,0],a:$(`#4a3a2c`),b:$(Ey(t,[`#d1479c`,`#e0569f`,`#b85ab8`,`#e86aa0`])),c:$(`#6b5644`)})}for(let n=0,r=e.count(30,4);n<r;n++){let n=e.point(.4);e.add(`leaf`,{pos:n.pos,dir:ky(t,n.normal,1.6,.2),data:[Oy(t,.05,.08),Oy(t,-.8,.8),e.delay(n.pos,.25),t()],extra:[0,1.2,0,0],a:$(`#2f6a2a`),b:$(`#4f8f3a`)})}}},leafwreath:{id:`leafwreath`,layers:[{id:`leaf`,label:`Leaves`,base:()=>Sy(.7),material:`part:leaf`,category:`cover`},{id:`daisy`,label:`Daisies`,base:()=>gy(18,.09),material:`part:flower`,category:`flowers`},{id:`spiky`,label:`Spiky asters`,base:()=>gy(26,.05),material:`part:flower`,category:`flowers`}],petals:{rate:.35,colors:[`#7f9b55`,`#8a6450`,`#6f6787`,`#a88a5a`],size:.035},build(e){let{rng:t}=e,n=[[5,[`#5d7c3f`,`#9cb675`]],[3,[`#7a8f52`,`#b4c48a`]],[3,[`#6b4a3a`,`#a07a5e`]],[2,[`#8a5a44`,`#c19073`]],[3,[`#5c5878`,`#8f8cab`]],[1.5,[`#4a4f6a`,`#7c84a6`]],[1.5,[`#9a7f5f`,`#d0b58c`]]];for(let r=0,i=e.count(470,34);r<i;r++){let r=e.point(.6),i=Ay(r.normal,t).multiplyScalar(.8).addScaledVector(r.normal,r.face?.55:.35).normalize(),[a,o]=Dy(t,n);e.add(`leaf`,{pos:r.pos,dir:i,data:[Oy(t,.09,.17),Oy(t,-.5,.5),e.delay(r.pos),t()],extra:[0,Oy(t,.4,1.4),0,0],a:$(a),b:$(o)})}let r=[[3,[`#f0a316`,`#f9cf4a`,`#d4472c`]],[3,[`#ead4ad`,`#f8ecd2`,`#a47a45`]],[2,[`#e9b48a`,`#f7d9bd`,`#8d6a3e`]],[2,[`#7c86c8`,`#a9b2e6`,`#e3a02c`]],[1,[`#e6d8a4`,`#fbf2cf`,`#c79a3a`]]];for(let n=0,i=e.count(34,.6);n<i;n++){let n=e.point(.85),[i,a,o]=Dy(t,r);e.add(`daisy`,{pos:n.pos,dir:ky(t,n.normal,.7,.6),data:[Oy(t,.055,.1),t()*6.28,e.delay(n.pos,.45),t()],extra:[.04,.5,0,0],a:$(i),b:$(a),c:$(o)})}let i=[[3,[`#a3204a`,`#e0567d`,`#6b1830`]],[2,[`#b8237f`,`#e86bb6`,`#7a164f`]],[1,[`#c45a3a`,`#ec9a72`,`#7a2f1c`]]];for(let n=0,r=e.count(18,.3);n<r;n++){let n=e.point(.85),[r,a,o]=Dy(t,i);e.add(`spiky`,{pos:n.pos,dir:ky(t,n.normal,.9,.5),data:[Oy(t,.045,.08),t()*6.28,e.delay(n.pos,.5),t()],extra:[.05,.4,0,0],a:$(r),b:$(a),c:$(o)})}}},crystal:{id:`crystal`,layers:[{id:`rock`,label:`Rocks`,base:()=>by(21),material:`part:rock`,category:`decor`},{id:`moss`,label:`Moss`,base:()=>my({blades:9,segments:3,lean:[.6,1.3],length:[.55,.95],width:[.13,.2],seed:7}),material:`part:tuft`,category:`cover`},{id:`crystal`,label:`Crystals`,base:()=>yy(9),material:`part:crystal`,category:`decor`},{id:`violet`,label:`Violets`,base:()=>dy(ly(5)),material:`part:flower`,category:`flowers`},{id:`speck`,label:`Lichen`,base:()=>vy(8),material:`part:flower`,category:`leaves`}],petals:{rate:.12,colors:[`#9aa6e8`,`#ffffff`,`#f2843a`],size:.022},build(e){let{rng:t}=e,n=[[4,[`#a7a29a`,`#c7c0b4`]],[3,[`#8f958c`,`#b0b6aa`]],[2,[`#7b8b80`,`#9fae9f`]],[1,[`#c9b9a6`,`#e2d3bf`]]];for(let r=0,i=e.count(95,11);r<i;r++){let r=e.point(.55),[i,a]=Dy(t,n);e.add(`rock`,{pos:r.pos.clone().addScaledVector(r.normal,-.015),dir:ky(t,r.normal,.8),data:[Oy(t,.028,.055),t()*6.28,e.delay(r.pos,-.1),t()],extra:[Oy(t,.6,1.1),0,0,0],a:$(i),b:$(a)})}for(let n=0,r=e.count(8e3,200);n<r;n++){let n=e.point(.7);e.noise(n.pos,4,1)<.36||e.add(`moss`,{pos:n.pos.clone().addScaledVector(n.normal,.015),dir:ky(t,n.normal,.4),data:[Oy(t,.028,.042),t()*6.28,e.delay(n.pos,.1),t()],extra:[.8,0,0,0],a:$(`#14260c`),b:$(Ey(t,[`#5d8a2e`,`#4e7a28`,`#6f9a38`])),c:$(`#2c4a18`)})}let r=[[3,[`#d9dde0`,`#ffffff`]],[3,[`#e8875a`,`#ffd7b0`]],[2,[`#f0b29a`,`#fff0e2`]],[1,[`#e46a3c`,`#ffc27a`]]];for(let n=0,i=Math.max(3,e.count(30,.5));n<i;n++){let n=e.point(.7),[i,a]=Dy(t,r);e.add(`crystal`,{pos:n.pos.clone().addScaledVector(n.normal,-.01),dir:ky(t,n.normal,.9,.3),data:[Oy(t,.12,.22),t()*6.28,e.delay(n.pos,.25),t()],extra:[1,0,0,0],a:$(i),b:$(a)})}let i=[[3,[`#8f9be0`,`#d7dcf8`,`#f2c230`]],[2,[`#ffffff`,`#c4ccf2`,`#f0b52a`]],[1,[`#6f7cd0`,`#b9c2f0`,`#f2c230`]]];for(let n=0,r=e.count(42,1.2);n<r;n++){let n=e.point(.7),[r,a,o]=Dy(t,i);e.add(`violet`,{pos:n.pos,dir:ky(t,n.normal,1,.6),data:[Oy(t,.045,.075),t()*6.28,e.delay(n.pos,.5),t()],extra:[.05,.4,0,0],a:$(r),b:$(a),c:$(o)})}for(let n=0,r=e.count(260,4);n<r;n++){let n=e.point(.7);e.noise(n.pos,7,2)<.5||e.add(`speck`,{pos:n.pos,dir:ky(t,n.normal,.6,.3),data:[Oy(t,.006,.011),t()*6.28,e.delay(n.pos,.3),t()],extra:[.012,0,0,0],a:$(`#e8642a`),b:$(`#f6a03a`),c:$(`#e8642a`)})}}},lavender:{id:`lavender`,layers:[{id:`branch`,label:`Branches`,base:()=>xy(),material:`part:twig`,category:`decor`},{id:`disc`,label:`Petal discs`,base:()=>vy(12),material:`part:flower`,category:`cover`}],petals:{rate:3.2,colors:[`#b9a6e8`,`#9f86dc`,`#c9bdf2`,`#8a73d0`],size:.022},build(e){let{rng:t}=e,n=[`#8a5e3f`,`#a8774f`,`#6e4a33`,`#b98a62`];for(let r=0,i=e.count(150,14);r<i;r++){let r=e.point(.6),i=ky(t,r.normal,1.6,.3);e.add(`branch`,{pos:r.pos.clone().addScaledVector(r.normal,-.02),dir:i,data:[1,0,e.delay(r.pos,-.05),t()],extra:[Oy(t,.06,.16),Oy(t,-.4,.4),Oy(t,.0025,.005),0],a:$(Ey(t,n)),b:$(Ey(t,n))})}let r=[[3,[`#a993e4`,`#c7b8f3`]],[3,[`#8c74d4`,`#b3a0ec`]],[2,[`#c2b3f0`,`#ddd3fa`]],[1.2,[`#6e57bd`,`#9580dd`]]];for(let n=0,i=e.count(2600,100);n<i;n++){let n=e.point(.65),i=t()**1.6*.075,[a,o]=Dy(t,r);e.add(`disc`,{pos:n.pos.clone().addScaledVector(n.normal,i),dir:ky(t,n.normal,1.3,.8),data:[Oy(t,.016,.027),t()*6.28,e.delay(n.pos,i*6),t()],extra:[0,.6,0,0],a:$(a),b:$(o),c:$(a)})}}},pastel:{id:`pastel`,layers:[{id:`fern`,label:`Fern`,base:()=>my({blades:12,segments:4,lean:[.6,1.2],length:[.6,1],width:[.09,.13],seed:12}),material:`part:tuft`,category:`cover`},{id:`plume`,label:`Plumes`,base:()=>my({blades:18,segments:4,lean:[.15,.6],length:[.7,1],width:[.06,.09],seed:13}),material:`part:tuft`,category:`cover`},{id:`bush`,label:`Bushes`,base:()=>my({blades:10,segments:3,lean:[.5,1.2],length:[.5,.9],width:[.12,.16],tipDot:.09,seed:14}),material:`part:tuft`,category:`leaves`},{id:`pom`,label:`Pom-poms`,base:()=>_y(46),material:`part:flower`,category:`flowers`},{id:`aster`,label:`Asters`,base:()=>gy(22,.06),material:`part:flower`,category:`flowers`}],petals:{rate:2.2,colors:[`#f2a0b8`,`#e8826e`,`#e9c47a`,`#b98be0`],size:.026},build(e){let{rng:t}=e;for(let n=0,r=e.count(1600,55);n<r;n++){let n=e.point(.6);e.add(`fern`,{pos:n.pos,dir:ky(t,n.normal,.5),data:[Oy(t,.05,.075),t()*6.28,e.delay(n.pos),t()],extra:[1,0,0,0],a:$(`#4f5b7a`),b:$(Ey(t,[`#b8c3da`,`#a6b4d4`,`#c8d0e2`])),c:$(`#7d8bb0`)})}for(let n=0,r=e.count(1900,55);n<r;n++){let n=e.point(.6);e.noise(n.pos,3.5,3)<.25||e.add(`plume`,{pos:n.pos,dir:ky(t,n.normal,.6,.2),data:[Oy(t,.06,.095),t()*6.28,e.delay(n.pos,.15),t()],extra:[1.05,0,0,0],a:$(`#b8577f`),b:$(Ey(t,[`#f6b7cf`,`#f4a3c4`,`#fbc8da`])),c:$(`#e58bb5`)})}for(let n=0,r=e.count(1600,40);n<r;n++){let n=e.point(.6);e.noise(n.pos,3,4)<.55||e.add(`bush`,{pos:n.pos,dir:ky(t,n.normal,.5),data:[Oy(t,.04,.06),t()*6.28,e.delay(n.pos,.2),t()],extra:[.9,0,0,0],a:$(`#b88a2a`),b:$(Ey(t,[`#f6d77a`,`#f2c95a`,`#fbe39a`])),c:$(`#e0b44a`)})}let n=[[5,[`#b98f4e`,`#ecd29a`,`#9c7536`]],[2.5,[`#6a32b8`,`#b07cf0`,`#4b1f8a`]],[1.2,[`#c95a5a`,`#f2a08a`,`#8a2f2f`]]];for(let r=0,i=e.count(190,4);r<i;r++){let r=e.point(.8),[i,a,o]=Dy(t,n);e.add(`pom`,{pos:r.pos.clone().addScaledVector(r.normal,.03),dir:ky(t,r.normal,.8,.5),data:[Oy(t,.05,.08),t()*6.28,e.delay(r.pos,.4),t()],extra:[.02,.3,0,0],a:$(i),b:$(a),c:$(o)})}for(let n=0,r=e.count(26,.6);n<r;n++){let n=e.point(.8),[r,i,a]=Ey(t,[[`#e0705e`,`#f6a896`,`#a83c2c`],[`#4f6fd0`,`#8aa4ee`,`#e0b040`]]);e.add(`aster`,{pos:n.pos,dir:ky(t,n.normal,.8,.5),data:[Oy(t,.03,.05),t()*6.28,e.delay(n.pos,.45),t()],extra:[.03,.3,0,0],a:$(r),b:$(i),c:$(a)})}}}},Ny=1.5,Py=1/Ny,Fy=.07,Iy=2,Ly=260,Ry=40,zy=new Map,By=class e{assets=new Map;uses=new Map;density={category:{cover:1,flowers:1,leaves:1},amount:{}};static key(e,t,n){return`${e}\u0000${t}\u0000${n}`}nextKey(t,n){let r=this.uses.get(n)??0;return this.uses.set(n,r+1),e.key(t,n,r%Iy)}has(e){return this.assets.has(e)}acquire(e,t,n){let r=this.assets.get(e);return r?this.assets.delete(e):(r=Wy(t,n,ry(e)),Vy(r,this.density),this.evict()),this.assets.set(e,r),r.refs++,r}release(e){e.refs=Math.max(0,e.refs-1)}setDensity(e){this.density=e;for(let t of this.assets.values())Vy(t,e)}evict(){if(!(this.assets.size<Ly)){for(let[e,t]of this.assets)if(!(t.refs>0)){this.assets.delete(e),t.body.dispose();for(let e of t.layers)e.geo.dispose();if(this.assets.size<Ly)return}}}};function Vy(e,t){for(let n of e.layers){let e=n.category===`decor`?1:t.category[n.category];n.geo.instanceCount=Math.round(n.count*Math.min(1,e*(t.amount[n.control]??1)))}}var Hy=class{pos=[];dir=[];data=[];extra=[];a=[];b=[];c=[];get count(){return this.pos.length/3}push(e){this.pos.push(e.pos.x,e.pos.y,e.pos.z),this.dir.push(e.dir.x,e.dir.y,e.dir.z),this.data.push(...e.data),this.extra.push(...e.extra??[0,0,0,0]);let t=e.a??Uy,n=e.b??t,r=e.c??t;this.a.push(t.r,t.g,t.b),this.b.push(n.r,n.g,n.b),this.c.push(r.r,r.g,r.b)}shuffle(e){let t=this.count,n=[[this.pos,3],[this.dir,3],[this.data,4],[this.extra,4],[this.a,3],[this.b,3],[this.c,3]];for(let r=t-1;r>0;r--){let t=Math.floor(e()*(r+1));for(let[e,i]of n)for(let n=0;n<i;n++){let a=e[r*i+n];e[r*i+n]=e[t*i+n],e[t*i+n]=a}}}},Uy=new X(1,1,1);function Wy(e,t,n){let r=ny(n),i=new iy(e.shapes,Fy),a=new wp(e.shapes,{depth:Fy*.92,bevelEnabled:!1,curveSegments:6}),o=e.center,s=new Map(t.layers.map(e=>[e.id,new Hy])),c={sampler:i,rng:r,point(e=.7){let t={pos:new J,normal:new J,face:!0};return r()<e?i.sampleFace(r,t):i.sampleRim(r,t)},delay:(e,t=0)=>Math.min(1,Math.hypot(e.x-o.x,e.y-o.y)/.5)*.9+r()*.3+t,add:(e,t)=>s.get(e).push(t),count:(e,t=0)=>Math.round((i.area*e+i.perimeter*t)*Ny),noise:(e,t,n=0)=>Ky(e.x*t+n*17.3,e.y*t-n*9.1)};t.build(c);let l=t.layers.map(e=>{let n=s.get(e.id);n.shuffle(r);let i=`${t.id}:${e.id}`,a=zy.get(i);a||zy.set(i,a=e.base());let o=Gy(a,{iPos:[n.pos,3],iDir:[n.dir,3],iData:[n.data,4],iExtra:[n.extra,4],iColA:[n.a,3],iColB:[n.b,3],iColC:[n.c,3]});return e.material===`moss`&&o.setAttribute(`iNormal`,o.getAttribute(`iDir`)),{control:e.control??e.id,geo:o,material:e.material,category:e.category,count:n.count}}),u=new Float32Array(120);for(let e=0;e<Ry;e++){let t=c.point(.8);t.pos.addScaledVector(t.normal,.03).toArray(u,e*3)}return{body:a,layers:l,emit:u,refs:0}}function Gy(e,t){let n=new Tm;n.index=e.index;for(let[t,r]of Object.entries(e.attributes))n.setAttribute(t,r);for(let[e,[r,i]]of Object.entries(t))n.setAttribute(e,new Hd(new Float32Array(r),i));return n.instanceCount=t.iPos[0].length/3,n}function Ky(e,t){let n=Math.floor(e),r=Math.floor(t),i=e-n,a=t-r,o=(e,t)=>{let n=Math.sin(e*127.1+t*311.7)*43758.5453;return n-Math.floor(n)},s=i*i*(3-2*i),c=a*a*(3-2*a),l=o(n,r),u=o(n+1,r),d=o(n,r+1),f=o(n+1,r+1);return l+(u-l)*s+(d-l)*c+(l-u-d+f)*s*c}var qy={amount:1,size:1,param:1},Jy=class{glyph;key;group=new fu;target=new J;birth=1e9;death=1e9;dying=!1;deathDur=.35;deathStagger=1;fadeMode=0;asset;body;constructor(e,t){this.glyph=e,this.key=t}get built(){return!!this.asset||this.glyph.empty}build(e,t,n,r,i){if(this.birth=n,this.glyph.empty||this.asset)return;let a=this.asset=e.acquire(this.key,this.glyph,r),o=[[a.body,t.soilMaterial,qy],...a.layers.map(e=>[e.geo,t.material(e.material),i(e.control)])];for(let[e,t,n]of o){let r=new Rd(e,t);e===a.body&&(this.body=r,r.scale.setScalar(.001)),r.frustumCulled=!1,t instanceof Rp&&(r.onBeforeRender=()=>{t.uniforms.uBirth.value=this.birth,t.uniforms.uDeath.value=this.death,t.uniforms.uDeathDur.value=this.deathDur,t.uniforms.uDeathStagger.value=this.deathStagger,t.uniforms.uFadeMode.value=this.fadeMode,t.uniforms.uLayer.value.set(n.size,n.param),t.uniformsNeedUpdate=!0}),this.group.add(r)}}get emitPoints(){return this.asset?.emit}kill(e,t=!1){this.dying=!0,this.death=e,this.deathDur=t?.22:.35,this.deathStagger=+!t,this.fadeMode=+!!t,this.body&&(this.body.visible=!1)}tick(e,t,n){let r=this.body;if(!r||this.dying)return;let i=Math.min(1,Math.max(0,(e-this.birth-t*.45)/(t*.6+1.2*n))),a=i*i;if(a>=1&&r.scale.x===1)return;let o=Math.max(.001,a),s=this.glyph.center;r.scale.set(o,o,1),r.position.set(s.x*(1-o),s.y*(1-o),0)}dispose(e){this.asset&&e.release(this.asset),this.asset=void 0,this.group.clear(),this.group.removeFromParent()}},Yy=`
uniform float uTime;
uniform float uWind;
attribute vec3 iSpawn;
attribute vec3 iVel;
attribute vec4 iLife; // x birth time, y lifetime, z size, w seed
attribute vec3 iCol;
varying vec3 vCol;
varying float vShade;

mat3 rotAxis(vec3 a, float t){
  a=normalize(a); float c=cos(t), s=sin(t), ic=1.0-c;
  return mat3(
    c+a.x*a.x*ic, a.y*a.x*ic+a.z*s, a.z*a.x*ic-a.y*s,
    a.x*a.y*ic-a.z*s, c+a.y*a.y*ic, a.z*a.y*ic+a.x*s,
    a.x*a.z*ic+a.y*s, a.y*a.z*ic-a.x*s, c+a.z*a.z*ic);
}

void main(){
  float age=uTime-iLife.x;
  float life=iLife.y;
  float t=clamp(age/life,0.0,1.0);
  float alive=step(0.0,age)*step(age,life);
  float seed=iLife.w;
  // Carried by the breeze, fluttering, with a little gravity.
  vec3 p=iSpawn+iVel*age;
  p.x+=uWind*0.12*age*age;
  p+=vec3(sin(age*3.1+seed*40.0)*0.05, cos(age*2.3+seed*23.0)*0.04-0.02*age*age, sin(age*1.7+seed*9.0)*0.05)*min(age,1.0);
  mat3 R=rotAxis(vec3(fract(seed*7.1)-0.5,fract(seed*3.3)-0.5,0.4), age*(1.5+seed*3.0)+seed*6.28);
  float s=iLife.z*smoothstep(0.0,0.12,t)*(1.0-smoothstep(0.7,1.0,t))*alive;
  vec3 local=R*(position*s);
  gl_Position=projectionMatrix*viewMatrix*vec4(p+local,1.0);
  vec3 n=R*vec3(0.0,0.0,1.0);
  vShade=0.62+0.38*abs(n.z)+0.15*position.x;
  vCol=iCol;
}
`,Xy=`
${Iv}
varying vec3 vCol;
varying float vShade;
void main(){
  gl_FragColor=vec4(grade(vCol*vShade),1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,Zy=class{max;mesh;spawn;vel;life;col;next=0;dirty=!1;constructor(e,t=420){this.max=t;let n=Cy(),r=new Tm;r.index=n.index,r.setAttribute(`position`,n.getAttribute(`position`));let i=e=>new Hd(new Float32Array(t*e),e).setUsage(kc);r.setAttribute(`iSpawn`,this.spawn=i(3)),r.setAttribute(`iVel`,this.vel=i(3)),r.setAttribute(`iLife`,this.life=i(4)),r.setAttribute(`iCol`,this.col=i(3));for(let e=0;e<t;e++)this.life.setXYZW(e,-1e9,1,0,0);r.instanceCount=t,this.mesh=new Rd(r,new Rp({vertexShader:Yy,fragmentShader:Xy,uniforms:{uTime:e.uTime,uWind:e.uWind,uContrast:e.uContrast},side:2})),this.mesh.frustumCulled=!1}emit(e,t,n,r,i,a=3+Math.random()*2.5){let o=this.next;this.next=(this.next+1)%this.max,this.spawn.setXYZ(o,e.x,e.y,e.z),this.vel.setXYZ(o,t.x,t.y,t.z),this.life.setXYZW(o,i,a,r,Math.random()),this.col.setXYZ(o,n.r,n.g,n.b),this.dirty=!0}flush(){if(this.dirty){for(let e of[this.spawn,this.vel,this.life,this.col])e.needsUpdate=!0;this.dirty=!1}}},Qy={density:1,height:1.35,shimmer:.6,glow:1.5,flowers:.3,flowerSize:1.22,leaves:1,wind:1,breath:1,pointer:1,growSpeed:1,spores:.35,blur:2.5,petals:1,contrast:1},$y={name:`Spring Bloom`,style:`spring`,bg:`#ffffff`,dark:!1,mossBase:`#2f3d08`,mossMid:`#7a9a12`,mossTip:`#c9e04a`,soil:`#2a2414`,petalInner:`#e9a6c9`,petalEdge:`#fbeaf3`,flowerCenter:`#e8a23a`,stem:`#d0623e`,leaf:`#4f8f3a`,sporeColor:`#ffffff`,shimmer:.6,glow:1.5,blur:2.5,wind:1,breath:1,pointer:1,growSpeed:1,spores:.35,petals:1,surfaces:{moss:[1,1,1],flowers:[1.5,1,1],leaf:[1.5,1,1]}},eb={flowers:1,leaves:1,height:1,flowerSize:1},tb=[$y,{...$y,...eb,name:`Blossom Wreath`,style:`blossom`,bg:`#ffffff`,soil:`#5a4a3e`,shimmer:0,glow:.86,blur:1.87,wind:1,breath:.8,pointer:.93,growSpeed:1.19,spores:.23,petals:.35,contrast:1.05,surfaces:{twig:[1.34,1,.54],big:[1.24,.45,1],small:[1,1,1],sprig:[.9,.84,1],leaf:[1,.97,2.5]}},{...$y,...eb,name:`Leaf Wreath`,style:`leafwreath`,bg:`#ffffff`,soil:`#3e3a2a`,shimmer:.2,glow:1.5,blur:2.2,wind:1,breath:1,pointer:1,growSpeed:1,spores:0,petals:.15,surfaces:{leaf:[.8,.58,1],daisy:[1,.48,1],spiky:[1,.47,1]}},{...$y,...eb,name:`Crystal Garden`,style:`crystal`,bg:`#ffffff`,soil:`#7d7a72`,height:.8,shimmer:.3,glow:1.08,blur:2.2,wind:1,breath:1,pointer:1,growSpeed:1,spores:.2,petals:.08,surfaces:{rock:[1.5,1,1],moss:[1.1,1,1],crystal:[1.16,1,1],violet:[1.5,1,1],speck:[1.5,1,1]}},{...$y,...eb,name:`Lavender Drift`,style:`lavender`,bg:`#ffffff`,soil:`#5b4130`,shimmer:.12,glow:1.5,blur:2.2,wind:1,breath:.96,pointer:1,growSpeed:.85,spores:0,petals:.2,surfaces:{branch:[1.5,1,.53],disc:[1.5,.6,.97]}},{...$y,...eb,name:`Pastel Meadow`,style:`pastel`,bg:`#ffffff`,soil:`#8a7f96`,shimmer:.3,glow:.1,blur:2.2,wind:1,breath:1,pointer:1,growSpeed:1,spores:0,petals:.34,surfaces:{fern:[1,.93,1],plume:[1,.79,1],bush:[1,.81,1],pom:[1,.6,1],aster:[1,.57,1]}}].map(e=>({...Qy,...e})),nb=e=>Object.fromEntries(Object.keys(Qy).map(t=>[t,e[t]])),rb=1.12,ib=6,ab=3,ob=.86,sb=.74,cb=1e-4,lb=0,ub=class{canvas;font;fontId;renderer;scene=new bu;camera=new xm(26,1,.1,100);uniforms=new ey;root=new fu;settings;cache=new By;composer;tiltH;tiltV;bg=new X(`#ffffff`);targetScale=1;textSize=1;glyphs=[];dying=[];queue=[];warmList=[];lineCount=1;spores;sporeUniforms;palette;sporeAmount=0;pointerLastMove=-1;lastBuildAt=0;t0=performance.now();lastT=0;kit=My.spring;layerTune=new Map;tuneFor=e=>{let t=this.layerTune.get(e);return t||this.layerTune.set(e,t=this.defaultTune(e)),t};defaultTune(e){let[t,n,r]=this.preset?.surfaces?.[e]??[1,1,1];return{amount:t*Py,size:n,param:r}}preset;get cacheScope(){return`${this.kit.id}/${this.fontId}`}petals;petalAcc=0;pointerPrev=new J;pointerSpeed=0;warmChars=``;reducedMotion=matchMedia(`(prefers-reduced-motion: reduce)`).matches;quality=1;frames=0;fpsWindowStart=0;constructor(e,t,n=`instrument`){this.canvas=e,this.font=t,this.fontId=n,this.renderer=new hv({canvas:e,antialias:!0,alpha:!0,preserveDrawingBuffer:!0,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.renderer.outputColorSpace=Cc,this.renderer.toneMapping=0,this.scene.background=this.bg,this.camera.position.set(0,.9,7),this.camera.lookAt(0,-.05,0),this.scene.add(this.root),this.scene.add(new lm(16777215,4210736,1.2));let r=new wm(16777215,1.6);r.position.copy(this.uniforms.uLightDir.value).multiplyScalar(5),this.scene.add(r);let i=new Float32Array(280);for(let e=0;e<i.length;e++)i[e]=Math.random();let a=new md;a.setAttribute(`position`,new $u(new Float32Array(210),3)),a.setAttribute(`aSeed`,new $u(i,4)),this.sporeUniforms={uTime:this.uniforms.uTime,uPixelRatio:{value:this.renderer.getPixelRatio()},uBox:{value:new J(9,5,4)},uFocus:{value:7},uSporeColor:{value:new X(`#ffffff`)},uSporeAmount:{value:0}},this.spores=new Qd(a,new Rp({vertexShader:Yv,fragmentShader:Xv,uniforms:this.sporeUniforms,transparent:!0,depthWrite:!1})),this.spores.frustumCulled=!1,this.scene.add(this.spores),this.petals=new Zy(this.uniforms),this.scene.add(this.petals.mesh);let o=this.renderer.getDrawingBufferSize(new q),s=new Fl(o.x,o.y,{samples:4,type:_s});this.composer=new Av(this.renderer,s),this.composer.addPass(new jv(this.scene,this.camera)),this.tiltH=new Dv(Zv),this.tiltV=new Dv(Zv),this.tiltH.uniforms.uDir.value=[1,0],this.tiltV.uniforms.uDir.value=[0,1],this.composer.addPass(this.tiltH),this.composer.addPass(this.tiltV),this.composer.addPass(new Nv),this.precompile(),this.bindPointer(),this.resize(),addEventListener(`resize`,()=>this.resize())}precompile(){let e=new fu,t=new Tm;t.instanceCount=0;for(let n of this.uniforms.all())e.add(new Rd(t,n));e.add(new Rd(new af,this.uniforms.soilMaterial)),this.scene.add(e),this.renderer.compileAsync(this.scene,this.camera).catch(()=>{}).finally(()=>e.removeFromParent())}get time(){return(performance.now()-this.t0)/1e3}setText(e){let t=Array.from(e),n=this.glyphs.map(e=>e.glyph.char),r=0;for(;r<n.length&&r<t.length&&n[r]===t[r];)r++;let i=0;for(;i<n.length-r&&i<t.length-r&&n[n.length-1-i]===t[t.length-1-i];)i++;let a=this.time,o=this.glyphs.splice(r,n.length-r-i);for(let e of o)e.built?(e.kill(a),this.dying.push(e)):(this.queue=this.queue.filter(t=>t!==e),e.dispose(this.cache));let s=t.slice(r,t.length-i).map(e=>{let t=this.font.glyph(e),n=new Jy(t,t.empty?``:this.cache.nextKey(this.cacheScope,e));return this.root.add(n.group),this.queue.push(n),n});this.glyphs.splice(r,0,...s),this.layout(t,s)}warm(e){this.warmChars=e,this.warmList=Array.from(e)}setFont(e,t){t!==this.fontId&&(this.font=e,this.fontId=t,this.restyle())}restyle(){let e=this.glyphs.map(e=>e.glyph.char).join(``),t=this.time;for(let e of this.glyphs)e.built?(e.kill(t),this.dying.push(e)):e.dispose(this.cache);this.glyphs=[],this.queue=[],this.setText(e),this.warm(this.warmChars)}drainQueue(e){let t=performance.now(),n=0;for(;this.queue.length&&(n===0||performance.now()-t<ib);)this.queue.shift().build(this.cache,this.uniforms,e-.01,this.kit,this.tuneFor),n++,this.lastBuildAt=e;if(!this.queue.length&&this.warmList.length)for(;this.warmList.length&&performance.now()-t<ab;){let e=this.warmList.shift(),t=this.font.glyph(e);if(!t.empty)for(let n=0;n<2;n++){let r=By.key(this.cacheScope,e,n);this.cache.has(r)||this.cache.release(this.cache.acquire(r,t,this.kit))}}}growSpeed(){return Math.max(.1,this.settings?.growSpeed??1)}setTextSize(e){this.textSize=e,this.layout(this.glyphs.map(e=>e.glyph.char),[],!0)}wrapWidth(){let e=this.visibleSize();return ml.clamp(e.x/e.y*3.4,2.8,7.5)}layout(e,t,n=!1){let r=e.length,i=e=>this.glyphs[e].glyph.advance,a=t=>t>0?this.font.kerning(e[t-1],e[t]):0,o=this.visibleSize(),s=t=>{let n=[],o=(t,r)=>{let o=0,s=0;for(let n=t;n<r;n++)n>t&&(o+=a(n)),o+=i(n),/\s/.test(e[n])||(s=o);n.push({start:t,end:r,width:s})},s=(n,r)=>{let s=n;for(;;){let n=0,c=-1,l=-1;for(let o=s;o<r;o++){if(o>s&&(n+=a(o)),e[o]===` `)c=o;else if(o>s&&n+i(o)>t){l=o;break}n+=i(o)}if(l<0)return void o(s,r);c>s?(o(s,c),s=c+1):(o(s,l),s=l)}},c=0;for(let t=0;t<=r;t++)(t===r||e[t]===`
`)&&(s(c,t),c=t+1);return n},c=this.wrapWidth(),l=o.x*ob/(c+.3)*this.textSize,u=e=>Math.min(l,o.x*ob/(Math.max(0,...e.map(e=>e.width))+.3),o.y*sb/(e.length*rb)),d=s(c/this.textSize),f=u(d);for(let e of[1.2,1.45,1.75,2.1,2.6,3.2]){if(f>=l-1e-4)break;let t=s(c/this.textSize*e),n=u(t);n>f+1e-4&&(d=t,f=n)}let p=Array(r),m=d.map(({start:t,end:n})=>{let r=0,o=0;for(let s=t;s<n;s++)s>t&&(r+=a(s)),p[s]=r,r+=i(s),/\s/.test(e[s])||(o=r);return{start:t,end:n,width:o}}),h=this.font.capHeight,g=m.length;this.lineCount=g;let _=e=>((g-1)/2-e)*rb-h/2;m.forEach((e,t)=>{for(let n=e.start;n<e.end;n++)this.glyphs[n].target.set(p[n]-e.width/2,_(t),0);let n=m[t+1]?.start??r+1;e.end<r&&n!==e.end&&this.glyphs[e.end].target.set(e.width/2,_(t),0)});for(let e of t)e.group.position.copy(e.target);r!==0&&(n||!this.glyphs.some(e=>!e.dying&&!e.glyph.empty&&!t.includes(e))?(this.targetScale=f,this.root.scale.setScalar(f)):this.targetScale=Math.min(this.targetScale,f))}visibleSize(){let e=2*this.camera.position.length()*Math.tan(ml.degToRad(this.camera.fov/2));return new q(e*this.camera.aspect,e)}setPreset(e,t=!1){this.preset=e,this.palette=e,this.settings=nb(e),this.resetSurfaces();let n=My[e.style];n!==this.kit&&(this.kit=n,this.restyle()),t&&(this.uniforms.blendTo(e,this.settings,1),this.bg.set(e.bg),this.sporeAmount=e.spores,this.sporeUniforms.uSporeColor.value.set(e.sporeColor)),this.applyDensity()}resetSurfaces(){for(let[e,t]of this.layerTune)Object.assign(t,this.defaultTune(e));this.applyDensity()}clear(){let e=this.time,t=this.glyphs.filter(e=>e.built&&!e.glyph.empty);t.forEach((n,r)=>{n.kill(e+(t.length>1?r/(t.length-1)*.05:0),!0),this.dying.push(n)});for(let e of this.glyphs)(!e.built||e.glyph.empty)&&e.dispose(this.cache);let n=this.kit.petals;if(n&&t.length){let r=n.size*this.root.scale.x;for(let i=0;i<Math.min(24,t.length*3);i++){let i=t[Math.floor(Math.random()*t.length)];this.emitFrom(i,e,r,n.colors,fb.set((Math.random()-.5)*.4,.15+Math.random()*.2,.2).multiplyScalar(this.root.scale.x))}}this.glyphs=[],this.queue=[],this.setText(``)}applyDensity(){let e=this.settings;e&&this.cache.setDensity({category:{cover:e.density*this.quality,flowers:e.flowers*Math.min(1,this.quality+.3),leaves:e.leaves},amount:Object.fromEntries([...this.layerTune].map(([e,t])=>[e,t.amount]))})}setQuality(e){this.quality=e,this.applyDensity()}bindPointer(){let e=new Gm,t=new q,n=new vd(new J(0,0,1),0),r=new J;this.canvas.addEventListener(`pointermove`,i=>{let a=this.canvas.getBoundingClientRect();if(t.set((i.clientX-a.left)/a.width*2-1,-((i.clientY-a.top)/a.height)*2+1),e.setFromCamera(t,this.camera),n.constant=-Fy*this.root.scale.x,e.ray.intersectPlane(n,r)){let e=this.time,t=Math.max(.008,e-this.pointerLastMove);if(this.pointerLastMove>=0&&t<.2){let e=r.distanceTo(this.pointerPrev)/t;this.pointerSpeed=Math.max(this.pointerSpeed,e)}this.pointerPrev.copy(r),this.uniforms.uPointer.value.copy(r),this.pointerLastMove=e}}),this.canvas.addEventListener(`pointerleave`,()=>this.pointerLastMove=-1)}resize(e=innerWidth,t=innerHeight){this.renderer.setSize(e,t,!1),this.composer.setSize(e,t),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.resizePasses(),this.camera.position.setLength(e<t?8.5:7),this.layout(this.glyphs.map(e=>e.glyph.char),[],!0)}update(){let e=this.time,t=this.uniforms;t.uTime.value=e;let n=Math.max(0,Math.min(.25,this.lastT?e-this.lastT:.016));this.lastT=e;let r=1-Math.exp(-n*4);this.drainQueue(e);let i=this.palette,a=this.settings;if(i&&a){t.blendTo(i,a,r),this.bg.lerp(db.set(i.bg),r),this.sporeUniforms.uSporeColor.value.lerp(db.set(i.sporeColor),r);let e=this.reducedMotion?.2:1;t.uWind.value+=(a.wind*e-t.uWind.value)*r,t.uBreath.value+=(a.breath*e-t.uBreath.value)*r,t.uGrowDur.value=cb/this.growSpeed(),t.uDelayScale.value=lb,this.sporeAmount+=(a.spores*(this.reducedMotion?.3:1)-this.sporeAmount)*r}this.sporeUniforms.uSporeAmount.value=this.sporeAmount;let o=+(this.pointerLastMove>=0&&e-this.pointerLastMove<.5);t.uPointerStrength.value+=(o-t.uPointerStrength.value)*(1-Math.exp(-n*6));let s=this.root.scale.x;this.targetScale<s&&this.root.scale.setScalar(s+(this.targetScale-s)*(1-Math.exp(-n*12)));let c=1-Math.exp(-n*10);for(let n of this.glyphs)n.group.position.lerp(n.target,c),n.tick(e,t.uGrowDur.value,t.uDelayScale.value);this.dying=this.dying.filter(t=>e-t.death>t.deathDur+.45*t.deathStagger+.05?(t.dispose(this.cache),!1):!0);let l=this.visibleSize(),u=Math.min(.42,this.lineCount*rb*this.root.scale.x/l.y/2+.06);for(let e of[this.tiltH,this.tiltV])e.uniforms.uFocusBand.value=u,e.uniforms.uFocusCenter.value=.53,e.uniforms.uAmount.value=9*(a?.blur??1)*this.renderer.getPixelRatio()*(this.quality<.8?.6:1);this.updatePetals(e,n),this.composer.render(),this.trackFps(e)}updatePetals(e,t){let n=this.kit.petals,r=this.pointerSpeed;if(this.pointerSpeed*=Math.exp(-t*8),!n||!this.settings)return this.petals.flush();let i=this.glyphs.filter(e=>e.emitPoints);if(!i.length)return this.petals.flush();let a=this.reducedMotion?.2:1,o=this.root.scale.x,s=n.size*o;this.petalAcc+=n.rate*this.settings.petals*a*i.length*t;let c=0;for(;this.petalAcc>=1&&c++<40;){--this.petalAcc;let t=i[Math.floor(Math.random()*i.length)];this.emitFrom(t,e,s,n.colors,fb.set(.18+Math.random()*.2,.06+Math.random()*.12,(Math.random()-.3)*.15).multiplyScalar(o))}let l=this.uniforms.uPointer.value;if(r>.6&&e-this.pointerLastMove<.1){let t=Math.min(6,Math.floor(r*.8*this.settings.petals*a)),c=(.45*o)**2;for(let a=0;a<t;a++){let t=i[Math.floor(Math.random()*i.length)],a=t.emitPoints,u=Math.floor(Math.random()*(a.length/3)),d=pb.fromArray(a,u*3).applyMatrix4(t.group.matrixWorld);if((d.x-l.x)**2+(d.y-l.y)**2>c)continue;let f=fb.set(d.x-l.x,d.y-l.y,.4).normalize().multiplyScalar(.25+Math.min(r,4)*.08);this.petals.emit(d,f.multiplyScalar(o),$(n.colors[Math.floor(Math.random()*n.colors.length)]),s,e)}}this.petals.flush()}emitFrom(e,t,n,r,i){let a=e.emitPoints,o=Math.floor(Math.random()*(a.length/3)),s=pb.fromArray(a,o*3).applyMatrix4(e.group.matrixWorld);this.petals.emit(s,i,$(r[Math.floor(Math.random()*r.length)]),n,t)}trackFps(e){if(this.quality<.6||this.glyphs.length<3||this.queue.length||e-this.lastBuildAt<1){this.frames=0,this.fpsWindowStart=e;return}this.frames++;let t=e-this.fpsWindowStart;t>2.5&&(this.frames/t<32&&this.setQuality(this.quality*.7),this.frames=0,this.fpsWindowStart=e)}async snapshot(e,t){let n=this.renderer,r=n.getPixelRatio(),i=n.capabilities.maxTextureSize,a=Math.min(e,i/Math.max(innerWidth,innerHeight));try{return n.setPixelRatio(a),this.composer.setPixelRatio(a),this.resizePasses(),t?(this.scene.background=null,this.spores.visible=!1,n.setClearColor(0,0),n.render(this.scene,this.camera)):this.composer.render(),await new Promise((e,t)=>this.canvas.toBlob(n=>n?e(n):t(Error(`toBlob failed`)),`image/png`))}finally{this.scene.background=this.bg,this.spores.visible=!0,n.setPixelRatio(r),this.composer.setPixelRatio(r),this.resizePasses()}}resizePasses(){let e=this.renderer.getDrawingBufferSize(new q);for(let t of[this.tiltH,this.tiltV])t.uniforms.uResolution.value=[e.x,e.y];this.sporeUniforms.uPixelRatio.value=this.renderer.getPixelRatio()}},db=new X,fb=new J,pb=new J,mb;function hb(){let e=window.claude;return e?.use?mb??=e.use(`downloads`).then(e=>e??null).catch(()=>null):Promise.resolve(null)}async function gb(e,t){let n=await hb();if(n)try{return await n.save({filename:t,data:e}),!0}catch(e){if(e.code===`declined`)return!1;throw e}let r=URL.createObjectURL(e),i=Object.assign(document.createElement(`a`),{href:r,download:t});return document.body.append(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(r),2e3),!0}function _b(e){return`moss-${e.trim().toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``).slice(0,32)||`type`}`}async function vb(e,t,n,r){return gb(await e.snapshot(n,r),`${_b(t)}${r?`-alpha`:``}@${n}x.png`)}function yb(){for(let[e,t]of[[`video/mp4;codecs=avc1.640028`,`mp4`],[`video/mp4;codecs=avc1.42E01E`,`mp4`],[`video/mp4;codecs=avc1`,`mp4`],[`video/webm;codecs=vp9`,`webm`],[`video/webm;codecs=vp8`,`webm`],[`video/webm`,`webm`],[`video/mp4`,`mp4`]])if(MediaRecorder.isTypeSupported(e))return{mime:e,ext:t};return{mime:``,ext:`webm`}}var bb=class{rec;chunks=[];ext=`webm`;stopTimer=0;get recording(){return this.rec?.state===`recording`}static supported(){return typeof MediaRecorder<`u`&&`captureStream`in HTMLCanvasElement.prototype}start(e,t,n,r=60){let{mime:i,ext:a}=yb();this.ext=a,this.chunks=[];let o=e.captureStream(60);this.rec=new MediaRecorder(o,{mimeType:i||void 0,videoBitsPerSecond:12e6}),this.rec.ondataavailable=e=>{e.data.size&&this.chunks.push(e.data)},this.rec.onstop=()=>{clearTimeout(this.stopTimer),o.getTracks().forEach(e=>e.stop());let e=new Blob(this.chunks,{type:i||`video/webm`});if(!e.size)return n(`empty`);gb(e,`${t()}.${this.ext}`).then(e=>n(e?`saved`:`declined`),()=>n(`failed`))},this.rec.start(250),this.stopTimer=window.setTimeout(()=>this.stop(),r*1e3)}stop(){this.recording&&this.rec.stop()}};function xb(e,t=96){let n=document.createElement(`canvas`);n.width=n.height=t;let r=n.getContext(`2d`),i=ny(7),a=t/96,o={spring:jb,blossom:Eb,leafwreath:Db,crystal:Ob,lavender:kb,pastel:Ab}[e.style];return o(r,t,a,i,e),Sb(r,t),n.toDataURL(`image/png`)}function Sb(e,t){let n=e.createRadialGradient(t*.35,t*.3,0,t*.5,t*.5,t*.75);n.addColorStop(0,`rgba(255,255,255,0.16)`),n.addColorStop(.55,`rgba(255,255,255,0)`),n.addColorStop(1,`rgba(0,0,0,0.3)`),e.fillStyle=n,e.fillRect(0,0,t,t)}var Cb=(e,t)=>t[Math.floor(e()*t.length)];function wb(e,t,n,r,i,a,o,s,c,l=.45,u=.32){let d=c()*Math.PI;for(let s=0;s<i;s++){let c=d+s/i*Math.PI*2,u=e.createRadialGradient(t,n,0,t,n,r*1.6);u.addColorStop(0,a),u.addColorStop(1,o),e.fillStyle=u,e.beginPath(),e.ellipse(t+Math.cos(c)*r*.72,n+Math.sin(c)*r*.72,r*.72,r*l,c,0,Math.PI*2),e.fill()}e.fillStyle=s,e.beginPath(),e.arc(t,n,r*u,0,Math.PI*2),e.fill()}function Tb(e,t,n,r,i,a,o){e.save(),e.translate(t,n),e.rotate(i),e.fillStyle=a,e.beginPath(),e.moveTo(0,0),e.quadraticCurveTo(r*.5,-r*.32,r,0),e.quadraticCurveTo(r*.5,r*.32,0,0),e.fill(),e.strokeStyle=o,e.lineWidth=Math.max(.6,r*.04),e.beginPath(),e.moveTo(0,0),e.lineTo(r*.92,0),e.stroke(),e.restore()}var Eb=(e,t,n,r)=>{e.fillStyle=`#d9cbbf`,e.fillRect(0,0,t,t),e.lineCap=`round`;for(let i=0;i<40;i++){e.strokeStyle=Cb(r,[`#4a3a2c`,`#5e4a38`,`#3a2e25`]),e.lineWidth=1.2*n;let i=r()*t,a=r()*t,o=r()*Math.PI;e.beginPath(),e.moveTo(i,a),e.quadraticCurveTo(i+Math.cos(o)*14*n,a+Math.sin(o)*4*n,i+Math.cos(o)*26*n,a+Math.sin(o)*26*n),e.stroke()}for(let i=0;i<30;i++)e.fillStyle=Cb(r,[`#d1479c`,`#e0569f`,`#b85ab8`]),e.beginPath(),e.arc(r()*t,r()*t,1.4*n,0,Math.PI*2),e.fill();let i=[[`#ffffff`,`#fff4ec`,`#f08a1e`],[`#e8705e`,`#f6a493`,`#e0662a`],[`#d63a64`,`#f07f9c`,`#b3243f`],[`#f2a46a`,`#fcd3b2`,`#e47a22`],[`#a557a6`,`#dc9fd6`,`#8a3486`]];for(let a=0;a<9;a++){let[a,o,s]=Cb(r,i);wb(e,r()*t,r()*t,(8+r()*9)*n,6,a,o,s,r,.55,.26)}},Db=(e,t,n,r)=>{e.fillStyle=`#4a4434`,e.fillRect(0,0,t,t);let i=[[`#6d8c4a`,`#a8bf80`],[`#7b5240`,`#b08468`],[`#615d80`,`#9894b4`],[`#8a9a5a`,`#c1cc94`],[`#9a7f5f`,`#d0b58c`]];for(let a=0;a<46;a++){let[a,o]=Cb(r,i);Tb(e,r()*t,r()*t,(16+r()*14)*n,r()*Math.PI*2,a,o)}let a=[[`#f0a316`,`#f9cf4a`,`#d4472c`],[`#ead4ad`,`#f8ecd2`,`#a47a45`],[`#a3204a`,`#e0567d`,`#6b1830`],[`#7c86c8`,`#a9b2e6`,`#e3a02c`]];for(let i=0;i<4;i++){let[i,o,s]=Cb(r,a);wb(e,(.15+r()*.7)*t,(.15+r()*.7)*t,(8+r()*4)*n,16,i,o,s,r,.14,.3)}},Ob=(e,t,n,r)=>{e.fillStyle=`#8f8b84`,e.fillRect(0,0,t,t);for(let i=0;i<26;i++)e.fillStyle=Cb(r,[`#a7a29a`,`#8f958c`,`#7b8b80`,`#c9b9a6`]),e.beginPath(),e.ellipse(r()*t,r()*t,(6+r()*9)*n,(4+r()*6)*n,r()*3,0,Math.PI*2),e.fill();for(let i=0;i<260;i++){let i=(r()<.5?.25:.75)*t+(r()-.5)*t*.5,a=(r()<.5?.3:.75)*t+(r()-.5)*t*.35;e.fillStyle=Cb(r,[`#1d3a12`,`#3c6420`,`#5d8a2e`]),e.beginPath(),e.arc(i,a,1.2*n,0,Math.PI*2),e.fill()}let i=[[`#ffd7b0`,`#e8875a`],[`#ffffff`,`#c9d0d6`],[`#fff0e2`,`#f0a487`]];for(let a=0;a<5;a++){let[a,o]=Cb(r,i),s=(.2+r()*.6)*t,c=(.35+r()*.5)*t,l=(18+r()*14)*n,u=(5+r()*4)*n,d=(r()-.5)*.8;e.save(),e.translate(s,c),e.rotate(d),e.fillStyle=o,e.beginPath(),e.moveTo(-u,0),e.lineTo(-u,-l*.7),e.lineTo(0,-l),e.lineTo(0,0),e.closePath(),e.fill(),e.fillStyle=a,e.beginPath(),e.moveTo(0,0),e.lineTo(0,-l),e.lineTo(u,-l*.7),e.lineTo(u,0),e.closePath(),e.fill(),e.restore()}for(let i=0;i<4;i++)wb(e,r()*t,r()*t,(5+r()*2.5)*n,5,`#8f9be0`,`#e4e7fb`,`#f2c230`,r,.42,.25);for(let i=0;i<18;i++)e.fillStyle=`#f07a2a`,e.beginPath(),e.arc(r()*t,r()*t,1.1*n,0,Math.PI*2),e.fill()},kb=(e,t,n,r)=>{e.fillStyle=`#6b5a7a`,e.fillRect(0,0,t,t),e.lineCap=`round`;for(let i=0;i<14;i++){e.strokeStyle=Cb(r,[`#8a5e3f`,`#b98a62`,`#6e4a33`]),e.lineWidth=1.1*n;let i=r()*t,a=t*(.6+r()*.4);e.beginPath(),e.moveTo(i,a);for(let t=0;t<3;t++)i+=(r()-.3)*18*n,a-=(8+r()*12)*n,e.lineTo(i,a);e.stroke()}let i=[`#a993e4`,`#8c74d4`,`#c2b3f0`,`#6e57bd`,`#b7a6ee`];for(let a=0;a<260;a++)e.fillStyle=Cb(r,i),e.beginPath(),e.ellipse(r()*t*.9,r()*t,(2.6+r()*1.6)*n,(2+r()*1.2)*n,r()*3,0,Math.PI*2),e.fill();for(let a=0;a<14;a++)e.fillStyle=Cb(r,i),e.beginPath(),e.ellipse(t*(.8+r()*.2),r()*t,2.2*n,1.4*n,r()*3,0,Math.PI*2),e.fill()},Ab=(e,t,n,r)=>{e.fillStyle=`#7d86a6`,e.fillRect(0,0,t,t),e.lineCap=`round`;for(let i=0;i<220;i++){let i=r()<.55;e.strokeStyle=i?Cb(r,[`#f2a3c4`,`#e58bb5`,`#fbc8da`]):Cb(r,[`#b8c3da`,`#9aa8c8`]),e.lineWidth=1*n;let a=r()*t,o=(i?r()*.6:.3+r()*.7)*t,s=-Math.PI/2+(r()-.5)*1.6;e.beginPath(),e.moveTo(a,o),e.lineTo(a+Math.cos(s)*7*n,o+Math.sin(s)*7*n),e.stroke()}for(let i=0;i<70;i++)e.fillStyle=Cb(r,[`#f6d77a`,`#f2c95a`]),e.beginPath(),e.arc(r()*t*.45,t*(.6+r()*.4),1.8*n,0,Math.PI*2),e.fill();let i=[[`#ecd29a`,`#b98f4e`],[`#ecd29a`,`#b98f4e`],[`#b07cf0`,`#6a32b8`],[`#f2a08a`,`#c95a5a`]];for(let a=0;a<9;a++){let[a,o]=Cb(r,i),s=r()*t,c=r()*t,l=(5+r()*3)*n;e.fillStyle=o,e.beginPath(),e.arc(s,c,l*.5,0,Math.PI*2),e.fill(),e.strokeStyle=a,e.lineWidth=1.1*n;for(let t=0;t<16;t++){let n=t/16*Math.PI*2;e.beginPath(),e.moveTo(s+Math.cos(n)*l*.3,c+Math.sin(n)*l*.3),e.lineTo(s+Math.cos(n)*l,c+Math.sin(n)*l),e.stroke()}}},jb=(e,t,n,r,i)=>{e.fillStyle=i.mossBase,e.fillRect(0,0,t,t);let a=[[i.mossBase,140,7],[i.mossMid,170,6],[i.mossTip,110,4.5]];e.lineCap=`round`;for(let[i,o,s]of a){e.strokeStyle=i,e.lineWidth=1.3*n;for(let i=0;i<o;i++){let i=r()*t,a=r()*t,o=6+Math.floor(r()*3),c=s*(.7+r()*.6)*n,l=r()*Math.PI;e.beginPath();for(let t=0;t<o;t++){let n=l+t/o*Math.PI*2;e.moveTo(i,a),e.lineTo(i+Math.cos(n)*c,a+Math.sin(n)*c)}e.stroke()}}for(let a=0;a<4;a++){let a=(.15+r()*.7)*t,o=(.15+r()*.7)*t,s=(4.2+r()*1.8)*n,c=r()*Math.PI;for(let t=0;t<5;t++){let n=c+t/5*Math.PI*2,r=e.createRadialGradient(a,o,0,a,o,s*1.6);r.addColorStop(0,i.petalInner),r.addColorStop(1,i.petalEdge),e.fillStyle=r,e.beginPath(),e.ellipse(a+Math.cos(n)*s*.75,o+Math.sin(n)*s*.75,s*.7,s*.45,n,0,Math.PI*2),e.fill()}e.fillStyle=i.flowerCenter,e.beginPath(),e.arc(a,o,s*.32,0,Math.PI*2),e.fill()}},Mb={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},Nb=([e,t,n])=>{let r=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{r.setAttribute(e,String(t[e]))}),n?.length&&n.forEach(e=>{let t=Nb(e);r.appendChild(t)}),r},Pb=(e,t={})=>Nb([`svg`,{...Mb,...t},e]),Fb=[[`path`,{d:`m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16`}],[`path`,{d:`M15.697 14h5.606`}],[`path`,{d:`m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16`}],[`path`,{d:`M3.304 13h6.392`}]],Ib=[[`path`,{d:`M20 6 9 17l-5-5`}]],Lb=[[`path`,{d:`M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21`}],[`path`,{d:`m5.082 11.09 8.828 8.828`}]],Rb=[[`path`,{d:`M5 12h14`}]],zb=[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],Bb=[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`}]],Vb=[[`path`,{d:`M12 4v16`}],[`path`,{d:`M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2`}],[`path`,{d:`M9 20h6`}]],Hb=1.75;function Ub(e,t=18,n={}){return Pb(e,{width:t,height:t,"stroke-width":Hb,"aria-hidden":`true`,...n})}var Wb=[12,3,12,15,7,10,12,15,17,10,12,15],Gb=[6,6,18,18,18,6,12,12,6,18,12,12],Kb=`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`;function qb(e){let t=Wb.map((t,n)=>+(t+(Gb[n]-t)*e).toFixed(2));return`M${t[0]} ${t[1]}L${t[2]} ${t[3]}M${t[4]} ${t[5]}L${t[6]} ${t[7]}M${t[8]} ${t[9]}L${t[10]} ${t[11]}`}function Jb(e=18){let t=Ub([[`path`,{d:qb(0)}],[`path`,{d:Kb}]],e,{class:`icon-down`}),[n,r]=t.querySelectorAll(`path`);return{svg:t,path:n,tray:r}}var Yb=e=>document.getElementById(e),Xb=Yb(`stage`),Zb=Yb(`type-input`),Qb=Yb(`download-btn`),$b=Yb(`clear-btn`);$b.append(Ub(Lb));var{svg:ex,path:tx,tray:nx}=Jb();Qb.append(ex,Ub(Bb,14,{class:`icon-stop`,fill:`currentColor`}));var rx=Yb(`hint`),ix=Yb(`download-menu`),ax=Yb(`rec-badge`),ox=Yb(`rec-label`),sx=Yb(`presets`),cx=Yb(`toast`),lx=0;function ux(e){cx.textContent=e,cx.setAttribute(`data-show`,``),clearTimeout(lx),lx=window.setTimeout(()=>cx.removeAttribute(`data-show`),2400)}var dx=`moss-type:font`,fx=`instrument`;try{let e=localStorage.getItem(dx);_v.some(t=>t.id===e)&&(fx=e)}catch{}var px=e=>_v.find(t=>t.id===e),mx=new ub(Xb,await bv(px(fx)),fx);mx.warm(`eaotinshrdlcumwfgypbvkjxqzEAOTINSHRDLCUMWFGYPBVKJXQZ0123456789`),hb();function hx(){Zb.focus({preventScroll:!0})}matchMedia(`(hover: none) and (pointer: coarse)`).matches&&(rx.textContent=`Tap to start typing`);var gx=window.visualViewport;if(gx){let e=0,t=()=>{cancelAnimationFrame(e),e=requestAnimationFrame(()=>{Xb.style.top=`${gx.offsetTop}px`,Xb.style.height=`${gx.height}px`,mx.resize(innerWidth,gx.height)})};gx.addEventListener(`resize`,t),gx.addEventListener(`scroll`,t),addEventListener(`resize`,t)}var _x=`moss-type:preset`,vx=0;try{vx=Math.min(tb.length-1,Math.max(0,Number(localStorage.getItem(_x))||0))}catch{}var yx=tb.map((e,t)=>{let n=document.createElement(`button`);n.className=`preset`,n.setAttribute(`aria-label`,e.name),n.innerHTML=`<span class="swatch"></span><span class="tip">${e.name}</span>`;let r=n.firstElementChild;return r.style.backgroundImage=`url(${xb(e)})`,n.addEventListener(`click`,()=>bx(t)),sx.append(n),n});function bx(e,t=!1){vx=e;let n=tb[e];mx.setPreset(n,t),yx.forEach((t,n)=>t.setAttribute(`aria-pressed`,String(e===n))),document.body.style.setProperty(`--bg`,n.bg),document.body.toggleAttribute(`data-dark`,n.dark);try{localStorage.setItem(_x,String(e))}catch{}hx()}bx(vx,!0);function xx(){mx.setText(Zb.value);let e=Zb.value.length===0;rx.toggleAttribute(`data-hidden`,!e),$b.disabled=e}Zb.addEventListener(`input`,xx),Zb.addEventListener(`keydown`,e=>{e.key===`Enter`&&Zb.value.split(`
`).length>=3&&e.preventDefault()}),Xb.addEventListener(`click`,hx),$b.addEventListener(`click`,()=>{Zb.value=``,mx.clear(),xx(),hx()}),hx(),xx(),addEventListener(`keydown`,e=>{document.activeElement!==Zb&&ix.hidden&&Cx.hidden&&kx.hidden&&(e.key===`ArrowRight`&&bx((vx+1)%tb.length),e.key===`ArrowLeft`&&bx((vx+tb.length-1)%tb.length))});var Sx=Yb(`font-btn`),Cx=Yb(`font-menu`);Sx.append(Ub(Vb)),xv();var wx=_v.map(e=>{let t=document.createElement(`button`);return t.setAttribute(`role`,`menuitemradio`),t.dataset.font=e.id,t.innerHTML=`<span style="font-family:'MossMenu-${e.id}', var(--ui-font); font-weight:${e.weight}">${e.label}</span>`,t.append(Ub(Ib,16)),Cx.append(t),t}),Tx=()=>wx.forEach(e=>e.setAttribute(`aria-checked`,String(e.dataset.font===fx)));Tx();function Ex(e){e!==!Cx.hidden&&(e&&(Bx(!1),Fx(!1)),Cx.hidden=!e,Sx.setAttribute(`aria-expanded`,String(e)),e?Cx.querySelector(`[aria-checked="true"]`)?.focus():hx())}Sx.addEventListener(`click`,e=>{e.stopPropagation(),Ex(!!Cx.hidden)}),Cx.addEventListener(`click`,async e=>{let t=e.target.closest(`button`)?.dataset.font;if(t&&(Ex(!1),t!==fx)){Sx.toggleAttribute(`data-busy`,!0);try{let e=await bv(px(t));fx=t,mx.setFont(e,t),Tx();try{localStorage.setItem(dx,t)}catch{}}catch(e){console.error(e),ux(`Could not load that font`)}finally{Sx.removeAttribute(`data-busy`)}}}),Cx.addEventListener(`keydown`,e=>{e.key===`Escape`&&Ex(!1)}),addEventListener(`pointerdown`,e=>{!Cx.hidden&&!Cx.contains(e.target)&&!Sx.contains(e.target)&&Ex(!1)});var Dx=`moss-type:size`,Ox=Yb(`size-btn`),kx=Yb(`size-menu`),Ax=Yb(`size-range`),jx=Yb(`size-val`),Mx=Yb(`size-down`),Nx=Yb(`size-up`);Ox.append(Ub(Fb)),Mx.append(Ub(Rb,16)),Nx.append(Ub(zb,16));function Px(e,t=!0){let n=Math.min(+Ax.max,Math.max(+Ax.min,Math.round(e/5)*5));if(Ax.value=String(n),jx.textContent=`${n}%`,Mx.disabled=n<=+Ax.min,Nx.disabled=n>=+Ax.max,mx.setTextSize(n/100),t)try{localStorage.setItem(Dx,String(n))}catch{}}{let e=100;try{e=Number(localStorage.getItem(Dx))||100}catch{}Px(e,!1)}function Fx(e){e!==!kx.hidden&&(e&&(Bx(!1),Ex(!1)),kx.hidden=!e,Ox.setAttribute(`aria-expanded`,String(e)),e?Ax.focus():hx())}Ox.addEventListener(`click`,e=>{e.stopPropagation(),Fx(!!kx.hidden)}),Ax.addEventListener(`input`,()=>Px(+Ax.value)),Mx.addEventListener(`click`,()=>Px(Ax.value-10)),Nx.addEventListener(`click`,()=>Px(+Ax.value+10)),kx.addEventListener(`keydown`,e=>{e.key===`Escape`&&Fx(!1)}),addEventListener(`pointerdown`,e=>{!kx.hidden&&!kx.contains(e.target)&&!Ox.contains(e.target)&&Fx(!1)});var Ix=new bb,Lx=0,Rx=0;function zx(e){cancelAnimationFrame(Rx);let t=Lx,n=+!!e,r=performance.now(),i=e=>{let a=Math.min(1,(e-r)/220),o=1-(1-a)**3;Lx=t+(n-t)*o,tx.setAttribute(`d`,qb(Lx)),nx.style.opacity=String(1-Lx),a<1&&(Rx=requestAnimationFrame(i))};Rx=requestAnimationFrame(i)}function Bx(e){e!==!ix.hidden&&(e&&(Ex(!1),Fx(!1)),zx(e),ix.hidden=!e,Qb.setAttribute(`aria-expanded`,String(e)),e?ix.querySelector(`button`).focus():hx())}Qb.addEventListener(`click`,e=>{if(e.stopPropagation(),Ix.recording){Ix.stop();return}Bx(!!ix.hidden)}),addEventListener(`pointerdown`,e=>{!ix.hidden&&!ix.contains(e.target)&&!Qb.contains(e.target)&&Bx(!1)}),ix.addEventListener(`keydown`,e=>{e.key===`Escape`&&Bx(!1)});function Vx(e,t){return bb.supported()?(ax.hidden=!1,ox.textContent=e,Qb.toggleAttribute(`data-recording`,!0),Qb.setAttribute(`aria-label`,`Stop recording`),Ix.start(Xb,()=>_b(Zb.value),e=>{ax.hidden=!0,Qb.removeAttribute(`data-recording`),Qb.setAttribute(`aria-label`,`Download`);let t={saved:`Video saved`,declined:`Video not saved`,empty:`Recording came out empty. Try again or use another browser`,failed:`Could not save the video`}[e];ux(t)},t),!0):(ux(`Video recording is not supported in this browser`),!1)}async function Hx(e,t){ux(await vb(mx,Zb.value,e,t)?t?`Transparent PNG saved`:`PNG saved`:`PNG not saved`)}ix.addEventListener(`click`,async e=>{let t=e.target.closest(`button`)?.dataset.action;if(t){if(Bx(!1),!Zb.value.trim()&&t!==`record`){ux(`Type something first`);return}try{switch(t){case`png`:await Hx(2,!1);break;case`png4`:await Hx(4,!1);break;case`record`:Vx(`REC · press ■ to finish`,60)&&ux(`Recording. Type away`)}}catch(e){console.error(e),ux(`Download failed`)}}});function Ux(){mx.update(),requestAnimationFrame(Ux)}requestAnimationFrame(Ux),Object.assign(window,{stage:mx});