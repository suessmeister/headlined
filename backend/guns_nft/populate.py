from artwork import create_nft_card
import os
import json
import shutil

# Load sniper rifle data from JSON file
with open(os.path.join(os.path.dirname(__file__), 'data/snipers.json'), 'r') as f:
    rifle_data = json.load(f)

# Create directory if it doesn't exist
output_dir = os.path.join(os.path.dirname(__file__), '../../public/rifles')
os.makedirs(output_dir, exist_ok=True)

# Clear existing files in the directory
def clear_directory(directory):
    for item in os.listdir(directory):
        item_path = os.path.join(directory, item)
        if os.path.isfile(item_path):
            os.remove(item_path)

# Clear the directory
clear_directory(output_dir)

# Create NFT cards for each sniper rifle
print("\nGenerating sniper rifle cards...")
for rifle in rifle_data['sniper']:
    create_nft_card(
        rifle,
        output_dir='../../public/rifles'
    )

print("\nSniper rifle cards generated successfully!")
print(f"Cards saved in: {output_dir}")