import re

with open(r'c:\Users\Acer\Desktop\Bharatworks\MyApp\src\screens\Labour\JobApply.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple regex to find content between tag close and open
# Matching: > ANY_TEXT < but excluding { comments } and ignoring spaces
# This is tricky in JS. 
# Let's just find lines that have text standing outside of <Text> or components.
# A better way is to look for JSX template literals that might be naked.

lines = content.split('\n')
for i, line in enumerate(lines):
    # Find things like:  <View> Text </View>
    # If a line has a tag and some text not inside quotes/brackets
    if '<' in line and '>' in line:
        # Strip tags and see if text remains
        stripped = re.sub(r'<[^>]+>', '', line).strip()
        if stripped and '{' not in stripped and '}' not in stripped:
             print(f"Line {i+1}: {line.strip()} -> text: {stripped}")
