import os
import glob
import re

base_dir = r"c:\Users\91836\AARAMBH\HouseHuntMaster\Househunt-Frontend"

# Copy the ico to root
import shutil
src_ico = os.path.join(base_dir, "assets", "mainappicon.ico")
dest_ico = os.path.join(base_dir, "favicon.ico")
if os.path.exists(src_ico):
    shutil.copyfile(src_ico, dest_ico)
    print("Copied favicon to root.")

html_files = glob.glob(os.path.join(base_dir, "*.html")) + glob.glob(os.path.join(base_dir, "html", "*.html"))

favicon_tags = """
    <!-- Favicons -->
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <link rel="apple-touch-icon" href="/assets/mainappicon.png">
"""

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove old icon links
    content = re.sub(r'<link[^>]*rel=["\']icon["\'][^>]*>\n?', '', content)
    content = re.sub(r'<link[^>]*rel=["\']shortcut icon["\'][^>]*>\n?', '', content)
    content = re.sub(r'<link[^>]*rel=["\']apple-touch-icon["\'][^>]*>\n?', '', content)
    
    # Remove any leftover Favicons comment
    content = content.replace('<!-- Favicons -->\n', '')
    
    # Inject new favicon tags before </head>
    content = content.replace('</head>', f'{favicon_tags}</head>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated favicons in {os.path.basename(filepath)}")
