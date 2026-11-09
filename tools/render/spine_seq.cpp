// Plaster spine SDF renderer. Writes a float buffer; lighting is composited in Python.
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <vector>
#include <algorithm>
using namespace std;
struct V{float x,y,z;V(float a=0,float b=0,float c=0):x(a),y(b),z(c){}};
inline V operator+(V a,V b){return V(a.x+b.x,a.y+b.y,a.z+b.z);}
inline V operator-(V a,V b){return V(a.x-b.x,a.y-b.y,a.z-b.z);}
inline V operator*(V a,float s){return V(a.x*s,a.y*s,a.z*s);}
inline float dot(V a,V b){return a.x*b.x+a.y*b.y+a.z*b.z;}
inline float len(V a){return sqrtf(dot(a,a));}
inline V norm(V a){return a*(1.f/len(a));}
inline V cross(V a,V b){return V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);}
inline float mixf(float a,float b,float t){return a+(b-a)*t;}
inline float clampf(float x,float a,float b){return x<a?a:(x>b?b:x);}
inline float smin(float a,float b,float k){float h=max(k-fabsf(a-b),0.f)/k;return min(a,b)-h*h*k*.25f;}
inline float capsule(V p,V a,V b,float r1,float r2){V pa=p-a,ba=b-a;float h=clampf(dot(pa,ba)/dot(ba,ba),0,1);return len(pa-ba*h)-mixf(r1,r2,h);}
inline float ellipsoid(V p,V c,V r){V q=p-c;V a(q.x/r.x,q.y/r.y,q.z/r.z);V b(a.x/r.x,a.y/r.y,a.z/r.z);float k0=len(a),k1=len(b);return k1<1e-5f?-min(r.x,min(r.y,r.z)):k0*(k0-1.f)/k1;}
inline float hash3(int x,int y,int z){unsigned h=(unsigned)x*374761393u+(unsigned)y*668265263u+(unsigned)z*2147483647u;h=(h^(h>>13))*1274126177u;return ((h^(h>>16))&0xffff)/65535.f;}
float vnoise(V p){int X=floor(p.x),Y=floor(p.y),Z=floor(p.z);float x=p.x-X,y=p.y-Y,z=p.z-Z;x=x*x*(3-2*x);y=y*y*(3-2*y);z=z*z*(3-2*z);
 float c[8];for(int i=0;i<8;i++)c[i]=hash3(X+(i&1),Y+((i>>1)&1),Z+((i>>2)&1));
 float a=mixf(mixf(c[0],c[1],x),mixf(c[2],c[3],x),y),b=mixf(mixf(c[4],c[5],x),mixf(c[6],c[7],x),y);return mixf(a,b,z);}

enum Kind{ATLAS,AXIS,CERV,THOR,LUMB};
struct Vert{Kind k;float r,h;V c;float cs,sn;float bound;int lvl;};
vector<Vert> verts; V sacC;float sacCs,sacSn;
// Spine centreline: z(y) as a smooth S. +z is posterior.
float curveZ(float s){ // s: 0 top C1 .. 1 sacrum top
 return 0.42f*sinf((s-0.02f)*M_PI*2.05f+0.35f)*(0.72f+.5f*s)-0.05f;
}
float bodySdf(V p,float r,float h){ // waisted, slightly kidney body
 float w=1.f-.13f*(1.f-clampf(p.y*p.y/(h*h*.25f),0,1));
 float rr=r*w; V q(p.x,0,(p.z-(p.z>0?.0f:0.f))/.8f);
 float dx=sqrtf(q.x*q.x+q.z*q.z)-rr+.03f*r/.1f*.0f;
 float dy=fabsf(p.y)-h*.5f; float rnd=min(.22f*h,.05f);
 float a=max(dx+rnd,0.f),b=max(dy+rnd,0.f);
 float d=sqrtf(a*a+b*b)+min(max(dx+rnd,dy+rnd),0.f)-rnd;
 return d*.8f;
}
float vertebra(const Vert&v,V p){
 float r=v.r,h=v.h; p.x=fabsf(p.x); // symmetric
 float d=1e3f,k=.055f+r*.12f;
 if(v.k==ATLAS){
  V q=p-V(0,0,.55f*r);float t=sqrtf(q.x*q.x+q.z*q.z*.8f)-1.25f*r;d=sqrtf(t*t+q.y*q.y*2.2f)-.22f*r;
  d=smin(d,ellipsoid(p,V(1.25f*r,0,.45f*r),V(.42f*r,.42f*r,.48f*r)),k);
  d=smin(d,capsule(p,V(1.3f*r,0,.45f*r),V(2.45f*r,-.05f*r,.25f*r),.2f*r,.14f*r),k);
  d=smin(d,ellipsoid(p,V(0,0,2.0f*r),V(.2f*r,.18f*r,.14f*r)),k);
  return d;
 }
 d=bodySdf(p,r,h);
 V ped0(.55f*r,.18f*h,.62f*r),ped1(.62f*r,.1f*h,1.5f*r),lam(0,-.05f*h,2.0f*r);
 d=smin(d,capsule(p,ped0,ped1,.27f*r,.25f*r),k);
 d=smin(d,capsule(p,ped1,lam,.27f*r,.26f*r),k);
 // articular processes
 d=smin(d,ellipsoid(p,ped1+V(.02f*r,.62f*h,.04f*r),V(.2f*r,.33f*h,.13f*r)),k);
 d=smin(d,ellipsoid(p,ped1+V(-.08f*r,-.72f*h,.14f*r),V(.2f*r,.33f*h,.13f*r)),k);
 float dropS,lenS,r1,r2;V tipT;float tr1,tr2;
 if(v.k==CERV||v.k==AXIS){dropS=.55f*h;lenS=1.05f*r;r1=.22f*r;r2=.16f*r;tipT=V(2.0f*r,.12f*h,.95f*r);tr1=.27f*r;tr2=.22f*r;}
 else if(v.k==THOR){float t=clampf((v.lvl-7)/11.f,0,1);float mid=1.f-fabsf(t-.45f)/.55f;dropS=mixf(.55f,1.9f,mid)*h;lenS=mixf(1.3f,1.5f,mid)*r;r1=.23f*r;r2=.15f*r;tipT=V(1.75f*r,.45f*h,1.8f*r);tr1=.27f*r;tr2=.23f*r;}
 else {dropS=.3f*h;lenS=1.25f*r;r1=.26f*r;r2=.22f*r;tipT=V(2.15f*r,.06f*h,1.05f*r);tr1=.21f*r;tr2=.15f*r;}
 V st=lam,en=lam+V(0,-dropS,lenS);
 if(v.k==LUMB){ // hatchet: two parallel bars fused
  d=smin(d,capsule(p,st+V(0,.2f*h,0),en+V(0,.22f*h,0),r1,r2),k);
  d=smin(d,capsule(p,st+V(0,-.25f*h,0),en+V(0,-.28f*h,0),r1,r2),k);
 } else if(v.k==CERV||v.k==AXIS){ // bifid tip
  V mid=st+(en-st)*.62f;
  d=smin(d,capsule(p,st,mid,r1,r1*.9f),k);
  d=smin(d,capsule(p,mid,en+V(.2f*r,0,0),r1*.8f,r2),k*.7f);
 } else d=smin(d,capsule(p,st,en,r1,r2),k);
 d=smin(d,capsule(p,ped1+V(-.05f*r,.08f*h,-.1f*r),tipT,tr1,tr2),k);
 if(v.k==AXIS) d=smin(d,capsule(p,V(0,.4f*h,.02f),V(0,h*1.55f,.02f),.34f*r,.24f*r),k);
 return d;
}
inline V toLocal(const Vert&v,V p){V q=p-v.c;return V(q.x,q.y*v.cs+q.z*v.sn,-q.y*v.sn+q.z*v.cs);}
float sacrum(V p){
 V q=p-sacC;V l(q.x,q.y*sacCs+q.z*sacSn,-q.y*sacSn+q.z*sacCs);float ax=fabsf(l.x);
 float d=1e3f;
 for(int i=0;i<5;i++){float t=i/4.f;float y=-t*1.25f,z=.09f*sinf(t*2.6f)+.22f*t*t;
  float w=mixf(.56f,.15f,pow(t,.8f)),hh=mixf(.2f,.09f,t),dd=mixf(.2f,.1f,t);
  d=smin(d,ellipsoid(V(ax,l.y,l.z),V(0,y,z),V(w,hh+.08f,dd)),.17f);
  d=smin(d,ellipsoid(V(ax,l.y,l.z),V(0,y,z+dd*.92f),V(.07f,.13f,.09f)),.06f);
  // foramina dimples
  if(i<4){float fw=w*.55f;float f=ellipsoid(V(ax,l.y,l.z),V(fw,y-.14f,z+dd*.7f),V(.075f,.075f,.2f));d=max(d,-f+.0f)*.999f+0*f;}
 }
 d=smin(d,ellipsoid(V(ax,l.y,l.z),V(.46f,-.14f,.0f),V(.2f,.28f,.12f)),.12f);
 for(int i=0;i<4;i++){float t=i/3.f;float y=-1.46f-t*.42f,z=.48f-.26f*t*t*1.3f;d=smin(d,ellipsoid(V(ax,l.y,l.z),V(0,y,z),V(mixf(.12f,.05f,t),.08f,.07f)),.035f);}
 return d;
}
struct Scap{V org;float cy,sy;};
float scapula(V p){
 V l(fabsf(p.x),p.y,p.z);
 // rotate wing about y to follow the rib cage
 V o(.0f,1.72f,.86f);V q=l-o;float a=.52f,c=cosf(a),s=sinf(a);V m(q.x*c-q.z*s,q.y,q.x*s+q.z*c);
 // triangle in xy
 V A(.62f,.36f),B(.86f,-1.25f),C(1.72f,-.1f);
 V e0=B-A,e1=C-B,e2=A-C,v0=m-A,v1=m-B,v2=m-C;
 auto seg=[&](V v,V e){float t=clampf(dot(V(v.x,v.y),V(e.x,e.y))/dot(V(e.x,e.y),V(e.x,e.y)),0,1);V w=V(v.x-e.x*t,v.y-e.y*t);return dot(V(w.x,w.y),V(w.x,w.y));};
 float d2=sqrtf(min(seg(v0,e0),min(seg(v1,e1),seg(v2,e2))));
 float sgn=e0.x*e2.y-e0.y*e2.x;sgn=sgn>0?1:-1;
 float s0=sgn*(v0.x*e0.y-v0.y*e0.x),s1=sgn*(v1.x*e1.y-v1.y*e1.x),s2=sgn*(v2.x*e2.y-v2.y*e2.x);
 if(min(s0,min(s1,s2))>0)d2=-d2;
 float bow=m.z+.11f*sinf(clampf((m.x-.62f)/1.1f,0,1)*M_PI);
 float rim=.05f;float ax=d2+.1f,az=fabsf(bow)-.012f;
 float d=sqrtf(max(ax,0.f)*max(ax,0.f)+max(az,0.f)*max(az,0.f))+min(max(ax,az),0.f)-rim-.04f;
 d*=.85f;
 V sp0(.68f,-.14f,.05f),sp1(1.3f,.04f,.2f),acr(2.02f,.22f,.16f);
 d=smin(d,capsule(m,sp0,sp1,.035f,.075f),.09f);
 d=smin(d,capsule(m,sp1,acr,.075f,.08f),.07f);
 d=smin(d,ellipsoid(m,acr+V(.14f,.05f,0),V(.27f,.12f,.1f)),.07f);
 d=smin(d,capsule(m,V(1.64f,.02f,-.05f),V(1.86f,.32f,-.3f),.08f,.06f),.07f); // coracoid
 d=smin(d,ellipsoid(m,V(1.76f,-.12f,-.02f),V(.09f,.24f,.1f)),.06f); // glenoid lip
 return d;
}
float clavicle(V p){
 V l(fabsf(p.x),p.y,p.z);
 V a(.24f,2.72f,-.45f),b(.86f,2.86f,-.62f),c(1.5f,2.95f,-.38f),e(2.0f,2.88f,.1f);
 float d=capsule(l,a,b,.11f,.075f);d=smin(d,capsule(l,b,c,.075f,.065f),.05f);d=smin(d,capsule(l,c,e,.065f,.085f),.05f);return d;
}
float map(V p){
 float res=1e3f;
 for(const Vert&v:verts){float b=len(p-v.c)-v.bound;if(b>.18f){res=min(res,b);continue;}V l=toLocal(v,p);res=min(res,vertebra(v,l));}
 {float b=len(p-(sacC+V(0,-.8f,0)))-2.0f;if(b>.18f)res=min(res,b);else res=min(res,sacrum(p));}
 // cast skin: slow hand-finished undulation
 return res;
}
float mapS(V p){float d=map(p);if(d<.08f){d+=.0028f*(vnoise(p*6.f)-.5f)+.0007f*(vnoise(p*30.f)-.5f);}return d;}
V normalAt(V p){float e=.0035f;V k1(1,-1,-1),k2(-1,-1,1),k3(-1,1,-1),k4(1,1,1);V n=k1*mapS(p+k1*e)+k2*mapS(p+k2*e)+k3*mapS(p+k3*e)+k4*mapS(p+k4*e);return norm(n);}

V wallP,wallN;
struct Hit{bool obj;float t;};
Hit trace(V ro,V rd){float t=18.f;float tw=dot(wallP-ro,wallN)/dot(rd,wallN);float tmax=tw;
 for(int i=0;i<200;i++){V p=ro+rd*t;float d=map(p);if(d<.0009f){for(int k=0;k<4;k++)t+=map(ro+rd*t);return{true,t};}t+=d*.92f;if(t>tmax)break;}
 return{false,tw};}
float shadow(V ro,V rd,float tmax,float k,float jit){float res=1,t=.07f+jit*.05f;
 for(int i=0;i<90&&t<tmax;i++){float h=map(ro+rd*t);if(h<.0006f){if(t>.1f)return 0;h=.002f;}
  if(t>.14f)res=min(res,k*h/t);t+=clampf(h*.65f,.012f,.3f)*(.85f+.3f*jit);if(res<.004f)break;}
 res=clampf(res,0,1);return res*res*(3-2*res);}
float ao(V p,V n){float occ=0,w=1;for(int i=1;i<=6;i++){float h=.012f+.075f*i*i*.2f;float d=map(p+n*h);occ+=(h-d)*w;w*=.68f;}return clampf(1-1.55f*occ,0,1);}

void build(){
 struct L{Kind k;float r,h,g;};vector<L> ls;
 ls.push_back({ATLAS,.12f,.1f,.06f});ls.push_back({AXIS,.125f,.14f,.05f});
 for(int i=0;i<5;i++){float t=i/4.f;ls.push_back({CERV,mixf(.13f,.15f,t),mixf(.12f,.13f,t),.055f});}
 for(int i=0;i<12;i++){float t=i/11.f;ls.push_back({THOR,mixf(.155f,.235f,t),mixf(.16f,.25f,t),mixf(.05f,.07f,t)});}
 for(int i=0;i<5;i++){float t=i/4.f;ls.push_back({LUMB,mixf(.25f,.285f,t),mixf(.27f,.28f,t),.095f});}
 float H=0;for(auto&l:ls)H+=l.h+l.g;
 float y=3.72f;float acc=0;
 for(size_t i=0;i<ls.size();i++){float s=(acc+ls[i].h*.5f)/H;float ds=.01f;float dz=(curveZ(s+ds)-curveZ(s-ds))/(2*ds*H);float tilt=atanf(dz);
  Vert v;v.k=ls[i].k;v.r=ls[i].r;v.h=ls[i].h;v.c=V(0,y-acc-ls[i].h*.5f,curveZ(s));v.cs=cosf(tilt);v.sn=sinf(tilt);v.lvl=i;
  float ext=v.k==LUMB?2.75f:(v.k==THOR?3.3f:3.4f);v.bound=max(ext*v.r+v.h*2.8f,.4f);
  verts.push_back(v);acc+=ls[i].h+ls[i].g;}
 float yEnd=y-acc;float zEnd=curveZ(1.f);sacC=V(0,yEnd-.12f,zEnd-.02f);float a=-.42f;sacCs=cosf(a);sacSn=sinf(a);
}
float Htot=7.6f;
int main(int ac,char**av){
 // W H frameH yc yaw lightY lightX out
 int W=atoi(av[1]),H=atoi(av[2]);float frameH=atof(av[3]),yc=atof(av[4]),yaw=atof(av[5]),lightY=atof(av[6]),lightX=atof(av[7]);build();
 float tot=0;for(size_t i=0;i+1<verts.size();i++)tot+=verts[i].c.y-verts[i+1].c.y;tot+=.3f;
 float sc=clampf((3.72f-yc)/tot,0,1);
 V view(sinf(yaw),0,cosf(yaw));V rt=norm(cross(V(0,1,0),view));V up=cross(view,rt);
 V target(0,yc,curveZ(sc));float D=30;V ro0=target+view*D;V fw=view*-1.f;
 wallN=view;wallP=target-view*2.4f;
 float halfH=frameH*.5f,halfW=halfH*W/(float)H;
 struct Lt{V pos;bool dir;float k;float falloff;};
 V keyDir=norm(rt*-.94f+up*.62f+view*.40f);V fillDir=norm(rt*.9f+up*-.2f+view*.25f);
 V lp=V(0,lightY,curveZ(clampf((3.72f-lightY)/tot,0,1)))+rt*lightX+view*2.1f;
 Lt lights[3]={{keyDir,true,16,0},{fillDir,true,5,0},{lp,false,12,.42f}};
 int NL=3,stride=3+NL;vector<float> buf(W*H*stride,0.f);
 #pragma omp parallel for schedule(dynamic,4)
 for(int j=0;j<H;j++){for(int i=0;i<W;i++){
  float sx=((i+.5f)/W*2-1)*halfW,sy=(1-(j+.5f)/H*2)*halfH;
  V ro=ro0+rt*sx+up*sy;V rd=fw;Hit h=trace(ro,rd);V p=ro+rd*h.t;V n=h.obj?normalAt(p):wallN;
  float a=h.obj?ao(p,n):1;float*o=&buf[(j*W+i)*stride];o[0]=h.obj;
  if(!h.obj){float d=map(p+wallN*.25f);a=clampf(.55f+d*.9f,0,1);}
  o[1]=a;o[2]=.5f+.5f*dot(n,up);
  for(int l=0;l<NL;l++){V L;float tmax,at=1;if(lights[l].dir){L=lights[l].pos;tmax=9;}else{V d=lights[l].pos-p;float r=len(d);L=d*(1/r);tmax=r;at=1/(1+lights[l].falloff*r*r*r*r*.08f);}
   float nl=dot(n,L);if(nl<=0){o[3+l]=0;continue;}float wrap=clampf((nl+.08f)/1.08f,0,1);float s=shadow(p+n*.03f,L,tmax,lights[l].k,hash3(i,j,l));o[3+l]=wrap*s*at;}
 }}
 FILE*f=fopen(av[8],"wb");fwrite(buf.data(),sizeof(float),buf.size(),f);fclose(f);return 0;
}
