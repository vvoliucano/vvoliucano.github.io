"""Fetch and publish from a machine that can access Scholar, without changing its checkout."""

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def main():
    source = Path(__file__).resolve().parents[1]

    def git(*args, cwd=source, **kwargs):
        return subprocess.run(["git", *args], cwd=cwd, check=True, text=True, **kwargs)

    remote = git("remote", "get-url", "origin", capture_output=True).stdout.strip()
    with tempfile.TemporaryDirectory(prefix="scholar-publish-") as directory:
        temporary = Path(directory)
        snapshot = temporary / "gs_data.json"
        subprocess.run([sys.executable, str(source / "scripts/update_scholar.py")],
                       cwd=source, check=True, env={**os.environ, "SCHOLAR_OUTPUT": str(snapshot)})
        checkout = temporary / "data"
        checkout.mkdir()
        git("init", "--quiet", cwd=checkout)
        git("symbolic-ref", "HEAD", "refs/heads/google-scholar-stats", cwd=checkout)
        git("remote", "add", "origin", remote, cwd=checkout)
        exists = subprocess.run(["git", "ls-remote", "--exit-code", "--heads", remote,
                                 "refs/heads/google-scholar-stats"], capture_output=True, text=True)
        if exists.returncode == 0:
            git("fetch", "--quiet", "--depth=1", "origin", "google-scholar-stats", cwd=checkout)
            git("checkout", "--quiet", "-B", "google-scholar-stats", "FETCH_HEAD", cwd=checkout)
        elif exists.returncode != 2:
            raise RuntimeError(exists.stderr or "Unable to check remote data branch")
        shutil.copyfile(snapshot, checkout / "gs_data.json")
        git("add", "gs_data.json", cwd=checkout)
        git("-c", "user.name=Scholar updater", "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com",
            "commit", "--quiet", "-m", "Update Google Scholar citations", cwd=checkout)
        # A normal push rejects concurrent changes instead of overwriting them.
        git("push", "origin", "HEAD:refs/heads/google-scholar-stats", cwd=checkout)
        print("Published Scholar snapshot; the homepage will load it automatically.")


if __name__ == "__main__":
    main()
