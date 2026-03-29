from math import atan2, cos, pi, sin, sqrt
from random import Random

from PIL import Image, ImageChops, ImageDraw, ImageFilter


WIDTH = 1600
HEIGHT = 1200
CENTER = (WIDTH // 2, HEIGHT // 2)
RADIUS = 270
RNG = Random(7)


def lerp(a, b, t):
    return a + (b - a) * t


def blend(c1, c2, t):
    return tuple(int(lerp(a, b, t)) for a, b in zip(c1, c2))


def radial_gradient(size, radius, inner, outer, power=1.0):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    px = img.load()
    cx, cy = size[0] / 2, size[1] / 2
    for y in range(size[1]):
        dy = y - cy
        for x in range(size[0]):
            dx = x - cx
            d = sqrt(dx * dx + dy * dy) / radius
            if d <= 1.0:
                t = min(1.0, d**power)
                r, g, b = blend(inner, outer, t)
                alpha = int(255 * (1.0 - d**4))
                px[x, y] = (r, g, b, alpha)
    return img


def make_space():
    base = Image.new("RGB", (WIDTH, HEIGHT), (5, 6, 12))
    px = base.load()
    for y in range(HEIGHT):
        v = y / (HEIGHT - 1)
        tint = blend((6, 7, 14), (1, 1, 4), v)
        for x in range(WIDTH):
            px[x, y] = tint
    draw = ImageDraw.Draw(base)
    for _ in range(240):
        x = RNG.randint(0, WIDTH - 1)
        y = RNG.randint(0, HEIGHT - 1)
        s = RNG.choice([1, 1, 1, 2])
        c = RNG.randint(160, 255)
        draw.ellipse((x, y, x + s, y + s), fill=(c, c, c))
    return base.filter(ImageFilter.GaussianBlur(0.25))


def make_texture(size):
    tex = Image.effect_noise(size, 90).convert("L")
    tex = tex.filter(ImageFilter.GaussianBlur(2.2))
    tex2 = Image.effect_noise(size, 38).convert("L")
    tex2 = tex2.filter(ImageFilter.GaussianBlur(10))
    tex = ImageChops.add(tex, tex2, scale=1.7)
    swirl = Image.new("L", size, 0)
    px = swirl.load()
    cx, cy = size[0] / 2, size[1] / 2
    for y in range(size[1]):
        dy = y - cy
        for x in range(size[0]):
            dx = x - cx
            d = sqrt(dx * dx + dy * dy)
            a = atan2(dy, dx)
            v = 0.5 + 0.5 * sin(a * 12 + d * 0.055) * cos(a * 5 - d * 0.03)
            px[x, y] = int(v * 255)
    swirl = swirl.filter(ImageFilter.GaussianBlur(2))
    return ImageChops.screen(tex, swirl)


def circle_mask(size, radius, blur=0):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = size[0] // 2, size[1] // 2
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=255)
    if blur:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    return mask


def colorize_texture(tex):
    img = Image.new("RGBA", tex.size)
    src = tex.load()
    dst = img.load()
    for y in range(tex.size[1]):
        for x in range(tex.size[0]):
            v = src[x, y]
            if v < 90:
                c = blend((120, 30, 8), (210, 82, 10), v / 90)
            elif v < 170:
                c = blend((210, 82, 10), (255, 166, 32), (v - 90) / 80)
            else:
                c = blend((255, 166, 32), (255, 240, 170), (v - 170) / 85)
            dst[x, y] = (*c, 255)
    return img


def make_corona(size, inner_radius):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    px = layer.load()
    cx, cy = size[0] / 2, size[1] / 2
    for y in range(size[1]):
        dy = y - cy
        for x in range(size[0]):
            dx = x - cx
            d = sqrt(dx * dx + dy * dy)
            if inner_radius < d < inner_radius * 1.95:
                a = atan2(dy, dx)
                n = (
                    0.52
                    + 0.22 * sin(a * 24 + d * 0.045)
                    + 0.16 * sin(a * 51 - d * 0.018)
                    + 0.1 * cos(a * 9 + d * 0.026)
                )
                falloff = max(0.0, 1.0 - (d - inner_radius) / (inner_radius * 0.95))
                intensity = max(0.0, min(1.0, n * (falloff**2.1)))
                if intensity > 0.02:
                    color = blend((255, 120, 20), (255, 225, 150), intensity)
                    alpha = int(185 * intensity)
                    px[x, y] = (*color, alpha)
    return layer.filter(ImageFilter.GaussianBlur(5))


def add_flares(image, center, radius):
    draw = ImageDraw.Draw(image, "RGBA")
    cx, cy = center
    for angle, length, width, color in [
        (-18, 260, 16, (255, 190, 80, 46)),
        (34, 220, 14, (255, 155, 50, 38)),
        (92, 180, 10, (255, 210, 120, 30)),
        (146, 250, 12, (255, 140, 40, 35)),
    ]:
        a = angle * pi / 180
        x1 = cx + cos(a) * (radius * 0.88)
        y1 = cy + sin(a) * (radius * 0.88)
        x2 = cx + cos(a) * (radius + length)
        y2 = cy + sin(a) * (radius + length)
        draw.line((x1, y1, x2, y2), fill=color, width=width)
        draw.ellipse((x2 - width, y2 - width, x2 + width, y2 + width), fill=color)
    return image.filter(ImageFilter.GaussianBlur(10))


def main():
    background = make_space().convert("RGBA")

    corona = make_corona((WIDTH, HEIGHT), RADIUS)
    background = Image.alpha_composite(background, corona)
    background = Image.alpha_composite(
        background,
        add_flares(Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0)), CENTER, RADIUS),
    )

    disk = radial_gradient(
        (WIDTH, HEIGHT), RADIUS, (255, 245, 210), (255, 116, 12), power=0.72
    )
    texture = colorize_texture(make_texture((WIDTH, HEIGHT)))
    mask = circle_mask((WIDTH, HEIGHT), RADIUS, blur=1)
    textured_disk = Image.composite(
        texture, Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0)), mask
    )
    textured_disk = ImageChops.screen(disk, textured_disk)

    hot_core = radial_gradient(
        (WIDTH, HEIGHT), int(RADIUS * 0.52), (255, 255, 245), (255, 222, 90), power=1.35
    )
    rim_glow = radial_gradient(
        (WIDTH, HEIGHT), int(RADIUS * 1.18), (255, 175, 55), (255, 60, 0), power=0.9
    )
    rim_glow.putalpha(circle_mask((WIDTH, HEIGHT), int(RADIUS * 1.18), blur=28))

    result = Image.alpha_composite(background, rim_glow)
    result = Image.alpha_composite(result, textured_disk)
    result = Image.alpha_composite(result, hot_core)
    result = result.filter(ImageFilter.GaussianBlur(0.35))
    result = result.convert("RGB")
    result.save("sun-realistic.jpg", quality=95, subsampling=0)


if __name__ == "__main__":
    main()
