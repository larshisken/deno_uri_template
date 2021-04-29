.PHONY: clean

unit_test_files := $(shell find test/unit/ -name '*.ts')

coverage: $(unit_test_files) 
	deno test --coverage=coverage --unstable test/unit

coverage.lcov: coverage
	deno coverage --unstable test/unit coverage --lcov > coverage.lcov

coverage/html: coverage.lcov
	genhtml --output-directory=coverage/html coverage.lcov

clean:
	rm --recursive --force coverage coverage.lcov
