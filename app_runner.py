#!/usr/bin/env python3
"""
Game Hub - Local Server Launcher
Inicia un servidor local y abre el proyecto en el navegador.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    os.chdir(PROJECT_DIR)
    
    print("=" * 50)
    print("🎮 GAME HUB - Iniciando servidor local...")
    print("=" * 50)
    print(f"\n📁 Directorio: {PROJECT_DIR}")
    print(f"🌐 Puerto: {PORT}")
    print(f"🔗 URL: http://localhost:{PORT}")
    print("\n⏳ Abriendo navegador...")
    print("\n🛑 Presiona Ctrl+C para detener el servidor")
    print("=" * 50)
    
    webbrowser.open(f'http://localhost:{PORT}')
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Servidor detenido.")
            sys.exit(0)

if __name__ == "__main__":
    main()
