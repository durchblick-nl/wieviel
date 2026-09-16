"""Integration checks against the actual nginx routing configuration.

Build with Hugo first, then run with NGINX_BIN=/path/to/nginx.
NGINX_MIME_TYPES and BUILD_DIR can override local installation/build paths.
"""
import http.client
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(os.environ.get('NGINX_BIN'), 'Set NGINX_BIN to test production routing')
class NginxRoutingTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory(prefix='wieviel-nginx-test-')
        directory = Path(cls.directory.name)
        (directory / 'logs').mkdir()
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            cls.port = sock.getsockname()[1]
        public = Path(os.environ.get('BUILD_DIR', ROOT / 'public')).resolve()
        assert (public / 'de/404.html').exists(), 'Run hugo first'
        config = (ROOT / 'nginx.conf').read_text()
        config = config.replace('listen 80', f'listen 127.0.0.1:{cls.port}')
        config = config.replace('/usr/share/nginx/html', str(public))
        config = config.replace('/etc/nginx/mime.types', os.environ.get('NGINX_MIME_TYPES', '/etc/nginx/mime.types'))
        config = 'daemon off;\n' + config
        (directory / 'nginx.conf').write_text(config)
        args = [os.environ['NGINX_BIN'], '-p', str(directory) + '/', '-c', str(directory / 'nginx.conf')]
        subprocess.run(args + ['-t'], check=True, capture_output=True)
        cls.process = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        for _ in range(50):
            try:
                with socket.create_connection(('127.0.0.1', cls.port), timeout=0.2):
                    return
            except OSError:
                if cls.process.poll() is not None:
                    raise RuntimeError(cls.process.stderr.read().decode())
                time.sleep(0.1)
        cls.process.terminate()
        cls.process.wait(timeout=5)
        raise RuntimeError('nginx did not start')

    @classmethod
    def tearDownClass(cls):
        cls.process.terminate()
        cls.process.wait(timeout=5)
        cls.process.stderr.close()
        cls.directory.cleanup()

    def request(self, host, path, method='GET'):
        connection = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        connection.request(method, path, headers={'Host': host})
        response = connection.getresponse()
        result = response.status, dict(response.getheaders()), response.read().decode()
        connection.close()
        return result

    def test_localized_error_pages_keep_404(self):
        for host, lang, title, home in [
            ('wieviel.ch', 'de', 'Seite nicht gefunden', 'Zur Startseite'),
            ('www.wieviel.ch', 'de', 'Seite nicht gefunden', 'Zur Startseite'),
            ('calcule.ch', 'fr', 'Page introuvable', 'Retour à l’accueil'),
            ('www.calcule.ch', 'fr', 'Page introuvable', 'Retour à l’accueil'),
            ('localhost', 'de', 'Seite nicht gefunden', 'Zur Startseite')
        ]:
            for path in [f'/{lang}/', '/not-a-real-calculator/', '/missing/deep/page?test=1', '/404.html', '/css/missing.css']:
                with self.subTest(host=host, path=path):
                    status, headers, body = self.request(host, path)
                    self.assertEqual(status, 404)
                    self.assertIn('text/html', headers['Content-Type'])
                    self.assertNotIn('Location', headers)
                    self.assertIn(f'<html lang="{lang}">', body)
                    self.assertIn(title, body)
                    self.assertIn(home, body)
                    self.assertIn('class="not-found-home" href="/"', body)
                    self.assertIn('content="noindex, follow"', body)
                    self.assertNotIn('rel="canonical"', body)
                    self.assertNotIn('application/ld+json', body)

    def test_homepages_calculators_and_shared_assets_still_load(self):
        for host, calculator in [('wieviel.ch', '/strom/'), ('calcule.ch', '/electricite/')]:
            for path in ['/', calculator, '/css/styles.css', '/js/rent-calculator.js']:
                with self.subTest(host=host, path=path):
                    self.assertEqual(self.request(host, path)[0], 200)

    def test_head_and_existing_redirects(self):
        status, headers, body = self.request('calcule.ch', '/missing-page/', 'HEAD')
        self.assertEqual(status, 404)
        self.assertIn('text/html', headers['Content-Type'])
        self.assertEqual(body, '')
        status, headers, _ = self.request('wieviel.ch', '/electricite/')
        self.assertEqual(status, 301)
        self.assertEqual(headers['Location'], 'https://calcule.ch/electricite/')


if __name__ == '__main__':
    unittest.main()
