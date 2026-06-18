#!/usr/bin/env python3
"""Minimal static file server for the Patient Dashboard web app.
Serves an explicit directory so it never calls os.getcwd() (sandbox-safe)."""
import functools
import http.server
import os
import socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 4173

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)


class Server(socketserver.TCPServer):
    allow_reuse_address = True


with Server(("127.0.0.1", PORT), Handler) as httpd:
    print(f"Serving {ROOT} at http://127.0.0.1:{PORT}")
    httpd.serve_forever()
