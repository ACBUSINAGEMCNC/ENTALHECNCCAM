import hashlib
import json
import os
import uuid
from datetime import datetime, timedelta
import tkinter as tk
from tkinter import messagebox, simpledialog
import sys

class LicenseManager:
    def __init__(self):
        self.license_file = "license.json"
        self.valid_keys_file = "valid_keys.json"
        
    def generate_machine_id(self):
        """Gera um ID único baseado no hardware da máquina"""
        import platform
        machine_info = f"{platform.node()}-{platform.processor()}-{platform.machine()}"
        return hashlib.sha256(machine_info.encode()).hexdigest()[:16]
    
    def hash_key(self, key):
        """Gera hash SHA256 da chave"""
        return hashlib.sha256(key.encode()).hexdigest()
    
    def generate_license_key(self, customer_name="", days_valid=365):
        """Gera uma nova chave de licença"""
        # Formato: ENTALHE-XXXXX-XXXXX-XXXXX
        key_parts = []
        for _ in range(3):
            part = ''.join([str(uuid.uuid4()).replace('-', '').upper()[:5]])
            key_parts.append(part)
        
        license_key = f"ENTALHE-{'-'.join(key_parts)}"
        
        # Salva no arquivo de chaves válidas
        self.add_valid_key(license_key, customer_name, days_valid)
        
        return license_key
    
    def add_valid_key(self, key, customer_name="", days_valid=365):
        """Adiciona uma chave válida ao banco de dados"""
        valid_keys = self.load_valid_keys()
        
        key_hash = self.hash_key(key)
        expiry_date = (datetime.now() + timedelta(days=days_valid)).isoformat()
        
        valid_keys[key_hash] = {
            "customer": customer_name,
            "created": datetime.now().isoformat(),
            "expires": expiry_date,
            "days_valid": days_valid
        }
        
        with open(self.valid_keys_file, 'w') as f:
            json.dump(valid_keys, f, indent=2)
    
    def load_valid_keys(self):
        """Carrega as chaves válidas do arquivo"""
        if os.path.exists(self.valid_keys_file):
            try:
                with open(self.valid_keys_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def validate_key(self, key):
        """Valida se a chave é válida e não expirou"""
        valid_keys = self.load_valid_keys()
        key_hash = self.hash_key(key)
        
        if key_hash not in valid_keys:
            return False, "Chave inválida"
        
        key_info = valid_keys[key_hash]
        expiry_date = datetime.fromisoformat(key_info["expires"])
        
        if datetime.now() > expiry_date:
            return False, "Chave expirada"
        
        return True, "Chave válida"
    
    def save_license(self, license_key, machine_id):
        """Salva a licença ativada no arquivo local"""
        try:
            license_data = {
                "license_key": license_key,
                "machine_id": machine_id,
                "activated_date": str(datetime.now())
            }
            
            # Usa a pasta AppData para evitar problemas de permissão
            import os
            app_data_folder = os.path.join(os.environ['APPDATA'], 'EntalheCNC_CAM')
            
            # Cria a pasta se não existir
            if not os.path.exists(app_data_folder):
                os.makedirs(app_data_folder)
                
            # Salva o arquivo na pasta AppData
            license_path = os.path.join(app_data_folder, 'license.json')
            with open(license_path, 'w') as f:
                json.dump(license_data, f, indent=2)
            return True
        except Exception as e:
            print(f"Erro ao salvar licença: {e}")
            return False
    
    def check_license(self):
        """Verifica se existe uma licença válida ativada"""
        # Usa a pasta AppData para evitar problemas de permissão
        import os
        app_data_folder = os.path.join(os.environ['APPDATA'], 'EntalheCNC_CAM')
        license_path = os.path.join(app_data_folder, 'license.json')
        
        if not os.path.exists(license_path):
            return False, "Nenhuma licença encontrada"
        
        try:
            with open(license_path, 'r') as f:
                license_data = json.load(f)
            
            # Verifica se a máquina é a mesma
            current_machine_id = self.generate_machine_id()
            if license_data.get("machine_id") != current_machine_id:
                return False, "Licença não é válida para esta máquina"
            
            # Verifica se a chave ainda é válida no banco
            valid_keys = self.load_valid_keys()
            license_key = license_data.get("license_key")
            key_hash = self.hash_key(license_key)  # Calcula o hash da chave salva
            
            if key_hash not in valid_keys:
                return False, "Licença revogada"
            
            key_info = valid_keys[key_hash]
            expiry_date = datetime.fromisoformat(key_info["expires"])
            
            if datetime.now() > expiry_date:
                return False, "Licença expirada"
            
            return True, "Licença válida"
            
        except Exception as e:
            return False, f"Erro ao verificar licença: {str(e)}"
    
    def activate_license_gui(self):
        """Interface gráfica para ativação da licença"""
        root = tk.Tk()
        root.withdraw()  # Esconde a janela principal
        
        # Verifica se já tem licença ativa
        is_valid, message = self.check_license()
        if is_valid:
            messagebox.showinfo("Licença", "Software já está ativado!")
            root.destroy()
            return True
        
        # Solicita a chave de ativação
        key = simpledialog.askstring(
            "Ativação do Software", 
            "Digite sua chave de licença:",
            parent=root
        )
        
        if not key:
            root.destroy()
            return False
        
        # Valida a chave
        is_valid, message = self.validate_key(key)
        
        if is_valid:
            # Gera o ID da máquina e salva a licença
            machine_id = self.generate_machine_id()
            self.save_license(key, machine_id)
            messagebox.showinfo("Sucesso", "Software ativado com sucesso!")
            root.destroy()
            return True
        else:
            messagebox.showerror("Erro", f"Falha na ativação: {message}")
            root.destroy()
            return False

def main():
    """Função principal para uso standalone"""
    if len(sys.argv) > 1:
        if sys.argv[1] == "generate":
            # Modo geração de chave
            lm = LicenseManager()
            customer = input("Nome do cliente (opcional): ").strip()
            try:
                days = int(input("Dias de validade (padrão 365): ") or "365")
            except:
                days = 365
            
            key = lm.generate_license_key(customer, days)
            print(f"\nChave gerada: {key}")
            print(f"Cliente: {customer or 'N/A'}")
            print(f"Válida por: {days} dias")
            
        elif sys.argv[1] == "validate":
            # Modo validação
            if len(sys.argv) > 2:
                key = sys.argv[2]
                lm = LicenseManager()
                is_valid, message = lm.validate_key(key)
                print("OK" if is_valid else "INVALID")
                sys.exit(0 if is_valid else 1)
    else:
        # Modo GUI
        lm = LicenseManager()
        success = lm.activate_license_gui()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
