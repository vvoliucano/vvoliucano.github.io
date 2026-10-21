import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from update_scholar import main, parse_profile


PROFILE = """
<div id="gsc_prf_in">Can Liu</div>
<table id="gsc_rsb_st"><td class="gsc_rsb_std">1,234</td></table>
<div id="gsc_rsb_cit">
  <span class="gsc_g_t">2025</span><span class="gsc_g_t">2026</span>
  <span class="gsc_g_al">100</span><span class="gsc_g_al">200</span>
</div>
"""


class ScholarTests(unittest.TestCase):
    def test_profile_and_annual_counts(self):
        data = parse_profile(PROFILE, "c_qeUtUAAAAJ")
        self.assertEqual(data["citedby"], 1234)
        self.assertEqual(data["cites_per_year"], {"2025": 100, "2026": 200})
        self.assertEqual(data["name"], "Can Liu")

    def test_block_or_changed_markup_is_rejected(self):
        for html in ["<html>CAPTCHA</html>", PROFILE.replace('class="gsc_g_al"', '')]:
            with self.subTest(html=html), self.assertRaises(ValueError):
                parse_profile(html, "c_qeUtUAAAAJ")

    def test_invalid_or_inconsistent_counts_are_rejected(self):
        for html in [PROFILE.replace('>100<', '>-1<'), PROFILE.replace('>2026<', '>2025<'),
                     PROFILE.replace('>1,234<', '>1<')]:
            with self.subTest(html=html), self.assertRaises(ValueError):
                parse_profile(html, "c_qeUtUAAAAJ")

    def test_fetch_failure_preserves_previous_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            snapshot = Path(directory) / "scholar.json"
            snapshot.write_text('{"previous": true}')
            with patch.dict(os.environ, {"SCHOLAR_OUTPUT": str(snapshot)}), \
                    patch("update_scholar.urlopen", side_effect=OSError("unavailable")), \
                    patch("update_scholar.time.sleep"), self.assertRaises(OSError):
                main()
            self.assertEqual(snapshot.read_text(), '{"previous": true}')


if __name__ == "__main__":
    unittest.main()
