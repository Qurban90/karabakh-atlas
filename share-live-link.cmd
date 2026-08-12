@echo off
rem ── Canlı public link (Cloudflare quick tunnel, hesab tələb etmir) ──
rem Əvvəlcə start-demo.cmd işə salınmalıdır (port 5001).
rem Pəncərədə görünən https://....trycloudflare.com linkini paylaşın.
"%~dp0..\.tools\cloudflared.exe" tunnel --url http://localhost:5001 --no-autoupdate
