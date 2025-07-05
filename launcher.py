import webview
import subprocess
import time
import atexit
import signal
import platform
import sys
import os
from license_manager import LicenseManager

if platform.system() == "Windows":
    import ctypes
    user32 = ctypes.windll.user32
    width = user32.GetSystemMetrics(0)
    height = user32.GetSystemMetrics(1)
else:
    # Valor aproximado para telas comuns em outros sistemas
    width, height = 1920, 1080

# --------------------
# Verificação de Licença
# --------------------
print("Verificando licença...")
license_manager = LicenseManager()
is_licensed, message = license_manager.check_license()

if not is_licensed:
    print(f"Licença inválida: {message}")
    print("Iniciando processo de ativação...")
    
    # Tenta ativar via GUI
    if not license_manager.activate_license_gui():
        print("Ativação cancelada ou falhou. Encerrando aplicação.")
        sys.exit(1)
    
    print("Licença ativada com sucesso!")
else:
    print("Licença válida. Iniciando aplicação...")

# --------------------
# Inicia o servidor Next.js em segundo plano
# --------------------
print("Iniciando servidor Next.js (pnpm dev)...")
dev_process = subprocess.Popen("pnpm dev", shell=True)

# Aguarda alguns segundos para o servidor levantar
# (ajuste se necessário)
time.sleep(5)

# Registra função para encerrar o servidor quando a aplicação fechar
def _cleanup():
    if dev_process.poll() is None:
        try:
            if platform.system() == "Windows":
                dev_process.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                dev_process.terminate()
            dev_process.wait(timeout=5)
        except Exception:
            dev_process.kill()

atexit.register(_cleanup)

webview.create_window(
    "ENTALHE CNC CAM",
    "http://localhost:3000",
    width=width,
    height=height,
    resizable=True
)
webview.start()