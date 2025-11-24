#!/bin/bash

echo "=================================="
echo "  GoodFinds Test Suite Runner"
echo "=================================="
echo ""

cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
    echo "Virtual environment not found!"
    echo "Please run: python -m venv venv"
    exit 1
fi

source venv/bin/activate

echo "Running all tests with coverage..."
echo ""

pytest --cov=. --cov-report=term --cov-report=html -v

echo ""
echo "=================================="
echo "Tests complete!"
echo ""
echo "Coverage report saved to: htmlcov/index.html"
echo "To view: open htmlcov/index.html"
echo ""
echo "=================================="

