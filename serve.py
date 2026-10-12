#!/usr/bin/env python3
"""
Serveur de prévisualisation locale — identique à `python3 -m http.server`,
mais désactive le cache navigateur sur chaque réponse.

Pourquoi : pendant le développement, un navigateur qui garde en cache une
ancienne version de style.css ou de store.js après une modification peut
faire croire à un bug qui n'existe pas (du vrai vécu sur ce projet). En
production (GitHub Pages ou autre hébergeur), le cache est à nouveau
légitime : ce script ne sert que pour la prévisualisation locale.
"""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8770
    HTTPServer(("", port), NoCacheHandler).serve_forever()
