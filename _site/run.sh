#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUBY_VERSION_FILE="${ROOT_DIR}/.ruby-version"
RUBY_VERSION="${JEKYLL_RUBY_VERSION:-}"
HOST="${JEKYLL_HOST:-0.0.0.0}"
PORT="${JEKYLL_PORT:-1111}"

if [[ -z "${RUBY_VERSION}" && -f "${RUBY_VERSION_FILE}" ]]; then
  RUBY_VERSION="$(<"${RUBY_VERSION_FILE}")"
fi

RUBY_VERSION="${RUBY_VERSION:-3.1.2}"

if ! command -v rbenv >/dev/null 2>&1; then
  echo "rbenv 未安装。请先执行: brew install rbenv ruby-build"
  exit 1
fi

export PATH="${HOME}/.rbenv/bin:${PATH}"
eval "$(rbenv init - bash)"

if ! rbenv versions --bare | grep -qx "${RUBY_VERSION}"; then
  echo "Installing Ruby ${RUBY_VERSION} ..."
  RUBY_CONFIGURE_OPTS=--disable-dtrace rbenv install "${RUBY_VERSION}"
fi

cd "${ROOT_DIR}"
rbenv local "${RUBY_VERSION}" >/dev/null

if ! gem list -i bundler >/dev/null 2>&1; then
  gem install bundler
fi

bundle config set --local path vendor/bundle >/dev/null

if command -v xcrun >/dev/null 2>&1; then
  SDKROOT="$(xcrun --show-sdk-path)"
  bundle config set --local build.eventmachine "--with-cxx=clang++ --with-cxxflags=-I${SDKROOT}/usr/include/c++/v1" >/dev/null
fi

bundle install

if [[ "${1:-}" == "--install-only" ]]; then
  echo "Jekyll 依赖已准备完成。"
  exit 0
fi

exec bundle exec jekyll serve --host "${HOST}" --port "${PORT}"
