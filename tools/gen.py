import json,math,glob,importlib.util
ALL=[]
def C(y,n,u,q,c,w,e,f=None):
    assert len(w)==3 and c not in w and len(set(w))==3,(y,n)
    ALL.append(dict(y=y,n=n,u=u,q=q,c=c,w=w,e=e,f=f))
def tr(pts,sc,ox,oy):  # math coords -> screen
    return {k:[round(ox+v[0]*sc,1),round(oy-v[1]*sc,1)] for k,v in pts.items()}
for fn in sorted(glob.glob('y*.py')):
    exec(open(fn).read())
out='/* 歷屆會考改編題：依心測中心公布之 111–115 年國中教育會考數學科試題改編（改數字、換情境），答案與解析重新計算撰寫 */\nvar CAPQ=[];function CP(o){CAPQ.push(o)}\n'
HARD={(111,15),(111,19),(111,20),(112,13),(112,19),(112,20),(113,18),(113,20),(114,12),(114,15),(114,17),(115,16),(115,18),(115,19),(115,20)}
for o in ALL:
    if o['n']<=20 and (o['y'],o['n']) not in HARD: o['m']=1
    d={k:v for k,v in o.items() if v is not None}
    out+='CP('+json.dumps(d,ensure_ascii=False)+');\n'
open(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','src','cap.js'),'w').write(out)
from collections import Counter
print(sum(1 for o in ALL if o.get('m')),len(ALL),Counter(o['y'] for o in ALL))
