.PHONY = build firefox

BUILD_DIR = ./firefox
SUBDIRS = dist images

all: firefox chromium

node_modules:
	pnpm install

build: node_modules
	webpack


firefox: build


chromium: firefox
	mkdir -p other-browsers/chromium
	for dir in $(SUBDIRS); do \
		cp -r $(BUILD_DIR)/$$dir other-browsers/chromium ; \
	done
