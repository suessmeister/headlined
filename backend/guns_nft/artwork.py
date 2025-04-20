from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import random
import requests
from io import BytesIO
import math
import os
import json


# Use Barrett's color scheme for all cards
BARRETT_COLORS = ("#A67C52", "#C19A6B")  # Lighter brown gradient

# Create fonts directory if it doesn't exist
FONTS_DIR = os.path.join(os.path.dirname(__file__), 'fonts')
PICS_DIR = os.path.join(os.path.dirname(__file__), 'data/pics')
os.makedirs(FONTS_DIR, exist_ok=True)
os.makedirs(PICS_DIR, exist_ok=True)

# Font file paths
TITLE_FONT = os.path.join(FONTS_DIR, 'gunmetl.ttf')
STATS_FONT = os.path.join(FONTS_DIR, "Quantico-Italic.ttf")

def get_rifle_image(rifle_name):
    """Get the rifle image from the pics directory"""
    # Convert rifle name to lowercase and replace spaces with underscores
    image_name = f"{rifle_name.lower().replace(' ', '_')}.png"  # Changed to .png
    image_path = os.path.join(PICS_DIR, image_name)
    
    if os.path.exists(image_path):
        return Image.open(image_path)
    else:
        print(f"Warning: No image found for {rifle_name} at {image_path}")
        return None

def get_fonts():
    """Get the font objects for different text elements"""
    try:
        title_font = ImageFont.truetype(TITLE_FONT, 60)
        name_font = ImageFont.truetype(TITLE_FONT, 90)
        stats_font = ImageFont.truetype(STATS_FONT, 45)
    except Exception as e:
        print(f"Warning: Could not load fonts ({str(e)}). Using system font.")
        try:
            title_font = ImageFont.truetype('arial.ttf', 100)
            name_font = ImageFont.truetype('arial.ttf', 85)
            stats_font = ImageFont.truetype('arial.ttf', 65)
        except Exception as e:
            print(f"Warning: Could not load system fonts ({str(e)}). Using default font.")
            title_font = ImageFont.load_default()
            name_font = ImageFont.load_default()
            stats_font = ImageFont.load_default()
    
    return {
        'title': title_font,
        'name': name_font,
        'stats': stats_font
    }

def create_card_background(img, rifle_type, width, height):
    draw = ImageDraw.Draw(img)
    
    # Use Barrett's colors for all cards
    primary_color, secondary_color = BARRETT_COLORS
    
    # Create a gradient background
    for y in range(height):
        ratio = y / height
        r = int(int(primary_color[1:3], 16) * (1 - ratio) + int(secondary_color[1:3], 16) * ratio)
        g = int(int(primary_color[3:5], 16) * (1 - ratio) + int(secondary_color[3:5], 16) * ratio)
        b = int(int(primary_color[5:7], 16) * (1 - ratio) + int(secondary_color[5:7], 16) * ratio)
        color = f"#{r:02x}{g:02x}{b:02x}"
        draw.line([(0, y), (width, y)], fill=color)

def create_card_frame(img, width, height):
    draw = ImageDraw.Draw(img)
    
    # Inner card frame (golden border)
    border_color = "#DAA520"
    border_width = 8
    radius = 20
    
    # Draw rounded rectangle for the border
    draw.arc([(border_width, border_width), 
              (border_width + radius*2, border_width + radius*2)], 
             180, 270, fill=border_color, width=border_width)
    draw.arc([(width - border_width - radius*2, border_width), 
              (width - border_width, border_width + radius*2)], 
             270, 0, fill=border_color, width=border_width)
    draw.arc([(width - border_width - radius*2, height - border_width - radius*2), 
              (width - border_width, height - border_width)], 
             0, 90, fill=border_color, width=border_width)
    draw.arc([(border_width, height - border_width - radius*2), 
              (border_width + radius*2, height - border_width)], 
             90, 180, fill=border_color, width=border_width)
    
    # Draw straight lines between corners
    draw.line([(border_width + radius, border_width), 
               (width - border_width - radius, border_width)], 
              fill=border_color, width=border_width)
    draw.line([(width - border_width, border_width + radius), 
               (width - border_width, height - border_width - radius)], 
              fill=border_color, width=border_width)
    draw.line([(border_width + radius, height - border_width), 
               (width - border_width - radius, height - border_width)], 
              fill=border_color, width=border_width)
    draw.line([(border_width, border_width + radius), 
               (border_width, height - border_width - radius)], 
              fill=border_color, width=border_width)
    
def create_nft_card(rifle, output_dir='../../public/rifles'):
    # Card dimensions
    width = 750
    height = 1050
    
    # Create base image
    img = Image.new("RGBA", (width, height), color="white")
    
    # Add Barrett-style gradient background
    create_card_background(img, "barrett", width, height)
    
    # Add card frame
    create_card_frame(img, width, height)
    
    # Add subtle gold sparkles
    gold_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    gold_draw = ImageDraw.Draw(gold_overlay)
    for _ in range(15):
        x = random.randint(0, width)
        y = random.randint(0, height)
        size = random.randint(1, 3)
        gold_draw.ellipse([(x, y), (x + size, y + size)], fill=(255, 215, 0, 100))
    img = Image.alpha_composite(img, gold_overlay)
    
    # Load fonts
    draw = ImageDraw.Draw(img)
    fonts = get_fonts()
    
    # Rifle name at top
    draw.text((50, 40), rifle["name"].upper(), font=fonts['name'], fill="black")

    # Add rifle image if available
    rifle_img = get_rifle_image(rifle["name"])
    if rifle_img:
        if rifle_img.mode != 'RGBA':
            rifle_img = rifle_img.convert('RGBA')

        # Resize while maintaining aspect ratio
        max_width = width - 100
        max_height = 400
        ratio = min(max_width / rifle_img.width, max_height / rifle_img.height)
        new_size = (int(rifle_img.width * ratio), int(rifle_img.height * ratio))

        # Center image
        img_x = (width - rifle_img.width) // 2
        img_y = 150
        img.paste(rifle_img, (img_x, img_y), rifle_img)

        # Add magazine capacity below the rifle image
        stats_below_y = img_y + rifle_img.height + 20
        
        # Magazine capacity
        mag_text = f"{rifle['mag_capacity']}"
        mag_bbox = draw.textbbox((0, 0), mag_text, font=fonts['stats'])
        mag_width = mag_bbox[2] - mag_bbox[0]
        draw.text((img_x + (rifle_img.width - mag_width) // 2 - 20, stats_below_y + 80),
                 mag_text, font=fonts['stats'], fill="black")

    # Draw stats with visual elements
    stats_y = 560
    
    # Scope Multiplier
    scope_center = (150, stats_y + 50)
    scope_radius = 40
    # Draw scope outer circle
    draw.ellipse([(scope_center[0]-scope_radius, scope_center[1]-scope_radius),
                 (scope_center[0]+scope_radius, scope_center[1]+scope_radius)],
                outline="#DAA520", width=3)
    # Draw scope crosshair
    draw.line([(scope_center[0]-scope_radius, scope_center[1]),
              (scope_center[0]+scope_radius, scope_center[1])],
             fill="#DAA520", width=2)
    draw.line([(scope_center[0], scope_center[1]-scope_radius),
              (scope_center[0], scope_center[1]+scope_radius)],
             fill="#DAA520", width=2)
    
    # Draw scope multiplier below the scope
    scope_text = f"{rifle['scope_multiplier']}x"
    scope_bbox = draw.textbbox((0, 0), scope_text, font=fonts['stats'])
    scope_width = scope_bbox[2] - scope_bbox[0]
    draw.text((scope_center[0] - scope_width/2, scope_center[1] + scope_radius + 10),
             scope_text, font=fonts['stats'], fill="black")
    
    # Magazine Capacity
    mag_center = (350, stats_y + 50)
    # Draw magazine outline
    draw.rectangle([(mag_center[0]-30, mag_center[1]-50),
                   (mag_center[0]+30, mag_center[1]+50)],
                  outline="#DAA520", width=3)
    # Draw bullets
    bullet_count = rifle['mag_capacity']
    bullet_spacing = 100 / (bullet_count + 1)
    for i in range(bullet_count):
        y_pos = mag_center[1] - 40 + (i * bullet_spacing)
        draw.ellipse([(mag_center[0]-10, y_pos-5),
                     (mag_center[0]+10, y_pos+5)],
                    fill="#DAA520")
    
    # Reload Time (Clock)
    clock_center = (550, stats_y + 50)
    clock_radius = 40
    # Draw clock face
    draw.ellipse([(clock_center[0]-clock_radius, clock_center[1]-clock_radius),
                 (clock_center[0]+clock_radius, clock_center[1]+clock_radius)],
                outline="#DAA520", width=3)
    # Draw clock hands
    reload_time = rifle['reload_time']
    # Hour hand (shorter)
    hour_angle = (reload_time % 12) * 30
    hour_length = clock_radius * 0.5
    hour_x = clock_center[0] + hour_length * math.sin(math.radians(hour_angle))
    hour_y = clock_center[1] - hour_length * math.cos(math.radians(hour_angle))
    draw.line([clock_center, (hour_x, hour_y)], fill="#DAA520", width=3)
    # Minute hand (longer)
    minute_angle = (reload_time * 5) % 360
    minute_length = clock_radius * 0.8
    minute_x = clock_center[0] + minute_length * math.sin(math.radians(minute_angle))
    minute_y = clock_center[1] - minute_length * math.cos(math.radians(minute_angle))
    draw.line([clock_center, (minute_x, minute_y)], fill="#DAA520", width=2)
    # Draw time text
    time_text = f"{reload_time}s"
    text_bbox = draw.textbbox((0, 0), time_text, font=fonts['stats'])
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    draw.text((clock_center[0]-text_width/2, clock_center[1]+clock_radius+10),
             time_text, font=fonts['stats'], fill="black")

    # Add quote section at the bottom
    quote_y = stats_y + 200
    quote_height = 150
    quote_width = width - 100
    
    # Draw quote container with decorative border
    draw.rectangle([(50, quote_y), (width-50, quote_y+quote_height)],
                  outline="#DAA520", width=3)
    
    # Add decorative corners
    corner_size = 20
    # Top left
    draw.line([(50, quote_y+corner_size), (50+corner_size, quote_y)],
             fill="#DAA520", width=2)
    # Top right
    draw.line([(width-50-corner_size, quote_y), (width-50, quote_y+corner_size)],
             fill="#DAA520", width=2)
    # Bottom left
    draw.line([(50, quote_y+quote_height-corner_size), (50+corner_size, quote_y+quote_height)],
             fill="#DAA520", width=2)
    # Bottom right
    draw.line([(width-50-corner_size, quote_y+quote_height), (width-50, quote_y+quote_height-corner_size)],
             fill="#DAA520", width=2)
    
    # Add quote text
    try:
        underscore_name = rifle["name"].replace(" ", "_")
        lowercase_name = rifle["name"].lower().replace(" ", "_")
        json_path = f"../../data/arweave_collections/{lowercase_name}_collection.json"
        
        with open(json_path, 'r') as f:
            collection_data = json.load(f)
            quote_text = collection_data.get("description", "No description available")
            
        # Draw quote with larger font
        quote_font = ImageFont.truetype(STATS_FONT, 35)
        # Split quote into lines if it's too long
        words = quote_text.split()
        lines = []
        current_line = []
        max_width = width - 140  # Account for padding
        
        for word in words:
            current_line.append(word)
            test_line = ' '.join(current_line)
            text_bbox = draw.textbbox((0, 0), test_line, font=quote_font)
            text_width = text_bbox[2] - text_bbox[0]
            
            if text_width > max_width:
                if len(current_line) > 1:
                    lines.append(' '.join(current_line[:-1]))
                    current_line = [word]
                else:
                    lines.append(word)
                    current_line = []
        
        if current_line:
            lines.append(' '.join(current_line))
        
        # Draw each line of the quote with more spacing
        for i, line in enumerate(lines):
            draw.text((70, quote_y+20 + (i * 40)), line, font=quote_font, fill="black")
            
    except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
        print(f"Warning: Could not load quote for {rifle['name']}: {str(e)}")
        # Draw default message if quote loading fails
        quote_font = ImageFont.truetype(STATS_FONT, 35)
        draw.text((70, quote_y+20), "No quote available", font=quote_font, fill="black")

    # Save output
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{rifle['name'].lower().replace(' ', '_')}.png")
    img.save(output_path, "PNG")
    print(f"✅ Created card for {rifle['name']} at {output_path}")
