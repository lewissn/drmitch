import sys, os, subprocess, numpy as np
from PIL import Image
# seq.py renderW renderH N outdir sizes(comma) [only indices comma]
W,H,N,out=int(sys.argv[1]),int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
sizes=[int(x) for x in sys.argv[5].split(',')]
only=None if len(sys.argv)<7 else [int(x) for x in sys.argv[6].split(',')]
os.makedirs(out,exist_ok=True)
#        p     yc     fH    yaw    lightY keyW  lightW lightX
KEYS=[(0.00, 3.05,  2.7, -0.30,  3.05, .46, 3.0, -1.5),
      (0.26, 2.72,  2.7, -0.44,  2.80, .46, 3.0, -1.5),
      (0.40, 1.95,  3.0, -0.56,  1.95, .46, 3.0, -1.8),
      (0.56, 1.50,  3.0, -0.66,  1.55, .46, 3.0, -1.8),
      (0.72,-1.25,  3.4, -0.86, -1.15, .46, 3.0, -1.7),
      (0.86,-1.90,  3.4, -0.98, -1.85, .46, 3.0, -1.7),
      (1.00,-0.20,  9.4, -0.72, -0.20, .92, 1.2, -2.4)]
def at(p):
    for a,b in zip(KEYS,KEYS[1:]):
        if p<=b[0]:
            t=(p-a[0])/(b[0]-a[0]); t=t*t*(3-2*t)
            v=[a[i]+(b[i]-a[i])*t for i in range(1,8)]
            v[1]=np.exp(np.log(a[2])+(np.log(b[2])-np.log(a[2]))*t)
            return v
    return list(KEYS[-1][1:])
G=np.array([26,43,168])/255.
lin=lambda c: np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
srgb=lambda c: np.where(c<=.0031308,c*12.92,1.055*np.power(np.clip(c,0,None),1/2.4)-.055)
g=lin(G); pl=np.array([.86,.84,.79]); warm=np.array([1,.88,.70]); cool=np.array([.88,.93,1.])
amb0=g*.62+.012
for f in range(N):
    if only is not None and f not in only: continue
    p=f/(N-1); yc,fH,yaw,ly,kw,lw,lx=at(p)
    b=f'{out}/f{f}.bin'
    subprocess.run(['./spine_seq',str(W),str(H),f'{fH:.4f}',f'{yc:.4f}',f'{yaw:.4f}',f'{ly:.4f}',f'{lx:.3f}',b],check=True)
    a=np.fromfile(b,dtype=np.float32).reshape(H,W,6); os.remove(b)
    obj,ao,hemi,key,fill,R=[a[...,i][...,None] for i in range(6)]
    amb=(amb0*(.55+.75*hemi)+.035)*ao**1.25
    light=cool*key*kw*ao**.5+amb0*1.5*fill+warm*R*lw*ao**.7
    co=pl*(amb+light)
    shade=(.86+.14*ao)*(.72+.28*key)
    cw=g*(shade*1.14+R*.5*np.array([2.2,1.9,1.5])*(lw/3.0))
    c=co*obj+cw*(1-obj); c=c*(1+c/1.8)/(1+c)*1.16
    img=srgb(np.clip(c,0,1))
    base=Image.fromarray((img*255+.5).astype(np.uint8))
    for s in sizes:
        im=base.resize((s,round(H*s/W)),Image.LANCZOS)
        arr=np.asarray(im).astype(np.float32); h,w=arr.shape[:2]
        x=np.arange(w)[None,:]; e=np.clip(np.minimum(x,w-1-x)/(w*.1),0,1); e=(e*e*(3-2*e))[...,None]
        arr=arr*e+(G*255)*(1-e)
        Image.fromarray(np.clip(arr,0,255).round().astype(np.uint8)).save(f'{out}/{s}-{f:03d}.webp',quality=74,method=6)
    print(f,flush=True)
