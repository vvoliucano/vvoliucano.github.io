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

## Homepage news

Add entries to `_data/news.yml` with a quoted `date` in `YYYY-MM` format,
an English `message`, and a Chinese `message_zh`. The homepages sort entries
newest first. To link a paper, set `publication_id` to its ID in
`_data/publication.yml`.
