from PIL import Image

img = Image.open(r'D:\workgroup\yugutu_20260818\tests\shots\exp.png').convert('RGB')
w, h = img.size
cols = {}
for y in range(500, 526):
    for x in range(w):
        r, g, b = img.getpixel((x, y))
        if r > 200 and 120 <= g <= 190 and b < 130:
            cols.setdefault(x, []).append(y)

xs = sorted(cols)
print('x range', xs[0], xs[-1])
for x in range(xs[0], xs[-1] + 1):
    ys = cols.get(x)
    if ys:
        print(x, 'count=%d' % len(ys), 'ymin=%d' % min(ys), 'ymax=%d' % max(ys))
    else:
        print(x, 'gap')
