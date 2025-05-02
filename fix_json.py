import json
import re
import os

def fix_json_file(input_file, output_file):
    try:
        # Read the file content
        with open(input_file, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Try to parse the JSON to see if it's valid
        try:
            data = json.loads(content)
            print("JSON is already valid.")
            # Write the formatted JSON back
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except json.JSONDecodeError as e:
            print(f"JSON is invalid: {e}")
            
            # If we get here, JSON is invalid and needs fixing
            # Replace problematic unicode characters with their proper equivalents or empty strings
            content = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', content)
            
            # Fix common JSON syntax issues
            content = content.replace("'", '"')  # Replace single quotes with double quotes
            content = re.sub(r',\s*]', ']', content)  # Remove trailing commas in arrays
            content = re.sub(r',\s*}', '}', content)  # Remove trailing commas in objects
            
            # Try to parse the fixed JSON
            try:
                fixed_data = json.loads(content)
                print("JSON fixed successfully.")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(fixed_data, f, ensure_ascii=False, indent=2)
                return True
            except json.JSONDecodeError as e2:
                print(f"Could not fix JSON automatically: {e2}")
                
                # If all else fails, use a more aggressive approach
                # Create a backup of the original file
                backup_file = input_file + '.bak'
                os.rename(input_file, backup_file)
                
                # Create a minimal valid JSON file with empty array
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write('[]')
                print(f"Created empty JSON array. Original file backed up as {backup_file}")
                return False
    
    except Exception as e:
        print(f"Error: {e}")
        return False

# Fix the JSON file
input_file = 'dataset_instagram-post-scraper_2025-05-02_03-41-05-501.json'
output_file = 'fixed_instagram_data.json'

fix_json_file(input_file, output_file)
