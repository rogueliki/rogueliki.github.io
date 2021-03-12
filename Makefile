# Makefile

locale=ja

TARGET = Rogueliki
FILES = $(shell cat MANIFEST)
VERSION = $(shell cat VERSION)
PACKAGE = $(TARGET)-$(VERSION)

pot:
	cat MANIFEST | grep ^lib/Rogueliki | grep -v Setup.js$ > MANIFEST.translate
	xgettext \
		--extract-all \
		--language=C \
		--default-domain=$(TARGET) \
		--output=$(TARGET).pot \
		--files-from=MANIFEST.translate \
		--from-code=UTF-8

po-init:
	msginit \
		--input=$(TARGET).pot \
		--locale=$(locale)

po-merge:
	msgmerge $(locale).po Rogueliki.pot -o $(locale).po.new

po-fmt:
	cp $(locale).po locale/$(locale)/LC_MESSAGES/$(TARGET).po

package: tar
	mkdir -p $(PACKAGE)
	cd $(PACKAGE); tar xvf ../$(PACKAGE).tar; cd ..
	tar cvf - $(PACKAGE) | gzip -9 > $(PACKAGE).tar.gz
	rm -rf $(PACKAGE) $(PACKAGE).tar

package-win: tar
	mkdir $(PACKAGE)
	cd $(PACKAGE) & tar xvf ../$(PACKAGE).tar & cd ..
	tar cvf - $(PACKAGE) | gzip -9 > $(PACKAGE).tar.gz
	rd $(PACKAGE) /S /Q
	del $(PACKAGE).tar

air-test:
	adl Roguelki-app.xml

package-air: tar
	mkdir $(PACKAGE)
	cd $(PACKAGE) & tar xvf ../$(PACKAGE).tar
	adt -package Rogueliki.air Rogueliki-app.xml rogueliki.html default.css hash.js lib wiki locale
	cd ..
	rd $(PACKAGE) /S /Q
	del $(PACKAGE).tar

tar:
	tar cvf - $(FILES) > $(PACKAGE).tar
