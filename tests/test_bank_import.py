import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace

spec = importlib.util.spec_from_file_location('bank_import', Path(__file__).resolve().parents[1] / 'scripts/update_bank_data.py')
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)


class BankImportTest(unittest.TestCase):
    def fixture(self):
        entries = [{'iid': str(i), 'bankOrInstitutionName': f'Bank {i}'} for i in range(1, 501)]
        entries[0] = {'iid': '1', 'entryType': 'BankMasterConcatenated', 'newIid': '2'}
        return {'validOn': '2026-09-16', 'totalSize': len(entries), 'entries': entries}

    def run_import(self, data, output):
        with patch.object(importer, 'OUTPUT_FILE', output), patch.object(importer.subprocess, 'run', return_value=SimpleNamespace(stdout=json.dumps(data))):
            importer.download_and_convert()

    def test_redirect_and_metadata_are_written_together(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'banks.json'
            self.run_import(self.fixture(), output)
            data = json.loads(output.read_text())
            self.assertEqual(data['00001']['name'], 'Bank 2')
            self.assertEqual(data['00001']['clearing'], '00001')
            self.assertEqual(data['_meta']['validOn'], '2026-09-16')
            self.assertEqual(data['_meta']['recordCount'], 500)
            self.assertEqual(len(data), 501)

    def test_invalid_import_preserves_previous_data_and_metadata(self):
        for failure in ['duplicate', 'cycle', 'missing_successor', 'incomplete', 'date']:
            with self.subTest(failure=failure), tempfile.TemporaryDirectory() as directory:
                output = Path(directory) / 'banks.json'
                output.write_text('previous snapshot')
                data = self.fixture()
                if failure == 'duplicate': data['entries'][-1]['iid'] = '1'
                if failure == 'cycle': data['entries'][0]['newIid'] = '1'
                if failure == 'missing_successor': data['entries'][0]['newIid'] = '99999'
                if failure == 'incomplete': data['totalSize'] += 1
                if failure == 'date': data['validOn'] = 'not-a-date'
                with self.assertRaises(SystemExit): self.run_import(data, output)
                self.assertEqual(output.read_text(), 'previous snapshot')


if __name__ == '__main__':
    unittest.main()
