import subprocess
import json
from datetime import date
from pathlib import Path

# Preserve the browser's IID-keyed JSON contract while using SIX's structured API.
SOURCE_URL = "https://api.six-group.com/api/epcd/bankmaster/v3/bankmaster.json"
OUTPUT_FILE = Path(__file__).resolve().parent.parent / "static/data/bank_master.json"

def download_and_convert():
    print(f"Downloading bank master from {SOURCE_URL}...")
    try:
        response = subprocess.run(
            ['curl', '--fail', '--silent', '--show-error', '--location', '--max-time', '30', SOURCE_URL],
            check=True, capture_output=True, text=True
        )
        data = json.loads(response.stdout)
        valid_on = date.fromisoformat(data['validOn'])
        entries = data['entries']
        if len(entries) < 500 or len(entries) != data['totalSize']:
            raise ValueError("Incomplete SIX bank master; existing file is unchanged")
        records = {}
        for row in entries:
            iid = str(row['iid']).zfill(5)
            if not iid.isdigit() or len(iid) != 5 or iid in records:
                raise ValueError(f"Invalid or duplicate IID: {iid}")
            records[iid] = row
        banks = {}
        for iid, row in records.items():
            # SIX includes redirects after bank mergers. Resolve these before
            # mapping the old IID so a valid IBAN never displays an empty bank.
            visited = {iid}
            while row.get('entryType') == 'BankMasterConcatenated':
                successor = str(row['newIid']).zfill(5)
                if successor in visited or successor not in records:
                    raise ValueError(f"Invalid SIX successor chain for IID: {iid}")
                visited.add(successor)
                row = records[successor]
            if not row.get('bankOrInstitutionName'):
                raise ValueError(f"Missing bank name for IID: {iid}")
            banks[iid] = {
                'name': row['bankOrInstitutionName'],
                'city': row.get('townName', ''),
                'zip': row.get('postCode', ''),
                'address': f"{row.get('streetName', '')} {row.get('buildingNumber', '')}".strip(),
                'bic': row.get('bic', ''),
                'clearing': iid
            }
        banks['_meta'] = {
            'validOn': valid_on.isoformat(),
            'importedOn': date.today().isoformat(),
            'sourceUrl': SOURCE_URL,
            'recordCount': len(banks)
        }
        temporary = OUTPUT_FILE.with_suffix('.json.tmp')
        temporary.write_text(json.dumps(banks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        temporary.replace(OUTPUT_FILE)
        print(f"Saved {len(records)} banks, valid on {valid_on}. Data status and cache version are derived automatically.")
        
    except Exception as e:
        raise SystemExit(f"Bank update failed: {e}") from e

if __name__ == "__main__":
    download_and_convert()
