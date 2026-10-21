# Readme

This repository is for the personal webpage of Can Liu. The template is modified from @[domoritz](https://github.com/domoritz/domoritz.github.io).

## Write
```
bundle exec jekyll post "My New Post"
```

## Run
```
bundle exec jekyll serve
```

## Google Scholar citations

The English and Chinese homepages display the five most recent citation years
from the public profile `c_qeUtUAAAAJ`. The total includes all years.

`Update Google Scholar citations` runs daily at 08:17 UTC (16:17 Beijing time),
and can also be started from its **Run workflow** button in GitHub Actions.
GitHub may delay scheduled runs. Successful snapshots are committed to
`google-scholar-stats/gs_data.json`; failures leave the previous snapshot intact.
The browser loads that snapshot directly, with `assets/data/scholar.json` as a
fallback, so daily updates do not need to rebuild GitHub Pages. No API key is needed.

To fetch a snapshot locally:

```sh
python3 -m pip install -r scripts/scholar-requirements.txt
python3 -m unittest discover -s scripts -p test_scholar.py
python3 scripts/update_scholar.py
```

Scholar rejected the initial GitHub-hosted Ubuntu and macOS runs (the Ubuntu
run returned HTTP 403). The daily workflow remains enabled to retry; its
presence does not guarantee a successful refresh. On a computer with working
Scholar access and Git push access, publish a fresh snapshot without switching
or changing the working checkout:

```sh
python3 scripts/publish_scholar.py
```
