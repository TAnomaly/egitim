#!/usr/bin/env python3
"""
Simple HTTP server for serving the ROS2 WASM application
"""
import http.server
import socketserver

PORT = 8000

PUBLIC_DIR = "public"


class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)
    def end_headers(self):
        # Add CORS headers
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        # Set correct MIME types
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        mimetype = super().guess_type(path)
        if path.endswith('.wasm'):
            return 'application/wasm'
        return mimetype

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"🚀 ROS2 Interactive Platform sunucusu başlatıldı!")
    print(f"📡 Tarayıcınızda şu adresi açın: http://localhost:{PORT}")
    print(f"🛑 Durdurmak için Ctrl+C")
    httpd.serve_forever()
