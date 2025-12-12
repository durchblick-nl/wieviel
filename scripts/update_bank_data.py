import requests
import csv
import json
import io
import os

# URL for the Swiss Bank Master CSV
CSV_URL = "https://api.six-group.com/api/epcd/bankmaster/v3/bankmaster_V3.csv"
# Output relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(script_dir, "../static/data/bank_master.json")

def download_and_convert():
    print(f"Downloading CSV from {CSV_URL}...")
    try:
        response = requests.get(CSV_URL)
        response.raise_for_status()
        
        # The CSV is semicolon separated and UTF-8 encoded
        csv_content = response.content.decode('utf-8')
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_content), delimiter=';')
        
        # Headers: ['IID/QR-IID', 'Valid on', 'Concatenation', 'New IID/QR-IID', 'SIC IID', 'Headquarters', 'IID type', 'QR-IID allocation', 'Name of bank/institution', 'Street Name', 'Building Number', 'Post Code', 'Town Name', 'Country', 'BIC', 'SIC participation', 'RTGS customer payments, CHF', 'IP customer payments, CHF', 'euroSIC participation', 'LSV+/BDD, CHF', 'LSV+/BDD, EUR', '...']
        
        banks = {}
        
        print("Processing data...")
        count = 0
        for row in csv_reader:
            iid = row.get('IID/QR-IID')
            if not iid:
                continue
            
            # Pack IID to 5 digits (Swiss IBAN standard)
            iid = iid.zfill(5)
            
            # Extract relevant fields
            bank_data = {
                'name': row.get('Name of bank/institution'),
                'city': row.get('Town Name'),
                'zip': row.get('Post Code'),
                'address': f"{row.get('Street Name', '')} {row.get('Building Number', '')}".strip(),
                'bic': row.get('BIC'),
                'clearing': iid
            }
            
            # Store in dictionary
            banks[iid] = bank_data
            count += 1
            
        print(f"Found {count} bank entries.")
            
        # Ensure output directory exists
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        
        # Write to JSON
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(banks, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully saved JSON to {OUTPUT_FILE}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_and_convert()
