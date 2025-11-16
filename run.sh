#!/bin/bash

echo "🤖 ROS2 İnteraktif Öğrenme Platformu"
echo "===================================="
echo ""

# Check if pkg directory exists
if [ ! -d "public/pkg" ]; then
    echo "⚙️  WASM paketi bulunamadı. Derleniyor..."
    wasm-pack build --target web --out-dir public/pkg
    echo "✅ Derleme tamamlandı!"
    echo ""
fi

echo "🚀 Sunucu başlatılıyor..."
echo "📡 Tarayıcınızda http://localhost:8000 adresini açın"
echo "🛑 Durdurmak için Ctrl+C"
echo ""

python3 server.py
