"""Offline transport tests: never invoke real SSH or public endpoints."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SHA = 'a' * 40


class DeploymentContract(unittest.TestCase):
    def run_transport(self, mode='ok', sha=SHA):
        with tempfile.TemporaryDirectory() as directory:
            binpath = Path(directory)
            mocks = {
                'ssh': '''#!/bin/bash
[[ "${!#}" == "deploy $DEPLOY_SHA" ]] || exit 90
[[ "$MODE" != ssh-fail ]] || exit 1
if [[ "$MODE" == receipt ]]; then echo 'DEPLOYED wrong'; else echo "DEPLOYED $DEPLOY_SHA"; fi
''',
                'curl': '''#!/bin/bash
[[ "$MODE" != curl-fail ]] || exit 22
if [[ "$MODE" == version ]]; then echo wrong; else echo "$DEPLOY_SHA"; fi
''',
                'sleep': '#!/bin/bash\nexit 0\n',
            }
            for name, content in mocks.items():
                path = binpath / name
                path.write_text(content)
                path.chmod(0o755)
            return subprocess.run(['bash', str(ROOT / 'scripts/deploy-checked-sha.sh')],
                env={**os.environ, 'PATH': f'{directory}:' + os.environ['PATH'],
                     'MODE': mode, 'DEPLOY_SHA': sha}, capture_output=True, text=True)

    def test_success(self):
        result = self.run_transport()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(SHA, result.stdout)

    def test_fail_closed(self):
        for mode in ('ssh-fail', 'receipt', 'version', 'curl-fail'):
            with self.subTest(mode=mode):
                self.assertNotEqual(self.run_transport(mode).returncode, 0)

    def test_reject_untrusted_sha(self):
        for sha in ('', 'main', 'a' * 39, SHA + '; false'):
            with self.subTest(sha=sha):
                self.assertNotEqual(self.run_transport(sha=sha).returncode, 0)
